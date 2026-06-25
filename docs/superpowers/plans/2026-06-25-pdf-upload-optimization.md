# PDF Upload Optimization Plan

## Goal

Reduce Supabase document storage usage for uploaded PDFs while keeping only one stored file per upload.

## Scope

- Add a shared client-side PDF upload preparation helper.
- Default document upload forms to automatic PDF optimization.
- Allow admins to choose `원본 그대로 저장`.
- Optimize only PDFs over 5MB.
- Use the optimized file only when it is at least 15% smaller.
- Persist original size, stored size, optimization status, and reduction percent for documents and attachments.

## Non-Goals

- Do not keep original and optimized PDF files together.
- Do not convert PDFs to images.
- Do not downsample scanned pages or otherwise risk visible quality loss.
- Do not change access control, viewing routes, audit logs, or download behavior.
- Do not implement image compression in this slice.

## Implementation Steps

1. Add tests for PDF upload optimization policy, upload form controls, and metadata persistence.
2. Add Prisma fields and migration for document/attachment optimization metadata.
3. Implement a shared `prepareDocumentUploadFile` helper using `pdf-lib` as a safe structural optimizer.
4. Wire the helper into new document upload and disclosure document replacement upload flows.
5. Normalize and persist upload optimization metadata in document create/update APIs.
6. Run focused tests, full test suite, lint, build, and UI review.
