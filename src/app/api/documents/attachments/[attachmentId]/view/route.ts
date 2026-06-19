import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { downloadDocumentFile } from "@/lib/document-storage";
import { getDocumentViewAccessError, shouldWriteDocumentViewLog } from "@/lib/document-view-access";

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

    const accessError = getDocumentViewAccessError(attachment.document, session);
    if (accessError) {
      return NextResponse.json({ error: accessError.error }, { status: accessError.status });
    }

    if (!isPdfFile(attachment.fileName)) {
      return NextResponse.json(
        { error: "PDF 미리보기를 지원하지 않는 첨부 형식입니다. 다운로드로 확인해 주세요." },
        { status: 415 }
      );
    }

    if (shouldWriteDocumentViewLog(session)) {
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
    }

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
