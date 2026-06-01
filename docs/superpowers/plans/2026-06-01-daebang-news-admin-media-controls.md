# News Admin Media Controls Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Finish the in-progress news administration slice by limiting notice/news creation, deletion, pasted image upload, and public attachment upload to administrators and wiring local files into news forms.

**Architecture:** Keep public news reading unchanged. Server routes enforce administrator-only mutation, while the `/news` client shows create/delete/image controls only to admin sessions and refreshes list state after changes.

**Tech Stack:** Next.js App Router route handlers, TypeScript, React client components, Prisma, Vitest, Testing Library.

---

## File Structure

- `src/app/api/news/route.ts`: enforce admin-only POST/PATCH/DELETE and keep public GET.
- `src/app/api/upload/route.ts`: enforce admin-only image/attachment upload, validate size and extension, store under `public/uploads`.
- `src/components/news/notice-board.tsx`: show create/delete controls only to admins, accept selected or pasted image files, submit optional attachment through `/api/upload`, and render notice images/attachments.
- `src/components/news/news-client.tsx`: support notice edit mode in the actual `/news` detail drawer with WYSIWYG-style image preview editing.
- `src/components/news/coop-newsletter.tsx`: replace manual image URL entry with selected or pasted image upload, support one attachment, and add delete controls.
- `src/__tests__/news-admin-controls.test.tsx`: route and UI regression tests for permissions, upload, and delete controls.
- `prisma/schema.prisma`: persist one optional public attachment for each news item.
- `.gitignore`: ignore generated `public/uploads/` files.
- `_workspace/04_review/ui-review.md`: record UI review result.
- `_workspace/final/verification.md`: record observed validation evidence.

## Tasks

### Task 1: API Permission Tests

- [ ] Add route-handler tests proving `/api/news` POST/DELETE and `/api/upload` reject unauthenticated and non-admin sessions.
- [ ] Run `pnpm exec vitest run src/__tests__/news-admin-controls.test.tsx` and verify the permission tests fail against the current WIP because member sessions are accepted.
- [ ] Update route handlers to require `session.role === "ADMIN"` for mutations.
- [ ] Re-run the focused test and verify those cases pass.

### Task 2: Upload Validation Tests

- [ ] Add upload tests for file size and extension/type validation.
- [ ] Run the focused test and verify validation fails against the current WIP because only MIME prefix is checked.
- [ ] Add a 5 MB upload cap and allow only `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp` with matching image MIME.
- [ ] Re-run the focused test and verify it passes.

### Task 3: Visible Admin UI Tests

- [ ] Add UI tests proving member sessions do not see create/delete controls, admin sessions do, and uploaded image files are submitted before creating a newsletter.
- [ ] Run the focused test and verify it fails against the current WIP because `isAdmin` is not honored and file upload is not wired.
- [ ] Update `NoticeBoard` and `CoopNewsletter` to use `isAdmin`, render delete buttons for real records, upload selected images, and refresh after mutation.
- [ ] Re-run the focused test and verify it passes.

### Task 4: Review And Verification

- [ ] Update `_workspace/04_review/ui-review.md` with a PASS/FIX/ESCALATE review based on changed `/news` UI.
- [ ] Update `_workspace/final/verification.md` with files changed, checks run, browser coverage, and risks.
- [ ] Run `pnpm lint`, `pnpm test`, and `pnpm build`.
- [ ] Open `/news` in the Codex browser on desktop and mobile widths and verify no obvious layout break in the changed admin/member controls.

### Task 5: Pasted Images And Attachments

- [ ] Add tests proving an admin can paste an image into the notice body and the submitted news item uses the pasted image upload result.
- [ ] Add tests proving `/api/upload` accepts an attachment upload when `kind=attachment` and rejects oversized attachments.
- [ ] Add tests proving news creation persists `attachmentPath`, `attachmentName`, and `attachmentSize`.
- [ ] Add Prisma fields and a migration for one optional public attachment per news item.
- [ ] Add image paste handlers, selected-file previews, attachment inputs, and attachment links in notice/news detail views.

### Task 6: Notice Editing And Body WYSIWYG Editor

- [ ] Add route-handler tests proving `/api/news` PATCH rejects non-admin users and persists edited notice fields for admins.
- [ ] Add upload-route tests proving image files are rejected when submitted as attachments.
- [ ] Add UI tests proving the separate notice image upload field is removed and pasted notice images are inserted into the writing surface before submission.
- [ ] Add PATCH support to `/api/news`.
- [ ] Add a notice detail edit mode for admins in `NewsClient`.
- [ ] Replace notice create/edit textarea surfaces with a basic WYSIWYG body editor so the author sees body images while writing and can adjust image width.
