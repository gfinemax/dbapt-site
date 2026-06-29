import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  isAllowedCommentReactionEmoji,
  parseCommentReactionTargetType,
  summarizeCommentReactions,
} from "@/lib/news/comment-reactions";

type Session = {
  id: string;
  role: string;
};

async function targetExists(targetType: string, targetId: string) {
  if (targetType === "COOP_NEWS_COMMENT") {
    return prisma.coopNewsComment.findUnique({
      where: { id: targetId },
      select: { id: true },
    });
  }

  return prisma.freeComment.findUnique({
    where: { id: targetId },
    select: { id: true },
  });
}

function targetWhere(targetType: string, targetId: string, userId?: string) {
  return {
    ...(userId ? { userId } : {}),
    ...(targetType === "COOP_NEWS_COMMENT"
      ? { coopNewsCommentId: targetId }
      : { freeCommentId: targetId }),
  };
}

async function loadReactionSummary(targetType: string, targetId: string, userId: string) {
  const reactions = await prisma.commentReaction.findMany({
    where: targetWhere(targetType, targetId),
    select: {
      emoji: true,
      userId: true,
    },
  });

  return summarizeCommentReactions(reactions, userId);
}

export async function POST(request: Request) {
  const session = (await getSession()) as Session | null;
  if (!session) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const targetType = parseCommentReactionTargetType(body.targetType);
    const targetId = typeof body.targetId === "string" ? body.targetId.trim() : "";
    const emoji = body.emoji;

    if (!targetType || !targetId) {
      return NextResponse.json({ error: "리액션 대상이 올바르지 않습니다." }, { status: 400 });
    }

    if (!isAllowedCommentReactionEmoji(emoji)) {
      return NextResponse.json({ error: "지원하지 않는 리액션입니다." }, { status: 400 });
    }

    const existingTarget = await targetExists(targetType, targetId);
    if (!existingTarget) {
      return NextResponse.json({ error: "리액션 대상 댓글을 찾을 수 없습니다." }, { status: 404 });
    }

    const existingReaction = await prisma.commentReaction.findFirst({
      where: targetWhere(targetType, targetId, session.id),
      select: {
        id: true,
        emoji: true,
      },
    });

    if (!existingReaction) {
      await prisma.commentReaction.create({
        data: {
          userId: session.id,
          emoji,
          ...(targetType === "COOP_NEWS_COMMENT"
            ? { coopNewsCommentId: targetId }
            : { freeCommentId: targetId }),
        },
      });
    } else if (existingReaction.emoji === emoji) {
      await prisma.commentReaction.delete({ where: { id: existingReaction.id } });
    } else {
      await prisma.commentReaction.update({
        where: { id: existingReaction.id },
        data: { emoji },
      });
    }

    const reactionSummary = await loadReactionSummary(targetType, targetId, session.id);
    return NextResponse.json({ success: true, targetType, targetId, reactionSummary });
  } catch (error) {
    console.error("POST comment reaction error:", error);
    return NextResponse.json({ error: "댓글 리액션 처리에 실패했습니다." }, { status: 500 });
  }
}
