import { useUser } from "@clerk/nextjs";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Image from "next/image";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { api, type RouterOutputs } from "~/utils/api";
import { LikeButton } from "./LikeButton";

dayjs.extend(relativeTime);

type PostWithUser = RouterOutputs["posts"]["getAll"][number];

export const PostView = ({ author, post }: PostWithUser) => {
  // get current authenticated user
  const { user } = useUser();
  const ctx = api.useContext();

  const isLikedByCurrentUser = post.likes.some(
    (like) => like.userId === user?.id
  );
  const userLikesIds = post.likes.map((like) => like.userId);
  const { data: likesData } = api.profile.getUsersById.useQuery({
    userId: userLikesIds,
  });

  let postLikes: typeof likesData = [];

  if (likesData) {
    postLikes = likesData.filter((like) => userLikesIds.includes(like.id));
  }

  const { mutate, isLoading: isPosting } = api.posts.like.useMutation({
    onSuccess: () => {
      void ctx.posts.getAll.invalidate();
      void ctx.posts.getPostsByUserId.invalidate();
    },
    onError(err) {
      const errorMessage = err.data?.zodError?.fieldErrors.content;
      if (errorMessage && errorMessage[0]) {
        toast.error(errorMessage[0]);
      } else {
        toast.error("Something went wrong");
      }
    },
  });

  const handleLike = (postId: string) => {
    mutate({ postId, action: isLikedByCurrentUser ? "unlike" : "like" });
  };

  return (
    <div className="flex gap-3 border-b border-slate-400 p-4" key={post.id}>
      <Image
        src={author.profileImageUrl}
        alt={`@${author.username}'s profile picture`}
        className="h-14 w-14 rounded-full"
        width={56}
        height={56}
      />
      <div className="flex flex-col">
        <div className="flex text-slate-300">
          <Link href={`/@${author.username}`}>
            <span>{`@${author.username}`}</span>
          </Link>
          <Link href={`/post/${post.id}`}>
            <span className="font-thin">
              {" "}
              · {`${dayjs(post.createdAt).fromNow()}`}
            </span>
          </Link>
        </div>
        <span className="text-2xl">{post.content}</span>
      </div>
      <div onClick={() => handleLike(post.id)}>
        <LikeButton filled={isLikedByCurrentUser} />
      </div>
      <span>{`${post.likes.length}`}</span>
      <span>
        <ul>
          {postLikes?.map((like) => (
            <li key={like.id}>{like.username}</li>
          ))}
        </ul>
      </span>
    </div>
  );
};
