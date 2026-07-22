ALTER TABLE "DocumentLog"
ADD COLUMN "resourceType" TEXT NOT NULL DEFAULT 'MAIN_FILE',
ADD COLUMN "attachmentId" TEXT,
ADD COLUMN "fileName" TEXT,
ADD COLUMN "fileSize" INTEGER,
ADD COLUMN "requestPath" TEXT;

CREATE INDEX "DocumentLog_createdAt_idx" ON "DocumentLog"("createdAt");
CREATE INDEX "DocumentLog_actionType_createdAt_idx" ON "DocumentLog"("actionType", "createdAt");
CREATE INDEX "DocumentLog_userId_createdAt_idx" ON "DocumentLog"("userId", "createdAt");
CREATE INDEX "DocumentLog_documentId_createdAt_idx" ON "DocumentLog"("documentId", "createdAt");
