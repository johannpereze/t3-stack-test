import { useUser } from "@clerk/nextjs";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { api, type RouterOutputs } from "~/utils/api";
import { LikeButton } from "./LikeButton";
import { LoadingSpinner } from "./loading";
import { Avatar, AvatarImage } from "./ui/avatar";
import { Card, CardContent, CardDescription } from "./ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

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

  const { mutate, isLoading: isLikeLoading } = api.posts.like.useMutation({
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
    if (!user) return;
    mutate({ postId, action: isLikedByCurrentUser ? "unlike" : "like" });
  };

  return (
    <div className="flex flex-col p-4" key={post.id}>
      <Card>
        <CardContent className="flex gap-4 p-3">
          <Link href={`/@${author.username}`}>
            <Avatar>
              <AvatarImage
                src={author.profileImageUrl}
                alt={`@${author.username}'s profile picture`}
              />
            </Avatar>
          </Link>
          <div>
            <div>
              <Link href={`/@${author.username}`}>
                <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">
                  {`@${author.username}`}
                </h4>
              </Link>
              <Link href={`/post/${post.id}`}>
                <CardDescription>{`${dayjs(
                  post.createdAt
                ).fromNow()}`}</CardDescription>
              </Link>
            </div>
            <h3 className="mt-2 scroll-m-20 text-2xl font-semibold tracking-tight">
              {post.content}
            </h3>
            <div className=" mt-4 flex items-start gap-3">
              <div
                onClick={() => handleLike(post.id)}
                className="cursor-pointer"
              >
                {isLikeLoading ? (
                  <LoadingSpinner size={24} />
                ) : (
                  <LikeButton filled={isLikedByCurrentUser} />
                )}
              </div>
              <Popover>
                <PopoverTrigger disabled={!post.likes.length}>
                  <h4 className="scroll-m-20 text-base tracking-widest">
                    {`${post.likes.length} Likes`}
                  </h4>
                </PopoverTrigger>
                <PopoverContent>
                  <ul>
                    {postLikes.map(({ username, profileImageUrl, id }) => (
                      <li key={id}>
                        <div className="flex items-center gap-2">
                          <Avatar size={5}>
                            <AvatarImage
                              src={profileImageUrl}
                              alt={`@${username || ""}'s profile picture`}
                            />
                          </Avatar>
                          <Link href={`/@${username || ""}`}>
                            <p className="leading-8">@{username}</p>
                          </Link>
                        </div>
                      </li>
                    ))}
                  </ul>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
