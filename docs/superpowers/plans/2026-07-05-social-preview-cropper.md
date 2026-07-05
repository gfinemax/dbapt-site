# Social Preview Cropper Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let administrators crop Kakao/Open Graph preview images at a fixed 1.91:1 ratio for notices, newsletters, free-board posts, and public disclosure documents.

**Architecture:** Add one reusable cropper modal and one canvas utility, then wire them into the existing `socialImagePath` flows for news/free-board posts. Extend the persisted `Document` model with the same `socialImagePath` storage and metadata fallback so shared `/disclosure?document=...` URLs can use cropped preview images too.

**Tech Stack:** Next.js App Router, React client components, TypeScript, Tailwind CSS, Prisma, existing `/api/upload`, Vitest, Testing Library.

---

## Scope

Included:
- Notice creation and editing.
- Newsletter creation and editing, through the existing news admin flow.
- Free-board post creation and editing.
- Public disclosure document creation/editing through the current document upload and library material edit flows.
- Public disclosure share metadata for `/disclosure?document=...`.

Excluded:
- General image editing beyond crop/zoom/pan.
- Multiple social preview images per post/material.
- Server-side image processing unless browser canvas output proves insufficient.
- Automatic OCR, face detection, or smart crop.

## Design Decisions

- Output ratio: `1.91:1`.
- Output size: `1200 x 628` PNG.
- File naming: `social-preview-YYYYMMDD-HHMMSS.png`.
- Upload target: reuse `/api/upload` with `kind: "image"`.
- Stored field: keep using `socialImagePath` for `CoopNews` and `FreePost`; add `socialImagePath` to `Document`.
- Fallback order: explicit cropped image, first public body/thumbnail image, existing card image, default hero.
- Permissions: administrator-only everywhere.

## Files

- Create: `src/lib/social-preview-crop.ts`
  - Pure browser canvas helper for 1.91:1 crop math and PNG generation.
- Create: `src/components/social-preview-cropper.tsx`
  - Reusable modal for preview image crop, pan, zoom, confirm, cancel.
- Modify: `src/components/news/notice-board.tsx`
  - Use cropper before setting notice create preview image.
- Modify: `src/components/news/news-client.tsx`
  - Use cropper before setting notice/newsletter edit preview image.
- Modify: `src/components/news/free-board.tsx`
  - Use cropper before setting free-board preview image.
- Create: `src/lib/document-social-preview.ts`
  - Build public disclosure document preview metadata with cropped image priority.
- Modify: `src/app/news/page.tsx`
  - Keep metadata behavior; no major changes expected for news/free-board.
- Modify: `src/components/portal/document-upload-form.tsx`
  - Add cropped preview image selection to new public disclosure document creation.
- Modify: `src/components/library/library-client.tsx`
  - Add cropped preview image selection to existing document edit flow.
- Modify: `src/app/disclosure/page.tsx`
  - Add metadata for approved public document share URLs.
- Modify: `prisma/schema.prisma`
  - Add `Document.socialImagePath`.
- Create: `prisma/migrations/20260705074500_add_document_social_preview_image_path/migration.sql`.
- Modify tests:
  - `src/__tests__/news-admin-controls.test.tsx`
  - `src/__tests__/news-social-preview.test.ts`
  - `src/__tests__/document-upload-api.test.ts`
  - `src/__tests__/document-serializer.test.ts`
  - `src/__tests__/disclosure-page-public-document.test.tsx`
  - `src/__tests__/document-social-preview.test.ts`
- Modify: `_workspace/04_review/ui-review.md`
  - Add review entry for visible admin cropper and public metadata behavior.

---

## Task 1: Canvas Crop Utility

**Files:**
- Create: `src/lib/social-preview-crop.ts`
- Test: create or extend a focused unit test such as `src/__tests__/social-preview-crop.test.ts`

- [ ] **Step 1: Write failing crop math tests**

Test these behaviors:
- Given a source image area and 1.91 target ratio, the crop output size is `1200 x 628`.
- Crop coordinates are clamped inside the source bounds.
- Zoom cannot go below the level required to cover the crop box.

- [ ] **Step 2: Implement pure helpers**

Expose these functions:
- `SOCIAL_PREVIEW_ASPECT_RATIO = 1.91`
- `SOCIAL_PREVIEW_OUTPUT_WIDTH = 1200`
- `SOCIAL_PREVIEW_OUTPUT_HEIGHT = 628`
- `clampCropRect(...)`
- `createSocialPreviewFile(image, cropRect, fileNamePrefix)`

