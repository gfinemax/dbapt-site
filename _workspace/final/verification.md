# Verification

## Implemented Feature
- Added PDF upload automatic optimization policy for admin document uploads and disclosure document replacement flows.
- Added `자동 최적화` and `원본 그대로 저장` controls.
- Added final-file-only metadata fields for documents and attachments:
  - `originalFileSize`
  - `storedFileSize`
  - `fileOptimized`
  - `fileSizeReductionPercent`
- Added migration `prisma/migrations/20260625093000_add_document_file_optimization_metadata/migration.sql`.
- Applied the migration to the current database with `pnpm exec prisma migrate deploy`.

## Changed Files Summary
- `src/lib/pdf-upload-optimization.ts`: shared PDF preparation helper using safe `pdf-lib` structural optimization.
- `src/components/portal/document-upload-form.tsx`: new upload controls and prepared-file signed upload flow.
- `src/components/disclosure/meetings-table.tsx`: same prepared-file flow for replacement and appended attachments.
- `src/app/api/documents/route.ts`: create API metadata normalization and persistence.
- `src/app/api/documents/[id]/route.ts`: update API metadata normalization and persistence.
- `prisma/schema.prisma`: document and attachment optimization metadata fields.
- Tests added/updated under `src/__tests__/`.

## Checks Run
- `pnpm exec prisma format && pnpm exec prisma generate`: PASS.
- `pnpm exec prisma migrate deploy`: PASS.
- `pnpm lint`: PASS.
- `pnpm test -- src/__tests__/pdf-upload-optimization.test.ts src/__tests__/document-upload-form.test.tsx src/__tests__/document-upload-api.test.ts`: PASS, 28 tests.
- `pnpm test`: PASS, 72 files / 421 tests.
- `pnpm build`: PASS.

## Browser Checks
- `/portal/admin` desktop 1440x1000: PASS. Screenshot saved to `_workspace/pdf-upload-optimization-desktop.png`.
- `/portal/admin` mobile 390x844: PASS. Screenshot saved to `_workspace/pdf-upload-optimization-mobile.png`.
- Verified default checked `자동 최적화`, available `원본 그대로 저장`, policy text, no horizontal overflow, and no Next.js error overlay.

## Unresolved Risks Or Follow-Ups
- Current PDF optimization is safe structural optimization through `pdf-lib`; it does not downsample scanned images. That avoids quality loss but means some scanned PDFs may not shrink much.
- Image upload compression remains out of scope for this slice.
