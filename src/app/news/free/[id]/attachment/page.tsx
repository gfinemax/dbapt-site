import { notFound } from "next/navigation";
import { FreePostPdfViewer } from "@/components/news/free-post-pdf-viewer";
import { isPdfAttachment, loadAccessibleFreePostAttachment } from "@/lib/news/free-post-attachment";

export default async function FreePostAttachmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await loadAccessibleFreePostAttachment(id);

  if (!result.ok || !isPdfAttachment(result.post.attachmentName)) {
    notFound();
  }

  return (
    <FreePostPdfViewer
      postId={result.post.id}
      title={result.post.title}
      fileName={result.post.attachmentName}
      fileSize={result.post.attachmentSize}
    />
  );
}