- [ ] **Step 3: Verify utility tests**

Run:
```powershell
pnpm vitest run src/__tests__/social-preview-crop.test.ts
```

Expected: crop utility tests pass.

## Task 2: Reusable Cropper Modal

**Files:**
- Create: `src/components/social-preview-cropper.tsx`
- Test: `src/__tests__/news-admin-controls.test.tsx` or a new focused component test

- [ ] **Step 1: Write failing modal test**

Test these behaviors:
- Selecting a file opens a modal with `1.91:1` crop UI.
- Confirm returns a cropped PNG `File`.
- Cancel closes the modal without changing existing image state.

- [ ] **Step 2: Implement modal**

Required props:
- `file: File | null`
- `open: boolean`
- `onConfirm(file: File): void`
- `onCancel(): void`
- `title?: string`

Required controls:
- Drag image or crop frame to reposition.
- Range slider for zoom.
- Buttons: `취소`, `대표 이미지 적용`.
- Preview copy: `카카오톡 공유 이미지 비율 1.91:1`.

- [ ] **Step 3: Verify accessibility**

Ensure:
- Modal has `role="dialog"`.
- File/crop controls have labels.
- Escape/cancel closes without saving.
- Text fits in mobile widths.

## Task 3: Notice And Newsletter Integration

**Files:**
- Modify: `src/components/news/notice-board.tsx`
- Modify: `src/components/news/news-client.tsx`
- Test: `src/__tests__/news-admin-controls.test.tsx`

- [ ] **Step 1: Write failing create/edit tests**

Add tests proving:
- Notice create file selection opens cropper.
- Confirmed crop uploads `/api/upload` with `kind=image`.
- POST/PATCH body includes `socialImagePath`.
- Cancel keeps previous `socialImagePath`.
- Delete sends `socialImagePath: null`.

- [ ] **Step 2: Wire cropper into notice create**

Replace direct social image file selection with:
- store selected source file
- open cropper
- store cropped result file after confirm
- upload cropped file on save

- [ ] **Step 3: Wire cropper into notice/newsletter edit**

Use the same flow in edit mode, keeping existing saved URL visible until a cropped replacement is confirmed.

- [ ] **Step 4: Verify news tests**

Run:
```powershell
pnpm vitest run src/__tests__/news-admin-controls.test.tsx --testNamePattern "Kakao preview|crop"
pnpm vitest run src/__tests__/news-social-preview.test.ts
```

## Task 4: Free-Board Integration

**Files:**
- Modify: `src/components/news/free-board.tsx`
- Test: `src/__tests__/news-admin-controls.test.tsx`

- [ ] **Step 1: Write failing free-board tests**

Add tests proving:
- Admin free-board edit opens cropper after selecting preview image.
- Confirmed crop uploads with `kind=image`.
- PATCH body includes cropped `socialImagePath`.
- Member sessions do not see the cropper entry point.

- [ ] **Step 2: Wire cropper into free-board create/edit**

Use the same state shape as notice:
- source file
- cropper open flag
- cropped preview file
- existing preview URL

- [ ] **Step 3: Verify free-board tests**

Run:
```powershell
pnpm vitest run src/__tests__/news-admin-controls.test.tsx --testNamePattern "free-board|Kakao preview|crop"
```

## Task 5: Public Disclosure Document Data Model And URL Strategy

**Files:**
- Inspect: `src/components/library/library-client.tsx`
- Inspect: `src/components/portal/document-upload-form.tsx`
- Inspect: `src/app/disclosure/page.tsx`
- Inspect: `prisma/schema.prisma`
- Modify related document API routes and tests.

- [ ] **Step 1: Identify current share URL**

Confirmed share URL:
- `/disclosure?document=<id>`

Decision:
- Approved public disclosure documents can have custom Open Graph metadata on `/disclosure?document=<id>`.

- [ ] **Step 2: Identify storage model**

Confirmed persisted model:
- `Document`

Fields already available:
- title
- description/body
- attachment path
- public id

- [ ] **Step 3: Add `socialImagePath` only if missing**

Add:
```prisma
socialImagePath String?
```

Then create migration:
```sql
ALTER TABLE "Document" ADD COLUMN "socialImagePath" TEXT;
```

