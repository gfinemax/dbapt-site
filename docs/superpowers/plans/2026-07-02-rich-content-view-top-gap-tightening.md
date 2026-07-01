# Rich Content View Top Gap Tightening Plan

## Goal

- Reduce unnecessary vertical space between the view-mode notice/free-board meta row and rich body content.
- Keep edit-mode form spacing unchanged.
- Keep shared body typography, width, and blank-line preservation intact.

## Scope

- `src/components/news/news-client.tsx`
- `src/components/news/notice-board.tsx`
- `src/components/news/free-board.tsx`
- `src/__tests__/news-admin-controls.test.tsx`

## Non-goals

- No rich editor replacement.
- No schema, API, permission, comment, reaction, bookmark, open-chat, or public-share behavior changes.

## Implementation Steps

1. Add regression expectations that view-mode content columns use `space-y-0` instead of the previous wide section gap.
2. Apply `space-y-0` to notice read, notice-board read, and free-board focused read columns.
3. Preserve existing edit-mode form spacing.
4. Verify focused tests, full lint/test/build, and browser desktop/mobile rendering.
