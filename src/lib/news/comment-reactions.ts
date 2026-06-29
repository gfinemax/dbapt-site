export const COMMENT_REACTION_EMOJIS = [
  "👍",
  "❤️",
  "👏",
  "✅",
  "🙏",
  "😊",
  "😍",
  "😮",
  "😢",
  "🤔",
  "😎",
  "💪",
  "👌",
  "💛",
  "💚",
  "💙",
  "💜",
  "💔",
] as const;

export type CommentReactionEmoji = (typeof COMMENT_REACTION_EMOJIS)[number];
export type CommentReactionTargetType = "COOP_NEWS_COMMENT" | "FREE_COMMENT";

export type CommentReactionSummaryItem = {
  emoji: string;
  count: number;
  selectedByCurrentUser: boolean;
};

type ReactionRecord = {
  emoji: string;
  userId: string;
};

export function isAllowedCommentReactionEmoji(value: unknown): value is CommentReactionEmoji {
  return typeof value === "string" && COMMENT_REACTION_EMOJIS.includes(value as CommentReactionEmoji);
}

export function parseCommentReactionTargetType(value: unknown): CommentReactionTargetType | null {
  return value === "COOP_NEWS_COMMENT" || value === "FREE_COMMENT" ? value : null;
}

export function summarizeCommentReactions(
  reactions: readonly ReactionRecord[] | null | undefined,
  currentUserId: string | null | undefined,
): CommentReactionSummaryItem[] {
  const order = new Map<string, number>();
  const counts = new Map<string, number>();
  const selected = new Set<string>();

  for (const reaction of reactions || []) {
    if (!order.has(reaction.emoji)) {
      order.set(reaction.emoji, order.size);
    }
    counts.set(reaction.emoji, (counts.get(reaction.emoji) || 0) + 1);
    if (currentUserId && reaction.userId === currentUserId) {
      selected.add(reaction.emoji);
    }
  }

  return [...counts.entries()]
    .sort(([leftEmoji, leftCount], [rightEmoji, rightCount]) => {
      if (rightCount !== leftCount) return rightCount - leftCount;
      return (order.get(leftEmoji) || 0) - (order.get(rightEmoji) || 0);
    })
    .map(([emoji, count]) => ({
      emoji,
      count,
      selectedByCurrentUser: selected.has(emoji),
    }));
}
