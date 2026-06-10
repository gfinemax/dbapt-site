import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { downloadDocumentFile } from "@/lib/document-storage";

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

  if (!session) {
    return NextResponse.json({ error: "인증되지 않은 사용자입니다." }, { status: 401 });
  }

  // PENDING 유저는 자료실 열람 권한이 없습니다.
  if (session.role === "PENDING") {
    return NextResponse.json({ error: "가입 승인 대기 중에는 자료를 열람할 수 없습니다." }, { status: 403 });
  }

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
    if (document.status === "PENDING" && session.role !== "ADMIN") {
      return NextResponse.json({ error: "해당 문서를 볼 수 있는 권한이 없습니다." }, { status: 403 });
    }

    if (!isPdfFile(document.fileName)) {
      return NextResponse.json(
        { error: "PDF 미리보기를 지원하지 않는 문서 형식입니다. 다운로드로 확인해 주세요." },
        { status: 415 }
      );
    }

    // 3. 보안 감사 로그 생성 (Append-only - VIEW 액션 타입)
    const ipAddress = request.headers.get("x-forwarded-for") || "127.0.0.1";
    const userAgent = request.headers.get("user-agent") || "Unknown";

    await prisma.documentLog.create({
      data: {
        userId: session.id,
        documentId: document.id,
        actionType: "VIEW", // 열람 이력 기록
        ipAddress,
        userAgent,
      },
    });

    // 4. Supabase Storage 비공개 버킷에서 파일 스트리밍
    const file = await downloadDocumentFile(document.filePath);
    const fileBuffer = await file.arrayBuffer();

    return new Response(fileBuffer, {
      headers: {
        "Content-Type": file.type || "application/pdf",
        // 'inline' 배치로 지정해 브라우저 내장 PDF 엔진으로 즉시 렌더링되게 설정
        "Content-Disposition": `inline; filename="${encodeURIComponent(document.fileName)}"`,
      },
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
