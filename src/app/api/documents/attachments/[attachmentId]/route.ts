import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { downloadDocumentFile } from "@/lib/document-storage";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ attachmentId: string }> }
) {
  const session = await getSession() as { id: string; loginId: string; name: string; role: string } | null;
  if (!session) {
    return NextResponse.json({ error: "인증되지 않은 사용자입니다." }, { status: 401 });
  }

  const { attachmentId } = await params;

  try {
    // 1. Fetch attachment from DB
    const attachment = await prisma.attachment.findUnique({
      where: { id: attachmentId },
      include: {
        document: true,
      }
    });

    if (!attachment) {
      return NextResponse.json({ error: "존재하지 않는 첨부파일입니다." }, { status: 404 });
    }

    // 2. Role-based access validation based on parent document status
    if (attachment.document.status === "PENDING" && session.role !== "ADMIN") {
      return NextResponse.json({ error: "해당 첨부파일을 다운로드할 수 있는 권한이 없습니다." }, { status: 403 });
    }

    // 3. Create Audit Log (Append-only) for security audits
    const ipAddress = request.headers.get("x-forwarded-for") || "127.0.0.1";
    const userAgent = request.headers.get("user-agent") || "Unknown";

    await prisma.documentLog.create({
      data: {
        userId: session.id,
        documentId: attachment.documentId,
        actionType: "DOWNLOAD", // Standard audit download log
        ipAddress,
        userAgent,
      },
    });

    // 4. Download from private Supabase Storage and return through the gated API.
    const file = await downloadDocumentFile(attachment.filePath);
    const fileBuffer = await file.arrayBuffer();

    return new Response(fileBuffer, {
      headers: {
        "Content-Type": file.type || "application/octet-stream",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(attachment.fileName)}"`,
      },
    });
  } catch (e) {
    console.error("Download attachment dynamic route error:", e);
    return NextResponse.json({ error: "첨부파일 다운로드 중 문제가 발생했습니다." }, { status: 500 });
  }
}
