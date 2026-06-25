import { Document as PrismaDocument, Attachment as PrismaAttachment } from "@prisma/client";
import { type Document } from "@/components/portal/document-table";

type PrismaDocWithAttachments = PrismaDocument & {
  attachments?: PrismaAttachment[];
};

export function serializeDocuments(docs: PrismaDocWithAttachments[]): Document[] {
  return docs.map(doc => ({
    id: doc.id,
    title: doc.title,
    description: doc.description,
    category: doc.category,
    subCategory: doc.subCategory,
    correspondenceType: doc.correspondenceType as Document["correspondenceType"],
    replyToDocumentId: doc.replyToDocumentId,
    replyNotRequired: doc.replyNotRequired,
    replyDueDate: doc.replyDueDate ? doc.replyDueDate.toISOString() : null,
    filePath: doc.filePath,
    fileName: doc.fileName,
    fileSize: doc.fileSize,
    originalFileSize: doc.originalFileSize,
    storedFileSize: doc.storedFileSize,
    fileOptimized: doc.fileOptimized,
    fileSizeReductionPercent: doc.fileSizeReductionPercent,
    status: doc.status,
    isStarred: doc.isStarred,
    publishedAt: doc.publishedAt ? doc.publishedAt.toISOString() : null,
    documentDate: doc.documentDate.toISOString(),
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
    attachmentName: doc.attachmentName,
    attachmentPath: doc.attachmentPath,
    attachmentSize: doc.attachmentSize,
    attachments: doc.attachments ? doc.attachments.map(att => ({
      id: att.id,
      documentId: att.documentId,
      filePath: att.filePath,
      fileName: att.fileName,
      fileSize: att.fileSize,
      originalFileSize: att.originalFileSize,
      storedFileSize: att.storedFileSize,
      fileOptimized: att.fileOptimized,
      fileSizeReductionPercent: att.fileSizeReductionPercent,
      createdAt: att.createdAt.toISOString(),
    })) : [],
  }));
}
