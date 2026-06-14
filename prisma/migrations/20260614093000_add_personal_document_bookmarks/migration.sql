CREATE TABLE "PersonalDocumentBookmark" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PersonalDocumentBookmark_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PersonalDocumentBookmark_userId_documentId_key"
ON "PersonalDocumentBookmark"("userId", "documentId");

CREATE INDEX "PersonalDocumentBookmark_documentId_idx"
ON "PersonalDocumentBookmark"("documentId");

ALTER TABLE "PersonalDocumentBookmark"
ADD CONSTRAINT "PersonalDocumentBookmark_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "PersonalDocumentBookmark"
ADD CONSTRAINT "PersonalDocumentBookmark_documentId_fkey"
FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;
