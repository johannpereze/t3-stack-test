import type { GetStaticProps, NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { PageLayout } from "~/components/layout";
import { LoadingPosts } from "~/components/loading";
import { PostView } from "~/components/postView";
import { generateSSHHelper } from "~/server/helpers/ssgHelper";
import { api } from "~/utils/api";

interface ProfilePageProps {
  userId: string;
}
const ProfileFeed = ({ userId }: ProfilePageProps) => {
  const { data, isLoading } = api.posts.getPostsByUserId.useQuery({ userId });

  if (isLoading)
    return (
      <div className="mt-4">
        <LoadingPosts />
      </div>
    );

  if (!data || data.length === 0) return <div>User has not posted</div>;

  return (
    <div className="flex flex-col">
      {data.map((fullPost) => (
        <PostView {...fullPost} key={fullPost.post.id} />
      ))}
    </div>
  );
};

/* This email comes from getStaticProps */
const ProfilePage: NextPage<{ email: string }> = ({ email }) => {
  const { data } = api.profile.getUserByEmail.useQuery({
    email,
  });

  if (!data) return <div>404</div>;

  return (
    <>
      <Head>
        <title>{data.username}</title>
      </Head>
      <PageLayout>
        <div className="relative h-36  bg-slate-600">
          <Image
            src={data.profileImageUrl}
            alt={`${data.username || ""}'s profile pic`}
            width={128}
            height={128}
            className="absolute bottom-0 left-0 -mb-[64px] ml-4 rounded-full border-4 border-black bg-black"
          />
        </div>
        <div className="h-[64px]" />
        <div className="p-4 text-2xl font-bold">{`@${
          data.username || ""
        }`}</div>
        <div className="w-full"></div>
        <ProfileFeed userId={data.id} />
      </PageLayout>
    </>
  );
};

export const getStaticProps: GetStaticProps = async (context) => {
  const helpers = generateSSHHelper();

  const slug = context.params?.slug;

  if (typeof slug !== "string") throw new Error("no slug");

  /* Only supports gmail users */
  const email = `${slug.replace("@", "")}@gmail.com`;

  await helpers.profile.getUserByEmail.prefetch({ email: email });

  return {
    props: {
      trpcState: helpers.dehydrate(),
      email,
    },
  };
};

export const getStaticPaths = () => {
  return {
    paths: [],
    fallback: "blocking",
  };
};

export default ProfilePage;
