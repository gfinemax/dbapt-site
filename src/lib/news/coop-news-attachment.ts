import { prisma } from "@/lib/db";
import { downloadPublicUpload } from "@/lib/document-storage";

export function isPdfAttachment(fileName: string) {
  return fileName.trim().toLowerCase().endsWith(".pdf");
}

export async function loadAccessibleCoopNewsAttachment(newsId: string) {
  const news = await prisma.coopNews.findUnique({
    where: { id: newsId },
    select: {
      id: true,
      title: true,
      attachmentPath: true,
      attachmentName: true,
      attachmentSize: true,
    },
  });

  if (!news) {
    return { ok: false, error: "존재하지 않는 공지사항입니다.", status: 404 } as const;
  }
  if (!news.attachmentPath || !news.attachmentName) {
    return { ok: false, error: "첨부파일이 없습니다.", status: 404 } as const;
  }

  return {
    ok: true,
    news: {
      ...news,
      attachmentPath: news.attachmentPath,
      attachmentName: news.attachmentName,
    },
  } as const;
}

export async function downloadAccessibleCoopNewsAttachment(newsId: string) {
  const access = await loadAccessibleCoopNewsAttachment(newsId);
  if (!access.ok) {
    return access;
  }

  const file = await downloadPublicUpload(access.news.attachmentPath);
  return { ...access, file } as const;
}
