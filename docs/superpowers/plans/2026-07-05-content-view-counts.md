# Content View Counts Implementation Plan

**Goal:** Show lightweight view/read counts for homepage notices, free-board posts, and public disclosure documents.

**Approved scope:** First-pass implementation only.

Included:
- Show `조회 N회` on notice and free-board list/detail metadata.
- Show `열람 N회` on disclosure document cards/tables.
- Show the baseline collection date: `2026.07.05`.
- Notice list: replace the old comment column with a dedicated `조회수` column.
- Free-board list: keep the `댓글` column and add a dedicated `조회수` column.
- Disclosure list: add a dedicated `열람수` column.
- Increment notice/newsletter view counts when a real post detail is opened.
- Increment free-board view counts when a real post focus panel is opened.
- Increment disclosure document view counts when the PDF view API successfully serves a readable document.

Excluded:
- Download counts.
- Kakao/share-link attribution counts.
- Per-user analytics dashboard.
- Bot filtering, IP de-duplication, and time-window uniqueness rules.

## Data Model

- Reuse existing `CoopNews.viewCount`.
- Add `FreePost.viewCount Int @default(0)`.
- Add `Document.viewCount Int @default(0)`.

## API

- Add a small view-count increment route for `CoopNews`.
- Add a small view-count increment route for `FreePost`.
- Update the document PDF view routes to increment `Document.viewCount` after access validation and before streaming.

## UI

- Notice/newsletter metadata: `조회 N회`.
- Free-board metadata: `조회 N회`.
- Disclosure document metadata: `열람 N회`.
- Keep visual treatment compact and secondary.

## Validation

- Add regression tests before implementation.
- Run `pnpm lint`, `pnpm test`, and `pnpm build`.
