import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  const session = (await getSession()) as { id: string; role: string } | null;
  if (!session) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const newsId = typeof body.newsId === "string" ? body.newsId : "";
    const content = typeof body.content === "string" ? body.content.trim() : "";

    if (!newsId) {
      return NextResponse.json({ error: "댓글을 등록할 공지사항이 누락되었습니다." }, { status: 400 });
    }

    if (!content) {
      return NextResponse.json({ error: "댓글 내용을 입력해 주세요." }, { status: 400 });
    }

    const notice = await prisma.coopNews.findUnique({
      where: { id: newsId },
      select: { id: true, category: true },
    });

    if (!notice || notice.category !== "NOTICE") {
      return NextResponse.json({ error: "댓글을 등록할 공지사항을 찾을 수 없습니다." }, { status: 404 });
    }

    const comment = await prisma.coopNewsComment.create({
      data: {
        newsId,
        content,
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

    return NextResponse.json({ success: true, comment });
  } catch (e) {
    console.error("POST notice comment error:", e);
    return NextResponse.json({ error: "공지사항 댓글 등록에 실패했습니다." }, { status: 500 });
  }
}
