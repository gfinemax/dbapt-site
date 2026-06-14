CREATE TABLE "CoopNewsComment" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "newsId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,

    CONSTRAINT "CoopNewsComment_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "CoopNewsComment_newsId_createdAt_idx" ON "CoopNewsComment"("newsId", "createdAt");

ALTER TABLE "CoopNewsComment" ADD CONSTRAINT "CoopNewsComment_newsId_fkey" FOREIGN KEY ("newsId") REFERENCES "CoopNews"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CoopNewsComment" ADD CONSTRAINT "CoopNewsComment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
