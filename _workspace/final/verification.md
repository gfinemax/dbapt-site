# Verification

## Implemented Feature

- Removed the notice intro/status box above the notice list.
- Removed the free-board intro/status box above the free-board list.
- Moved the notice search field into the same top line as `공지사항`.
- Moved the logged-in free-board search field into the same top line as `자유게시판`.
- Changed the notice detail drawer from right-side to left-side opening.
- Kept comment columns, detail drawers, write controls, and access boundaries unchanged.

## Changed File Summary

- UI: `src/components/news/notice-board.tsx`, `src/components/news/free-board.tsx`, `src/components/news/news-client.tsx`
- Tests: `src/__tests__/news-admin-controls.test.tsx`
- Harness notes: `_workspace/00_input/request-summary.md`, `_workspace/01_scope/spec-selection.md`, `_workspace/04_review/ui-review.md`, `_workspace/final/verification.md`

## Checks Run

- `pnpm test -- src/__tests__/news-admin-controls.test.tsx`: PASS, 1 file / 32 tests.
- `pnpm lint`: PASS.
- `pnpm test`: PASS, 34 files / 198 tests.
- `pnpm build`: PASS.

## Browser Checks

- `Invoke-WebRequest http://127.0.0.1:3000/news?tab=notice`: 200 OK; notice title and search were present; `공식 안내 현황` was absent.
- `Invoke-WebRequest http://127.0.0.1:3000/news?tab=free`: 200 OK; free-board title was present; `토론 공간 현황` was absent. The public request is unauthenticated, so the logged-in free-board search field is covered by component tests.
- Component tests verify `공지사항 상세 드로어` uses `left-0`, `border-r`, and `slide-in-from-left`, and does not use right-side drawer classes.

## Unresolved Risks Or Follow-Up Specs

- none.
