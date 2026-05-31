import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { uploadDocumentFile } from "@/lib/document-storage";

// 1. GET: List documents (gated by session and role)
export async function GET(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "인증되지 않은 사용자입니다." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");

  try {
    const whereClause: { category?: string; status?: string } = {};

    // Category filter
    if (category) {
      whereClause.category = category;
    }

    // Role-specific visibility bounds
    if (session.role !== "ADMIN") {
      // Regular members & Refund members can only see APPROVED documents
      whereClause.status = "APPROVED";
    }

    const documents = await prisma.document.findMany({
      where: whereClause,
      include: {
        attachments: true,
      },
      orderBy: { documentDate: "desc" },
    });

    return NextResponse.json({ documents });
  } catch (e) {
    console.error("GET documents error:", e);
    return NextResponse.json({ error: "문서 목록을 가져오는 데 실패했습니다." }, { status: 500 });
  }
}

// 2. POST: Upload new document (ADMIN only)
export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "관리자 권한이 필요합니다." }, { status: 403 });
  }

  try {
    const formData = await request.formData();
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const category = formData.get("category") as string;
    const subCategory = formData.get("subCategory") as string;
    const documentDateStr = formData.get("documentDate") as string;
    const publishedAtStr = formData.get("publishedAt") as string;
    const file = formData.get("file") as File | null;
    const attachments = formData.getAll("attachments") as File[];
    const isStarredStr = formData.get("isStarred") as string;
    const isStarred = isStarredStr === "true";

    if (!title || !category || !file) {
      return NextResponse.json({ error: "필수 입력 항목(제목, 카테고리, 파일)이 누락되었습니다." }, { status: 400 });
    }

    const storagePath = await uploadDocumentFile(file);

    const attachmentsData: { filePath: string; fileName: string; fileSize: number }[] = [];
    const validAttachments = attachments.slice(0, 10);

    for (const att of validAttachments) {
      if (att && att.size > 0) {
        const attPath = await uploadDocumentFile(att);
        attachmentsData.push({
          filePath: attPath,
          fileName: att.name,
          fileSize: att.size,
        });
      }
    }

    const documentDate = documentDateStr ? new Date(documentDateStr) : new Date();
    const publishedAt = publishedAtStr ? new Date(publishedAtStr) : new Date();

    // Save record to DB
    const document = await prisma.document.create({
      data: {
        title,
        description: description || null,
        category,
        subCategory: subCategory || null,
        filePath: storagePath,
        fileName: file.name,
        fileSize: file.size,
        status: "APPROVED", // Auto-approved by default in this implementation slice
        isStarred,
        publishedAt,
        documentDate,
        attachments: {
          create: attachmentsData,
        },
      },
      include: {
        attachments: true,
      },
    });

    return NextResponse.json({ success: true, document });
  } catch (e) {
    console.error("POST document upload error:", e);
    return NextResponse.json({ error: "문서 업로드 처리 중 문제가 발생했습니다." }, { status: 500 });
  }
}
