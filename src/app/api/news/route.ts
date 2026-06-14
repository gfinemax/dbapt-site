import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

// 1. GET: 공지사항 및 조합뉴스 조회 (Public)
export async function GET(request: Request) {
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
          },
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ newsList });
  } catch (e) {
    console.error("GET news error:", e);
    return NextResponse.json({ error: "조합소식을 가져오는 데 실패했습니다." }, { status: 500 });
  }
}

// 2. POST: 공지사항 및 조합뉴스 등록 (ADMIN 전용)
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
    const {
      title,
      content,
      category,
      imagePath,
      isStarred,
      attachmentPath,
      attachmentName,
      attachmentSize,
    } = body;

    if (!title || !content || !category) {
      return NextResponse.json({ error: "필수 입력 항목(제목, 내용, 카테고리)이 누락되었습니다." }, { status: 400 });
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
        authorId: session.id,
      },
    });

    return NextResponse.json({ success: true, news });
  } catch (e) {
    console.error("POST news error:", e);
    return NextResponse.json({ error: "조합소식을 등록하는 데 실패했습니다." }, { status: 500 });
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
    } = body;

    if (!id) {
      return NextResponse.json({ error: "수정할 대상 ID가 누락되었습니다." }, { status: 400 });
    }

    if (!title || !content || !category) {
      return NextResponse.json({ error: "필수 입력 항목(제목, 내용, 카테고리)이 누락되었습니다." }, { status: 400 });
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
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    return NextResponse.json({ success: true, news });
  } catch (e) {
    console.error("PATCH news error:", e);
    return NextResponse.json({ error: "조합소식을 수정하는 데 실패했습니다." }, { status: 500 });
  }
}

// 4. DELETE: 공지사항 및 조합뉴스 삭제
export async function DELETE(request: Request) {
  const session = (await getSession()) as { id: string; role: string } | null;
  if (!session) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }
  if (session.role !== "ADMIN") {
    return NextResponse.json({ error: "관리자 권한이 필요합니다." }, { status: 403 });
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

    await prisma.coopNews.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("DELETE news error:", e);
    return NextResponse.json({ error: "공지사항을 삭제하는 데 실패했습니다." }, { status: 500 });
  }
}
