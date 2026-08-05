import { NextResponse } from "next/server";
import { downloadAccessibleFreePostAttachment } from "@/lib/news/free-post-attachment";

function asciiFileName(fileName: string) {
  return fileName.replace(/[^\x20-\x7E]/g, "_").replace(/["\\]/g, "_").trim() || "attachment";
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const result = await downloadAccessibleFreePostAttachment(id);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    const bytes = await result.file.arrayBuffer();
    const encodedName = encodeURIComponent(result.post.attachmentName);
    return new Response(bytes, {
      headers: {
        "Content-Type": result.file.type || "application/octet-stream",
        "Content-Disposition": `attachment; filename="${asciiFileName(result.post.attachmentName)}"; filename*=UTF-8''${encodedName}`,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("Free-post attachment download error:", error);
    return NextResponse.json({ error: "첨부파일을 다운로드하지 못했습니다." }, { status: 500 });
  }
}
