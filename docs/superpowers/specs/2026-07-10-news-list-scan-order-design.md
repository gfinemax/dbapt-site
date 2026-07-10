# Notice And Free-Board List Scan Order Design

## Status

Approved by the user's request on 2026-07-10.

## Goal

Improve notice and free-board list readability by placing the date before the title and removing artificial reserved space between badges and title text.

## Approved Scope

- Notice desktop table order: `No. → 등록일 → 제목 → 등록자 → 조회수 → 공감 → 보관 → 관리`.
- Free-board desktop table order: `No. → 등록일 → 제목 → 작성자 → 댓글 → 조회수 → 공감 → 보관 → 관리`.
- Remove the fixed badge-block width and outer `gap-3` between badges and title text in both lists.
- Keep badge-internal spacing needed to read multi-part badges such as `★ 중요`.
- Center every desktop table column heading.
- Use compact, consistent header and row padding (`py-2.5`) across notice and free-board lists.
- Keep list badges in a horizontal row beside the title instead of stacking them vertically; keep the free-board title/excerpt gap at `space-y-0.5`.
- In the free-board desktop list title cell, show only the post title; omit important/type/attachment badges and body excerpts from that cell while retaining their underlying data and non-list uses.
- Keep the `★ 중요` badge visible for starred free-board posts while continuing to omit type/attachment badges and body excerpts.
- Use the same explicit `52px` desktop data-row height for notice and free-board lists.
- Enforce density at the table-cell level with `h-[52px] py-0 align-middle` and keep both tables `h-auto`, so free-board rows cannot absorb extra container height.
- Show the free-board registered date as date only in list rows using Korea time.
- Preserve the full registered date/time in detail, edit, and administrative surfaces.

## Out Of Scope

- APIs, database values, schema, sorting, permissions, routes, or mutations.
- Detail/read/write layout changes.
- Comment, reaction, bookmark, management-menu, copy, or public-share behavior.
- Changes to notice date formatting, which is already date-only.

## Acceptance Criteria

- Both tables expose `등록일` immediately before `제목` in their column-header order.
- Badge containers no longer reserve `76px` or `92px`, and title rows no longer use the outer `gap-3` spacer.
- Long titles continue to truncate on one line.
- Notice and free-board headers share centered alignment, rows share compact vertical padding, and badge/title content follows the same horizontal rhythm.
- Free-board title cells contain only the one-line truncated title.
- Starred free-board title cells contain only `★ 중요` plus the one-line truncated title, and both lists share `52px` data rows.
- Notice and free-board data cells share the same fixed cell height, zero vertical padding, and vertical centering.
- A free-board list row renders `2026-07-06` rather than `2026-07-06 10:05` while its focused/detail view can still render the time.
- Focused component and list-helper tests fail before and pass after implementation.
- `pnpm lint`, `pnpm test`, `pnpm build`, and desktop/mobile browser checks complete before readiness is reported.
