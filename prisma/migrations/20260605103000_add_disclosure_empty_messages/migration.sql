CREATE TABLE "DisclosureEmptyMessage" (
  "id" TEXT NOT NULL,
  "subCategory" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "DisclosureEmptyMessage_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "DisclosureEmptyMessage_subCategory_key" ON "DisclosureEmptyMessage"("subCategory");
