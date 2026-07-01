# Free Board Side Edit Plan

## Goal

- Match the free-board edit workflow to the notice edit workflow.
- Keep free-board read mode as the existing left focus panel.
- Change free-board post editing from a separate centered modal into an inline edit state inside the left focus panel.
- Keep new free-board post writing as a side drawer using the shared `780px` shell and `680px` document column.

## Scope

- `src/components/news/free-board.tsx`
- `src/__tests__/news-admin-controls.test.tsx`

## Non-goals

- No database table merge.
- No API, route, permission, comment, reaction, bookmark, open-chat, or public-share behavior changes.
- No rich editor replacement.

## Implementation Steps

1. Update regression tests so editing an existing free-board post must not open `게시글 수정 편집 모달`.
2. Move existing post editing into the focused free-board panel, preserving the shared article shell/content widths and editor body typography.
3. Keep create mode separate as a right-side drawer labeled `새 게시글 작성 드로어`.
4. Verify desktop and mobile surfaces have no horizontal overflow.

## Verification

- Focused Vitest coverage for free-board edit, attachment edit, and write drawer behavior.
- Full lint, test, and build.
- Browser verification on authenticated `/news?tab=free` at desktop and mobile viewport sizes.
