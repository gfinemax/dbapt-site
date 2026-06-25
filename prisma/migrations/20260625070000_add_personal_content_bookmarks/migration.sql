CREATE TABLE "PersonalContentBookmark" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "targetType" TEXT NOT NULL,
  "targetId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "PersonalContentBookmark_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PersonalContentBookmark_userId_targetType_targetId_key"
  ON "PersonalContentBookmark"("userId", "targetType", "targetId");

CREATE INDEX "PersonalContentBookmark_targetType_targetId_idx"
  ON "PersonalContentBookmark"("targetType", "targetId");

ALTER TABLE "PersonalContentBookmark"
  ADD CONSTRAINT "PersonalContentBookmark_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
