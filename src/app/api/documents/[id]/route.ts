import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createClient } from "@supabase/supabase-js";

const DOCUMENTS_BUCKET = process.env.SUPABASE_DOCUMENTS_BUCKET || "documents";

function getSupabaseAdmin() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseKey) {
    throw new Error("SUPABASE_URL and SUPABASE_SECRET_KEY are required.");
  }
  return createClient(supabaseUrl, supabaseKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// DELETE: 문서 삭제 (관리자 전용 – Supabase Storage 파일도 함께 정리)
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "관리자 권한이 필요합니다." }, { status: 403 });
  }

  const { id } = await params;

  try {
    // 1. DB에서 문서 및 첨부파일 정보 조회
    const doc = await prisma.document.findUnique({
      where: { id },
      include: { attachments: true },
    });

    if (!doc) {
      return NextResponse.json({ error: "문서를 찾을 수 없습니다." }, { status: 404 });
    }

    // 2. Supabase Storage에서 파일 삭제 (본문 PDF + 추가 첨부파일들)
    const supabase = getSupabaseAdmin();
    const pathsToDelete = [doc.filePath];

    // 레거시 단일 첨부파일
    if (doc.attachmentPath) {
      pathsToDelete.push(doc.attachmentPath);
    }

    // 다중 첨부파일
    for (const att of doc.attachments) {
      pathsToDelete.push(att.filePath);
    }

    const { error: storageError } = await supabase.storage
      .from(DOCUMENTS_BUCKET)
      .remove(pathsToDelete);

    if (storageError) {
      console.error("Storage deletion warning:", storageError);
      // 스토리지 오류가 발생하더라도 DB 삭제는 진행
    }

    // 3. DB 레코드 삭제 (Cascade로 attachments, logs도 함께 삭제)
    await prisma.document.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("DELETE document error:", e);
    return NextResponse.json({ error: "문서 삭제 중 문제가 발생했습니다." }, { status: 500 });
  }
}

const EDITABLE_DOCUMENT_FIELDS = [
  "title",
  "description",
  "category",
  "subCategory",
  "documentDate",
  "publishedAt",
  "isStarred",
] as const;

function hasOwn(body: Record<string, unknown>, key: string) {
  return Object.prototype.hasOwnProperty.call(body, key);
}

// PATCH: 문서 메타데이터 수정 및 별표(중요) 토글 (관리자 전용)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "관리자 권한이 필요합니다." }, { status: 403 });
  }

  const { id } = await params;

  try {
    const body = await request.json() as Record<string, unknown>;
    const data: {
      title?: string;
      description?: string | null;
      category?: string;
      subCategory?: string | null;
      documentDate?: Date;
      publishedAt?: Date | null;
      isStarred?: boolean;
    } = {};

    const hasEditableField = EDITABLE_DOCUMENT_FIELDS.some((field) => hasOwn(body, field));
    if (!hasEditableField) {
      return NextResponse.json({ error: "수정할 문서 정보가 없습니다." }, { status: 400 });
    }

    if (hasOwn(body, "title")) {
      const title = typeof body.title === "string" ? body.title.trim() : "";
      if (!title) {
        return NextResponse.json({ error: "문서 제목을 입력해 주세요." }, { status: 400 });
      }
      data.title = title;
    }

    if (hasOwn(body, "description")) {
      const description = typeof body.description === "string" ? body.description.trim() : "";
      data.description = description || null;
    }

    if (hasOwn(body, "category")) {
      const category = typeof body.category === "string" ? body.category.trim() : "";
      if (!category) {
        return NextResponse.json({ error: "카테고리를 선택해 주세요." }, { status: 400 });
      }
      data.category = category;
    }

    if (hasOwn(body, "subCategory")) {
      const subCategory = typeof body.subCategory === "string" ? body.subCategory.trim() : "";
      data.subCategory = subCategory || null;
    }

    if (hasOwn(body, "documentDate")) {
      const documentDateStr = typeof body.documentDate === "string" ? body.documentDate : "";
      const documentDate = new Date(documentDateStr);
      if (!documentDateStr || Number.isNaN(documentDate.getTime())) {
        return NextResponse.json({ error: "발생일이 올바르지 않습니다." }, { status: 400 });
      }
      data.documentDate = documentDate;
    }

    if (hasOwn(body, "publishedAt")) {
      const publishedAtStr = typeof body.publishedAt === "string" ? body.publishedAt : "";
      const publishedAt = new Date(publishedAtStr);
      if (!publishedAtStr || Number.isNaN(publishedAt.getTime())) {
        return NextResponse.json({ error: "등록일이 올바르지 않습니다." }, { status: 400 });
      }
      data.publishedAt = publishedAt;
    }

    if (hasOwn(body, "isStarred")) {
      if (typeof body.isStarred !== "boolean") {
        return NextResponse.json({ error: "isStarred 필드는 boolean 이어야 합니다." }, { status: 400 });
      }
      data.isStarred = body.isStarred;
    }

    const updated = await prisma.document.update({
      where: { id },
      data,
      include: {
        attachments: true,
      },
    });

    return NextResponse.json({ success: true, document: updated });
  } catch (e) {
    console.error("PATCH document error:", e);
    return NextResponse.json({ error: "문서 업데이트 중 문제가 발생했습니다." }, { status: 500 });
  }
}
