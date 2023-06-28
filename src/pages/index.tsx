import { SignInButton, useUser } from "@clerk/nextjs";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { type NextPage } from "next";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { PageLayout } from "~/components/layout";
import { LoadingPage, LoadingSpinner } from "~/components/loading";
import { api, type RouterOutputs } from "~/utils/api";

dayjs.extend(relativeTime);

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
    <div className="flex w-full gap-3">
      <Image
        src={user.profileImageUrl}
        alt="profile"
        className="h-14 w-14 rounded-full"
        width={56}
        height={56}
      />
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
        <button onClick={() => mutate({ content: input })}>Post</button>
      )}
      {isPosting && (
        <div className="flex items-center justify-center">
          <LoadingSpinner size={30} />
        </div>
      )}
    </div>
  );
};

type PostWithUser = RouterOutputs["posts"]["getAll"][number];

const PostView = ({ author, post }: PostWithUser) => {
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
          <Link href={`/post/@${post.id}`}>
            <span className="font-thin">
              {" "}
              · {`${dayjs(post.createdAt).fromNow()}`}
            </span>
          </Link>
        </div>
        <span className="text-2xl">{post.content}</span>
      </div>
    </div>
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
      <div className="flex border-b border-slate-400 p-4">
        {!isSignedIn && (
          <div className="flex justify-center">
            <SignInButton />
          </div>
        )}
        {isSignedIn && <CreatePostWizard />}
      </div>
      <Feed />
    </PageLayout>
  );
};

export default Home;
