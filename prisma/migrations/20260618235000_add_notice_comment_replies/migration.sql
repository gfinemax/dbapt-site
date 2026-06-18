-- Add one-level reply threading support to notice comments.
ALTER TABLE "CoopNewsComment" ADD COLUMN "parentId" TEXT;

ALTER TABLE "CoopNewsComment"
ADD CONSTRAINT "CoopNewsComment_parentId_fkey"
FOREIGN KEY ("parentId") REFERENCES "CoopNewsComment"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

CREATE INDEX "CoopNewsComment_newsId_parentId_idx" ON "CoopNewsComment"("newsId", "parentId");
