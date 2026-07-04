-- Add dedicated social preview image paths for Kakao/Open Graph cards.
ALTER TABLE "CoopNews" ADD COLUMN "socialImagePath" TEXT;
ALTER TABLE "FreePost" ADD COLUMN "socialImagePath" TEXT;
