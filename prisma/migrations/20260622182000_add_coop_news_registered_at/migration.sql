ALTER TABLE "CoopNews" ADD COLUMN "registeredAt" TIMESTAMP(3);

UPDATE "CoopNews"
SET "registeredAt" = "createdAt"
WHERE "registeredAt" IS NULL;

ALTER TABLE "CoopNews" ALTER COLUMN "registeredAt" SET NOT NULL;
ALTER TABLE "CoopNews" ALTER COLUMN "registeredAt" SET DEFAULT CURRENT_TIMESTAMP;

CREATE INDEX "CoopNews_registeredAt_idx" ON "CoopNews"("registeredAt");
