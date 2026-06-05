import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

function normalizeText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function PATCH(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "관리자 권한이 필요합니다." }, { status: 403 });
  }

  try {
    const body = await request.json() as Record<string, unknown>;
    const subCategory = normalizeText(body.subCategory);
    const title = normalizeText(body.title);
    const message = normalizeText(body.message);

    if (!subCategory) {
      return NextResponse.json({ error: "문서함 세부 분류가 필요합니다." }, { status: 400 });
    }

    if (!title || !message) {
      return NextResponse.json({ error: "안내 제목과 본문을 모두 입력해 주세요." }, { status: 400 });
    }

    const emptyMessage = await prisma.disclosureEmptyMessage.upsert({
      where: { subCategory },
      create: { subCategory, title, message },
      update: { title, message },
    });

    return NextResponse.json({ success: true, emptyMessage });
  } catch (e) {
    console.error("PATCH disclosure empty message error:", e);
    return NextResponse.json({ error: "안내문 저장 중 문제가 발생했습니다." }, { status: 500 });
  }
}
