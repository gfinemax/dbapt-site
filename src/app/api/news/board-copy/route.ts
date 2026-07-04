import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

type BoardCopySourceType = "COOP_NEWS" | "FREE_POST";

function isBoardCopySourceType(value: unknown): value is BoardCopySourceType {
  return value === "COOP_NEWS" || value === "FREE_POST";
}

function normalizeAttachmentSize(value: number | null | undefined) {
  return Number.isFinite(value) && value ? value : null;
}

export async function POST(request: Request) {
  const session = (await getSession()) as { id: string; role: string } | null;
  if (!session) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }
  if (session.role !== "ADMIN") {
    return NextResponse.json({ error: "관리자 권한이 필요합니다." }, { status: 403 });
  }

  try {
    const body = await request.json();
    const sourceType = body.sourceType;
    const sourceId = typeof body.sourceId === "string" ? body.sourceId.trim() : "";

    if (!isBoardCopySourceType(sourceType) || !sourceId) {
      return NextResponse.json({ error: "복사할 게시판과 글을 선택해 주세요." }, { status: 400 });
    }

    if (sourceType === "COOP_NEWS") {
      const source = await prisma.coopNews.findUnique({
        where: { id: sourceId },
      });

      if (!source) {
        return NextResponse.json({ error: "복사할 원본 글을 찾을 수 없습니다." }, { status: 404 });
      }

      const target = await prisma.freePost.create({
        data: {
          title: source.title,
          content: source.content,
          attachmentPath: source.attachmentPath || null,
          attachmentName: source.attachmentName || null,
          attachmentSize: normalizeAttachmentSize(source.attachmentSize),
          ...(source.socialImagePath ? { socialImagePath: source.socialImagePath } : {}),
          displayAuthorName: source.displayAuthorName || null,
          isStarred: !!source.isStarred,
          postType: "NOTICE",
          registeredAt: source.registeredAt,
          authorId: session.id,
          isPublicShareEnabled: false,
          publicShareEnabledAt: null,
        },
      });

      return NextResponse.json({ success: true, targetType: "FREE_POST", target });
    }

    const source = await prisma.freePost.findUnique({
      where: { id: sourceId },
    });

    if (!source) {
      return NextResponse.json({ error: "복사할 원본 글을 찾을 수 없습니다." }, { status: 404 });
    }

    const target = await prisma.coopNews.create({
      data: {
        title: source.title,
        content: source.content,
        category: "NOTICE",
        imagePath: null,
        ...(source.socialImagePath ? { socialImagePath: source.socialImagePath } : {}),
        attachmentPath: source.attachmentPath || null,
        attachmentName: source.attachmentName || null,
        attachmentSize: normalizeAttachmentSize(source.attachmentSize),
        displayAuthorName: source.displayAuthorName || null,
        isStarred: !!source.isStarred,
        registeredAt: source.registeredAt,
        authorId: session.id,
      },
    });

    return NextResponse.json({ success: true, targetType: "COOP_NEWS", target });
  } catch (error) {
    console.error("POST board copy error:", error);
    return NextResponse.json({ error: "게시글 복사 중 오류가 발생했습니다." }, { status: 500 });
  }
}
