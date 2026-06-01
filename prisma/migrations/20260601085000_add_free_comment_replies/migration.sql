-- Add one-level reply threading support for free-board comments.
ALTER TABLE "FreeComment" ADD COLUMN "parentId" TEXT;

ALTER TABLE "FreeComment"
ADD CONSTRAINT "FreeComment_parentId_fkey"
FOREIGN KEY ("parentId") REFERENCES "FreeComment"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

CREATE INDEX "FreeComment_postId_parentId_idx" ON "FreeComment"("postId", "parentId");
