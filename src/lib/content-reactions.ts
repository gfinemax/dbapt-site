export const CONTENT_REACTION_TARGET_TYPES = ["COOP_NEWS", "FREE_POST", "DOCUMENT"] as const;

export type ContentReactionTargetType = (typeof CONTENT_REACTION_TARGET_TYPES)[number];

export type ContentLikeSummary = {
  likeCount: number;
  likedByCurrentUser: boolean;
};

type ContentReactionRecord = {
  userId: string;
};

export function parseContentReactionTargetType(value: unknown): ContentReactionTargetType | null {
  return typeof value === "string" && CONTENT_REACTION_TARGET_TYPES.includes(value as ContentReactionTargetType)
    ? (value as ContentReactionTargetType)
    : null;
}

export function summarizeContentLikes(
  reactions: readonly ContentReactionRecord[] | null | undefined,
  currentUserId: string | null | undefined,
): ContentLikeSummary {
  const items = reactions || [];
  return {
    likeCount: items.length,
    likedByCurrentUser: !!currentUserId && items.some((reaction) => reaction.userId === currentUserId),
  };
}
