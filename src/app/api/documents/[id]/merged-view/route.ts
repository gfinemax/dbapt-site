import { NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { downloadDocumentFile } from "@/lib/document-storage";
import { getDocumentViewAccessError, shouldWriteDocumentViewLog } from "@/lib/document-view-access";
import { getInlinePdfResponseHeaders } from "@/lib/pdf-response-headers";

function isPdfFile(fileName: string) {
  return fileName.trim().toLowerCase().endsWith(".pdf");
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = (await getSession()) as {
    id: string;
    loginId?: string;
    name?: string;
    role: string;
  } | null;

  const { id } = await params;

  try {
    const document = await prisma.document.findUnique({
      where: { id },
      include: {
        attachments: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!document) {
      return NextResponse.json({ error: "존재하지 않는 문서입니다." }, { status: 404 });
    }

    const accessError = getDocumentViewAccessError(document, session);
    if (accessError) {
      return NextResponse.json({ error: accessError.error }, { status: accessError.status });
    }

    if (!isPdfFile(document.fileName)) {
      return NextResponse.json(
        { error: "PDF 미리보기를 지원하지 않는 문서 형식입니다. 다운로드로 확인해 주세요." },
        { status: 415 },
      );
    }

    const pdfSources = [
      { fileName: document.fileName, filePath: document.filePath },
      ...document.attachments
        .filter((attachment) => isPdfFile(attachment.fileName))
        .map((attachment) => ({
          fileName: attachment.fileName,
          filePath: attachment.filePath,
        })),
    ];

    const mergedPdf = await PDFDocument.create();

    for (const source of pdfSources) {
      const file = await downloadDocumentFile(source.filePath);
      const pdf = await PDFDocument.load(await file.arrayBuffer());
      const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      for (const page of pages) {
        mergedPdf.addPage(page);
      }
    }

    if (shouldWriteDocumentViewLog(session)) {
      const ipAddress = request.headers.get("x-forwarded-for") || "127.0.0.1";
      const userAgent = request.headers.get("user-agent") || "Unknown";

      await prisma.documentLog.create({
        data: {
          userId: session.id,
          documentId: document.id,
          actionType: "VIEW",
          ipAddress,
          userAgent,
        },
      });
    }

    const mergedBytes = await mergedPdf.save();
    const mergedBuffer = new ArrayBuffer(mergedBytes.byteLength);
    new Uint8Array(mergedBuffer).set(mergedBytes);

    try {
      await prisma.document.update({
        where: { id: document.id },
        data: { viewCount: { increment: 1 } },
        select: { id: true, viewCount: true },
      });
    } catch (viewCountError) {
      console.error("Document view count update failed:", viewCountError);
    }

    return new Response(mergedBuffer, {
      headers: {
        ...getInlinePdfResponseHeaders(document.fileName),
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    console.error("Merged view dynamic route error:", e);
    const detail = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      { error: `통합 PDF 열람 중 문제가 발생했습니다. (상세 오류: ${detail})` },
      { status: 500 }
    );
  }
}
