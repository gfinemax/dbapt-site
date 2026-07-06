import { getContentAuthorLabel } from "@/lib/content-author-label";

type FreeBoardAuthor = {
  signupName?: string | null;
  name?: string | null;
  loginId: string | null;
  role: string;
  memberType?: string | null;
  id?: string;
  displayAuthorName?: string | null;
};

export function getFreeBoardAuthorLabel(
  author: FreeBoardAuthor,
  currentUserId: string | null | undefined,
): string {
  return getContentAuthorLabel(author, currentUserId, { adminFallback: "사무국" });
}
