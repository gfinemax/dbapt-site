import { prisma } from "@/lib/db";
import type { ContentLikeSummary, ContentReactionTargetType } from "@/lib/content-reactions";

type ContentReactionRecord = {
  userId: string;
  coopNewsId?: string | null;
  freePostId?: string | null;
  documentId?: string | null;
};

type ContentReactionDelegate = {
  findMany: (args: {
    where: Record<string, unknown>;
    select: {
      userId: true;
      coopNewsId: true;
      freePostId: true;
      documentId: true;
    };
  }) => Promise<ContentReactionRecord[]>;
};

function getDefaultSummary(): ContentLikeSummary {
  return {
    likeCount: 0,
    likedByCurrentUser: false,
  };
}

function targetField(targetType: ContentReactionTargetType) {
  if (targetType === "COOP_NEWS") return "coopNewsId";
  if (targetType === "FREE_POST") return "freePostId";
  return "documentId";
}

export async function loadContentReactionSummaries(
  targetType: ContentReactionTargetType,
  targetIds: readonly string[],
  currentUserId: string | null | undefined,
): Promise<Map<string, ContentLikeSummary>> {
  const uniqueTargetIds = Array.from(new Set(targetIds.filter(Boolean)));
  const summaries = new Map<string, ContentLikeSummary>();
  uniqueTargetIds.forEach((id) => summaries.set(id, getDefaultSummary()));

  if (uniqueTargetIds.length === 0) {
    return summaries;
  }

  const delegate = (prisma as unknown as { contentReaction?: ContentReactionDelegate }).contentReaction;
  if (!delegate) {
    return summaries;
  }

  const field = targetField(targetType);

  try {
    const reactions = await delegate.findMany({
      where: {
        [field]: {
          in: uniqueTargetIds,
        },
      },
      select: {
        userId: true,
        coopNewsId: true,
        freePostId: true,
        documentId: true,
      },
    });

    for (const reaction of reactions) {
      const targetId = reaction[field];
      if (!targetId) continue;

      const current = summaries.get(targetId) || getDefaultSummary();
      summaries.set(targetId, {
        likeCount: current.likeCount + 1,
        likedByCurrentUser: current.likedByCurrentUser || (!!currentUserId && reaction.userId === currentUserId),
      });
    }
  } catch (error) {
    console.error("Failed to load content reaction summaries:", error);
  }

  return summaries;
}
