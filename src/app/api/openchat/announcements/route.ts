import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  markOpenChatAnnouncementCopied,
  upsertOpenChatAnnouncementForDocument,
  type OpenChatAnnouncementPrisma,
} from "@/lib/notifications/openchat-announcements";

function isAdminSession(session: Awaited<ReturnType<typeof getSession>>) {
  return typeof session?.role === "string" && session.role.trim().toUpperCase() === "ADMIN";
}

function normalizeText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function GET(request: Request) {
  const session = await getSession();
  if (!isAdminSession(session)) {
    return NextResponse.json({ error: "관리자 권한이 필요합니다." }, { status: 403 });
  }

  const documentId = normalizeText(new URL(request.url).searchParams.get("documentId"));
  if (!documentId) {
    return NextResponse.json({ error: "문서 식별자가 필요합니다." }, { status: 400 });
  }

  const announcement = await prisma.openChatAnnouncement.findFirst({
    where: {
      documentId,
      status: {
        in: ["DRAFT", "COPIED"],
      },
    },
    orderBy: { updatedAt: "desc" },
    include: {
      document: {
        select: {
          id: true,
          title: true,
        },
      },
    },
  });

  if (announcement) {
    return NextResponse.json({ success: true, announcement });
  }

  const document = await prisma.document.findUnique({ where: { id: documentId } });
  if (!document) {
    return NextResponse.json({ error: "문서를 찾을 수 없습니다." }, { status: 404 });
  }

  const result = await upsertOpenChatAnnouncementForDocument({
    prisma: prisma as unknown as OpenChatAnnouncementPrisma,
    document,
  });

  if (!result.announcementId || !result.message) {
    return NextResponse.json({ error: "오픈채팅 공지문 생성 대상 문서가 아닙니다." }, { status: 422 });
  }

  return NextResponse.json({
    success: true,
    announcement: {
      id: result.announcementId,
      documentId,
      status: "DRAFT",
      message: result.message,
    },
  });
}

export async function PATCH(request: Request) {
  const session = await getSession();
  if (!isAdminSession(session)) {
    return NextResponse.json({ error: "관리자 권한이 필요합니다." }, { status: 403 });
  }

  try {
    const body = await request.json() as Record<string, unknown>;
    const announcementId = normalizeText(body.announcementId);
    if (!announcementId) {
      return NextResponse.json({ error: "공지문 식별자가 필요합니다." }, { status: 400 });
    }

    const result = await markOpenChatAnnouncementCopied({
      prisma: prisma as unknown as OpenChatAnnouncementPrisma,
      announcementId,
    });

    return NextResponse.json({ success: true, result });
  } catch (e) {
    console.error("PATCH openchat announcement error:", e);
    return NextResponse.json({ error: "공지문 복사 상태 저장 중 문제가 발생했습니다." }, { status: 500 });
  }
}
