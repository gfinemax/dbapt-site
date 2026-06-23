# Verification

## Implemented Feature

- Applied the previously pending free-board migrations so 자유게시판 posts can load against the current code.
- Added `registeredAt` to `CoopNews` with a Prisma migration, backfilled existing rows from `createdAt`, and indexed it.
- Updated 공지사항, 조합뉴스, and 개발일지 server queries/API payloads to use `registeredAt` for visible date and sorting while keeping `createdAt` immutable.
- Kept 자유게시판 `registeredAt` support from the prior slice and deployed its pending attachment/registered-date migrations.
- 공지사항 list/detail/create/edit now use `등록일`; `작성일` remains only as a rejected system-field mutation.
- 조합뉴스 remains a card view and now supports `등록일` display, create input, and admin edit inside a left slide panel instead of the previous centered modal.
- Fixed the follow-up blank-panel regression by matching the 조합뉴스 detail/create panels to the existing left drawer layer and scroll pattern (`z-[130]`, panel-level `overflow-y-auto`).
- Fixed the follow-up scrolled-away panel regression by rendering 조합뉴스 panels through `document.body` portals and scrolling the viewport to the top when a newsletter card or create button opens a panel.
- 개발일지 list/detail/edit use `등록일`, and admin edit saves the registered date along with title/content.
- FAQ was intentionally left unchanged.

## Changed Files

- `_workspace/04_review/ui-review.md`
- `_workspace/final/verification.md`
- `_workspace/00_input/request-summary.md`
- `_workspace/01_scope/spec-selection.md`
- `prisma/schema.prisma`
- `prisma/migrations/20260622163000_add_free_post_attachments/migration.sql`
- `prisma/migrations/20260622171500_add_free_post_registered_at/migration.sql`
- `prisma/migrations/20260622182000_add_coop_news_registered_at/migration.sql`
- `src/app/api/news/route.ts`
- `src/app/api/news/free/route.ts`
- `src/app/api/upload/route.ts`
- `src/app/news/page.tsx`
- `src/app/page.tsx`
- `src/components/news/coop-newsletter.tsx`
- `src/components/news/development-log.tsx`
- `src/components/news/free-board.tsx`
- `src/components/news/news-client.tsx`
- `src/components/news/notice-board.tsx`
- `src/lib/news/development-log.ts`
- `src/lib/news/free-board-api.ts`
- `src/lib/news/free-board-list.ts`
- `src/lib/news/newsletter-list.ts`
- `src/lib/news/notice-board-list.ts`
- `src/lib/news/notice-edit-draft.ts`
- `src/lib/news/notice-edit-payload.ts`
- `src/lib/news/notice-mutations.ts`
- `src/lib/news/public-upload.ts`
- `src/lib/news/types.ts`
- `src/__tests__/news-admin-controls.test.tsx`
- `src/__tests__/news-development-log-component.test.tsx`
- `src/__tests__/news-free-board-api.test.ts`
- `src/__tests__/news-free-board-list.test.ts`
- `src/__tests__/news-newsletter-list.test.ts`
- `src/__tests__/news-notice-board-list.test.ts`
- `src/__tests__/news-notice-deep-link.test.tsx`
- `src/__tests__/news-notice-edit-payload.test.ts`

## Checks Run

- `pnpm exec vitest run src/__tests__/news-admin-controls.test.tsx`: first RED confirmed 조합뉴스 still used centered modals instead of left slide panels for detail/create/edit.
- `pnpm exec vitest run src/__tests__/news-admin-controls.test.tsx -t "newsletter"`: follow-up RED confirmed 조합뉴스 panels used a lower/hidden drawer structure (`z-[120]`, `overflow-hidden`) instead of the working left drawer pattern.
- `pnpm exec vitest run src/__tests__/news-admin-controls.test.tsx -t "newsletter"`: second follow-up RED confirmed 조합뉴스 panels were still rendered inside the newsletter component instead of a `document.body` portal and did not scroll the viewport to the top on open.
- `pnpm exec vitest run src/__tests__/news-notice-board-list.test.ts src/__tests__/news-newsletter-list.test.ts src/__tests__/news-notice-edit-payload.test.ts src/__tests__/news-development-log-component.test.tsx src/__tests__/news-admin-controls.test.tsx`: first RED confirmed missing `CoopNews.registeredAt` display/sort/edit/API support.
- `pnpm exec vitest run src/__tests__/news-admin-controls.test.tsx`: passed, 1 file / 76 tests.
- `pnpm exec vitest run src/__tests__/news-notice-deep-link.test.tsx src/__tests__/news-admin-controls.test.tsx`: passed, 2 files / 78 tests after updating shared newsletter URLs to expect the new detail panel.
- `pnpm exec vitest run src/__tests__/news-admin-controls.test.tsx -t "newsletter"`: passed, 1 file / 8 selected newsletter tests.
- Same focused registered-date test command after implementation: passed, 5 files / 88 tests.
- `pnpm exec prisma validate`: passed.
- `pnpm exec prisma generate`: passed.
- `pnpm exec prisma migrate deploy`: applied `20260622163000_add_free_post_attachments`, `20260622171500_add_free_post_registered_at`, and `20260622182000_add_coop_news_registered_at`.
- `pnpm exec prisma migrate status`: passed, database schema is up to date.
- `pnpm lint`: passed.
- `pnpm test`: passed, 70 files / 403 tests. Existing jsdom `Window's scrollTo()` warnings were printed.
- `pnpm build`: passed.
- Restarted the local dev server on `localhost:3000`; `http://localhost:3000/news?tab=newsletter` returned HTTP 200.

## Browser Checks

- Existing local server on `localhost:3000` was used.
- `http://localhost:3000/news`: HTTP 200.
- `http://localhost:3000/news?tab=free`: HTTP 200.
- `http://localhost:3000/news?tab=newsletter`: HTTP 200.
- `http://localhost:3000/news?tab=development`: HTTP 200.
- Chrome headless/CDP check on `http://localhost:3000/news?tab=newsletter`: after scrolling the page and clicking the first newsletter card, the detail panel existed, was a direct `document.body` portal child, had `panelTop: 0`, had `scrollY: 0`, and exposed headings `조합뉴스 열람` plus the newsletter title.
- `dbapt-site-ui-review`: PASS in `_workspace/04_review/ui-review.md`.

## Unresolved Risks Or Follow-Up Specs

- The Chrome CDP check used a fresh unauthenticated browser profile, so it verified public card detail opening. Admin create/edit controls are covered by component tests rather than that browser session.
