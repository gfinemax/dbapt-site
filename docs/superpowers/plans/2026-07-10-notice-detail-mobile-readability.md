# Notice Detail Mobile Readability Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make notice detail reading on mobile match the readable free-board detail pattern, while verifying shared public-material and community reading surfaces.

**Architecture:** Reuse the existing `NEWS_ARTICLE_*` width constants and `NoticeRichContent` renderer instead of introducing a new layout system. Apply notice-specific detail improvements in both `NewsClient` and standalone `NoticeBoard`, and verify that public-material PDF viewing remains on its own full-viewport viewer path.

**Tech Stack:** Next.js App Router, TypeScript, React Testing Library, Vitest, Tailwind CSS.

---

### Task 1: Lock Shared Rich-Content Mobile Density

**Files:**
- Modify: `src/__tests__/news-rich-content-links.test.tsx`
- Modify: `src/lib/news/content-layout.ts`

- [x] **Step 1: Write the failing test**

Add a `NoticeRichContent` regression that expects mobile read views to use tighter horizontal padding and full-width images:

```tsx
expect(contentRoot).toHaveClass(
  "max-sm:px-3",
  "max-sm:py-4",
  "max-sm:[&_img]:!w-full",
  "max-sm:[&_img]:!max-w-full",
);
```

- [x] **Step 2: Run the focused RED check**

Run: `pnpm test -- src/__tests__/news-rich-content-links.test.tsx`

Expected: FAIL because the shared body class lacks the new mobile image/spacing rules.

- [x] **Step 3: Update the shared body class**

Add the mobile padding and image width constraints to `NEWS_ARTICLE_BODY_SURFACE_CLASS`.

- [x] **Step 4: Run the focused GREEN check**

Run: `pnpm test -- src/__tests__/news-rich-content-links.test.tsx`

Expected: PASS.

### Task 2: Align Notice Detail Read Views With Free-Board Reading

**Files:**
- Modify: `src/__tests__/news-admin-controls.test.tsx`
- Modify: `src/components/news/news-client.tsx`
- Modify: `src/components/news/notice-board.tsx`

- [x] **Step 1: Write failing detail-view tests**

Extend existing notice-detail tests so both `NewsClient` and `NoticeBoard` require:

```tsx
expect(heading).toHaveClass("text-[19px]", "sm:text-xl", "break-keep");
expect(meta).toHaveClass("flex-wrap", "gap-x-2.5", "gap-y-1.5");
expect(meta).not.toHaveTextContent("📂 분류: 조합 공지사항");
expect(screen.getByAltText("공지 대표 이미지")).toHaveClass("object-contain", "max-h-none");
```

- [x] **Step 2: Run the focused RED check**

Run: `pnpm test -- src/__tests__/news-admin-controls.test.tsx`

Expected: FAIL because notice details still use larger mobile headings, long category copy, and cropped representative images.

- [x] **Step 3: Update both notice detail surfaces**

Use mobile-friendly heading classes, wrap metadata with a compact `공지사항` badge, and show representative images with `object-contain` and an explicit accessible alt.

- [x] **Step 4: Run the focused GREEN check**

Run: `pnpm test -- src/__tests__/news-admin-controls.test.tsx`

Expected: PASS.

### Task 3: Review Adjacent Public And Community Surfaces

**Files:**
- Review: `src/components/news/free-board.tsx`
- Review: `src/components/news/development-log.tsx`
- Review: `src/components/portal/pdf-viewer-modal.tsx`
- Test: `src/__tests__/news-development-log-component.test.tsx`
- Test: `src/__tests__/pdf-viewer-modal.test.tsx`
- Test: `src/__tests__/disclosure-page.test.tsx`
- Test: `src/__tests__/library-page.test.tsx`

- [x] **Step 1: Confirm shared consumers**

Use `rg` to confirm `NoticeRichContent` and `NEWS_ARTICLE_*` consumers. Free-board and development-log share the HTML body path; disclosure/library use `PdfViewerModal`.

- [x] **Step 2: Verify adjacent focused suites**

Run:

```powershell
pnpm test -- src/__tests__/news-development-log-component.test.tsx
pnpm test -- src/__tests__/pdf-viewer-modal.test.tsx
pnpm test -- src/__tests__/disclosure-page.test.tsx src/__tests__/library-page.test.tsx
```

Expected: PASS.

### Task 4: Final Validation And UI Review

**Files:**
- Modify: `_workspace/04_review/ui-review.md`
- Modify: `_workspace/final/verification.md`

- [x] **Step 1: Run required project checks**

Run:

```powershell
pnpm lint
pnpm test
pnpm build
```

Expected: all PASS.

- [x] **Step 2: Verify mobile and desktop rendering**

Start the local app and inspect `/news?tab=notice` at mobile and desktop widths. Confirm the notice detail has no horizontal overflow and public-material viewer behavior remains intact.

- [x] **Step 3: Record UI review and verification**

Prepend PASS entries to `_workspace/04_review/ui-review.md` and `_workspace/final/verification.md`.
