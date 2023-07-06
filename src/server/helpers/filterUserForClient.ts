import type { User } from "@clerk/nextjs/dist/types/server";

export const filterUserForClient = (user: User) => {
  return {
    id: user.id,
    /* Since google does not provide an username, we create one from the email address */
    username: user.emailAddresses[0]?.emailAddress.split("@")[0],
    profileImageUrl: user.profileImageUrl,
  };
};
