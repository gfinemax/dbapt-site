import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { downloadDocumentFile } from "@/lib/document-storage";
import { getDocumentViewAccessError, shouldWriteDocumentViewLog } from "@/lib/document-view-access";
import { getInlinePdfResponseHeaders } from "@/lib/pdf-response-headers";
import { recordDocumentAccess } from "@/lib/document-audit";

function isPdfFile(fileName: string) {
  return fileName.trim().toLowerCase().endsWith(".pdf");
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = (await getSession()) as {
    id: string;
    loginId: string;
    name: string;
    role: string;
  } | null;

  const { id } = await params;

  try {
    // 1. DB에서 문서 메타데이터 조회
    const document = await prisma.document.findUnique({
      where: { id },
    });

    if (!document) {
      return NextResponse.json({ error: "존재하지 않는 문서입니다." }, { status: 404 });
    }

    // 2. 관리자 권한 및 공개 상태 보안 검증
    const accessError = getDocumentViewAccessError(document, session);
    if (accessError) {
      return NextResponse.json({ error: accessError.error }, { status: accessError.status });
    }

    if (!isPdfFile(document.fileName)) {
      return NextResponse.json(
        { error: "PDF 미리보기를 지원하지 않는 문서 형식입니다. 다운로드로 확인해 주세요." },
        { status: 415 }
      );
    }

    // 3. Supabase Storage 비공개 버킷에서 파일 스트리밍
    const file = await downloadDocumentFile(document.filePath);
    const fileBuffer = await file.arrayBuffer();

    if (shouldWriteDocumentViewLog(session)) {
      await recordDocumentAccess({
        request,
        session,
        documentId: document.id,
        actionType: "VIEW",
        resourceType: "MAIN_FILE",
        fileName: document.fileName,
        fileSize: fileBuffer.byteLength,
      });
    }

    try {
      await prisma.document.update({
        where: { id: document.id },
        data: { viewCount: { increment: 1 } },
        select: { id: true, viewCount: true },
      });
    } catch (viewCountError) {
      console.error("Document view count update failed:", viewCountError);
    }

    return new Response(fileBuffer, {
      headers: getInlinePdfResponseHeaders(document.fileName),
    });
  } catch (e) {
    console.error("View dynamic route error:", e);
    const detail = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      { error: `파일 열람 중 문제가 발생했습니다. (상세 오류: ${detail})` },
      { status: 500 }
    );
  }
}
