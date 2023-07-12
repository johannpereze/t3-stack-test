import { clerkClient } from "@clerk/nextjs";
import type { Like, Post } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { z } from "zod";
import {
  createTRPCRouter,
  privateProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { filterUserForClient } from "~/server/helpers/filterUserForClient";

const addUserDataToPosts = async (
  posts: (Post & {
    likes: Like[];
  })[]
) => {
  //Using the Clerk API to get the user directly
  const users = (
    await clerkClient.users.getUserList({
      userId: posts.map((post) => post.authorId),
      limit: 100,
    })
  ).map(filterUserForClient);

  return posts.map((post) => {
    const author = users.find((user) => user.id === post.authorId);

    if (!author || !author.username)
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Author not found",
      });

    return {
      post,
      author: {
        ...author,
        username: author.username,
      },
    };
  });
};

// Create a new rate limiter, that allows 3 requests per 1 minute
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(3, "1 m"),
  analytics: true,
});

export const postsRouter = createTRPCRouter({
  /* Create a procedure to get a single post by id */
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const posts = await ctx.prisma.post.findUnique({
        where: {
          id: input.id,
        },
        include: {
          likes: true,
        },
      });
      if (!posts)
        throw new TRPCError({ code: "NOT_FOUND", message: "Post not found" });
      const postsWithUserData = await addUserDataToPosts([posts]);
      const post = postsWithUserData[0];
      return post;
    }),

  /* Create a procedure to get all the posts */
  getAll: publicProcedure.query(async ({ ctx }) => {
    const posts = await ctx.prisma.post.findMany({
      take: 100,
      orderBy: [{ createdAt: "desc" }],
      include: {
        likes: true,
      },
    });

    return addUserDataToPosts(posts);
  }),

  /* Create a procedure to get the posts of an user */
  getPostsByUserId: publicProcedure
    .input(
      z.object({
        userId: z.string(),
      })
    )
    .query(({ ctx, input }) =>
      ctx.prisma.post
        .findMany({
          where: {
            authorId: input.userId,
          },
          take: 100,
          orderBy: [{ createdAt: "desc" }],
          include: {
            likes: true,
          },
        })
        .then(addUserDataToPosts)
    ),

  create: privateProcedure
    .input(
      z.object({
        content: z.string().emoji("Only emojis are allowed").min(1).max(280),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const authorId = ctx.userId;

      const { success } = await ratelimit.limit(authorId);

      if (!success) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "You have exceeded the rate limit",
        });
      }

      const post = await ctx.prisma.post.create({
        data: {
          authorId,
          content: input.content,
        },
      });
      return post;
    }),
  like: privateProcedure
    .input(
      z.object({
        postId: z.string(),
        action: z.enum(["like", "unlike"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const authorId = ctx.userId;

      if (input.action === "like") {
        const post = await ctx.prisma.like.create({
          data: {
            userId: authorId,
            postId: input.postId,
          },
        });
        return post;
      } else {
        const post = await ctx.prisma.like.delete({
          where: {
            postId_userId: {
              userId: authorId,
              postId: input.postId,
            },
          },
        });
        return post;
      }
    }),
});
