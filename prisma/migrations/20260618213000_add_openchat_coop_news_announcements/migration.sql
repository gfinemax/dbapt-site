ALTER TABLE "OpenChatAnnouncement" ALTER COLUMN "documentId" DROP NOT NULL;

ALTER TABLE "OpenChatAnnouncement" ADD COLUMN "coopNewsId" TEXT;

ALTER TABLE "OpenChatAnnouncement"
  ADD CONSTRAINT "OpenChatAnnouncement_coopNewsId_fkey"
  FOREIGN KEY ("coopNewsId") REFERENCES "CoopNews"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE INDEX "OpenChatAnnouncement_coopNewsId_status_idx" ON "OpenChatAnnouncement"("coopNewsId", "status");
