-- CreateTable
CREATE TABLE "CommentReaction" (
    "id" TEXT NOT NULL,
    "emoji" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "coopNewsCommentId" TEXT,
    "freeCommentId" TEXT,

    CONSTRAINT "CommentReaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CommentReaction_userId_coopNewsCommentId_key" ON "CommentReaction"("userId", "coopNewsCommentId");

-- CreateIndex
CREATE UNIQUE INDEX "CommentReaction_userId_freeCommentId_key" ON "CommentReaction"("userId", "freeCommentId");

-- CreateIndex
CREATE INDEX "CommentReaction_coopNewsCommentId_idx" ON "CommentReaction"("coopNewsCommentId");

-- CreateIndex
CREATE INDEX "CommentReaction_freeCommentId_idx" ON "CommentReaction"("freeCommentId");

-- CreateIndex
CREATE INDEX "CommentReaction_userId_idx" ON "CommentReaction"("userId");

-- AddCheck
ALTER TABLE "CommentReaction" ADD CONSTRAINT "CommentReaction_exactly_one_target_check"
CHECK (
    ("coopNewsCommentId" IS NOT NULL AND "freeCommentId" IS NULL)
    OR ("coopNewsCommentId" IS NULL AND "freeCommentId" IS NOT NULL)
);

-- AddForeignKey
ALTER TABLE "CommentReaction" ADD CONSTRAINT "CommentReaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommentReaction" ADD CONSTRAINT "CommentReaction_coopNewsCommentId_fkey" FOREIGN KEY ("coopNewsCommentId") REFERENCES "CoopNewsComment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommentReaction" ADD CONSTRAINT "CommentReaction_freeCommentId_fkey" FOREIGN KEY ("freeCommentId") REFERENCES "FreeComment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
