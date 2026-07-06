CREATE TABLE "ContentReaction" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "coopNewsId" TEXT,
    "freePostId" TEXT,
    "documentId" TEXT,

    CONSTRAINT "ContentReaction_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ContentReaction_userId_coopNewsId_key" ON "ContentReaction"("userId", "coopNewsId");
CREATE UNIQUE INDEX "ContentReaction_userId_freePostId_key" ON "ContentReaction"("userId", "freePostId");
CREATE UNIQUE INDEX "ContentReaction_userId_documentId_key" ON "ContentReaction"("userId", "documentId");
CREATE INDEX "ContentReaction_coopNewsId_idx" ON "ContentReaction"("coopNewsId");
CREATE INDEX "ContentReaction_freePostId_idx" ON "ContentReaction"("freePostId");
CREATE INDEX "ContentReaction_documentId_idx" ON "ContentReaction"("documentId");
CREATE INDEX "ContentReaction_userId_idx" ON "ContentReaction"("userId");

ALTER TABLE "ContentReaction" ADD CONSTRAINT "ContentReaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ContentReaction" ADD CONSTRAINT "ContentReaction_coopNewsId_fkey" FOREIGN KEY ("coopNewsId") REFERENCES "CoopNews"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ContentReaction" ADD CONSTRAINT "ContentReaction_freePostId_fkey" FOREIGN KEY ("freePostId") REFERENCES "FreePost"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ContentReaction" ADD CONSTRAINT "ContentReaction_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;
