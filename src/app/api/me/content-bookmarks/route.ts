import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

const VALID_TARGET_TYPES = new Set(["COOP_NEWS", "FREE_POST"]);

type BookmarkSession = {
  id: string;
  loginId: string | null;
  name: string;
  role: string;
} | null;

async function requireSession() {
  const session = (await getSession()) as BookmarkSession;
  if (!session) {
    return { session: null, response: NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 }) };
  }
  return { session, response: null };
}

function normalizeBookmarkTarget(input: { targetType?: unknown; targetId?: unknown }) {
  const targetType = typeof input.targetType === "string" ? input.targetType.trim().toUpperCase() : "";
  const targetId = typeof input.targetId === "string" ? input.targetId.trim() : "";

  if (!VALID_TARGET_TYPES.has(targetType)) {
    return { error: "보관할 게시글 분류가 올바르지 않습니다." };
  }
  if (!targetId) {
    return { error: "보관할 게시글 ID가 필요합니다." };
  }

  return { targetType, targetId };
}

export async function POST(request: Request) {
  const { session, response } = await requireSession();
  if (response) return response;

  try {
    const body = await request.json();
    const target = normalizeBookmarkTarget(body);
    if ("error" in target) {
      return NextResponse.json({ error: target.error }, { status: 400 });
    }

    await prisma.personalContentBookmark.upsert({
      where: {
        userId_targetType_targetId: {
          userId: session.id,
          targetType: target.targetType,
          targetId: target.targetId,
        },
      },
      update: {},
      create: {
        userId: session.id,
        targetType: target.targetType,
        targetId: target.targetId,
      },
    });

    return NextResponse.json({ bookmarked: true });
  } catch (error) {
    console.error("POST personal content bookmark error:", error);
    return NextResponse.json({ error: "게시글 보관 중 문제가 발생했습니다." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { session, response } = await requireSession();
  if (response) return response;

  try {
    const url = new URL(request.url);
    const target = normalizeBookmarkTarget({
      targetType: url.searchParams.get("targetType"),
      targetId: url.searchParams.get("targetId"),
    });
    if ("error" in target) {
      return NextResponse.json({ error: target.error }, { status: 400 });
    }

    await prisma.personalContentBookmark.deleteMany({
      where: {
        userId: session.id,
        targetType: target.targetType,
        targetId: target.targetId,
      },
    });

    return NextResponse.json({ bookmarked: false });
  } catch (error) {
    console.error("DELETE personal content bookmark error:", error);
    return NextResponse.json({ error: "게시글 보관 해제 중 문제가 발생했습니다." }, { status: 500 });
  }
}
