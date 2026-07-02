import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { parseNewsDisplayAuthorName } from "@/lib/news-display-author";
import { DEVELOPMENT_LOG_CATEGORIES } from "@/lib/news/development-log";
import { summarizeCommentReactions } from "@/lib/news/comment-reactions";

function hasCreatedAtInput(body: Record<string, unknown>) {
  return Object.prototype.hasOwnProperty.call(body, "createdAt");
}

function parseRegisteredAtInput(value: unknown) {
  if (value === undefined || value === null || value === "") return undefined;
  const registeredAt = new Date(String(value));
  return Number.isNaN(registeredAt.getTime()) ? null : registeredAt;
}

// 1. GET: 공지사항 및 조합뉴스 조회 (Public)
export async function GET(request: Request) {
  const session = (await getSession()) as { id: string; role: string } | null;
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category"); // NOTICE or WEEKLY_MONTHLY

  try {
    const whereClause: { category?: string } = {};
    if (category) {
      whereClause.category = category;
    }

    const newsList = await prisma.coopNews.findMany({
      where: whereClause,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            loginId: true,
            role: true,
          },
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                loginId: true,
                role: true,
              },
            },
            reactions: {
              select: {
                emoji: true,
                userId: true,
              },
            },
          },
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { registeredAt: "desc" },
    });

    return NextResponse.json({
      newsList: newsList.map((news) => ({
        ...news,
        comments: news.comments.map((comment) => ({
          ...comment,
          reactionSummary: summarizeCommentReactions(comment.reactions, session?.id),
        })),
      })),
    });
  } catch (e) {
    console.error("GET news error:", e);
    return NextResponse.json({ error: "소통마당 글을 가져오는 데 실패했습니다." }, { status: 500 });
  }
}

// 2. POST: 공지사항 및 조합뉴스 등록 (ADMIN 전용)
export async function POST(request: Request) {
  const session = (await getSession()) as { id: string; role: string } | null;
  if (!session) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      title,
      content,
      category,
      imagePath,
      isStarred,
      attachmentPath,
      attachmentName,
      attachmentSize,
      displayAuthorName,
      registeredAt,
    } = body;

    if (hasCreatedAtInput(body)) {
      return NextResponse.json({ error: "작성일은 시스템 기록으로만 보관됩니다." }, { status: 400 });
    }

    const isMemberRequirement = category === DEVELOPMENT_LOG_CATEGORIES.request;
    if (session.role !== "ADMIN" && !isMemberRequirement) {
      return NextResponse.json({ error: "관리자 권한이 필요합니다." }, { status: 403 });
    }

    if (!title || !content || !category) {
      return NextResponse.json({ error: "필수 입력 항목(제목, 내용, 카테고리)이 누락되었습니다." }, { status: 400 });
    }

    if (registeredAt !== undefined && session.role !== "ADMIN") {
      return NextResponse.json({ error: "등록일 변경은 관리자만 가능합니다." }, { status: 403 });
    }

    const parsedRegisteredAt = parseRegisteredAtInput(registeredAt);
    if (parsedRegisteredAt === null) {
      return NextResponse.json({ error: "등록일 형식이 올바르지 않습니다." }, { status: 400 });
    }

    const parsedDisplayAuthorName = parseNewsDisplayAuthorName(displayAuthorName);
    if (!parsedDisplayAuthorName.ok) {
      return NextResponse.json({ error: parsedDisplayAuthorName.error }, { status: 400 });
    }

    const news = await prisma.coopNews.create({
      data: {
        title,
        content,
        category,
        imagePath: imagePath || null,
        attachmentPath: attachmentPath || null,
        attachmentName: attachmentName || null,
        attachmentSize: Number.isFinite(attachmentSize) ? attachmentSize : null,
        isStarred: !!isStarred,
        displayAuthorName: parsedDisplayAuthorName.value,
        ...(parsedRegisteredAt ? { registeredAt: parsedRegisteredAt } : {}),
        authorId: session.id,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            loginId: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, news });
  } catch (e) {
    console.error("POST news error:", e);
    return NextResponse.json({ error: "소통마당 글을 등록하는 데 실패했습니다." }, { status: 500 });
  }
}

