import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { downloadDocumentFile } from "@/lib/document-storage";

function isPdfFile(fileName: string) {
  return fileName.trim().toLowerCase().endsWith(".pdf");
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ attachmentId: string }> }
) {
  const session = (await getSession()) as {
    id: string;
    loginId: string;
    name: string;
    role: string;
  } | null;

  if (!session) {
    return NextResponse.json({ error: "인증되지 않은 사용자입니다." }, { status: 401 });
  }

  if (session.role === "PENDING") {
    return NextResponse.json({ error: "가입 승인 대기 중에는 자료를 열람할 수 없습니다." }, { status: 403 });
  }

  const { attachmentId } = await params;

  try {
    const attachment = await prisma.attachment.findUnique({
      where: { id: attachmentId },
      include: {
        document: true,
      },
    });

    if (!attachment) {
      return NextResponse.json({ error: "존재하지 않는 첨부파일입니다." }, { status: 404 });
    }

    if (attachment.document.status === "PENDING" && session.role !== "ADMIN") {
      return NextResponse.json({ error: "해당 첨부파일을 열람할 수 있는 권한이 없습니다." }, { status: 403 });
    }

    if (!isPdfFile(attachment.fileName)) {
      return NextResponse.json(
        { error: "PDF 미리보기를 지원하지 않는 첨부 형식입니다. 다운로드로 확인해 주세요." },
        { status: 415 }
      );
    }

    const ipAddress = request.headers.get("x-forwarded-for") || "127.0.0.1";
    const userAgent = request.headers.get("user-agent") || "Unknown";

    await prisma.documentLog.create({
      data: {
        userId: session.id,
        documentId: attachment.documentId,
        actionType: "VIEW",
        ipAddress,
        userAgent,
      },
    });

    const file = await downloadDocumentFile(attachment.filePath);
    const fileBuffer = await file.arrayBuffer();

    return new Response(fileBuffer, {
      headers: {
        "Content-Type": file.type || "application/pdf",
        "Content-Disposition": `inline; filename="${encodeURIComponent(attachment.fileName)}"`,
      },
    });
  } catch (e) {
    console.error("View attachment dynamic route error:", e);
    const detail = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      { error: `첨부파일 열람 중 문제가 발생했습니다. (상세 오류: ${detail})` },
      { status: 500 }
    );
  }
}
