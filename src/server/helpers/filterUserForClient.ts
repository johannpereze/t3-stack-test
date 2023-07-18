import type { User } from "@clerk/nextjs/dist/types/server";
import { getUsernameFromEmail } from "~/utils/misc";

export const filterUserForClient = (user: User) => {
  return {
    id: user.id,
    /* Since google does not provide an username, we create one from the email address */
    username: getUsernameFromEmail(
      String(user.emailAddresses[0]?.emailAddress) || ""
    ),
    profileImageUrl: user.profileImageUrl,
  };
};
