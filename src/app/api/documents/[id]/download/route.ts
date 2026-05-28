import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { readFile } from "fs/promises";
import { basename, join } from "path";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession() as { id: string; loginId: string; name: string; role: string } | null;
  if (!session) {
    return NextResponse.json({ error: "인증되지 않은 사용자입니다." }, { status: 401 });
  }

  const { id } = await params;

  try {
    // 1. Fetch document from DB
    const document = await prisma.document.findUnique({
      where: { id },
    });

    if (!document) {
      return NextResponse.json({ error: "존재하지 않는 문서입니다." }, { status: 404 });
    }

    // 2. Role-based access validation
    if (document.status === "PENDING" && session.role !== "ADMIN") {
      return NextResponse.json({ error: "해당 문서를 볼 수 있는 권한이 없습니다." }, { status: 403 });
    }

    // 3. Resolve absolute path
    const absolutePath = join(process.cwd(), "uploads", basename(document.filePath));

    // 4. Create Audit Log (Append-only)
    const ipAddress = request.headers.get("x-forwarded-for") || "127.0.0.1";
    const userAgent = request.headers.get("user-agent") || "Unknown";

    await prisma.documentLog.create({
      data: {
        userId: session.id,
        documentId: document.id,
        actionType: "DOWNLOAD",
        ipAddress,
        userAgent,
      },
    });

    // 5. Read file and return as streaming Response
    const fileBuffer = await readFile(absolutePath);

    return new Response(fileBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(document.fileName)}"`,
      },
    });
  } catch (e) {
    console.error("Download dynamic route error:", e);
    return NextResponse.json({ error: "파일 다운로드 중 문제가 발생했습니다." }, { status: 500 });
  }
}
