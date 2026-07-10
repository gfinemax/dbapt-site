# Notice And Free-Board List Scan Order Implementation Plan

## Scope

Implement `docs/superpowers/specs/2026-07-10-news-list-scan-order-design.md` as a list-presentation-only change.

## Task 1: Add focused regression tests

Files:

- `src/__tests__/news-admin-controls.test.tsx`
- `src/__tests__/news-free-board-list.test.ts`

Steps:

1. Assert notice headers begin `No., 등록일, 제목, 등록자`.
2. Assert free-board headers begin `No., 등록일, 제목, 작성자`.
3. Assert notice and free-board title rows have no fixed-width badge spacer and no outer `gap-3`.
4. Assert both title nodes retain one-line truncation.
5. Add a Korea-time list-date assertion proving free-board list output contains only `YYYY-MM-DD` while the existing full timestamp field remains available.
6. Run the focused tests and confirm the new assertions fail before implementation.

## Task 2: Reorder and tighten the notice list

Files:

- `src/components/news/notice-board.tsx`

Steps:

1. Reorder `colgroup`, headers, and body cells so `등록일` sits between `No.` and `제목`.
2. Remove the fixed `76px` badge block and the title row's outer `gap-3`.
3. Preserve badge-internal spacing, title truncation, author, view, empathy, bookmark, and admin behavior.
4. Center all column headings, reduce header/body vertical padding to `py-2.5`, and keep table badges in a horizontal row.
5. Leave the existing mobile card presentation unchanged.

## Task 3: Reorder and tighten the free-board list

Files:

- `src/components/news/free-board.tsx`
- `src/lib/news/free-board-list.ts`

Steps:

1. Add a list-only date field/formatter derived from `registeredAtRaw` in Korea time; retain the existing full date/time field for detail/edit use.
2. Reorder `colgroup`, headers, row cells, and row props so `등록일` sits between `No.` and `제목`.
3. Remove the fixed `92px` badge block and the title row's outer `gap-3`.
4. Preserve badge-internal spacing, excerpt, title truncation, author, comments, views, empathy, bookmarks, management actions, and row click behavior.
5. Center all column headings, reduce header/body vertical padding to `py-2.5`, and simplify the free-board title cell to the one-line title only.
6. Keep important/type/attachment data, filtering, focused/detail presentation, and editor date/time presentation unchanged.

## Task 4: Review and verify

1. Run focused notice/free-board component and helper tests.
2. Run `pnpm lint`, `pnpm test`, and `pnpm build`.
3. Inspect `/news?tab=notice` and `/news?tab=free` at desktop and mobile widths.
4. Confirm header order, badge-title adjacency, title truncation, date-only free-board list output, and no new horizontal overflow.
5. Run `dbapt-site-ui-review` and require `PASS`.
6. Record evidence in `_workspace/final/verification.md`.
