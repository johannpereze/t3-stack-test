import { SignInButton, useUser } from "@clerk/nextjs";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { type NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { LoadingPage } from "~/components/loading";
import { api, type RouterOutputs } from "~/utils/api";

dayjs.extend(relativeTime);

const CreatePostWizard = () => {
  const { user } = useUser();
  console.log("🚀 ~ file: index.tsx:8 ~ CreatePostWizard ~ user:", user);
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
      />
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
          <span>
            {`@${author.username}`}
            <span className="font-thin">
              {" "}
              · {`${dayjs(post.createdAt).fromNow()}`}
            </span>
          </span>
        </div>
        {post.content}
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
      {[...data, ...data].map((fullPost) => (
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
    <>
      <Head>
        <title>Create T3 App</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex justify-center">
        <div className="h-screen w-full border-x border-slate-400 md:max-w-2xl">
          <div className="flex border-b border-slate-400 p-4">
            {!isSignedIn && (
              <div className="flex justify-center">
                <SignInButton />
              </div>
            )}
            {isSignedIn && <CreatePostWizard />}
          </div>
          <Feed />
        </div>
      </main>
    </>
  );
};

export default Home;