- [ ] **Step 4: Verify schema**

Run:
```powershell
pnpm prisma generate
pnpm prisma migrate status
```

Deploy the migration with the normal production DB migration flow.

## Task 6: Public Disclosure Document Cropper Integration

**Files:**
- Modify: `src/components/portal/document-upload-form.tsx`
- Modify: `src/components/library/library-client.tsx`
- Test document API and metadata behavior.

- [ ] **Step 1: Write failing document tests**

Tests:
- Admin document upload/edit surfaces show `카톡 미리보기 이미지 (선택)`.
- Selecting image opens cropper.
- Confirmed crop uploads cropped PNG.
- Save payload includes `socialImagePath`.
- Delete clears `socialImagePath`.

- [ ] **Step 2: Implement UI**

Reuse `SocialPreviewCropper`.

Do not duplicate crop logic in document/library files.

- [ ] **Step 3: Implement API persistence**

Add `socialImagePath` to create/update payload validation for admin-only document mutation routes.

## Task 7: Public Disclosure Document Metadata

**Files:**
- Modify: `src/app/disclosure/page.tsx`
- Create: `src/lib/document-social-preview.ts`
- Test: metadata tests for disclosure route.

- [ ] **Step 1: Write failing metadata tests**

Test fallback order:
- cropped `socialImagePath`
- default community hero

- [ ] **Step 2: Implement `generateMetadata` for share URL**

Metadata must set:
- `openGraph.title`
- `openGraph.description`
- `openGraph.images`
- `twitter.card`
- `twitter.images`

- [ ] **Step 3: Verify direct URL behavior**

Run HTTP checks against the share URL and confirm the rendered HTML contains the correct `og:image`.

## Task 8: Upload Naming And Kakao Cache Safety

**Files:**
- Modify where cropped files are named before upload.
- Possibly no server changes if `/api/upload` preserves client file names.

- [ ] **Step 1: Write failing naming test**

Confirm uploaded file names begin with:
- `social-preview-` for news/free-board/documents

- [ ] **Step 2: Implement unique filenames**

Always create a new PNG `File` after crop confirmation. Never reuse an old social preview URL after a new crop.

- [ ] **Step 3: Document Kakao cache behavior**

In the UI review or a small code comment near upload naming, note that unique URLs prevent stale Kakao image cache.

## Task 9: Visual Review And Full Validation

**Files:**
- Modify: `_workspace/04_review/ui-review.md`

- [ ] **Step 1: Update UI review**

Add sections for:
- cropper modal
- admin-only boundary
- public disclosure document metadata behavior
- mobile cropper usability

- [ ] **Step 2: Run validation**

Run:
```powershell
pnpm lint
pnpm test
pnpm build
```

- [ ] **Step 3: Browser checks**

Check:
- Desktop notice edit crop flow.
- Mobile notice edit crop flow.
- Desktop free-board edit crop flow.
- Mobile free-board edit crop flow.
- Public disclosure document share page metadata.

If Playwright is unavailable, use:
- Testing Library coverage
- `Invoke-WebRequest` metadata checks
- Vercel/browser manual check with admin login

## Execution Order

Recommended sequence:
1. Build crop utility.
2. Build reusable cropper modal.
3. Apply to notice/newsletter.
4. Apply to free-board.
5. Inspect and normalize public disclosure document share URL.
6. Add document storage/UI/API.
7. Add public disclosure document metadata.
8. Run full validation and UI review.

## Risk Notes

- Public disclosure document work is the riskiest part because the current share URL and data model must be confirmed before coding.
- Kakao cache may keep old images if the URL is reused; unique cropped output file names are required.
- Browser canvas can fail on cross-origin images if the selected source is a remote URL without CORS. This plan crops newly selected local files, avoiding tainted canvas problems.
- Existing saved remote URLs should be displayed but not re-cropped unless the admin reselects a source file.

## Done Criteria

- Admin can crop a 1.91:1 preview image for notice/newsletter/free-board/public disclosure documents.
- Cropped PNG uploads as a separate social-preview file.
- Saved `socialImagePath` points to the cropped PNG.
- Kakao/Open Graph metadata uses cropped image first.
- Member/non-admin users cannot set or see admin-only preview controls.
- `pnpm lint`, `pnpm test`, and `pnpm build` pass.
