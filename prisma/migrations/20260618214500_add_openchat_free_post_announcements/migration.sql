ALTER TABLE "OpenChatAnnouncement" ADD COLUMN "freePostId" TEXT;

ALTER TABLE "OpenChatAnnouncement"
  ADD CONSTRAINT "OpenChatAnnouncement_freePostId_fkey"
  FOREIGN KEY ("freePostId") REFERENCES "FreePost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE INDEX "OpenChatAnnouncement_freePostId_status_idx" ON "OpenChatAnnouncement"("freePostId", "status");
