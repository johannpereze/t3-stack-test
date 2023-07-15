import { useUser } from "@clerk/nextjs";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { toast } from "react-hot-toast";
import { api, type RouterOutputs } from "~/utils/api";
import { LikeButton } from "./LikeButton";
import { Avatar, AvatarImage } from "./ui/avatar";
import { Card, CardContent, CardDescription } from "./ui/card";

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
    <div className="flex flex-col gap-3 p-4" key={post.id}>
      <Card>
        <CardContent className="mt-6 flex gap-4">
          <Avatar>
            <AvatarImage
              src={author.profileImageUrl}
              alt={`@${author.username}'s profile picture`}
            />
          </Avatar>
          <div className="flex flex-col">
            <div className="flex items-baseline gap-2">
              <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">
                {`@${author.username}`}
              </h4>
              <CardDescription>{`· ${dayjs(
                post.createdAt
              ).fromNow()}`}</CardDescription>
            </div>
            <h3 className="mt-2 scroll-m-20 text-2xl font-semibold tracking-tight">
              {post.content}
            </h3>
            <div className=" mt-4 flex items-start gap-3">
              <div
                onClick={() => handleLike(post.id)}
                className="cursor-pointer"
              >
                <LikeButton filled={isLikedByCurrentUser} />
              </div>
              <h4 className="scroll-m-20 text-base tracking-widest">
                {`${post.likes.length} Likes`}
              </h4>
            </div>
          </div>
        </CardContent>
      </Card>
      {/* <Image
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
      </span> */}
    </div>
  );
};
