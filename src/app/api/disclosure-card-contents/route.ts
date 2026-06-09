import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

function normalizeText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function isAdminSession(session: Awaited<ReturnType<typeof getSession>>) {
  return typeof session?.role === "string" && session.role.trim().toUpperCase() === "ADMIN";
}

type DisclosureCardContentDelegate = {
  upsert: (args: {
    where: { itemId: string };
    create: { itemId: string; title: string; description: string };
    update: { title: string; description: string };
  }) => Promise<unknown>;
};

function getDisclosureCardContentDelegate() {
  return (prisma as typeof prisma & {
    disclosureCardContent?: DisclosureCardContentDelegate;
  }).disclosureCardContent;
}

export async function PATCH(request: Request) {
  const session = await getSession();
  if (!isAdminSession(session)) {
    return NextResponse.json({ error: "관리자 권한이 필요합니다." }, { status: 403 });
  }

  try {
    const body = await request.json() as Record<string, unknown>;
    const itemId = normalizeText(body.itemId);
    const title = normalizeText(body.title);
    const description = normalizeText(body.description);

    if (!itemId) {
      return NextResponse.json({ error: "카드 식별자가 필요합니다." }, { status: 400 });
    }

    if (!title || !description) {
      return NextResponse.json({ error: "카드 제목과 내용을 모두 입력해 주세요." }, { status: 400 });
    }

    const disclosureCardContent = getDisclosureCardContentDelegate();
    if (!disclosureCardContent) {
      return NextResponse.json({ error: "카드 문구 저장 기능을 준비 중입니다. 서버를 다시 시작해 주세요." }, { status: 503 });
    }

    const cardContent = await disclosureCardContent.upsert({
      where: { itemId },
      create: { itemId, title, description },
      update: { title, description },
    });

    return NextResponse.json({ success: true, cardContent });
  } catch (e) {
    console.error("PATCH disclosure card content error:", e);
    return NextResponse.json({ error: "카드 문구 저장 중 문제가 발생했습니다." }, { status: 500 });
  }
}
