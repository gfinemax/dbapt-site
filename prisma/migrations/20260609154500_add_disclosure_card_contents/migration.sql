CREATE TABLE "DisclosureCardContent" (
  "id" TEXT NOT NULL,
  "itemId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "DisclosureCardContent_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "DisclosureCardContent_itemId_key" ON "DisclosureCardContent"("itemId");
