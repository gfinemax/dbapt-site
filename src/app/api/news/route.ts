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
            name: true,
            role: true,
          },
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

  try {
    const body = await request.json();
    const { title, content, category, imagePath, isStarred } = body;

    if (!title || !content || !category) {
      return NextResponse.json({ error: "필수 입력 항목(제목, 내용, 카테고리)이 누락되었습니다." }, { status: 400 });
    }

    const news = await prisma.coopNews.create({
      data: {
        title,
        content,
        category,
        imagePath: imagePath || null,
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
