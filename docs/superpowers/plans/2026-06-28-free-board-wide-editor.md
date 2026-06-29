# Free Board Wide Editor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the narrow free-board create/edit drawer with a wide, responsive editing dialog.

**Architecture:** Keep `src/components/news/free-board.tsx` as the UI/state orchestration owner. Change only the portal layout around the existing form controls and `NoticeRichEditor`; do not change API helpers, upload behavior, or rich-editor internals.

**Tech Stack:** Next.js App Router, React, TypeScript, Tailwind CSS, Testing Library, Vitest.

---

### Task 1: Add Failing Coverage For The Wide Editor

**Files:**
- Modify: `src/__tests__/news-admin-controls.test.tsx`

- [ ] **Step 1: Write the failing test**

Add a test that opens a free-board post, clicks `게시글 수정`, and expects:

```tsx
const dialog = screen.getByRole("dialog", { name: "게시글 수정 편집 모달" });
expect(dialog).toHaveClass("max-w-[1180px]");
expect(within(dialog).getByLabelText("게시글 설정")).toBeInTheDocument();
expect(within(dialog).getByLabelText("게시글 본문 편집 영역")).toBeInTheDocument();
```

- [ ] **Step 2: Run test to verify RED**

Run:

```powershell
pnpm exec vitest run src/__tests__/news-admin-controls.test.tsx -t "wide editing workspace"
```

Expected: FAIL because the current UI is a narrow `게시글 수정 드로어`.

### Task 2: Implement The Wide Dialog Layout

**Files:**
- Modify: `src/components/news/free-board.tsx`

- [ ] **Step 1: Replace drawer shell**

Change the portal shell from a fixed right `max-w-lg` drawer to a centered responsive dialog:

```tsx
<div role="dialog" aria-modal="true" aria-label={editingPost ? "게시글 수정 편집 모달" : "새 게시글 작성 편집 모달"} className="... max-w-[1180px] ...">
```

- [ ] **Step 2: Split form content**

Move author/type/date/attachment/admin toggles into an `aside aria-label="게시글 설정"` column and title/body editor into a `section aria-label="게시글 본문 편집 영역"` column.

- [ ] **Step 3: Keep submit behavior**

Keep `onSubmit={handleCreatePost}`, existing field bindings, file upload handler, and submit button text unchanged.

- [ ] **Step 4: Update existing tests**

Change tests that query `게시글 수정 드로어` to `게시글 수정 편집 모달`.

### Task 3: Verify

**Files:**
- Modify: `_workspace/04_review/ui-review.md`
- Modify: `_workspace/final/verification.md`

- [ ] **Step 1: Run focused tests**

```powershell
pnpm exec vitest run src/__tests__/news-admin-controls.test.tsx -t "wide editing workspace|allows post editing|shows free-board attachments"
```

- [ ] **Step 2: Run required checks**

```powershell
pnpm lint
pnpm test
pnpm build
```

- [ ] **Step 3: Complete UI review**

Write `_workspace/04_review/ui-review.md` with `Result: PASS` only after checking the implemented layout against `DESIGN.md` and the approved scope.

---

### Follow-up Task: Compact Fixed-Width Composer

**Goal:** Keep the wide create/edit modal useful without letting the writing surface expand indefinitely on large screens.

**Files:**
- Modify: `src/components/news/free-board.tsx`
- Modify: `src/__tests__/news-admin-controls.test.tsx`

- [x] **Step 1: Add failing coverage**

Add tests that verify the free-board write/edit dialog uses a fixed `max-w-[920px]` shell, keeps an inline `maxWidth: 920px` fallback, caps the document column at `max-w-[820px]`, gives the body editor a taller minimum height, removes the redundant header helper copy, and orders title/body before `게시글 설정`.

- [x] **Step 2: Refine the dialog layout**

Move from the earlier desktop two-column workspace to a centered document-style flow: title, body editor, compact settings/attachment panel, and fixed footer action. Cap the shell at `920px`, cap the inner input/footer column at `820px`, and increase the editable body surface to `min-h-[360px] sm:min-h-[420px]`.

- [x] **Step 3: Verify**

Run focused free-board tests and the required `pnpm lint`, `pnpm test`, and `pnpm build` checks.
