import { useUser } from "@clerk/nextjs";
import { type NextPage } from "next";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { PageLayout } from "~/components/layout";
import { LoadingPage, LoadingSpinner } from "~/components/loading";
import { PostView } from "~/components/postView";
import { Avatar, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
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
    <Card className="w-full bg-secondary pt-6">
      <CardContent>
        <div className="flex w-full items-center gap-3">
          <Avatar>
            <AvatarImage
              src={user.profileImageUrl}
              alt={`@${user.username || ""}'s profile picture`}
            />
          </Avatar>
          <input
            className="grow bg-transparent outline-none"
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
          />
          {input !== "" && !isPosting && (
            <Button onClick={() => mutate({ content: input })}>Post</Button>
          )}
          {isPosting && (
            <div className="flex items-center justify-center">
              <LoadingSpinner size={30} />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const Feed = () => {
  const { data, isLoading: postLoading } = api.posts.getAll.useQuery();
  if (postLoading) return <LoadingPage />;
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
