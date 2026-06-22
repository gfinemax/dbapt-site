# Verification

## Implemented Feature

- Added rich-content link support for free-board posts.
- Plain pasted free-board post URLs now render as clickable links.
- Custom link labels can be inserted through the shared rich editor so the body can show a meaningful phrase instead of a raw URL.
- Fixed the editor selection-loss case where typing a custom link label in the browser prompt left the selected raw URL unchanged.
- Internal notice links like `/news?tab=notice&news=...` are also normalized as same-site links instead of being stored as raw deployment URLs.
- Internal `/news?tab=free&post=...` links open the target post directly in the existing left focus panel and keep the `post` query in sync.
- Preserved existing free-board data, API, write/edit permissions, comments, replies, uploads, openchat copy flow, and list/focus-panel layout.

## Changed Files

- `_workspace/00_input/request-summary.md`
- `_workspace/01_scope/spec-selection.md`
- `_workspace/04_review/ui-review.md`
- `_workspace/final/verification.md`
- `docs/superpowers/plans/2026-06-01-daebang-free-board-list-rich-editor.md`
- `src/components/news/notice-rich-editor.tsx`
- `src/components/news/free-board.tsx`
- `src/__tests__/news-rich-content-links.test.tsx`
- `src/__tests__/news-admin-controls.test.tsx`

## Checks Run

- `pnpm vitest run src/__tests__/news-rich-content-links.test.tsx`: first RED confirmed plain URLs were not linkified and `buildNoticeLinkHtml` was missing.
- `pnpm vitest run src/__tests__/news-admin-controls.test.tsx -t "opens another free-board post from a link inside the focused post body"`: first RED confirmed internal body links did not switch the focus panel to the target post.
- `pnpm vitest run src/__tests__/news-rich-content-links.test.tsx`: second RED confirmed the prompt-entered display label did not replace selected raw URL text.
- `pnpm vitest run src/__tests__/news-rich-content-links.test.tsx`: passed, 1 file / 3 tests.
- `pnpm vitest run src/__tests__/news-admin-controls.test.tsx -t "opens another free-board post from a link inside the focused post body"`: passed, 1 selected test.
- `pnpm vitest run src/__tests__/news-rich-content-links.test.tsx src/__tests__/news-free-board-deep-links.test.ts src/__tests__/news-free-board-list.test.ts src/__tests__/news-admin-controls.test.tsx -t "free-board|free board|자유게시판|notice rich content links|opens another free-board post"`: passed, 3 files plus 1 skipped by filter / 21 selected tests.
- `pnpm vitest run src/__tests__/news-rich-content-links.test.tsx`: passed, 1 file / 4 tests after the display-label fix.
- `pnpm vitest run src/__tests__/news-rich-content-links.test.tsx src/__tests__/news-free-board-deep-links.test.ts src/__tests__/news-free-board-list.test.ts src/__tests__/news-admin-controls.test.tsx`: passed, 4 files / 74 tests.
- `pnpm lint`: passed.
- `pnpm test`: passed, 70 files / 388 tests. Existing jsdom `Window's scrollTo()` warnings were printed.
- `pnpm build`: passed.

## Browser Checks

- Chrome CDP temporary-member desktop 1440x1000: `/news?tab=free` rendered the free-board list and had no horizontal overflow.
- Chrome CDP temporary-member desktop 1440x1000: `/news?tab=free&post=ae7e6506-a15e-450d-ac58-cd60896eb73f` rendered the free-board list and left focus panel and had no horizontal overflow. The local data for that ID resolved to the current seeded/available free-board item, so link-body behavior is covered by automated tests above.
- Chrome CDP temporary-member mobile 390x844: `/news?tab=free&post=ae7e6506-a15e-450d-ac58-cd60896eb73f` rendered the free-board list and left focus panel and had no horizontal overflow.
- `dbapt-site-ui-review`: PASS in `_workspace/04_review/ui-review.md`.

## Unresolved Risks Or Follow-Up Specs

- none
