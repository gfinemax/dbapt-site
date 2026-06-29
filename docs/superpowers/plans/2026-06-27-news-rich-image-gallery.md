# News Rich Image Gallery Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let authors insert uploaded body images as inline content or uncropped gallery blocks, then adjust selected image size, fit, crop focus, and rotation through panel controls and direct image handles.

**Architecture:** Extend `NoticeRichEditor` because notices, free-board posts, and news surfaces already share it. Store gallery layout and image presentation metadata as sanitized HTML `data-*` attributes inside the existing content field, so no API or schema change is needed.

**Tech Stack:** Next.js App Router, React 19, TypeScript, Tailwind CSS, Vitest, Testing Library.

---

### Task 1: Gallery Sanitizer And Rendering

**Files:**
- Modify: `src/components/news/notice-rich-editor.tsx`
- Test: `src/__tests__/news-rich-content-links.test.tsx`

- [ ] Add tests proving `sanitizeNoticeContentHtml` preserves trusted gallery blocks and removes unsafe gallery images.
- [ ] Run `pnpm exec vitest run src/__tests__/news-rich-content-links.test.tsx` and confirm the new test fails before implementation.
- [ ] Add gallery block sanitization before standalone image sanitization.
- [ ] Add rich content CSS classes for gallery grid layouts.
- [ ] Re-run the focused test and confirm it passes.

### Task 2: Multi-Image Editor Insertion

**Files:**
- Modify: `src/components/news/notice-rich-editor.tsx`
- Test: `src/__tests__/news-rich-content-links.test.tsx`

- [ ] Add tests proving multiple selected files upload and insert as one `2열` gallery.
- [ ] Add tests proving one selected file still inserts as a standalone image.
- [ ] Run the focused test and confirm the new tests fail before implementation.
- [ ] Let the hidden file input accept multiple images.
- [ ] Add a gallery template selector and build gallery HTML from uploaded URLs.
- [ ] Re-run the focused test and confirm it passes.

### Task 3: Review And Verification

**Files:**
- Modify: `_workspace/04_review/ui-review.md`
- Modify: `_workspace/final/verification.md`

- [ ] Run `pnpm lint`.
- [ ] Run `pnpm test`.
- [ ] Run `pnpm build`.
- [ ] Start the dev server and browser-check `/news` desktop and mobile for the changed editor surface.
- [ ] Record UI review and verification evidence.

### Task 4: Image Fitting And Inline Editing Follow-up

**Files:**
- Modify: `src/components/news/notice-rich-editor.tsx`
- Test: `src/__tests__/news-rich-content-links.test.tsx`

- [x] Add tests proving galleries preserve original aspect ratio with `data-fit="contain"` instead of cropping by default.
- [x] Add tests proving `본문 이미지` is the default insertion mode and multiple images stay as normal body images unless a gallery mode is selected.
- [x] Add tests proving selected image controls update width, fit, crop focus, and rotation attributes.
- [x] Add tests proving selected image resize and rotation handles update image metadata by dragging.
- [x] Run the focused test and confirm the new tests fail before implementation.
- [x] Add insertion mode state and toolbar buttons for `본문 이미지`, `2열`, and `대표+2열`.
- [x] Add sanitized image metadata helpers for `data-fit`, `data-crop-x`, `data-crop-y`, and `data-rotate`.
- [x] Expand the selected image editing panel with size, fit, crop focus, and rotation controls.
- [x] Add selected-image overlay handles for direct resizing and rotation.
- [x] Re-run the focused test and confirm it passes.
