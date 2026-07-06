import { getUserDisplayName } from "@/lib/user-display-name";

export type ContentAuthorLabelUser = {
  id?: string | null;
  signupName?: string | null;
  name?: string | null;
  loginId?: string | null;
  role?: string | null;
  memberType?: string | null;
  displayAuthorName?: string | null;
};

type ContentAuthorLabelOptions = {
  adminFallback?: string;
};

const PUBLIC_ADMIN_NAMES = new Set(["운영자", "사무국"]);

function normalize(value: string | null | undefined) {
  return value?.trim().toUpperCase() || "";
}

function getBaseAuthorName(author: ContentAuthorLabelUser, adminFallback: string) {
  if (normalize(author.role) === "ADMIN") {
    const displayName = author.displayAuthorName?.trim();
    if (displayName) return displayName;

    const authorName = author.name?.trim();
    return authorName && PUBLIC_ADMIN_NAMES.has(authorName) ? authorName : adminFallback;
  }

  return getUserDisplayName(author);
}

function getStatusTags(author: ContentAuthorLabelUser, baseName: string) {
  const role = normalize(author.role);
  const memberType = normalize(author.memberType);

  if (role === "ADMIN") {
    return PUBLIC_ADMIN_NAMES.has(baseName) ? [] : ["관계자"];
  }

  if (role === "REFUND" || memberType === "REFUND") {
    return ["환불"];
  }

  if (role === "ASSOCIATE" || memberType === "ASSOCIATE") {
    return ["관계자"];
  }

  return [];
}

export function getContentAuthorLabel(
  author: ContentAuthorLabelUser,
  currentUserId?: string | null,
  options: ContentAuthorLabelOptions = {},
) {
  const baseName = getBaseAuthorName(author, options.adminFallback ?? "운영자");
  const tags = getStatusTags(author, baseName);

  if (author.id && currentUserId && author.id === currentUserId) {
    tags.push("나");
  }

  return tags.length > 0 ? `${baseName} (${tags.join(", ")})` : baseName;
}
