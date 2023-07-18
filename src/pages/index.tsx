import { useUser } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";
import { type NextPage } from "next";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { PageLayout } from "~/components/layout";
import { PostView } from "~/components/postView";
import { Avatar, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { SkeletonPost } from "~/components/ui/skeleton-post";
import { api } from "~/utils/api";

const CreatePostWizard = () => {
  const { user } = useUser();
  const [input, setInput] = useState("");

  const ctx = api.useContext();

  const { mutate, isLoading: isPosting } = api.posts.create.useMutation({
    onSuccess: () => {
      setInput("");
      void ctx.posts.getAll.invalidate();
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

  if (!user) return null;
  return (
    <Card className="w-full bg-secondary">
      <CardContent className="p-3">
        <div className="flex w-full items-center gap-3">
          <Avatar>
            <AvatarImage
              src={user.profileImageUrl}
              alt={`@${user.username || ""}'s profile picture`}
            />
          </Avatar>
          <input
            className="w-full bg-transparent outline-none"
            placeholder="Type some emojis!"
            onChange={(e) => setInput(e.target.value)}
            value={input}
            type="text"
            disabled={isPosting}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                if (input === "") return;
                mutate({ content: input });
              }
            }}
            autoFocus
          />
          <Button
            disabled={!input || isPosting}
            onClick={() => mutate({ content: input })}
          >
            {isPosting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isPosting ? "Posting" : "Post"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const LoadingPosts = () => {
  return (
    <div className="flex flex-col gap-4">
      <SkeletonPost />
      <SkeletonPost />
      <SkeletonPost />
    </div>
  );
};

const Feed = () => {
  const { data, isLoading: postLoading } = api.posts.getAll.useQuery();
  if (postLoading) return <LoadingPosts />;
  if (!data) return <div>Something went wrong</div>;
  return (
    <div className="flex flex-col">
      {data.map((fullPost) => (
        <PostView {...fullPost} key={fullPost.post.id} />
      ))}
    </div>
  );
};

const Home: NextPage = () => {
  const { isLoaded: userLoaded, isSignedIn } = useUser();

  /* Start fetching ASAP */
  api.posts.getAll.useQuery();

  /* Return empty div if user isn't loaded yet */
  if (!userLoaded) return <div />;

  return (
    <PageLayout>
      <div className="flex p-4">{isSignedIn && <CreatePostWizard />}</div>
      <Feed />
    </PageLayout>
  );
};

export default Home;
