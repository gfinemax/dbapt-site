import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: "조회할 글 ID가 누락되었습니다." }, { status: 400 });
  }

  try {
    const updated = await prisma.coopNews.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
      select: { id: true, viewCount: true },
    });

    return NextResponse.json({ success: true, id: updated.id, viewCount: updated.viewCount });
  } catch (error) {
    console.error("Increment news view count error:", error);
    return NextResponse.json({ error: "조회수 반영에 실패했습니다." }, { status: 500 });
  }
}
