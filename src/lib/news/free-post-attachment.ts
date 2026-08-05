import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { downloadPublicUpload } from "@/lib/document-storage";

export function isPdfAttachment(fileName: string) {
  return fileName.trim().toLowerCase().endsWith(".pdf");
}

export async function loadAccessibleFreePostAttachment(postId: string) {
  const [session, post] = await Promise.all([
    getSession() as Promise<{ id?: string; role?: string } | null>,
    prisma.freePost.findUnique({
      where: { id: postId },
      select: {
        id: true,
        title: true,
        attachmentPath: true,
        attachmentName: true,
        attachmentSize: true,
        isPublicShareEnabled: true,
      },
    }),
  ]);

  if (!post) {
    return { ok: false, error: "존재하지 않는 게시글입니다.", status: 404 } as const;
  }
  if (!session && !post.isPublicShareEnabled) {
    return { ok: false, error: "로그인 후 첨부파일을 볼 수 있습니다.", status: 401 } as const;
  }
  if (!post.attachmentPath || !post.attachmentName) {
    return { ok: false, error: "첨부파일이 없습니다.", status: 404 } as const;
  }

  return {
    ok: true,
    post: {
      ...post,
      attachmentPath: post.attachmentPath,
      attachmentName: post.attachmentName,
    },
    session,
  } as const;
}

export async function downloadAccessibleFreePostAttachment(postId: string) {
  const access = await loadAccessibleFreePostAttachment(postId);
  if (!access.ok) {
    return access;
  }

  const file = await downloadPublicUpload(access.post.attachmentPath);
  return { ...access, file } as const;
}
