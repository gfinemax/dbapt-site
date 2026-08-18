import { NextResponse } from "next/server";
import { downloadAccessibleCoopNewsAttachment } from "@/lib/news/coop-news-attachment";

function asciiFileName(fileName: string) {
  return fileName.replace(/[^\x20-\x7E]/g, "_").replace(/["\\]/g, "_").trim() || "attachment";
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const result = await downloadAccessibleCoopNewsAttachment(id);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    const bytes = await result.file.arrayBuffer();
    const encodedName = encodeURIComponent(result.news.attachmentName);
    return new Response(bytes, {
      headers: {
        "Content-Type": result.file.type || "application/octet-stream",
        "Content-Disposition": `attachment; filename="${asciiFileName(result.news.attachmentName)}"; filename*=UTF-8''${encodedName}`,
        "Cache-Control": "public, max-age=3600",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("CoopNews attachment download error:", error);
    return NextResponse.json({ error: "첨부파일을 다운로드하지 못했습니다." }, { status: 500 });
  }
}
