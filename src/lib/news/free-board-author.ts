import { getUserDisplayName } from "@/lib/user-display-name";

type FreeBoardAuthor = {
  signupName?: string | null;
  name?: string | null;
  loginId: string | null;
  role: string;
  id?: string;
  displayAuthorName?: string | null;
};

export function getFreeBoardAuthorLabel(
  author: FreeBoardAuthor,
  currentUserId: string | null | undefined,
): string {
  const displayName = author.role === "ADMIN"
    ? author.displayAuthorName || "사무국"
    : getUserDisplayName(author);

  if (author.id === currentUserId) {
    return `${displayName} (나)`;
  }

  if (author.role === "ADMIN") {
    return displayName;
  }

  const maskedId = author.loginId
    ? `${author.loginId.slice(0, 2)}***`
    : "social";

  return `${displayName.slice(0, 1)}*조합원 (${maskedId})`;
}
