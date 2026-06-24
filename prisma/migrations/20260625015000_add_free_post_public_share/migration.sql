ALTER TABLE "FreePost"
ADD COLUMN "isPublicShareEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "publicShareEnabledAt" TIMESTAMP(3);

CREATE INDEX "FreePost_isPublicShareEnabled_registeredAt_idx" ON "FreePost"("isPublicShareEnabled", "registeredAt");
