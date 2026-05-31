import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

// 1. GET: FAQ 조회 (MEMBER, ADMIN, REFUND 전용)
export async function GET() {
  const session = (await getSession()) as { role: string } | null;
  if (!session) {
    return NextResponse.json({ error: "인증되지 않은 사용자입니다." }, { status: 401 });
  }

  try {
    const faqs = await prisma.fAQ.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ faqs });
  } catch (e) {
    console.error("GET faq error:", e);
    return NextResponse.json({ error: "FAQ 목록을 가져오는 데 실패했습니다." }, { status: 500 });
  }
}

// 2. POST: FAQ 등록 (ADMIN 전용)
export async function POST(request: Request) {
  const session = (await getSession()) as { role: string } | null;
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "관리자 권한이 필요합니다." }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { question, answer, category } = body;

    if (!question || !answer || !category) {
      return NextResponse.json({ error: "필수 입력 항목(질문, 답변, 분류)이 누락되었습니다." }, { status: 400 });
    }

    const faq = await prisma.fAQ.create({
      data: {
        question,
        answer,
        category,
      },
    });

    return NextResponse.json({ success: true, faq });
  } catch (e) {
    console.error("POST faq error:", e);
    return NextResponse.json({ error: "FAQ를 등록하는 데 실패했습니다." }, { status: 500 });
  }
}

// 3. DELETE: FAQ 삭제 (ADMIN 전용)
export async function DELETE(request: Request) {
  const session = (await getSession()) as { role: string } | null;
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "관리자 권한이 필요합니다." }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "삭제할 대상 FAQ ID가 누락되었습니다." }, { status: 400 });
    }

    await prisma.fAQ.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("DELETE faq error:", e);
    return NextResponse.json({ error: "FAQ를 삭제하는 데 실패했습니다." }, { status: 500 });
  }
}
