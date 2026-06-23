ALTER TABLE "FreePost" ADD COLUMN "registeredAt" TIMESTAMP(3);
UPDATE "FreePost" SET "registeredAt" = "createdAt" WHERE "registeredAt" IS NULL;
ALTER TABLE "FreePost" ALTER COLUMN "registeredAt" SET NOT NULL;
ALTER TABLE "FreePost" ALTER COLUMN "registeredAt" SET DEFAULT CURRENT_TIMESTAMP;
CREATE INDEX "FreePost_registeredAt_idx" ON "FreePost"("registeredAt");
