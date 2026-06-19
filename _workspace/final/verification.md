# Verification

## Implemented Feature

- OpenChat public document announcements now link to the item-level PDF viewer route: `/disclosure?document=<documentId>`.
- Cooperative news and notice announcements now link to the registered PDF attachment when one exists.
- Cooperative news and notice announcements fall back to an item-level news route when no attachment is registered.
- Existing draft announcements are refreshed on copy requests, and already-copied announcements create a fresh draft before copying so old menu-only messages are not reused.
- Shared notice URLs with `?tab=notice&news=<newsId>` now open the left notice detail drawer automatically.
- News client logic was split into typed helpers for notice, FAQ, newsletter, free-board, comment, upload, and deep-link behavior so the UI no longer relies on broad `any` handling.

## Changed Files

- `src/lib/notifications/openchat-announcements.ts`
- `src/app/api/openchat/announcements/route.ts`
- `src/components/news/news-client.tsx`
- `src/components/news/notice-board.tsx`
- `src/components/news/free-board.tsx`
- `src/components/news/faq-accordion.tsx`
- `src/components/news/coop-newsletter.tsx`
- `src/components/news/notice-rich-editor.tsx`
- `src/app/news/page.tsx`
- `src/lib/news/*`
- `src/__tests__/openchat-announcements.test.ts`
- `src/__tests__/openchat-announcements-api.test.ts`
- `src/__tests__/news-notice-deep-link.test.tsx`
- `src/__tests__/news-*.test.ts`
- `tsconfig.json`
- `_workspace/00_input/request-summary.md`
- `_workspace/01_scope/spec-selection.md`
- `_workspace/04_review/ui-review.md`
- `_workspace/final/verification.md`

## Checks Run

- `pnpm test src/__tests__/openchat-announcements.test.ts`: passed, 13 tests
- `pnpm test src/__tests__/openchat-announcements-api.test.ts`: passed, 8 tests
- `pnpm test src/__tests__/news-notice-deep-link.test.tsx`: passed, 1 test
- `pnpm lint`: passed
- `pnpm test`: passed, 64 files / 343 tests
- `pnpm build`: passed

## Browser Checks

- Dev server: existing `http://127.0.0.1:3000` responded, but headless Chrome did not hydrate it because the dev HMR websocket failed in that environment.
- Production server: `pnpm start --hostname 127.0.0.1 --port 3001` served the built app successfully.
- Chrome headless CDP check: `/news?tab=notice&news=568e0aa2-f745-460a-976a-4ffba43ae776` opened the notice detail drawer on desktop and mobile.
- Overflow check: desktop `innerWidth=1418`, `scrollWidth=1418`; mobile `innerWidth=390`, `scrollWidth=390`; `overflowX=false`.
- `dbapt-site-ui-review`: PASS in `_workspace/04_review/ui-review.md`.

## Unresolved Risks Or Follow-Up Specs

- none
