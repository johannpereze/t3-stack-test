import { clerkClient } from "@clerk/nextjs";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { filterUserForClient } from "~/server/helpers/filterUserForClient";

export const profileRouter = createTRPCRouter({
  getUserByEmail: publicProcedure
    .input(z.object({ email: z.string() }))
    .query(async ({ input }) => {
      const [user] = await clerkClient.users.getUserList({
        emailAddress: [input.email],
      });
      if (!user) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "User not found",
        });
      }
      return filterUserForClient(user);
    }),
  getUsersById: publicProcedure
    // input of an array of userids
    .input(z.object({ userId: z.array(z.string()) }))
    .query(async ({ input }) => {
      const users = await clerkClient.users.getUserList({
        userId: input.userId,
      });
      console.log("🚀 ~ file: profile.ts:29 ~ .query ~ users:", users);
      if (!users.length) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "User not found",
        });
      }
      return users.map((user) => filterUserForClient(user));
    }),
});
