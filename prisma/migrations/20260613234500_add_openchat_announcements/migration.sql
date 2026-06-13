-- CreateTable
CREATE TABLE "OpenChatAnnouncement" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "message" TEXT NOT NULL,
    "copiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OpenChatAnnouncement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OpenChatAnnouncement_documentId_status_idx" ON "OpenChatAnnouncement"("documentId", "status");

-- CreateIndex
CREATE INDEX "OpenChatAnnouncement_status_createdAt_idx" ON "OpenChatAnnouncement"("status", "createdAt");

-- AddForeignKey
ALTER TABLE "OpenChatAnnouncement" ADD CONSTRAINT "OpenChatAnnouncement_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;