// 3. PATCH: 공지사항 및 조합뉴스 수정 (ADMIN 전용)
export async function PATCH(request: Request) {
  const session = (await getSession()) as { id: string; role: string } | null;
  if (!session) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }
  if (session.role !== "ADMIN") {
    return NextResponse.json({ error: "관리자 권한이 필요합니다." }, { status: 403 });
  }

  try {
    const body = await request.json();
    const {
      id,
      title,
      content,
      category,
      imagePath,
      isStarred,
      attachmentPath,
      attachmentName,
      attachmentSize,
      displayAuthorName,
      registeredAt,
    } = body;

    if (hasCreatedAtInput(body)) {
      return NextResponse.json({ error: "작성일은 시스템 기록으로만 보관됩니다." }, { status: 400 });
    }

    if (!id) {
      return NextResponse.json({ error: "수정할 대상 ID가 누락되었습니다." }, { status: 400 });
    }

    if (!title || !content || !category) {
      return NextResponse.json({ error: "필수 입력 항목(제목, 내용, 카테고리)이 누락되었습니다." }, { status: 400 });
    }

    const parsedRegisteredAt = parseRegisteredAtInput(registeredAt);
    if (parsedRegisteredAt === null) {
      return NextResponse.json({ error: "등록일 형식이 올바르지 않습니다." }, { status: 400 });
    }

    const parsedDisplayAuthorName = parseNewsDisplayAuthorName(displayAuthorName);
    if (!parsedDisplayAuthorName.ok) {
      return NextResponse.json({ error: parsedDisplayAuthorName.error }, { status: 400 });
    }

    const news = await prisma.coopNews.update({
      where: { id },
      data: {
        title,
        content,
        category,
        imagePath: imagePath || null,
        attachmentPath: attachmentPath || null,
        attachmentName: attachmentName || null,
        attachmentSize: Number.isFinite(attachmentSize) ? attachmentSize : null,
        isStarred: !!isStarred,
        ...(parsedRegisteredAt ? { registeredAt: parsedRegisteredAt } : {}),
        ...(displayAuthorName !== undefined
          ? { displayAuthorName: parsedDisplayAuthorName.value }
          : {}),
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            loginId: true,
            role: true,
          },
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                loginId: true,
                role: true,
              },
            },
            reactions: {
              select: {
                emoji: true,
                userId: true,
              },
            },
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    return NextResponse.json({
      success: true,
      news: {
        ...news,
        comments: news.comments.map((comment) => ({
          ...comment,
          reactionSummary: summarizeCommentReactions(comment.reactions, session.id),
        })),
      },
    });
  } catch (e) {
    console.error("PATCH news error:", e);
    return NextResponse.json({ error: "소통마당 글을 수정하는 데 실패했습니다." }, { status: 500 });
  }
}

// 4. DELETE: 공지사항 및 조합뉴스 삭제
export async function DELETE(request: Request) {
  const session = (await getSession()) as { id: string; role: string } | null;
  if (!session) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "삭제할 대상 ID가 누락되었습니다." }, { status: 400 });
    }

    const news = await prisma.coopNews.findUnique({
      where: { id },
    });

    if (!news) {
      return NextResponse.json({ error: "존재하지 않는 공지사항입니다." }, { status: 404 });
    }

    if (session.role !== "ADMIN" && news.category !== DEVELOPMENT_LOG_CATEGORIES.request) {
      return NextResponse.json({ error: "관리자 권한이 필요합니다." }, { status: 403 });
    }

    if (session.role !== "ADMIN" && news.authorId !== session.id) {
      return NextResponse.json({ error: "삭제 권한이 없습니다." }, { status: 403 });
    }

    await prisma.coopNews.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("DELETE news error:", e);
    return NextResponse.json({ error: "공지사항을 삭제하는 데 실패했습니다." }, { status: 500 });
  }
}
