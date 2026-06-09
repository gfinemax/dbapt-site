ALTER TABLE "Document" ADD COLUMN "replyToDocumentId" TEXT;

CREATE INDEX "Document_replyToDocumentId_idx" ON "Document"("replyToDocumentId");
