# News List Consistency Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans if this plan is implemented in a separate session. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the notice and free-board list views consistent by using compact default-width tables, row density, badge treatment, comment action, and dedicated bookmark column.

**Architecture:** Keep existing routes, data shape, click behavior, and permissions unchanged. Adjust the list table markup/classes for `NoticeBoard` and `FreeBoard`, and cover the shared rules with focused component regression tests.

**Tech Stack:** Next.js App Router, TypeScript, Tailwind CSS, Vitest, Testing Library.

---

### Task 1: Add Focused List Regression Tests

**Files:**
- Modify: `src/__tests__/news-admin-controls.test.tsx`

- [x] Assert notice and free-board member tables use a `760px` minimum width.
- [x] Assert admin tables can include management controls within an `820px` minimum width.
- [x] Assert each list has a separate `보관` column.
- [x] Assert the free-board `관리` column is only shown to admins.
- [x] Assert comment actions keep the accessible name `댓글 N개 보기` while showing `댓글 N`.
- [x] Assert the notice important badge has no ring or border.
- [x] Assert the free-board important badge has no border.
- [x] Assert title metadata rows do not contain bookmark controls.

### Task 2: Align The Notice Table Row UI

**Files:**
- Modify: `src/components/news/notice-board.tsx`

- [x] Set the member list table minimum width to `760px` and admin width to `820px`.
- [x] Keep `중요` beside the title, but remove the badge edge/ring.
- [x] Move `실제자료` and `첨부` into a smaller metadata row.
- [x] Move bookmark controls into a dedicated `보관` column.
- [x] Replace the large blue comment button with a compact bordered pill.
- [x] Preserve row click, comment click, bookmark click, and admin controls.

### Task 3: Align The Free-Board Table Row UI

**Files:**
- Modify: `src/components/news/free-board.tsx`

- [x] Set the member list table minimum width to `760px` and admin width to `820px`.
- [x] Use the same header sizing, row padding, number-column treatment, and comment button pattern as notices.
- [x] Render the `관리` column only for admins.
- [x] Keep `중요` beside the title, but remove the badge edge.
- [x] Move post type, attachment, and excerpt into a smaller metadata row.
- [x] Move bookmark controls into a dedicated `보관` column.
- [x] Preserve row click, comment click, bookmark click, and admin controls.

### Task 4: Verify

**Files:**
- Review: `/news?tab=notice`
- Review: `/news?tab=free`

- [x] Run focused RED/GREEN tests.
- [x] Run `pnpm lint`, `pnpm test`, and `pnpm build`.
- [x] Verify desktop and mobile rendering with Chrome CDP.
