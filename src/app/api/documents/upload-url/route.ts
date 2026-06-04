import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import {
  createDocumentSignedUpload,
  isAllowedDocumentUploadExtension,
  MAX_DOCUMENT_UPLOAD_SIZE,
} from "@/lib/document-storage";

type UploadRequestFile = {
  name?: unknown;
  size?: unknown;
};

function validateUploadRequestFile(file: UploadRequestFile) {
  const name = typeof file.name === "string" ? file.name.trim() : "";
  const size = typeof file.size === "number" ? file.size : Number(file.size);

  if (!name || !Number.isFinite(size) || size <= 0) {
    return { error: "업로드할 파일 정보가 올바르지 않습니다." };
  }

  if (size > MAX_DOCUMENT_UPLOAD_SIZE) {
    return { error: "문서 파일은 20MB 이하만 업로드할 수 있습니다." };
  }

  if (!isAllowedDocumentUploadExtension(name)) {
    return { error: "문서 파일은 PDF, HWP, HWPX, Word 파일만 업로드할 수 있습니다." };
  }

  return { name, size };
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "관리자 권한이 필요합니다." }, { status: 403 });
  }

  try {
    const body = await request.json();
    const files = Array.isArray(body.files) ? body.files.slice(0, 11) : [];

    if (files.length === 0) {
      return NextResponse.json({ error: "업로드할 파일이 없습니다." }, { status: 400 });
    }

    const uploads = [];
    for (const file of files) {
      const validated = validateUploadRequestFile(file);
      if ("error" in validated) {
        return NextResponse.json({ error: validated.error }, { status: 400 });
      }

      uploads.push(await createDocumentSignedUpload(validated.name));
    }

    return NextResponse.json({ uploads });
  } catch (e) {
    console.error("Create document upload URL error:", e);
    return NextResponse.json({ error: "문서 업로드 준비 중 문제가 발생했습니다." }, { status: 500 });
  }
}
