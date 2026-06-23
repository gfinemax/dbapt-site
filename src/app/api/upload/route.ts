import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { uploadPublicFile } from "@/lib/document-storage";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_ATTACHMENT_SIZE = 20 * 1024 * 1024;
const ALLOWED_IMAGE_EXTENSIONS = new Set(["jpg", "jpeg", "png", "gif", "webp"]);
const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
]);
const IMAGE_ATTACHMENT_EXTENSIONS = new Set(["jpg", "jpeg", "png", "gif", "webp", "svg"]);
const ALLOWED_ATTACHMENT_EXTENSIONS = new Set([
  "pdf",
  "doc",
  "docx",
  "xls",
  "xlsx",
  "ppt",
  "pptx",
  "txt",
  "hwp",
  "hwpx",
  "zip",
]);

export async function POST(request: Request) {
  const session = (await getSession()) as { role?: string } | null;
  if (!session) {
    return NextResponse.json({ error: "인증되지 않은 사용자입니다." }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const rawKind = formData.get("kind");
    const kind = rawKind === "attachment" || rawKind === "free-attachment" ? rawKind : "image";
    const isAttachmentKind = kind === "attachment" || kind === "free-attachment";

    if (kind === "attachment" && session.role !== "ADMIN") {
      return NextResponse.json({ error: "관리자 권한이 필요합니다." }, { status: 403 });
    }

    if (!file || file.size === 0) {
      return NextResponse.json({ error: "업로드할 파일이 없습니다." }, { status: 400 });
    }

    if (kind === "image" && file.size > MAX_IMAGE_SIZE) {
      return NextResponse.json({ error: "이미지는 5MB 이하만 업로드할 수 있습니다." }, { status: 400 });
    }
    if (isAttachmentKind && file.size > MAX_ATTACHMENT_SIZE) {
      return NextResponse.json({ error: "첨부파일은 20MB 이하만 업로드할 수 있습니다." }, { status: 400 });
    }

    const extension = file.name.split(".").pop()?.toLowerCase() || "";
    if (kind === "image" && (!ALLOWED_IMAGE_EXTENSIONS.has(extension) || !ALLOWED_IMAGE_TYPES.has(file.type))) {
      return NextResponse.json({ error: "jpg, png, gif, webp 이미지만 업로드할 수 있습니다." }, { status: 400 });
    }
    if (isAttachmentKind && (IMAGE_ATTACHMENT_EXTENSIONS.has(extension) || file.type.startsWith("image/"))) {
      return NextResponse.json({ error: "이미지는 본문 이미지로만 업로드할 수 있습니다." }, { status: 400 });
    }
    if (isAttachmentKind && !ALLOWED_ATTACHMENT_EXTENSIONS.has(extension)) {
      return NextResponse.json({ error: "허용되지 않는 첨부파일 형식입니다." }, { status: 400 });
    }

    // Supabase 퍼블릭 스토리지 버킷에 파일 업로드
    const publicUrl = await uploadPublicFile(file);

    return NextResponse.json({
      success: true,
      url: publicUrl,
      name: file.name,
      size: file.size,
      kind,
    });
  } catch (e) {
    console.error("Upload error:", e);
    return NextResponse.json({ error: "파일 업로드 중 오류가 발생했습니다." }, { status: 500 });
  }
}
