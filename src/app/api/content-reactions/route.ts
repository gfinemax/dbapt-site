import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  parseContentReactionTargetType,
  summarizeContentLikes,
  type ContentReactionTargetType,
} from "@/lib/content-reactions";

type Session = {
  id: string;
  role: string;
};

function targetWhere(targetType: ContentReactionTargetType, targetId: string, userId?: string) {
  return {
    ...(userId ? { userId } : {}),
    ...(targetType === "COOP_NEWS"
      ? { coopNewsId: targetId }
      : targetType === "FREE_POST"
        ? { freePostId: targetId }
        : { documentId: targetId }),
  };
}

function targetCreateData(targetType: ContentReactionTargetType, targetId: string, userId: string) {
  return {
    userId,
    ...(targetType === "COOP_NEWS"
      ? { coopNewsId: targetId }
      : targetType === "FREE_POST"
        ? { freePostId: targetId }
        : { documentId: targetId }),
  };
}

async function targetExists(targetType: ContentReactionTargetType, targetId: string) {
  if (targetType === "COOP_NEWS") {
    return prisma.coopNews.findUnique({
      where: { id: targetId },
      select: { id: true },
    });
  }

  if (targetType === "FREE_POST") {
    return prisma.freePost.findUnique({
      where: { id: targetId },
      select: { id: true },
    });
  }

  return prisma.document.findUnique({
    where: { id: targetId },
    select: { id: true },
  });
}

async function loadLikeSummary(targetType: ContentReactionTargetType, targetId: string, userId: string) {
  const reactions = await prisma.contentReaction.findMany({
    where: targetWhere(targetType, targetId),
    select: {
      userId: true,
    },
  });

  return summarizeContentLikes(reactions, userId);
}

export async function POST(request: Request) {
  const session = (await getSession()) as Session | null;
  if (!session) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const targetType = parseContentReactionTargetType(body.targetType);
    const targetId = typeof body.targetId === "string" ? body.targetId.trim() : "";

    if (!targetType || !targetId) {
      return NextResponse.json({ error: "공감 대상이 올바르지 않습니다." }, { status: 400 });
    }

    const existingTarget = await targetExists(targetType, targetId);
    if (!existingTarget) {
      return NextResponse.json({ error: "공감 대상을 찾을 수 없습니다." }, { status: 404 });
    }

    const existingReaction = await prisma.contentReaction.findFirst({
      where: targetWhere(targetType, targetId, session.id),
      select: {
        id: true,
      },
    });

    if (existingReaction) {
      await prisma.contentReaction.delete({ where: { id: existingReaction.id } });
    } else {
      await prisma.contentReaction.create({
        data: targetCreateData(targetType, targetId, session.id),
      });
    }

    const summary = await loadLikeSummary(targetType, targetId, session.id);
    return NextResponse.json({
      success: true,
      targetType,
      targetId,
      ...summary,
    });
  } catch (error) {
    console.error("POST content reaction error:", error);
    return NextResponse.json({ error: "공감 처리에 실패했습니다." }, { status: 500 });
  }
}
