import { NextResponse } from "next/server";
import { getInlinePdfResponseHeaders } from "@/lib/pdf-response-headers";
import {
  downloadAccessibleFreePostAttachment,
  isPdfAttachment,
} from "@/lib/news/free-post-attachment";

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
    if (!isPdfAttachment(result.post.attachmentName)) {
      return NextResponse.json(
        { error: "PDF 파일만 온라인에서 바로 볼 수 있습니다." },
        { status: 415 },
      );
    }

    const bytes = await result.file.arrayBuffer();
    return new Response(bytes, {
      headers: {
        ...getInlinePdfResponseHeaders(result.post.attachmentName),
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    console.error("Free-post PDF view error:", error);
    return NextResponse.json({ error: "PDF를 불러오지 못했습니다." }, { status: 500 });
  }
}
