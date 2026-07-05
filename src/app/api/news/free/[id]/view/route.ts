import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = (await getSession()) as { id: string; role: string } | null;
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: "조회할 게시글 ID가 누락되었습니다." }, { status: 400 });
  }

  try {
    const post = await prisma.freePost.findUnique({
      where: { id },
      select: { id: true, isPublicShareEnabled: true },
    });

    if (!post) {
      return NextResponse.json({ error: "존재하지 않는 게시글입니다." }, { status: 404 });
    }

    if (!session && !post.isPublicShareEnabled) {
      return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    const updated = await prisma.freePost.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
      select: { id: true, viewCount: true },
    });

    return NextResponse.json({ success: true, id: updated.id, viewCount: updated.viewCount });
  } catch (error) {
    console.error("Increment free-board view count error:", error);
    return NextResponse.json({ error: "조회수 반영에 실패했습니다." }, { status: 500 });
  }
}
