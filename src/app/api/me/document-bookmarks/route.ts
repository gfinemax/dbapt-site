import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

type BookmarkSession = {
  id: string;
  loginId: string | null;
  name: string;
  role: string;
} | null;

async function requireSession() {
  const session = (await getSession()) as BookmarkSession;
  if (!session) {
    return { session: null, response: NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 }) };
  }
  return { session, response: null };
}

export async function POST(request: Request) {
  const { session, response } = await requireSession();
  if (response) return response;

  try {
    const body = await request.json();
    const documentId = typeof body.documentId === "string" ? body.documentId.trim() : "";
    if (!documentId) {
      return NextResponse.json({ error: "보관할 문서 ID가 필요합니다." }, { status: 400 });
    }

    await prisma.personalDocumentBookmark.upsert({
      where: { userId_documentId: { userId: session.id, documentId } },
      update: {},
      create: { userId: session.id, documentId },
    });

    return NextResponse.json({ bookmarked: true });
  } catch (error) {
    console.error("POST personal document bookmark error:", error);
    return NextResponse.json({ error: "문서 보관 중 문제가 발생했습니다." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { session, response } = await requireSession();
  if (response) return response;

  try {
    const url = new URL(request.url);
    const documentId = url.searchParams.get("documentId")?.trim() || "";
    if (!documentId) {
      return NextResponse.json({ error: "보관 해제할 문서 ID가 필요합니다." }, { status: 400 });
    }

    await prisma.personalDocumentBookmark.deleteMany({
      where: { userId: session.id, documentId },
    });

    return NextResponse.json({ bookmarked: false });
  } catch (error) {
    console.error("DELETE personal document bookmark error:", error);
    return NextResponse.json({ error: "문서 보관 해제 중 문제가 발생했습니다." }, { status: 500 });
  }
}
