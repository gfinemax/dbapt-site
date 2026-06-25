ALTER TABLE "Document"
ADD COLUMN "originalFileSize" INTEGER,
ADD COLUMN "storedFileSize" INTEGER,
ADD COLUMN "fileOptimized" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "fileSizeReductionPercent" INTEGER;

ALTER TABLE "Attachment"
ADD COLUMN "originalFileSize" INTEGER,
ADD COLUMN "storedFileSize" INTEGER,
ADD COLUMN "fileOptimized" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "fileSizeReductionPercent" INTEGER;
