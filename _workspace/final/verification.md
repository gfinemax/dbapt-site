# Verification - Notice Mobile Image Width Parity

## Implemented Feature

- Matched the main notice detail drawer's mobile padding to the free-board focused post panel: `px-3 py-4 sm:p-8`.
- Matched the standalone notice read modal's mobile padding to the same wider mobile canvas pattern: `px-3 py-4 sm:p-6.5`.
- Added `h-auto` to notice representative images while preserving `w-full`, `max-h-none`, and `object-contain`.
- Kept shared rich-body image rules that make mobile images full width without distortion.

## Changed Files

- `src/components/news/news-client.tsx`
- `src/components/news/notice-board.tsx`
- `src/__tests__/news-admin-controls.test.tsx`
- `docs/superpowers/plans/2026-07-10-notice-mobile-image-width-parity.md`
- `_workspace/00_input/request-summary.md`
- `_workspace/01_scope/spec-selection.md`
- `_workspace/04_review/ui-review.md`

## Checks

- `pnpm test -- src/__tests__/news-admin-controls.test.tsx -t "notice detail drawer|notice-board read modal"`: PASS, 2 tests.
- `pnpm test -- src/__tests__/news-admin-controls.test.tsx src/__tests__/news-rich-content-links.test.tsx`: PASS, 169 tests.
- `pnpm lint`: PASS.
- `pnpm test`: PASS, 87 files and 592 tests. jsdom printed existing non-failing `Window.scrollTo()` warnings.
- `pnpm build`: PASS.

## Browser Checks

- Local production server `http://127.0.0.1:3002/news?tab=notice` in local Chrome mobile 390px.
- Opened the notice titled `제목: 장마를 제낀 푸른 하늘 아래 내 집 마련, 그 시작은 미납 조합운영비 납부입니다`.
- Confirmed notice detail shell class included `px-3 py-4 sm:p-8`.
- Confirmed content width was 365px on a 390px viewport, body image width was 341px, image `object-fit` was `contain`, and document horizontal overflow was false.

## Risks Or Follow-up

- none

---

# Verification - News List Scrollbar And Notice Badge Cleanup

## Implemented Feature

- Added a reusable `.scrollbar-none` utility in `src/app/globals.css`.
- Applied it to the notice and free-board list table overflow wrappers so the horizontal scrollbar no longer appears visually.
- Removed the notice-list `실제자료` badge from `src/components/news/notice-board.tsx`.
- Kept notice `중요` and `첨부` badges intact.

## Changed Files

- `src/app/globals.css`
- `src/components/news/notice-board.tsx`
- `src/components/news/free-board.tsx`
- `src/__tests__/news-admin-controls.test.tsx`
- `docs/superpowers/plans/2026-07-10-news-list-scrollbar-badge-cleanup.md`
- `_workspace/00_input/request-summary.md`
- `_workspace/01_scope/spec-selection.md`
- `_workspace/04_review/ui-review.md`

## Checks

- `pnpm test -- src/__tests__/news-admin-controls.test.tsx`: PASS, 107 tests.
- `pnpm lint`: PASS.
- `pnpm test`: PASS, 87 files and 592 tests. jsdom printed existing non-failing `Window.scrollTo()` warnings.
- `pnpm build`: PASS.

## Browser Checks

- Local production server `http://127.0.0.1:3002/news?tab=notice` in local Chrome: notice table rendered, wrapper class was `overflow-x-auto scrollbar-none`, computed `scrollbar-width` was `none`, and `실제자료` was absent from the DOM.
- Free-board list is login-gated in the unauthenticated browser check, so its wrapper class is covered by focused component tests.

## Risks Or Follow-up

- The table can still be horizontally scrollable on very narrow constrained layouts; this change removes the visible scrollbar bar while preserving access to the existing wide table content.

---

# Verification - Notice Detail Mobile Readability

## Implemented Feature

- Matched notice-detail mobile reading with the existing free-board detail width pattern.
- Reduced notice-detail mobile title pressure with `text-[19px]` and desktop `sm:text-xl`.
- Changed notice metadata from the long `분류: 조합 공지사항` string to a compact wrapped `공지사항` badge plus author/date/view metadata.
- Changed notice representative images to preserve full image ratio instead of cropping.
- Added shared mobile rich-content rules so notice/free-board/development HTML body images use full readable width on narrow screens.
- Reviewed adjacent 공개자료/자료실 document viewing and kept it on `PdfViewerModal`, which already has separate full-viewport mobile PDF behavior.

## Changed Files

- `src/lib/news/content-layout.ts`
- `src/components/news/news-client.tsx`
- `src/components/news/notice-board.tsx`
- `src/__tests__/news-rich-content-links.test.tsx`
- `src/__tests__/news-admin-controls.test.tsx`
- `docs/superpowers/plans/2026-07-10-notice-detail-mobile-readability.md`
- `_workspace/00_input/request-summary.md`
- `_workspace/01_scope/spec-selection.md`
- `_workspace/04_review/ui-review.md`

## Checks

- `pnpm test -- src/__tests__/news-rich-content-links.test.tsx`: FAIL before implementation because shared rich content lacked mobile padding and full-width image classes.
- `pnpm test -- src/__tests__/news-admin-controls.test.tsx`: FAIL before implementation because notice detail headings, metadata, and representative image classes still used the old layout.
- `pnpm test -- src/__tests__/news-rich-content-links.test.tsx`: PASS, 62 tests.
- `pnpm test -- src/__tests__/news-admin-controls.test.tsx`: PASS, 107 tests.
- `pnpm test -- src/__tests__/news-development-log-component.test.tsx`: PASS, 8 tests.
- `pnpm test -- src/__tests__/pdf-viewer-modal.test.tsx`: PASS, 9 tests.
- `pnpm test -- src/__tests__/disclosure-page.test.tsx src/__tests__/library-page.test.tsx`: PASS, 51 tests.
- `pnpm lint`: PASS.
- `pnpm test`: PASS, 87 files and 592 tests. jsdom printed existing non-failing `Window.scrollTo()` warnings.
- `pnpm build`: PASS.

## Browser Checks

- Local production server `/news?tab=notice&news=68074b97-401f-423e-bc65-b145db6851c9` at 390px: notice detail drawer rendered, metadata compacted, 3 body images present, and `overflowX=false`.
- Local production server `/news?tab=notice&news=68074b97-401f-423e-bc65-b145db6851c9` at 1440px: drawer width `780px`, content width `680px`, and `overflowX=false`.
- Existing dev server on port 3000 was left untouched; production verification ran on port 3002 from the fresh build.

## Risks Or Follow-up

- 조합뉴스 detail surfaces still use their own card/text presentation and were not redesigned in this slice.
- The public document PDF viewer is intentionally separate from HTML rich-content reading rules.

---

# Verification - Notice List Accumulation Readability

## Implemented Feature

- Collapsed notice administrator row actions into a compact per-row management menu.
- Added a mobile notice card list for narrow viewports instead of forcing the table as the main reading surface.
- Kept desktop notice rows scannable with tighter stable columns and a smaller admin column.
- Preserved existing notice data, row opening, badges, reactions, bookmarks, OpenChat copy, board-copy, and delete behavior.

## Changed Files

- `src/components/news/notice-board.tsx`
- `src/__tests__/news-admin-controls.test.tsx`
- `docs/superpowers/plans/2026-07-09-notice-list-accumulation-readability.md`
- `_workspace/00_input/request-summary.md`
- `_workspace/01_scope/spec-selection.md`
- `_workspace/04_review/ui-review.md`

## Checks

- `pnpm test -- src/__tests__/news-admin-controls.test.tsx`: FAIL before implementation because the visible notice row still exposed all administrator actions and no mobile card list existed.
- `pnpm test -- src/__tests__/news-admin-controls.test.tsx`: PASS after implementation, 107 tests.
- `pnpm lint`: PASS.
- `pnpm test`: PASS, 87 files and 591 tests. jsdom printed existing non-failing `Window.scrollTo()` warnings.
- `pnpm build`: PASS.

## Browser Checks

- Local `/news?tab=notice`: HTTP 200.
- Local Chrome desktop 1440px `/news?tab=notice`: compact notice table rendered with the per-row management menu.
- Local Chrome mobile 390px `/news?tab=notice`: card-style notice list rendered after hydration with stable title, badges, date, view count, empathy, bookmark, and management menu controls.

## Risks Or Follow-up

- Pagination, month/category filters, and a separate pinned-important section are still not implemented in this slice.
- Existing upper summary controls still create some horizontal pressure on very narrow mobile screens and should be handled as a separate 소통마당 toolbar pass.

---

# Verification - Free Board Comment Editing

## Implemented Feature

- Added free-board comment/reply editing from the focused post panel.
- Added `PATCH /api/news/free` handling for `commentId` updates.
- Kept mutation permission aligned with deletion: comment author or administrator.
- Preserved administrator display-author selection (`운영자`/`사무국`) for edited comments.
- Added `수정` actions beside mutable top-level comments and replies.
- Added a compact inline edit form with `댓글 수정 내용`, `수정 완료`, and `취소`.
- Increased the free-board comment edit textarea from 4 rows to 6 rows.
- Increased the main free-board comment composer from 3 rows to 5 rows.

## Changed Files

- `src/app/api/news/free/route.ts`
- `src/components/news/free-board.tsx`
- `src/lib/news/free-board-api.ts`
- `src/__tests__/news-admin-controls.test.tsx`
- `src/__tests__/news-free-board-api.test.ts`
- `docs/superpowers/plans/2026-07-06-free-board-comment-editing.md`
- `_workspace/00_input/request-summary.md`
- `_workspace/01_scope/spec-selection.md`
- `_workspace/04_review/ui-review.md`

## Checks

- `pnpm test src/__tests__/news-admin-controls.test.tsx`: FAIL before implementation because `PATCH /api/news/free` returned 400 for `commentId` edits and the focused panel had no `댓글 수정` button.
- `pnpm test src/__tests__/news-admin-controls.test.tsx`: PASS after implementation, 104 tests.
- `pnpm test src/__tests__/news-admin-controls.test.tsx src/__tests__/news-free-board-api.test.ts`: PASS, 109 tests.
- `pnpm test src/__tests__/news-admin-controls.test.tsx`: PASS after textarea resize follow-up, 105 tests.
- `pnpm lint`: PASS.
- `pnpm test`: PASS, 87 files and 585 tests. jsdom printed existing non-failing `Window.scrollTo()` warnings.
- `pnpm build`: PASS.

## Browser Checks

- Local `/news`: HTTP 200.
- Local Chrome desktop 1440px `/news`: HTTP 200, title `소통마당 | 대방동 지역주택조합`, no document horizontal overflow.
- Local Chrome mobile 390px `/news`: HTTP 200, title `소통마당 | 대방동 지역주택조합`, no document horizontal overflow.
- The exact comment edit controls are session/comment-author gated and are covered by focused Testing Library tests.

## Risks Or Follow-up

- No edit history is stored. If 운영 기록으로 댓글 수정 이력이 필요해지면 별도 감사 로그/버전 기록 설계가 필요하다.

---

# Verification - Very Short Kakao Share URLs

## Implemented Feature

- Added deterministic very short share URLs at `/s/[code]` for:
  - free-board posts
  - notices
  - newsletters
  - approved public disclosure documents
- Added `src/lib/short-share-url.ts` to encode UUID ids into compact typed base62 codes such as `/s/f...`, with a reversible fallback for non-UUID legacy/test ids.
- Added `src/app/s/[code]/page.tsx` so Kakao can read Open Graph/Twitter metadata from the short URL and visitors are then moved to the canonical content page.
- Updated generated OpenChat/Kakao announcement messages to use `/s/[code]` instead of `/share/<kind>/<id>`.
- Kept existing `/share/...` routes available for already copied links and Kakao cache continuity.

## Changed Files

- `src/lib/short-share-url.ts`
- `src/app/s/[code]/page.tsx`
- `src/lib/notifications/openchat-announcements.ts`
- `src/__tests__/short-share-url.test.ts`
- `src/__tests__/share-routes.test.ts`
- `src/__tests__/openchat-announcements.test.ts`
- `docs/superpowers/plans/2026-07-05-short-share-url-code.md`
- `_workspace/00_input/request-summary.md`
- `_workspace/01_scope/spec-selection.md`
- `_workspace/04_review/ui-review.md`

## Checks

- `pnpm vitest run src/__tests__/short-share-url.test.ts src/__tests__/share-routes.test.ts src/__tests__/openchat-announcements.test.ts`: FAIL before implementation because `@/lib/short-share-url` and `/s/[code]` did not exist.
- `pnpm vitest run src/__tests__/short-share-url.test.ts src/__tests__/share-routes.test.ts src/__tests__/openchat-announcements.test.ts`: PASS, 3 files and 22 tests.
- `pnpm vitest run src/__tests__/openchat-announcements-api.test.ts src/__tests__/disclosure-notifications.test.ts`: PASS, 2 files and 12 tests.
- `pnpm vitest run src/__tests__/disclosure-page.test.tsx --testNamePattern "OpenChat|오픈채팅|공지문"`: PASS, 1 test, 35 skipped by filter.
- `pnpm lint`: PASS.
- `pnpm test`: PASS, 82 files and 561 tests. jsdom printed existing non-failing `Window.scrollTo()` warnings.
- `pnpm build`: PASS. Build output includes `/s/[code]` plus existing `/share/document/[id]`, `/share/free/[id]`, `/share/newsletter/[id]`, and `/share/notice/[id]`.

## Browser Checks

- Not run separately. This change adds a metadata/redirect route and reuses the existing `ShareRedirectPage` UI without new styling. Route generation and metadata behavior are covered by tests and production build output.

## Risks Or Follow-up

- Already-copied OpenChat announcement rows can still contain older `/share/...` messages until they are regenerated or forced. Newly generated announcement messages use `/s/[code]`.
- Kakao can still display the raw URL text in a normal chat bubble; this change shortens the URL, it does not hide it.

---

# Verification - Content View Counts

## Implemented Feature

- Added persisted `viewCount` counters for free-board posts and documents, while using the existing `CoopNews.viewCount` field for notices.
- Added notice and free-board view-count increment APIs.
- Incremented document `viewCount` when public/session-approved PDF view and merged-view endpoints are opened.
- Displayed `조회 N회` in notice/free-board lists and detail surfaces.
- Replaced the notice-list `댓글` column with a dedicated `조회수` column.
- Kept the free-board `댓글` column and added a dedicated `조회수` column.
- Displayed `열람 N회` in document cards, document table rows, and a dedicated public disclosure `열람수` column.
- Added the visible baseline notice that counts are collected from `2026.07.05`.
- Kept document file delivery resilient: PDF viewing still succeeds if the optional view-count update fails.

## Changed Files

- `prisma/schema.prisma`
- `prisma/migrations/20260705161000_add_content_view_counts/migration.sql`
- `src/lib/view-count.ts`
- `src/app/api/news/[id]/view/route.ts`
- `src/app/api/news/free/[id]/view/route.ts`
- `src/app/api/documents/[id]/view/route.ts`
- `src/app/api/documents/[id]/merged-view/route.ts`
- `src/components/news/news-client.tsx`
- `src/components/news/notice-board.tsx`
- `src/components/news/free-board.tsx`
- `src/components/portal/document-table.tsx`
- `src/components/disclosure/meetings-table.tsx`
- `src/lib/document-serializer.ts`
- `src/lib/news/free-board-list.ts`
- `src/lib/news/types.ts`
- `src/__tests__/content-view-counts.test.tsx`
- `src/__tests__/news-admin-controls.test.tsx`

## Checks

- `pnpm prisma generate`: PASS.
- `pnpm prisma migrate deploy`: PASS, applied `20260705161000_add_content_view_counts` to the configured Supabase Postgres database.
- `pnpm vitest run src/__tests__/content-view-counts.test.tsx`: PASS, 9 tests. The new column/baseline tests failed first before implementation, then passed after the UI changes.
- `pnpm vitest run src/__tests__/news-admin-controls.test.tsx`: PASS, 102 tests.
- `pnpm vitest run src/__tests__/content-view-counts.test.tsx src/__tests__/disclosure-page.test.tsx src/__tests__/library-page.test.tsx`: PASS, 60 tests.
- `pnpm vitest run src/__tests__/disclosure-page.test.tsx src/__tests__/library-page.test.tsx src/__tests__/document-serializer.test.ts src/__tests__/document-upload-api.test.ts`: PASS, 71 tests.
- `pnpm vitest run src/__tests__/document-merged-view-api.test.ts src/__tests__/document-public-view-api.test.ts`: PASS, 6 tests.
- `pnpm vitest run src/__tests__/portal-auth-flow.test.tsx`: PASS, 8 tests.
- `pnpm lint`: PASS.
- `pnpm test`: PASS, 81 files and 557 tests. jsdom printed existing non-failing `Window.scrollTo()` warnings.
- `pnpm build`: PASS.

## Browser Checks

- Local dev server started at `http://localhost:3000`.
- HTTP check for `http://127.0.0.1:3000/news`: PASS, 200.
- HTTP check for `http://127.0.0.1:3000/disclosure`: PASS, 200.
- Codex in-app browser was unavailable in this environment: `agent.browsers.list()` returned `[]`. Visible layout is covered by focused component tests and production build type/layout compilation.

## Risks Or Follow-up

- Counts are simple total counters, not unique visitors. A future slice can add daily/unique analytics if 운영 통계가 필요해진다.

---

# Verification - Communication Label And News List Consistency Finalization

## Implemented Feature

- Renamed public/user-facing `조합소식` copy to `소통마당` while keeping `/news` and internal identifiers unchanged.
- Made notice and free-board list tables compact and consistent with fixed table layout, `760px` member minimum width, `820px` admin minimum width, dedicated `보관` column, compact comment pills, softer important badges, and admin-only free-board `관리` column.
- Added the missing table stability classes (`table-fixed`, key `whitespace-nowrap` cells/buttons) required by the list regression tests.

## Changed Files

- `src/content/landing.ts`
- `src/content/site-search.ts`
- `src/content/library.ts`
- `src/content/issues.ts`
- `src/components/landing/notices-section.tsx`
- `src/components/library/library-client.tsx`
- `src/app/search/page.tsx`
- `src/app/issues/page.tsx`
- `src/app/terms/page.tsx`
- `docs/operations/user-manual.md`
- `src/lib/notifications/openchat-announcements.ts`
- `src/app/api/openchat/announcements/route.ts`
- `src/app/api/news/route.ts`
- `src/lib/news/development-log.ts`
- `src/components/news/coop-newsletter.tsx`
- `src/components/news/notice-board.tsx`
- `src/components/news/free-board.tsx`
- related tests and plan/review workspace files

## Checks

- `pnpm vitest run src/__tests__/news-admin-controls.test.tsx -t "compact notice list row layout|same compact list structure|management column only"`: first run failed on missing `table-fixed`, then PASS after adding the table/cell stability classes, 3 tests.
- `pnpm lint`: PASS.
- `pnpm test`: PASS, 74 files and 507 tests. jsdom printed existing non-failing `Window.scrollTo()` warnings.
- `pnpm build`: PASS.

## Browser Checks

- Existing dev server responded at `http://127.0.0.1:3000`.
- Chrome headless `/` desktop 1440px and mobile 390px: `소통마당` rendered, `조합소식` absent, no document horizontal overflow.
- Chrome headless `/news?tab=notice` desktop 1440px: notice table rendered with `table-fixed`, `minWidth=760px`, `tableScrollWidth=862`, `tableClientWidth=862`, no document horizontal overflow.
- Chrome headless `/news?tab=notice` mobile 390px: document width stayed `390px`; notice table kept internal wrapper scrolling (`wrapperClientWidth=324`, `wrapperScrollWidth=760`) without page overflow.
- Chrome headless `/news?tab=free` with temporary admin session cookie desktop 1440px: free-board table rendered with `table-fixed`, `minWidth=820px`, `보관` and `관리` headers present, no document horizontal overflow.
- Chrome headless `/news?tab=free` with temporary admin session cookie mobile 390px: document width stayed `390px`; free-board table kept internal wrapper scrolling (`wrapperClientWidth=324`, `wrapperScrollWidth=820`) without page overflow.

## Risks Or Follow-up

- none

---

# Verification - Short Kakao Share URLs

## Implemented Feature

- Added short public share routes:
  - `/share/free/[id]`
  - `/share/notice/[id]`
  - `/share/newsletter/[id]`
  - `/share/document/[id]`
- Each share route serves Open Graph/Twitter metadata with the existing social preview image priority, then redirects visitors to the canonical content URL.
- Updated generated OpenChat/Kakao announcement messages to use the short share URLs.
- Kept free-board metadata behind `isPublicShareEnabled: true` and disclosure document metadata behind approved public disclosure status.

## Checks

- `pnpm vitest run src/__tests__/share-routes.test.ts`: FAIL before implementation because the short share route modules did not exist.
- `pnpm vitest run src/__tests__/openchat-announcements.test.ts`: FAIL before implementation because generated messages still used `/news?...` and `/disclosure?...` URLs.
- `pnpm vitest run src/__tests__/share-routes.test.ts`: PASS, 5 tests passed.
- `pnpm vitest run src/__tests__/openchat-announcements.test.ts`: PASS, 13 tests passed.
- `pnpm vitest run src/__tests__/news-admin-controls.test.tsx src/__tests__/disclosure-page.test.tsx`: PASS, 138 tests passed. jsdom printed existing `Window.scrollTo()` not implemented warnings.
- `pnpm vitest run src/__tests__/disclosure-page-public-document.test.tsx src/__tests__/news-page-metadata.test.ts`: PASS, 6 tests passed.
- `pnpm lint`: PASS.
- `pnpm test`: PASS, 80 files and 548 tests passed. jsdom printed existing `Window.scrollTo()` not implemented warnings.
- `pnpm build`: PASS. Build output includes `/share/document/[id]`, `/share/free/[id]`, `/share/newsletter/[id]`, and `/share/notice/[id]`.

## Browser Checks

- Not run separately. This change is covered by metadata unit tests and production build route generation; the new visible screen is a minimal redirect fallback page with no authenticated interaction.

## Risks Or Follow-up

- Kakao may cache metadata per URL. The route preserves current unique cropped image URL behavior, but already-shared Kakao cards may require cache refresh or a newly generated image URL.

---

# Verification - Rich Content View Top Gap Tightening

## Implemented Feature

- Changed notice detail read mode from `space-y-6` to `space-y-0`.
- Changed notice-board read modal from `space-y-4` to `space-y-0`.
- Changed free-board focused read mode from `space-y-6` to `space-y-0`.
- Preserved edit-mode form spacing and shared body typography/padding.

## Changed Files

- `src/components/news/news-client.tsx`
- `src/components/news/notice-board.tsx`
- `src/components/news/free-board.tsx`
- `src/__tests__/news-admin-controls.test.tsx`
- `docs/superpowers/plans/2026-07-02-rich-content-view-top-gap-tightening.md`
- `_workspace/00_input/request-summary.md`
- `_workspace/01_scope/spec-selection.md`
- `_workspace/04_review/ui-review.md`
- `_workspace/final/verification.md`

## Checks

- `pnpm vitest run src/__tests__/news-admin-controls.test.tsx -t "notice detail drawer|shared article width|left focus panel"`: FAIL before implementation because read columns still used `space-y-6` or `space-y-4`.
- `pnpm vitest run src/__tests__/news-admin-controls.test.tsx -t "notice detail drawer|shared article width|left focus panel"`: PASS, 3 tests.
- `pnpm vitest run src/__tests__/news-admin-controls.test.tsx src/__tests__/news-rich-content-links.test.tsx`: PASS, 148 tests. jsdom printed the existing `Window.scrollTo()` not implemented warning.
- `pnpm lint`: PASS.
- `pnpm test`: PASS, 74 files and 504 tests. jsdom printed the existing `Window.scrollTo()` not implemented warning.
- `pnpm build`: PASS.

## Browser Checks

- Authenticated Chrome headless `/news` desktop 1440px:
  - Notice read column class: `mx-auto mt-6 w-full flex-1 space-y-0 max-w-[680px]`.
  - Measured gap between the header/meta block and rich body component: `0px`.
  - No horizontal overflow.
- Authenticated Chrome headless `/news?tab=free` desktop 1440px:
  - Free-board focused read column class: `mx-auto mt-6 w-full flex-1 space-y-0 max-w-[680px]`.
  - Measured gap between the header/meta block and rich body component: `0px`.
  - No horizontal overflow.
- Chrome headless `/news` mobile 390px: `clientWidth=390`, `scrollWidth=390`, no horizontal overflow.

## Risks Or Follow-up

- The rich body itself still keeps its shared `py-6` top padding, so edit/view body padding remains consistent. This change removes only the extra view-mode section gap above that body surface.

---

# Verification - Rich Content View Spacing Parity

## Implemented Feature

- Removed view-only rich-content wrapper spacing from notice detail drawer, notice-board dialog, and free-board focused panel.
- Preserved empty editor paragraphs as visible blank lines by sanitizing empty `<p></p>` blocks to `<p><br /></p>`.
- Kept existing safe paragraph line-height attributes/styles in view HTML.
- Left `NoticeRichContent` as the single source for body padding, font size, line-height, and paragraph margin.

## Changed Files

- `src/components/news/notice-rich-editor.tsx`
- `src/components/news/news-client.tsx`
- `src/components/news/notice-board.tsx`
- `src/components/news/free-board.tsx`
- `src/__tests__/news-rich-content-links.test.tsx`
- `src/__tests__/news-admin-controls.test.tsx`
- `docs/superpowers/plans/2026-07-02-rich-content-view-spacing-parity.md`
- `_workspace/00_input/request-summary.md`
- `_workspace/01_scope/spec-selection.md`
- `_workspace/04_review/ui-review.md`
- `_workspace/final/verification.md`

## Checks

- `pnpm vitest run src/__tests__/news-rich-content-links.test.tsx -t "empty editor paragraphs"`: FAIL before implementation because sanitized empty paragraphs stayed as `<p></p>`.
- `pnpm vitest run src/__tests__/news-admin-controls.test.tsx -t "notice detail drawer|left focus panel"`: FAIL before implementation because notice/free-board rich content wrappers still had extra `pt-2` and notice had `leading-8`.
- `pnpm vitest run src/__tests__/news-rich-content-links.test.tsx -t "empty editor paragraphs"`: PASS.
- `pnpm vitest run src/__tests__/news-admin-controls.test.tsx -t "notice detail drawer|left focus panel"`: PASS, 2 tests.
- `pnpm vitest run src/__tests__/news-rich-content-links.test.tsx src/__tests__/news-admin-controls.test.tsx`: PASS, 148 tests. jsdom printed the existing `Window.scrollTo()` not implemented warning.
- `pnpm lint`: PASS.
- `pnpm test`: PASS, 74 files and 504 tests. jsdom printed the existing `Window.scrollTo()` not implemented warning.
- `pnpm build`: PASS.

## Browser Checks

- Existing local server responded at `http://localhost:3000/news` and `http://localhost:3000/news?tab=free`.
- Authenticated Chrome headless `/news` desktop 1440px:
  - Notice rich-content parent class was empty, so no extra `pt-2` or legacy `leading-8` wrapper was present.
  - Existing notice content rendered 7 empty paragraphs with `<br />`, preserving visible blank lines.
  - No horizontal overflow.
- Authenticated Chrome headless `/news?tab=free` desktop 1440px:
  - Free-board focused rich-content parent class was empty, so no extra `pt-2` wrapper was present.
  - No horizontal overflow.
- Chrome headless `/news` mobile 390px: `clientWidth=390`, `scrollWidth=390`, no horizontal overflow.

## Risks Or Follow-up

- Existing posts without explicit saved `data-line-height` still use the shared default `leading-relaxed` view surface. Explicit saved paragraph line-height values are preserved by the sanitizer.

---

# Verification - Free Board Side Edit

## Implemented Feature

- Changed existing free-board post editing from a separate centered edit modal into an inline edit state inside the left `토론 집중 패널`.
- Kept the focused panel at the shared `780px` shell and `680px` document column.
- Changed new free-board post writing to a right-side drawer labeled `새 게시글 작성 드로어`.
- Preserved the shared rich editor body surface: `px-6`, `py-6`, `text-xs`, `leading-relaxed`, and paragraph margin classes.
- Reset edit draft state when closing the focused post panel.

## Changed Files

- `src/components/news/free-board.tsx`
- `src/__tests__/news-admin-controls.test.tsx`
- `docs/superpowers/plans/2026-07-02-free-board-side-edit.md`
- `_workspace/00_input/request-summary.md`
- `_workspace/01_scope/spec-selection.md`
- `_workspace/04_review/ui-review.md`
- `_workspace/final/verification.md`

## Checks

- `pnpm vitest run src/__tests__/news-admin-controls.test.tsx -t "free-board post editing|free-board post writing|allows post editing|replace attachments"`: FAIL before implementation, because edit still opened `게시글 수정 편집 모달` and create mode still used `새 게시글 작성 편집 모달`.
- `pnpm vitest run src/__tests__/news-admin-controls.test.tsx -t "free-board post editing|free-board post writing|allows post editing|replace attachments"`: PASS, 4 tests.
- `pnpm lint`: PASS.
- `pnpm vitest run src/__tests__/news-admin-controls.test.tsx src/__tests__/news-rich-content-links.test.tsx`: PASS, 147 tests. jsdom printed the existing `Window.scrollTo()` not implemented warning.
- `pnpm test`: PASS, 74 files and 503 tests. jsdom printed the existing `Window.scrollTo()` not implemented warning.
- `pnpm build`: PASS.

## Browser Checks

- Existing local server responded at `http://localhost:3000/news?tab=free` with HTTP 200.
- Authenticated Chrome headless `/news?tab=free` desktop 1440px:
  - New post drawer found: `right-0`, `slide-in-from-right`, `maxWidth=780px`, document column `680px`, no horizontal overflow.
  - Existing post focus panel found: `left-0`, `slide-in-from-left`, `maxWidth=780px`, document column `680px`, no horizontal overflow.
  - Existing post edit mode found inside the focus panel; `게시글 수정 편집 모달` was not present; editor/settings/body region were present; no horizontal overflow.
- Authenticated Chrome headless `/news?tab=free` mobile 390px:
  - New post drawer width was `390px`, right aligned, editor visible, and no horizontal overflow.

## Risks Or Follow-up

- The edit toolbar still adds vertical chrome inside the same side panel. Text canvas width and body styling are matched, but edit mode will naturally feel more tool-heavy than read mode.

---

# Verification - Shared Article Body Surface

## Implemented Feature

- Kept shared article content width at `680px`.
- Added shared article body constants for `px-6`, `py-6`, `text-xs`, `leading-relaxed`, and paragraph spacing.
- Applied the shared body surface to `NoticeRichContent`.
- Applied the same shared body surface to the Tiptap editor body.
- Applied shared shell/content widths and read/edit body surface classes to development-log detail and edit surfaces.
- Preserved bottom reserve space for placed layer images while keeping the new common bottom padding.

## Changed Files

- `src/lib/news/content-layout.ts`
- `src/components/news/notice-rich-editor.tsx`
- `src/components/news/rich-text-editor-v2.tsx`
- `src/components/news/development-log.tsx`
- `src/__tests__/news-rich-content-links.test.tsx`
- `src/__tests__/news-admin-controls.test.tsx`
- `src/__tests__/news-development-log-component.test.tsx`
- `_workspace/00_input/request-summary.md`
- `_workspace/01_scope/spec-selection.md`
- `_workspace/04_review/ui-review.md`
- `_workspace/final/verification.md`

## Checks

- `pnpm exec vitest run src/__tests__/news-rich-content-links.test.tsx -t "professional V2 editor toolbar"`: PASS, 1 test.
- `pnpm exec vitest run src/__tests__/news-admin-controls.test.tsx -t "editor-matched body typography"`: PASS, 1 test.
- `pnpm exec vitest run src/__tests__/news-development-log-component.test.tsx -t "opens development log details|shows and submits registered dates"`: PASS, 2 tests.
- `pnpm lint`: PASS.
- `pnpm test`: initially failed one expected layer-image padding assertion after the shared bottom padding change; focused regression passed after updating the expected `calc(1.5rem + 270px)`.
- `pnpm test`: PASS on rerun, 74 files and 503 tests.
- `pnpm build`: PASS.

## Browser Checks

- Existing local server responded at `http://127.0.0.1:3000/news?tab=free` with HTTP 200.
- Chrome headless `/news?tab=free` desktop 1440px: `clientWidth=1440`, `scrollWidth=1440`, `hasHorizontalOverflow=false`, `hasNewsSurface=true`.
- Chrome headless `/news?tab=free` mobile 390px: `clientWidth=390`, `scrollWidth=390`, `hasHorizontalOverflow=false`, `hasNewsSurface=true`.

## Risks Or Follow-up

- The edit toolbar still adds vertical chrome above the same text canvas. The text line width is matched, but edit mode can still feel visually heavier because of the toolbar and editor border.

---

# Verification - News Read/Edit Typography And Width Tightening

## Implemented Feature

- Reduced the shared news article shell from `860px` to `780px`.
- Reduced the shared news article body canvas from `760px` to `680px`.
- Kept notice and free-board read/write surfaces on the same shared width constants.
- Changed the rich editor default body from `text-sm` to `text-xs` so edit mode matches published read mode.
- Changed the editor default toolbar values from `14px / 1.5` to `12px / 1.625`, matching the read-mode `text-xs leading-relaxed` baseline.
- Allowed persisted `data-line-height="1.625"` through the rich-content sanitizer.

## Changed Files

- `src/lib/news/content-layout.ts`
- `src/components/news/rich-text-editor-v2.tsx`
- `src/components/news/notice-rich-editor.tsx`
- `src/__tests__/news-admin-controls.test.tsx`
- `src/__tests__/news-rich-content-links.test.tsx`
- `docs/superpowers/specs/2026-07-01-news-content-width-unification-design.md`
- `docs/superpowers/plans/2026-07-01-news-content-width-unification.md`
- `_workspace/00_input/request-summary.md`
- `_workspace/01_scope/spec-selection.md`
- `_workspace/04_review/ui-review.md`
- `_workspace/final/verification.md`

## Checks

- `pnpm exec vitest run src/__tests__/news-admin-controls.test.tsx -t "notice detail drawer|selected notice display author|shared article width|left focus panel|fixed-width document"`: PASS, 6 tests.
- `pnpm exec vitest run src/__tests__/news-rich-content-links.test.tsx -t "toolbar|글자 크기|does not add layer reserve spacing|two-column galleries"`: PASS, 9 tests.
- `pnpm lint`: PASS.
- `pnpm test`: first run had one unrelated `portal-shell.test.tsx` timing failure; the failing test passed in isolation.
- `pnpm test`: PASS on rerun, 74 files and 503 tests.
- `pnpm build`: PASS.

## Browser Checks

- Existing local server responded at `http://127.0.0.1:3000/news?tab=free` with HTTP 200.
- Chrome headless `/news?tab=free` desktop 1440px: `clientWidth=1440`, `scrollWidth=1440`, `hasHorizontalOverflow=false`, `hasNewsSurface=true`.
- Chrome headless `/news?tab=free` mobile 390px: `clientWidth=390`, `scrollWidth=390`, `hasHorizontalOverflow=false`, `hasNewsSurface=true`.
- Local DB did not expose a focused free-board article in this environment, so focused panel internals are covered by component tests rather than live-data browser interaction.

## Risks Or Follow-up

- DB table unification was discussed separately and was not implemented in this UI slice.

---

# Verification - News Content Width Inline Fix

## Implemented Feature

- Added `NEWS_ARTICLE_CONTENT_MAX_WIDTH_STYLE = "760px"`.
- Applied inline `maxWidth` to notice detail/read/edit/write shells and article content columns.
- Applied inline `maxWidth` to free-board focus panel, focused article body, and write-modal content/footer columns.
- Kept the existing shared width classes so tests and class-based styling remain explicit.

## Changed Files

- `src/lib/news/content-layout.ts`
- `src/components/news/news-client.tsx`
- `src/components/news/notice-board.tsx`
- `src/components/news/free-board.tsx`
- `src/__tests__/news-admin-controls.test.tsx`
- `_workspace/04_review/ui-review.md`
- `_workspace/final/verification.md`

## Checks

- `pnpm exec vitest run src/__tests__/news-admin-controls.test.tsx -t "notice detail drawer|selected notice display author|shared article width|left focus panel|fixed-width document"`: FAIL before implementation because only the free-board writing modal had inline `maxWidth`; the other shells/content columns had no inline width.
- `pnpm exec vitest run src/__tests__/news-admin-controls.test.tsx -t "notice detail drawer|selected notice display author|shared article width|left focus panel|fixed-width document"`: PASS, 6 tests.
- `pnpm exec vitest run src/__tests__/news-admin-controls.test.tsx`: PASS, 91 tests. jsdom printed the existing `Window.scrollTo()` not implemented warning.
- `pnpm lint`: PASS.
- `pnpm test`: PASS, 74 files and 500 tests. jsdom printed the existing `Window.scrollTo()` not implemented warning.
- `pnpm build`: PASS.

## Browser Checks

- Existing local server responded at `http://127.0.0.1:3000/news` with HTTP 200.
- Local API had `freePostCount=0`, so the actual free-board focused read panel could not be opened from live data in this environment; component tests verify its inline `maxWidth`.
- Chrome headless `/news` desktop 1440px and mobile 390px: `hasHorizontalOverflow=false`, `hasNewsSurface=true`.
- Chrome headless `/news?tab=free` desktop 1440px and mobile 390px: `hasHorizontalOverflow=false`, `hasNewsSurface=true`.

## Risks Or Follow-up

- none

---

# Verification - News Content Width Unification

## Implemented Feature

- Added shared news article layout width constants in `src/lib/news/content-layout.ts`.
- Applied a shared `max-w-[860px]` shell width to notice and free-board article writing/reading surfaces.
- Applied a shared `max-w-[760px]` body canvas width to notice read/edit/write and free-board read/write content columns.
- Reduced free-board reading and writing widths from the previous `920px` shell and `820px` body column.
- Kept notice writing as a right-side drawer, free-board writing as a modal, and free-board reading as a left focus panel.

## Changed Files

- `src/lib/news/content-layout.ts`
- `src/components/news/news-client.tsx`
- `src/components/news/notice-board.tsx`
- `src/components/news/free-board.tsx`
- `src/__tests__/news-admin-controls.test.tsx`
- `docs/superpowers/specs/2026-07-01-news-content-width-unification-design.md`
- `docs/superpowers/plans/2026-07-01-news-content-width-unification.md`
- `_workspace/00_input/request-summary.md`
- `_workspace/01_scope/spec-selection.md`
- `_workspace/04_review/ui-review.md`
- `_workspace/final/verification.md`

## Checks

- `pnpm exec vitest run src/__tests__/news-admin-controls.test.tsx -t "notice detail drawer|selected notice display author|shared article width|left focus panel|fixed-width document|post editing in the focus panel"`: FAIL before implementation due legacy width classes and missing `NoticeBoard` dialog semantics.
- `pnpm exec vitest run src/__tests__/news-admin-controls.test.tsx -t "notice detail drawer|selected notice display author|shared article width|left focus panel|fixed-width document|post editing in the focus panel"`: PASS, 7 tests.
- `pnpm exec vitest run src/__tests__/news-admin-controls.test.tsx`: PASS, 91 tests. jsdom printed the existing `Window.scrollTo()` not implemented warning.
- `pnpm lint`: PASS.
- `pnpm test`: PASS, 74 files and 500 tests. jsdom printed the existing `Window.scrollTo()` not implemented warning.
- `pnpm build`: PASS.

## Browser Checks

- Existing local server responded at `http://127.0.0.1:3000/news?tab=free` with HTTP 200.
- Chrome headless `/news?tab=free` desktop 1440px: `clientWidth=1440`, `scrollWidth=1440`, `hasHorizontalOverflow=false`, `hasNewsSurface=true`.
- Chrome headless `/news?tab=free` mobile 390px: `clientWidth=390`, `scrollWidth=390`, `hasHorizontalOverflow=false`, `hasNewsSurface=true`.

## Risks Or Follow-up

- none

---

# Verification

# Verification - News Board Copy Tool

## Implemented Feature

- Added `POST /api/news/board-copy` as an administrator-only copy endpoint.
- Added notice-to-free-board copy behavior that creates a `FreePost` with `postType: NOTICE`.
- Added free-board-to-notice copy behavior that creates a `CoopNews` with `category: NOTICE`.
- Added administrator-only copy buttons to notice management controls and free-board management controls.
- Kept source posts unchanged and excluded comments, replies, reactions, bookmarks, open-chat announcements, view counts, and public-share settings from copying.

## Changed Files

- `src/app/api/news/board-copy/route.ts`
- `src/components/news/notice-board.tsx`
- `src/components/news/free-board.tsx`
- `src/__tests__/news-board-copy-api.test.ts`
- `src/__tests__/news-admin-controls.test.tsx`
- `docs/superpowers/specs/2026-07-01-news-board-copy-design.md`
- `docs/superpowers/plans/2026-07-01-news-board-copy.md`
- `_workspace/00_input/request-summary.md`
- `_workspace/01_scope/spec-selection.md`
- `_workspace/04_review/ui-review.md`
- `_workspace/final/verification.md`

## Checks

- `pnpm exec vitest run src/__tests__/news-board-copy-api.test.ts`: FAIL before implementation because `@/app/api/news/board-copy/route` did not exist.
- `pnpm exec vitest run src/__tests__/news-board-copy-api.test.ts`: PASS, 5 tests.
- `pnpm exec vitest run src/__tests__/news-admin-controls.test.tsx -t "board copy|copies a notice|copies a free-board|does not copy a notice"`: FAIL before UI implementation because copy controls were missing.
- `pnpm exec vitest run src/__tests__/news-admin-controls.test.tsx -t "board copy|copies a notice|copies a free-board|does not copy a notice"`: PASS, 5 tests.
- `pnpm exec vitest run src/__tests__/news-board-copy-api.test.ts src/__tests__/news-admin-controls.test.tsx`: PASS, 95 tests. jsdom printed the existing `Window.scrollTo()` not implemented warning.
- `pnpm lint`: PASS.
- `pnpm test`: PASS, 74 files and 499 tests. jsdom printed the existing `Window.scrollTo()` not implemented warning.
- `pnpm build`: PASS.
- `git diff --check`: PASS; only CRLF conversion warnings were printed.

## Browser Checks

- Started local dev server at `http://127.0.0.1:3000`; `/news?tab=free` returned HTTP 200.
- Chrome headless `/news?tab=free` desktop 1440px: rendered, `scrollWidth=1440`, `innerWidth=1440`, `hasOverflow=false`.
- Chrome headless `/news?tab=free` mobile 390px: rendered, `scrollWidth=390`, `innerWidth=390`, `hasOverflow=false`.
- The visible copy controls are admin/session gated, so the exact button visibility and click behavior are covered by focused component tests.

## Risks Or Follow-up

- none

---

# Verification - Publish Finalization 2026-07-01

## Implemented Scope

- Finalized the footer credit date update and the free-board gallery blank-space follow-up for publication.
- Kept untracked local dev logs and screenshots out of the commit scope.

## Checks

- `git diff --check`: PASS; only CRLF conversion warnings were printed.
- `pnpm lint`: PASS.
- `pnpm test`: first full run had two timing-related failures outside the touched files (`document-upload-api` timeout and `portal-shell` message assertion); both focused reruns passed, and the second full run passed with 73 files and 489 tests.
- `pnpm build`: PASS.

## Browser Checks

- Started local dev server at `http://127.0.0.1:3000`.
- Chrome headless `/news?tab=free` desktop 1440px: rendered, `scrollWidth=1440`, `innerWidth=1440`, `hasOverflow=false`.
- Chrome headless `/news?tab=free` mobile 390px: rendered, `scrollWidth=390`, `innerWidth=390`, `hasOverflow=false`.
- Chrome hydrated DOM check for `/`: footer contains `Website created & maintained by 오학동 · 2026.6.17`.

## Risks Or Follow-up

- none

---

# Verification - Footer Credit Date

## Implemented Fix

- Changed the shared footer credit text to `Website created & maintained by 오학동 · 2026.6.17`.
- Updated the focused footer regression test expectation.

## Changed Files

- `src/components/landing/site-footer.tsx`
- `src/__tests__/site-footer.test.tsx`
- `_workspace/00_input/request-summary.md`
- `_workspace/01_scope/spec-selection.md`
- `_workspace/04_review/ui-review.md`
- `_workspace/final/verification.md`

## Checks

- `pnpm test -- site-footer`: PASS, 1 test.
- `pnpm lint`: PASS.
- `pnpm build`: PASS.
- `pnpm test`: PASS, 73 files and 489 tests. jsdom printed existing `window.scrollTo()` not implemented warnings.

## Browser Checks

- Existing local dev server at `http://127.0.0.1:3000`.
- Home page HTML contained `Website created & maintained by 오학동 · 2026.6.17`.

## Risks Or Follow-up

- none

---

# Verification - Free Board Gallery Blank Space

## Implemented Fix

- Removed duplicated blank space below free-board rich-content galleries by excluding `data-notice-gallery` blocks from standalone layer image reserve-height scanning.
- Preserved root bottom spacing for true standalone `front`/`behind` layer images so comments do not overlap positioned layer images.

## Changed Files

- `src/components/news/notice-rich-editor.tsx`
- `src/__tests__/news-rich-content-links.test.tsx`
- `docs/superpowers/plans/2026-06-27-news-rich-editor-v2.md`
- `_workspace/00_input/request-summary.md`
- `_workspace/01_scope/spec-selection.md`
- `_workspace/04_review/ui-review.md`
- `_workspace/final/verification.md`

## Checks

- `pnpm exec vitest run src/__tests__/news-rich-content-links.test.tsx -t "does not add layer reserve spacing"`: FAIL before implementation, expected `640px` vs empty padding.
- `pnpm exec vitest run src/__tests__/news-rich-content-links.test.tsx -t "does not add layer reserve spacing|reserves published layer image space"`: PASS, 2 tests.
- `pnpm exec vitest run src/__tests__/news-rich-content-links.test.tsx`: PASS, 53 tests.
- `pnpm exec vitest run src/__tests__/news-admin-controls.test.tsx -t "opens a left focus panel|opens free-board post editing|opens free-board post writing"`: PASS, 3 tests.
- `pnpm lint`: PASS.
- `pnpm test`: PASS, 73 files and 489 tests. jsdom printed existing `window.scrollTo()` not implemented warnings.
- `pnpm build`: PASS.

## Browser Checks

- Started local dev server at `http://127.0.0.1:3000`.
- Browser plugin connection failed with MCP sandbox metadata error, so Chrome headless/CDP was used as fallback.
- `/news?tab=free` desktop 1440px: rendered, `overflowX=false`, screenshot `_workspace/free-board-blank-space-desktop.png`.
- `/news?tab=free` mobile 390px: rendered, `overflowX=false`, screenshot `_workspace/free-board-blank-space-mobile.png`.
- The live unauthenticated page had no visible free-board post detail available (`initialFreePosts` empty), so the focused-post gallery spacing behavior is covered by component regression tests.

## Risks Or Follow-up

- none

---

# Verification - Published Layer Image Text Flow Regression

## Implemented Fix

- Added a failing regression check for the exact rollback: saved layer images must reserve published bottom space outside normal text flow.
- Kept the trusted `front`/`behind` layer wrapper at `height:0px` so text after the image is not pushed below the image.
- Added `getNoticeContentLayerReserveHeight()` so `NoticeRichContent` reserves root `padding-bottom` from saved pixel height, estimated image height, `offsetY`, zoom, and rotation.
- Preserved the existing absolutely positioned layer surface and image metadata.

## Changed Files

- `src/components/news/notice-rich-editor.tsx`
- `src/__tests__/news-rich-content-links.test.tsx`
- `docs/superpowers/plans/2026-06-27-news-rich-editor-v2.md`
- `_workspace/00_input/request-summary.md`
- `_workspace/01_scope/spec-selection.md`
- `_workspace/04_review/ui-review.md`
- `_workspace/final/verification.md`

## Checks

- `pnpm exec vitest run src/__tests__/news-rich-content-links.test.tsx -t "reserves published layer image space outside the text flow"`: FAIL before implementation because `.notice-rich-content` had no `padding-bottom`; PASS after implementation with 1 passed and 51 skipped.
- `pnpm exec vitest run src/__tests__/news-rich-content-links.test.tsx`: PASS, 52 tests passed.
- `pnpm lint`: PASS.
- `pnpm test`: PASS, 73 test files and 488 tests passed. jsdom printed existing `Window.scrollTo()` not implemented warnings.
- `pnpm build`: PASS.

## Browser Checks

- Reused local server at `http://127.0.0.1:3000`.
- `/news?tab=free`: HTTP 200.
- In-app browser connection failed with `codex/sandbox-state-meta: missing field sandboxPolicy`; fallback local Playwright/Chrome verification was used.
- Desktop 1440x1000 logged-out page: free-board rich content was locked (`hasRichContent=false`, `hasLayer=false`), `scrollWidth=1440`, `clientWidth=1440`, `hasHorizontalOverflow=false`; screenshot saved to `_workspace/news-free-locked-desktop.png`.
- Mobile 390x844 logged-out page: free-board rich content was locked (`hasRichContent=false`, `hasLayer=false`), `scrollWidth=390`, `clientWidth=390`, `hasHorizontalOverflow=false`; screenshot saved to `_workspace/news-free-locked-mobile.png`.

## Risks Or Follow-up

- The exact authenticated post from the screenshot was not directly opened in browser automation because the headless session was logged out and the free-board content was locked. The regression is covered by the focused `NoticeRichContent` component test.

---

# Verification - Published Layer Image Overlaps Comment Box

## Implemented Fix

- Added a failing regression check that saved `front`/`behind` image layers reserve published content height.
- Added `getNoticeLayerReservedHeight()` in `src/components/news/notice-rich-editor.tsx`.
- Updated the trusted layer wrapper from `height:0px` to a calculated height based on saved pixel height, estimated image height, `offsetY`, zoom, and rotation.
- Preserved the existing absolutely positioned image surface so the editor placement intent remains intact while comments are pushed below the image.

## Changed Files

- `src/components/news/notice-rich-editor.tsx`
- `src/__tests__/news-rich-content-links.test.tsx`
- `docs/superpowers/plans/2026-06-27-news-rich-editor-v2.md`
- `_workspace/00_input/request-summary.md`
- `_workspace/01_scope/spec-selection.md`
- `_workspace/04_review/ui-review.md`
- `_workspace/final/verification.md`

## Checks

- `pnpm exec vitest run src/__tests__/news-rich-content-links.test.tsx -t "reserves published content height"`: FAIL before implementation because the wrapper still had `height:0px`; PASS after implementation with 1 passed and 51 skipped.
- `pnpm exec vitest run src/__tests__/news-rich-content-links.test.tsx`: PASS, 52 tests passed.
- `pnpm lint`: PASS.
- `pnpm test`: PASS, 73 test files and 488 tests passed. jsdom printed existing `Window.scrollTo()` not implemented warnings.
- `pnpm build`: PASS.

## Browser Checks

- Reused local server at `http://127.0.0.1:3000`.
- `/news?tab=free`: HTTP 200.
- Desktop 1440x1000: `hasFreeBoard=true`, `scrollWidth=1440`, `clientWidth=1440`, `hasHorizontalOverflow=false`; screenshot saved to `_workspace/news-free-layer-height-fix-desktop.png`.
- Mobile 390x844: `hasFreeBoard=true`, `scrollWidth=390`, `clientWidth=390`, `hasHorizontalOverflow=false`; screenshot saved to `_workspace/news-free-layer-height-fix-mobile.png`.

## Risks Or Follow-up

- The exact overlapped post from the screenshot was not directly opened by URL in browser automation; the overlap behavior is covered by the focused `NoticeRichContent` component regression.

---

# Verification - Edit Preview And Published Rich Content Diverge

## Implemented Fix

- Added focused regression coverage proving saved `front`/`behind` image layer metadata renders through `NoticeRichContent` as a zero-flow positioned object.
- Updated rich-content sanitization so trusted `data-layout="front"` and `data-layout="behind"` images render with a zero-size relative wrapper and an absolutely positioned image surface.
- Preserved existing image metadata including `data-offset-x`, `data-offset-y`, pixel dimensions, fit, zoom, opacity, and z-index for published display.

## Changed Files

- `src/components/news/notice-rich-editor.tsx`
- `src/__tests__/news-rich-content-links.test.tsx`
- `docs/superpowers/plans/2026-06-27-news-rich-editor-v2.md`
- `_workspace/00_input/request-summary.md`
- `_workspace/01_scope/spec-selection.md`
- `_workspace/04_review/ui-review.md`
- `_workspace/final/verification.md`

## Checks

- `pnpm exec vitest run src/__tests__/news-rich-content-links.test.tsx -t "zero-flow positioned"`: FAIL before implementation because `[data-notice-image-layer]` was missing; PASS after implementation with 1 passed and 51 skipped.
- `pnpm exec vitest run src/__tests__/news-rich-content-links.test.tsx`: PASS, 52 tests passed.
- `pnpm lint`: PASS.
- `pnpm test`: FAIL, 72 files passed and 1 file failed; 487 tests passed and 1 failed. Failing test: `src/__tests__/portal-shell.test.tsx > changes the logged-in user's password from the profile menu`, expected text `비밀번호가 변경되었습니다.` was not found.
- `pnpm build`: PASS.

## Browser Checks

- Reused the existing local server on `http://127.0.0.1:3000`; `/news?tab=free` returned HTTP 200.
- Used a temporary `%TEMP%` installation of `playwright-core` for browser automation; project dependencies were not changed.
- Desktop 1440x1000: `hasFreeBoard=true`, `scrollWidth=1440`, `clientWidth=1440`, `hasHorizontalOverflow=false`; screenshot saved to `_workspace/news-free-layer-fix-desktop.png`.
- Mobile 390x844: `hasFreeBoard=true`, `scrollWidth=390`, `clientWidth=390`, `hasHorizontalOverflow=false`; screenshot saved to `_workspace/news-free-layer-fix-mobile.png`.
- The default loaded page did not include an open rich-content detail or layer image (`layerNodeCount=0`), so layer-specific rendering is covered by focused component tests.

## Risks Or Follow-up

- Full repository tests are currently red because of the unrelated `portal-shell.test.tsx` password-change assertion failure.

---

# Verification - Saved Layer Image Position Resets In Display

## Implemented Fix

- Preserved image `data-layout`, `data-align`, `data-zoom`, `data-offset-x`, and `data-offset-y` during saved-post HTML sanitization.
- Updated the saved-post image style builder to mirror the editor's image placement rules for inline, block, wrap, front, and behind layouts.
- Added regression coverage proving a saved front-layer image keeps its offsets and rendered placement style.

## Changed Files

- `src/components/news/notice-rich-editor.tsx`
- `src/__tests__/news-rich-content-links.test.tsx`
- `_workspace/00_input/request-summary.md`
- `_workspace/01_scope/spec-selection.md`
- `_workspace/04_review/ui-review.md`
- `_workspace/final/verification.md`

## Checks

- `pnpm exec vitest run src/__tests__/news-rich-content-links.test.tsx -t "preserves saved front"`: FAIL before implementation, then PASS.
- `pnpm exec vitest run src/__tests__/news-rich-content-links.test.tsx`: PASS, 51 tests passed.
- `pnpm lint`: PASS.
- `pnpm test`: PASS, 73 files and 487 tests passed. jsdom printed existing `Window.scrollTo()` not implemented warnings.
- `pnpm build`: PASS.
- `git diff --check -- src/components/news/notice-rich-editor.tsx src/__tests__/news-rich-content-links.test.tsx _workspace/00_input/request-summary.md _workspace/01_scope/spec-selection.md _workspace/04_review/ui-review.md _workspace/final/verification.md`: PASS, with LF-to-CRLF working-copy warnings only.

## Browser Checks

- `http://localhost:3000/news?tab=free` returned HTTP 200 with a 15 second timeout.
- Direct browser click/screenshot verification could not run from this shell because the Browser Plugin was not exposed by tool discovery, and the available Node REPL failed before execution with `codex/sandbox-state-meta: missing field sandboxPolicy`.
- The save/display regression is covered by sanitizer and rich-content component tests proving saved `front` layer offsets remain in the rendered HTML/style.

## Risks Or Follow-up

- This keeps existing metadata/CSS behavior. It does not rasterize or physically rewrite uploaded images.

---

# Verification - Layer Image Disappears In Edit Mode

## Implemented Fix

- Removed the `max-w-full` class from the internal image layer surface when an image is in `front` or `behind` layer mode.
- Kept normal non-layer image surfaces constrained with `max-w-full`.
- Added regression coverage for existing saved `front` layer images loading visibly in edit mode.
- Tightened layer button coverage so a normal block image remains visible after choosing `텍스트 뒤에 배치` or `텍스트 앞에 배치`.

## Changed Files

- `src/components/news/rich-text-editor-v2.tsx`
- `src/__tests__/news-rich-content-links.test.tsx`
- `_workspace/00_input/request-summary.md`
- `_workspace/04_review/ui-review.md`
- `_workspace/final/verification.md`

## Checks

- `pnpm exec vitest run src/__tests__/news-rich-content-links.test.tsx -t "visible when the editor loads"`: FAIL before implementation, then PASS.
- `pnpm exec vitest run src/__tests__/news-rich-content-links.test.tsx -t "layer|visible when"`: PASS.
- `pnpm exec vitest run src/__tests__/news-rich-content-links.test.tsx`: PASS, 50 tests passed.
- `pnpm lint`: PASS.
- `pnpm test`: PASS, 73 files and 486 tests passed. jsdom printed existing `Window.scrollTo()` not implemented warnings.
- `pnpm build`: PASS.
- `git diff --check -- src/components/news/rich-text-editor-v2.tsx src/__tests__/news-rich-content-links.test.tsx _workspace/00_input/request-summary.md _workspace/04_review/ui-review.md _workspace/final/verification.md`: PASS, with LF-to-CRLF working-copy warnings only.

## Browser Checks

- `http://localhost:3000/news?tab=free` returned HTTP 200 with a 15 second timeout.
- Direct browser click/screenshot verification could not run from this shell because local `playwright`, `@playwright/test`, Chrome, and Edge commands were not available.
- The changed interaction is covered by component tests for loading saved layer images and clicking the fourth/fifth layer controls from a normal block image.

## Risks Or Follow-up

- This fixes the collapse caused by the zero-width layer wrapper. Browser click verification is still useful when a local browser automation runtime is available.

---

# Verification - Front Behind Image Layer Drag

## Implemented Feature

- Added image layer offsets as `data-offset-x` and `data-offset-y`.
- Changed `텍스트 뒤에 배치` and `텍스트 앞에 배치` from simple z-index hints into layer-mode rendering in the image NodeView.
- In layer mode, the image wrapper no longer consumes normal document space; the image surface is positioned by its saved offset.
- Dragging a `front` or `behind` image updates and persists its offsets.
- Kept regular `inline`, `wrap`, and `block` image modes in normal document flow.

## Changed Files

- `src/components/news/rich-text-editor-v2.tsx`
- `src/__tests__/news-rich-content-links.test.tsx`
- `_workspace/00_input/request-summary.md`
- `_workspace/01_scope/spec-selection.md`
- `_workspace/04_review/ui-review.md`
- `_workspace/final/verification.md`

## Checks

- `pnpm exec vitest run src/__tests__/news-rich-content-links.test.tsx -t "layer"`: FAIL before implementation, then PASS.
- `pnpm exec vitest run src/__tests__/news-rich-content-links.test.tsx`: PASS, 49 tests passed.
- `pnpm lint`: PASS.
- `pnpm test`: PASS, 73 files and 485 tests passed. jsdom printed existing `Window.scrollTo()` not implemented warnings.
- `pnpm build`: PASS.
- `git diff --check -- src/components/news/rich-text-editor-v2.tsx src/__tests__/news-rich-content-links.test.tsx _workspace/00_input/request-summary.md _workspace/01_scope/spec-selection.md _workspace/04_review/ui-review.md _workspace/final/verification.md`: PASS, with LF-to-CRLF working-copy warnings only.

## Browser Checks

- `http://localhost:3000/news?tab=free` returned HTTP 200.
- Direct browser click/screenshot verification could not run from this shell because local `playwright`, `@playwright/test`, Chrome, and Edge commands were not available.
- The changed interaction is covered by component tests for `behind`/`front` layer rendering and persisted drag offsets.

## Risks Or Follow-up

- `front` and `behind` are rich-editor image layer modes, not a full arbitrary page-layout engine.

---

# Verification - Inline Image Double-Click Crop Mode

## Implemented Feature

- Changed image double-click behavior from opening the advanced image options panel to entering inline crop mode.
- Added an internal crop box with labeled corner and edge crop handles.
- Added explicit `자르기 저장`, `자르기 취소`, and `자르기 초기화` controls.
- Kept normal image dragging and selection from changing crop metadata.
- Saved crop as existing non-destructive image presentation metadata: `data-fit="cover"`, `data-crop-x`, `data-crop-y`, and `data-zoom`.

## Changed Files

- `src/components/news/rich-text-editor-v2.tsx`
- `src/__tests__/news-rich-content-links.test.tsx`
- `_workspace/00_input/request-summary.md`
- `_workspace/01_scope/spec-selection.md`
- `_workspace/04_review/ui-review.md`
- `_workspace/final/verification.md`

## Checks

- `pnpm exec vitest run src/__tests__/news-rich-content-links.test.tsx -t "inline crop|cancels inline crop"`: FAIL before implementation, then PASS.
- `pnpm exec vitest run src/__tests__/news-rich-content-links.test.tsx -t "saved without moving"`: FAIL before implementation, then PASS.
- `pnpm exec vitest run src/__tests__/news-rich-content-links.test.tsx`: PASS, 47 tests passed.
- `pnpm lint`: PASS.
- `pnpm test`: PASS, 73 files and 483 tests passed. jsdom printed existing `Window.scrollTo()` not implemented warnings.
- `pnpm build`: PASS.
- `git diff --check -- src/components/news/rich-text-editor-v2.tsx src/__tests__/news-rich-content-links.test.tsx _workspace/00_input/request-summary.md _workspace/01_scope/spec-selection.md _workspace/04_review/ui-review.md _workspace/final/verification.md`: PASS, with LF-to-CRLF working-copy warnings only.

## Browser Checks

- `http://localhost:3000/news?tab=free` returned HTTP 200.
- Direct browser click/screenshot verification could not run from this shell because local `playwright`, `@playwright/test`, Chrome, and Edge commands were not available.
- The changed interaction is covered by component tests for double-click crop entry, internal crop handle drag, save, cancel, and hiding the regular layout toolbar while crop mode is active.

## Risks Or Follow-up

- Crop remains metadata/CSS based. It does not generate a newly cropped bitmap file.

---

# Verification - Selected Image Movement And Toolbar Spacing

## Implemented Feature

- Added bottom spacing to selected image nodes so the floating layout toolbar does not cover the following text.
- Marked the selected image NodeView and inner image as draggable.
- Added a move surface around the selected image and stopped preventing default mouse-down on that surface, allowing native editor drag movement.
- Added regression coverage for toolbar spacing and selected-image drag readiness.

## Changed Files

- `src/components/news/rich-text-editor-v2.tsx`
- `src/__tests__/news-rich-content-links.test.tsx`
- `_workspace/04_review/ui-review.md`
- `_workspace/final/verification.md`

## Checks

- `pnpm exec vitest run src/__tests__/news-rich-content-links.test.tsx -t "reserves space for the selected image toolbar"`: FAIL before implementation, then PASS.
- `pnpm exec vitest run src/__tests__/news-rich-content-links.test.tsx`: PASS, 44 tests passed.
- `pnpm lint`: PASS.
- `pnpm test`: PASS, 73 files and 480 tests passed. jsdom printed existing `Window.scrollTo()` not implemented warnings.
- `pnpm build`: PASS.
- `git diff --check -- src/components/news/rich-text-editor-v2.tsx src/__tests__/news-rich-content-links.test.tsx`: PASS, with LF-to-CRLF working-copy warnings only.

## Browser Checks

- Direct browser drag/click screenshot verification could not run from this shell because local browser automation remains unavailable.
- The behavior is covered by component tests for toolbar spacing, draggable attributes, and unblocked mouse-down on the image move surface.

## Risks Or Follow-up

- Dragging remains document-flow movement through the editor, not free canvas positioning.

---

# Verification - Bottom Image Layout Menu Functional Fix

## Implemented Feature

- Changed the rich editor image extension from block-only to inline-capable so image layout controls can work like document object placement controls.
- Stopped unwrapping `<p><img /></p>` into top-level images during editor input normalization.
- Added coverage that images can remain inside a text paragraph and that all five bottom layout buttons visibly change the selected image node placement classes.
- Updated existing image interaction tests to wait for inline NodeView rendering before interacting with the image.

## Changed Files

- `src/components/news/rich-text-editor-v2.tsx`
- `src/__tests__/news-rich-content-links.test.tsx`
- `_workspace/04_review/ui-review.md`
- `_workspace/final/verification.md`

## Checks

- `pnpm exec vitest run src/__tests__/news-rich-content-links.test.tsx -t "text flow and visibly changes placement|every bottom image layout icon"`: FAIL before implementation, then PASS.
- `pnpm exec vitest run src/__tests__/news-rich-content-links.test.tsx`: PASS, 43 tests passed.
- `pnpm lint`: PASS.
- `pnpm test`: PASS, 73 files and 479 tests passed. jsdom printed existing `Window.scrollTo()` not implemented warnings.
- `pnpm build`: PASS.
- `git diff --check -- src/components/news/rich-text-editor-v2.tsx src/__tests__/news-rich-content-links.test.tsx`: PASS, with LF-to-CRLF working-copy warnings only.

## Browser Checks

- Direct browser click/screenshot verification could not run from this shell because local browser automation remains unavailable.
- The original symptom is covered by focused component tests that click all five bottom layout buttons and assert visible selected-node placement changes.

## Risks Or Follow-up

- `behind` and `front` still behave as document-flow layering modes, not arbitrary page-free positioning.

---

# Verification - Bottom Image Layout Menu Actions

## Implemented Feature

- Replaced low-contrast CSS fragment icons in the selected-image bottom menu with explicit SVG icons.
- Made all five bottom placement buttons persist distinct layout modes: `inline`, `wrap`, `block`, `behind`, and `front`.
- Updated image layout normalization and saved image styles so `behind` and `front` are preserved as document-flow layering hints.
- Kept the active menu item as a rounded blue icon highlight.

## Changed Files

- `src/components/news/rich-text-editor-v2.tsx`
- `src/__tests__/news-rich-content-links.test.tsx`
- `_workspace/00_input/request-summary.md`
- `_workspace/04_review/ui-review.md`
- `_workspace/final/verification.md`

## Checks

- `pnpm exec vitest run src/__tests__/news-rich-content-links.test.tsx -t "every bottom image layout icon"`: FAIL before implementation, then PASS.
- `pnpm exec vitest run src/__tests__/news-rich-content-links.test.tsx`: PASS, 42 tests passed.
- `pnpm lint`: PASS.
- `pnpm test`: PASS, 73 files and 478 tests passed. jsdom printed existing `Window.scrollTo()` not implemented warnings.
- `pnpm build`: PASS.
- `git diff --check -- src/components/news/rich-text-editor-v2.tsx src/__tests__/news-rich-content-links.test.tsx`: PASS, with LF-to-CRLF working-copy warnings only.

## Browser Checks

- Direct click/screenshot verification could not run from this shell because local browser automation remains unavailable.
- The menu action bug is covered by focused component tests for visible SVG icons and distinct persisted placement modes.

## Risks Or Follow-up

- `behind` and `front` remain document-flow layering hints. True Google Docs-style page-fixed overlap would require a separate layout engine and is still out of scope.

---

# Verification - Google Docs Image Toolbar Clone Follow-up

## Implemented Feature

- Moved the selected-image rotation angle label into the same rotatable surface as the rotation handle.
- Positioned the angle label beside the circular rotation handle and counter-rotated the label text for readability.
- Removed the previous wide `이미지 배치 방식` text/dropdown button from the default selected-image toolbar.
- Replaced the bottom toolbar with five icon-only layout controls, a separator, and the More/options button, matching the Google Docs reference more closely.
- Changed the active layout control from a full rectangular highlight to a small rounded blue icon highlight.
- Kept layout actions wired to existing `data-layout` metadata so images remain document-flow content.

## Changed Files

- `src/components/news/rich-text-editor-v2.tsx`
- `src/__tests__/news-rich-content-links.test.tsx`
- `docs/superpowers/specs/2026-06-27-news-rich-editor-v2-design.md`
- `docs/superpowers/plans/2026-06-27-news-rich-editor-v2.md`
- `_workspace/00_input/request-summary.md`
- `_workspace/01_scope/spec-selection.md`
- `_workspace/04_review/ui-review.md`
- `_workspace/final/verification.md`

## Checks

- `pnpm exec vitest run src/__tests__/news-rich-content-links.test.tsx -t "shows rotation angle|renders a Google Docs style bottom image layout popup|rotates the selected image, outline"`: FAIL before implementation, then PASS.
- `pnpm exec vitest run src/__tests__/news-rich-content-links.test.tsx -t "Google Docs style bottom|rotation angle|rotates the selected image, outline|clean Google Docs style image toolbar"`: PASS, 4 tests passed.
- `pnpm exec vitest run src/__tests__/news-rich-content-links.test.tsx`: PASS, 41 tests passed.
- `pnpm lint`: PASS.
- `pnpm test`: PASS, 73 files and 477 tests passed. jsdom printed existing `Window.scrollTo()` not implemented warnings.
- `pnpm build`: PASS.
- `git diff --check`: PASS, with LF-to-CRLF working-copy warnings only.
- `pnpm exec tsc --noEmit --pretty false --incremental false`: previously FAIL due existing repo-wide test type issues outside this slice, including disclosure category fixtures, legacy `CoopNewsView` author fixtures, and unrelated test typing mismatches. `pnpm build` TypeScript validation passed.

## Browser Checks

- `http://localhost:3000/news?tab=free` returned HTTP 200.
- Direct click/screenshot verification could not run from this shell because local `playwright`, Chrome, and Edge commands were not available.
- The changed interaction is covered by focused component tests for angle-label containment, icon toolbar shape, active icon styling, and layout metadata updates.

## Risks Or Follow-up

- The `텍스트 뒤에 배치` and `텍스트 앞에 배치` icons remain document-flow approximations because page-fixed absolute placement is intentionally out of scope.

---

# Verification - Google Docs Rotated Image Object And Options Panel

## Implemented Feature

- Moved selected-image outline, resize handles, and rotation handle into the same rotatable image surface so they align with the actually rotated image.
- Kept the bottom image toolbar and angle label upright while the selected image object itself rotates.
- Converted the bottom `텍스트와 함께 이동` control into a real accessible `이미지 배치 방식` menu.
- Added placement menu actions for `글자처럼 처리`, `텍스트 감싸기`, and `위아래 배치`, backed by existing `data-layout` metadata.
- Reworked detailed image editing from a full-screen black editor into a right-side `이미지 편집` options panel.
- Preserved detailed controls for size, rotation, zoom, fit, crop focus, and apply/cancel actions.
- Connected side-panel text wrapping buttons to the same image layout metadata.

## Changed Files

- `src/components/news/rich-text-editor-v2.tsx`
- `src/__tests__/news-rich-content-links.test.tsx`
- `docs/superpowers/specs/2026-06-27-news-rich-editor-v2-design.md`
- `docs/superpowers/plans/2026-06-27-news-rich-editor-v2.md`
- `_workspace/00_input/request-summary.md`
- `_workspace/01_scope/spec-selection.md`
- `_workspace/04_review/ui-review.md`
- `_workspace/final/verification.md`

## Checks

- `pnpm exec vitest run src/__tests__/news-rich-content-links.test.tsx -t "opens the bottom image layout menu"`: FAIL before implementation, then PASS.
- `pnpm exec vitest run src/__tests__/news-rich-content-links.test.tsx -t "right side options panel"`: FAIL before implementation, then PASS.
- `pnpm exec vitest run src/__tests__/news-rich-content-links.test.tsx -t "clean Google Docs style image toolbar|rotates the selected image, outline, resize handles|shows rotation angle"`: PASS, 3 tests passed.
- `pnpm exec vitest run src/__tests__/news-rich-content-links.test.tsx`: PASS, 41 tests passed.
- `pnpm lint`: PASS.
- `pnpm test`: PASS, 73 files and 477 tests passed. jsdom printed existing `Window.scrollTo()` not implemented warnings.
- `pnpm build`: PASS.
- `git diff --check`: PASS, with LF-to-CRLF working-copy warnings only.
- `pnpm exec tsc --noEmit`: FAIL due existing repo-wide test type issues outside this slice, including disclosure category fixture values, legacy `CoopNewsView` author fixtures in `news-admin-controls`, and several unrelated test typing mismatches.

## Browser Checks

- `http://localhost:3000/news?tab=free` returned HTTP 200.
- Local Playwright CLI verification could not run because `playwright` is not installed as an executable in this workspace.
- Chrome/Edge commands were not discoverable through `Get-Command`, so direct click/screenshot verification could not run from this shell.
- The changed interaction is covered by focused component tests for rotated object chrome, placement menu behavior, and side-panel rendering.

## Risks Or Follow-up

- Rotation and image options remain metadata/CSS based. This does not rasterize or upload a newly transformed bitmap.
- If exact Google Docs free-position placement is required later, it should be a separate absolute-position/page-layout feature because the current implementation intentionally stays in document flow.

---

# Verification - Non-Clipping Image Rotation Feedback

## Implemented Feature

- Added a visible selected-image rotation angle label such as `33.0°` near the rotation handle.
- Added a rotated blue object outline for selected images with non-zero rotation.
- Changed the selected image frame to use `overflow: visible` while rotated so rotated image corners are not clipped by the frame.
- Prevented rotated `cover` images from reintroducing a square aspect-ratio crop frame in sanitized/public rendering.
- Preserved existing `data-rotate` metadata and document-flow layout behavior.

## Changed Files

- `src/components/news/rich-text-editor-v2.tsx`
- `src/components/news/notice-rich-editor.tsx`
- `src/__tests__/news-rich-content-links.test.tsx`
- `docs/superpowers/specs/2026-06-27-news-rich-editor-v2-design.md`
- `docs/superpowers/plans/2026-06-27-news-rich-editor-v2.md`
- `_workspace/00_input/request-summary.md`
- `_workspace/01_scope/spec-selection.md`
- `_workspace/04_review/ui-review.md`
- `_workspace/final/verification.md`

## Checks

- `pnpm exec vitest run src/__tests__/news-rich-content-links.test.tsx -t "shows rotation angle"`: FAIL before implementation, then PASS.
- `pnpm exec vitest run src/__tests__/news-rich-content-links.test.tsx -t "rotates a selected image from the top rotation handle"`: PASS.
- `pnpm exec vitest run src/__tests__/news-rich-content-links.test.tsx`: PASS, 38 tests passed.
- `pnpm exec vitest run src/__tests__/news-rich-content-links.test.tsx src/__tests__/news-admin-controls.test.tsx`: PASS, 123 tests passed. jsdom printed the existing `Window.scrollTo()` not implemented warning.
- `pnpm lint`: PASS.
- `pnpm test`: PASS, 73 files and 474 tests passed. jsdom printed existing `Window.scrollTo()` not implemented warnings.
- `pnpm build`: PASS.
- `git diff --check`: PASS, with LF-to-CRLF working-copy warnings only.

## Browser Checks

- `http://localhost:3000/news?tab=free` returned HTTP 200.
- Local Playwright CLI verification could not run because `playwright` is not installed as an executable in this workspace.
- The interaction is covered by focused DOM tests for angle display, rotated outline, visible frame overflow, drag-updated angle label, and sanitized non-crop rotated rendering.

## Risks Or Follow-up

- Rotation remains metadata/CSS-transform based. It does not rasterize and upload a newly rotated bitmap.

---

# Verification - Google Docs Middle Handles And Top Rotation

## Implemented Feature

- Moved the selected-image rotation dot above the top-center resize handle with explicit inline positioning, avoiding stale arbitrary Tailwind positioning.
- Made side middle handles stretch or compress the selected image width by writing `data-pixel-width`.
- Made top and bottom middle handles stretch or compress the selected image height by writing `data-pixel-height`.
- Kept corner handles proportional by deriving both pixel width and pixel height from the drag ratio.
- Preserved existing crop metadata during resize and prevented pixel-sized `cover` images from keeping a square crop frame.
- Applied the same pixel-size rendering rule in the saved/public rich-content renderer so edited images display consistently after saving.

## Changed Files

- `src/components/news/rich-text-editor-v2.tsx`
- `src/components/news/notice-rich-editor.tsx`
- `src/__tests__/news-rich-content-links.test.tsx`
- `src/__tests__/news-admin-controls.test.tsx`
- `docs/superpowers/specs/2026-06-27-news-rich-editor-v2-design.md`
- `docs/superpowers/plans/2026-06-27-news-rich-editor-v2.md`
- `_workspace/00_input/request-summary.md`
- `_workspace/01_scope/spec-selection.md`
- `_workspace/04_review/ui-review.md`
- `_workspace/final/verification.md`

## Checks

- `pnpm exec vitest run src/__tests__/news-rich-content-links.test.tsx -t "clean Google Docs style image toolbar|side handles|top and bottom handles|rotates a selected image"`: FAIL before implementation, then PASS, 5 tests passed.
- `pnpm exec vitest run src/__tests__/news-rich-content-links.test.tsx`: PASS, 36 tests passed.
- `pnpm exec vitest run src/__tests__/news-rich-content-links.test.tsx src/__tests__/news-admin-controls.test.tsx`: PASS, 121 tests passed. jsdom printed the existing `Window.scrollTo()` not implemented warning.
- `pnpm lint`: FAIL once on `prefer-const`, then PASS after fixing `nextWidth`.
- `pnpm test`: PASS, 73 files and 472 tests passed. jsdom printed existing `Window.scrollTo()` not implemented warnings.
- `pnpm build`: PASS.
- `git diff --check`: PASS, with LF-to-CRLF working-copy warnings only.

## Browser Checks

- `http://localhost:3000/news?tab=free` returned HTTP 200.
- In-app browser automation could not run because the browser runtime connection failed with a sandbox metadata error.
- Local Playwright CLI verification could not run because `playwright` is not installed as an executable in this workspace.
- The interaction is covered by focused component tests for handle selection, drag output, rotation handle placement, and saved HTML rendering semantics.

## Risks Or Follow-up

- Middle-handle resizing intentionally stretches/compresses pixels. It does not perform destructive bitmap cropping or image file regeneration.
- Browser click verification should be repeated when the in-app browser runtime is available.

---

# Verification - Google Docs Style Image Handles And Rotation

## Implemented Feature

- Reduced selected-image resize handles from bulky `size-4` white nodes to smaller Google Docs style `size-2` blue nodes.
- Added a top-center `이미지 회전 핸들` with a short connector line above the selected image.
- Added drag rotation logic that calculates angle from the selected image frame center and saves the result to `data-rotate`.
- Expanded image rotation normalization in both the editor and sanitizer paths so authored rotation metadata can preserve arbitrary 0-359 degree values.
- Reworked the selected-image bottom toolbar into a compact rounded popup with layout choices, `텍스트와 함께 이동`, and a More-style advanced settings entry.
- Kept image movement document-flow based through the existing `data-layout` modes rather than adding absolute page positioning.

## Changed Files

- `src/components/news/rich-text-editor-v2.tsx`
- `src/components/news/notice-rich-editor.tsx`
- `src/__tests__/news-rich-content-links.test.tsx`
- `docs/superpowers/specs/2026-06-27-news-rich-editor-v2-design.md`
- `docs/superpowers/plans/2026-06-27-news-rich-editor-v2.md`
- `_workspace/00_input/request-summary.md`
- `_workspace/01_scope/spec-selection.md`
- `_workspace/04_review/ui-review.md`
- `_workspace/final/verification.md`

## Checks

- `pnpm exec vitest run src/__tests__/news-rich-content-links.test.tsx -t "clean Google Docs style image toolbar|rotates a selected image"`: FAIL before implementation, then PASS.
- `pnpm exec vitest run src/__tests__/news-rich-content-links.test.tsx`: PASS, 34 tests passed.
- `pnpm exec vitest run src/__tests__/news-admin-controls.test.tsx -t "본문 이미지|image|pasted|rich text editor"`: PASS, 8 tests passed. jsdom printed the existing `Window.scrollTo()` not implemented warning.
- `pnpm exec vitest run src/__tests__/news-rich-content-links.test.tsx src/__tests__/news-admin-controls.test.tsx`: PASS, 119 tests passed. jsdom printed the existing `Window.scrollTo()` not implemented warning.
- `pnpm lint`: PASS.
- `pnpm test`: PASS, 73 files and 470 tests passed. jsdom printed existing `Window.scrollTo()` not implemented warnings.
- `pnpm build`: PASS.
- `git diff --check`: PASS, with LF-to-CRLF working-copy warnings only.

## Browser Checks

- Existing dev server detected on `http://localhost:3000`.
- Automated browser verification was not completed in this shell because `chrome`, `chrome.exe`, `msedge`, and `msedge.exe` were not discoverable through `Get-Command`.
- The changed interaction is covered by focused component DOM tests for the selected image group, 8 small handles, rotation handle drag, bottom toolbar action, advanced editor entry, and unchanged default-selection control surface.

## Risks Or Follow-up

- Rotation remains metadata-based (`data-rotate`) and does not rasterize/upload a newly rotated bitmap.
- Page-fixed/free-positioned image placement remains out of scope; images still move with document flow.

---

# Verification - Free Board Compact Fixed-Width Composer

## Implemented Feature

- Changed the free-board create/edit dialog shell to a capped `max-w-[920px]` document-style composer.
- Added an inline `maxWidth: 920px` fallback so the visible dialog width remains capped even if arbitrary Tailwind class output is stale in the running dev server.
- Changed the inner writing/footer column to `max-w-[820px]`.
- Increased the rich body textbox from the previous `min-h-80` sizing to `min-h-[360px] sm:min-h-[420px]`.
- Removed the redundant header helper copy under `새 게시글 작성` / `게시글 수정`.
- Reordered the composer flow to title first, body editor second, and a compact `게시글 설정` panel after the editor.
- Reduced the attachment control from a full-width top section to a smaller line-style control inside the settings panel.
- Kept the same free-board create/edit state, attachment upload, rich editor props, submit labels, and API behavior.

## Changed Files

- `src/components/news/free-board.tsx`
- `src/components/news/rich-text-editor-v2.tsx`
- `src/__tests__/news-admin-controls.test.tsx`
- `docs/superpowers/specs/2026-06-28-free-board-wide-editor-design.md`
- `docs/superpowers/plans/2026-06-28-free-board-wide-editor.md`
- `_workspace/00_input/request-summary.md`
- `_workspace/01_scope/spec-selection.md`
- `_workspace/04_review/ui-review.md`
- `_workspace/final/verification.md`

## Checks

- `pnpm exec vitest run src/__tests__/news-admin-controls.test.tsx -t "narrow document workspace|fixed-width document workspace"`: FAIL before implementation, then PASS.
- `pnpm exec vitest run src/__tests__/news-admin-controls.test.tsx`: PASS, 85 tests passed. jsdom printed the existing `Window.scrollTo()` not implemented warning.
- `pnpm lint`: PASS.
- `pnpm test`: PASS, 73 files and 469 tests passed. jsdom printed existing `Window.scrollTo()` not implemented warnings.
- `pnpm build`: PASS.
- `git diff --check`: PASS, with LF-to-CRLF working-copy warnings only.

## Browser Checks

- Existing dev server responded at `http://localhost:3000/news`.
- The live page is session-gated for the create composer in an unauthenticated browser context, so this follow-up is verified by focused component DOM tests for the modal shell, document column, content order, and rich body textbox height.

## Risks Or Follow-up

- none

---

# Verification - Google Docs Image Crop Intent And Handle Roles

## Implemented Fix

- Removed the implicit image-surface crop drag path that changed selected images to `data-fit="cover"` based on mouse movement inside the image.
- Kept normal image click/drag behavior as object selection only unless the user uses an explicit resize handle or advanced image edit controls.
- Made resize dragging read the actual pressed handle in the NodeView capture path instead of defaulting to `bottom-right`.
- Split resize math by handle role: left/right handles adjust width, top/bottom handles adjust height, and corners resize width/height together.
- Preserved existing fit, crop, rotation, layout, zoom, and pixel metadata during resize updates.

## Changed Files

- `src/components/news/rich-text-editor-v2.tsx`
- `src/__tests__/news-rich-content-links.test.tsx`
- `_workspace/00_input/request-summary.md`
- `_workspace/01_scope/spec-selection.md`
- `_workspace/04_review/ui-review.md`
- `_workspace/final/verification.md`

## Checks

- `pnpm exec vitest run src/__tests__/news-rich-content-links.test.tsx -t "does not switch a selected image into crop mode|uses the top and bottom handles"`: FAIL before implementation, then PASS.
- `pnpm exec vitest run src/__tests__/news-rich-content-links.test.tsx`: PASS, 33 tests passed.
- `pnpm lint`: PASS.
- `pnpm test`: PASS, 73 files and 468 tests passed. jsdom printed existing `Window.scrollTo()` not implemented warnings.
- `pnpm build`: PASS.

## Browser Checks

- Existing dev server responded at `http://localhost:3000/news?tab=free`.
- Chrome CDP opened the real free-board create modal with an admin session cookie, inserted a body image, selected it, dragged the image surface, and verified `data-fit="contain"` plus `data-crop-x/y="center"` stayed unchanged.
- Chrome CDP then dragged the bottom resize handle and verified `data-width="50"` stayed unchanged while `data-pixel-height` changed from unset to `269` and rendered image height increased from `179` to `267`.
- Screenshot saved: `_workspace/google-docs-image-crop-intent-fixed.png`.

## Risks Or Follow-up

- This keeps image edits metadata-based. It does not rasterize and upload a newly cropped bitmap.

---

# Verification - Google Docs Style Clean Image Controls

## Implemented Feature

- Replaced the cluttered selected-image quick toolbar with one compact Google Docs style `이미지 레이아웃 도구`.
- Kept selected images as document objects with a blue selection frame and 8 resize handles.
- Moved default-surface controls down to three layout choices: inline, text wrapping, and block.
- Removed always-visible selected-image zoom slider, crop preset row, fit controls, and delete action from the default selected state.
- Kept exact pixel size, zoom, fit, crop, and rotation in the advanced `이미지 편집` dialog.
- Fixed the real-browser advanced edit activation by adding `data-notice-image-open-editor` to the new `이미지 고급 설정` button so the NodeView capture path opens the modal before ProseMirror can swallow the click.

## Changed Files

- `src/components/news/rich-text-editor-v2.tsx`
- `src/__tests__/news-rich-content-links.test.tsx`
- `src/__tests__/news-admin-controls.test.tsx`
- `_workspace/00_input/request-summary.md`
- `_workspace/01_scope/spec-selection.md`
- `_workspace/04_review/ui-review.md`
- `_workspace/final/verification.md`

## Checks

- `pnpm exec vitest run src/__tests__/news-rich-content-links.test.tsx -t "clean Google Docs style image toolbar"`: FAIL before implementation, then PASS.
- `pnpm exec vitest run src/__tests__/news-rich-content-links.test.tsx src/__tests__/news-admin-controls.test.tsx`: PASS, 115 tests passed.
- `pnpm lint`: PASS.
- `pnpm test`: PASS, 73 files and 466 tests passed. jsdom printed existing `Window.scrollTo()` not implemented warnings.
- `pnpm build`: PASS.

## Browser Checks

- Existing dev server responded at `http://localhost:3000/news?tab=free`.
- Chrome CDP opened the real free-board create modal with an admin session cookie, inserted an image into the Tiptap editor, selected the image, and clicked `이미지 고급 설정`.
- Final browser DOM state: `이미지 레이아웃 도구` present, `이미지 빠른 도구` absent, 8 resize handles present, `data-notice-image-open-editor` present on the advanced button, `이미지 편집` dialog present, and `이미지 편집 적용` button present.
- Screenshot saved: `_workspace/google-docs-image-control-verified.png`.

## Risks Or Follow-up

- This remains metadata-based document image editing. It does not rasterize and upload a newly edited bitmap.

---

# Verification - Google Docs Style Inline Image Editing

## Implemented Feature

- Added direct in-document image editing controls to `RichTextEditorV2`.
- Selected images now show an object frame, compact quick toolbar, separate layout/crop/zoom toolbar, and 8 resize handles.
- Added image layout metadata (`inline`, `wrap`, `block`) so images can behave more like text-adjacent objects.
- Added image zoom metadata and rendered zoom inside an overflow-hidden image frame so the object size remains stable while crop/zoom changes.
- Added crop-position buttons and image-drag crop adjustment for cover-mode images.
- Changed resize dragging to attach document listeners immediately on pointer/mouse down, making real browser drag input reliable.
- Kept the detailed image editor dialog as the advanced/helper path.

## Changed Files

- `src/components/news/rich-text-editor-v2.tsx`
- `src/__tests__/news-rich-content-links.test.tsx`
- `src/__tests__/news-admin-controls.test.tsx`
- `_workspace/00_input/request-summary.md`
- `_workspace/01_scope/spec-selection.md`
- `_workspace/04_review/ui-review.md`
- `_workspace/final/verification.md`

## Checks

- `pnpm exec vitest run src/__tests__/news-rich-content-links.test.tsx -t "edits image layout, crop, zoom, and resize handles directly"`: PASS.
- `pnpm exec vitest run src/__tests__/news-rich-content-links.test.tsx src/__tests__/news-admin-controls.test.tsx`: PASS, 115 tests passed. jsdom printed the existing `Window.scrollTo()` not implemented warning.
- `pnpm lint`: PASS.
- `pnpm build`: PASS.
- `pnpm exec vitest run src/__tests__/portal-shell.test.tsx -t "changes the logged-in user's password from the profile menu"`: PASS after one parallel full-suite run missed the success text.
- `pnpm test`: PASS on the final standalone run, 73 files and 466 tests passed. jsdom printed existing `Window.scrollTo()` not implemented warnings.

## Browser Checks

- Existing dev server responded at `http://localhost:3000/news?tab=free`.
- Chrome CDP opened the real free-board create modal, inserted an image into the Tiptap editor, selected the image, clicked layout/crop/zoom controls, and dragged the bottom-right resize handle.
- Final browser DOM state: `data-width="75"`, `data-layout="wrap"`, `data-zoom="140"`, `data-crop-x="right"`, `data-crop-y="bottom"`, selected image toolbar visible, and 8 resize handles visible.
- Screenshot saved: `_workspace/direct-inline-image-edit-final-immediate-drag.png`.

## Risks Or Follow-up

- The implementation stores image presentation metadata in HTML and does not rasterize/upload a newly edited bitmap. If destructive bitmap editing is required later, that should be a separate canvas/export slice.

---

# Verification - Rich Image Editor Code Cleanup

## Implemented Cleanup

- Removed the unused parent-level image editor state path from `RichTextEditorV2`.
- Removed the legacy `notice-rich-editor:image-editor-open` custom event bridge from production code.
- Removed the duplicate parent-level image editor portal.
- Extracted the full-screen image editor UI into a single `ImageEditorDialog` component.
- Added `createImageEditDraft(...)` so image edit draft initialization has one source.
- Kept the actual working path as the image NodeView local object editor, which is the path verified by direct browser clicks and regression tests.

## Checks

- `rg -n "NOTICE_IMAGE_EDITOR|activeImageEditor|ImageEditorOpenDetail|notice-rich-editor:image-editor-open|ImageEditorDialog|createImageEditDraft" src/components/news/rich-text-editor-v2.tsx src/__tests__/news-rich-content-links.test.tsx`: production code now only contains `ImageEditorDialog` and `createImageEditDraft`; the legacy event string remains only in a regression test that asserts it is not dispatched.
- `pnpm exec vitest run src/__tests__/news-rich-content-links.test.tsx -t "image editor|toolbar image editing|keeps image editor controls out"`: PASS, 7 tests passed.
- `pnpm lint`: PASS.
- `pnpm exec vitest run src/__tests__/news-rich-content-links.test.tsx src/__tests__/news-admin-controls.test.tsx`: PASS, 114 tests passed. jsdom printed the existing `Window.scrollTo()` not implemented warning.
- `pnpm test`: PASS, 73 files and 465 tests passed. jsdom printed the existing `Window.scrollTo()` not implemented warnings.
- `pnpm build`: PASS.
- `git diff --check`: PASS, only existing LF-to-CRLF warnings were printed.

## Risks Or Follow-up

- This cleanup does not yet implement Google-Docs-style inline image wrapping/cropping handles. It reduces the conflicting paths before that next implementation.
- `src/components/news/rich-text-editor-v2.tsx` is still untracked in the current git worktree, so normal `git diff -- <file>` does not display its changes until it is staged or otherwise tracked.

---

# Verification - Rich Image Editor Direct Click Fix

## Implemented Fix

- Changed the image toolbar `편집` action so it opens the NodeView image editor state directly instead of relying on the editor-root custom event bridge.
- Kept the full-screen image editor outside the ProseMirror document body via portal.
- Added inline `z-index`, black background, and white text styles to the image editor layer so the running browser does not depend on generated Tailwind utility output for the critical overlay layer.
- Added regression coverage proving the toolbar image editor opens without dispatching `notice-rich-editor:image-editor-open`.

## Checks

- `pnpm exec vitest run src/__tests__/news-rich-content-links.test.tsx -t "full pointer click sequence|without relying on the editor custom event bridge|image editor"`: PASS, 7 tests passed.
- `pnpm lint`: PASS.
- `pnpm test`: PASS, 73 files and 465 tests passed. jsdom printed the existing `Window.scrollTo()` not implemented warnings.
- `pnpm build`: PASS.

## Browser Checks

- Existing dev server responded at `http://localhost:3000/news?tab=free`.
- Direct Chrome CDP click test completed the real flow: `새 게시글 작성` -> image file upload -> inserted image click -> toolbar `편집` click.
- The clicked edit button was `aria="이미지 편집 열기"` and visible at `57.4375 x 32`.
- The resulting image editor dialog covered the viewport at `1400 x 1050`, had `inlineZ=220`, `computedZ=220`, `backgroundColor=rgb(0, 0, 0)`, and `topInsideDialog=true`.
- Screenshots saved: `_workspace/direct-click-live-before-edit.png`, `_workspace/direct-click-live-after-edit.png`.

## Risks Or Follow-up

- The direct browser check uploads an image through the normal local dev upload path and does not submit a post. The edit mode itself is now verified by actual clicks and by focused regression tests.

---

# Verification - Rich Image Activation Follow-up

## Implemented Feature

- Image nodes now keep a local active state instead of depending only on ProseMirror's selected NodeView prop.
- Image nodes now dispatch `NodeSelection` directly before focusing the editor.
- Image nodes now capture pointer, mouse, and click activation before the editor body handles the event.
- The toolbar `이미지 편집 열기` button now opens the detailed editor during the pointer press path before ProseMirror can swallow the later click.
- The edit control now shows a visible `편집` label and dispatches the open request to the editor root.
- The detailed image editor modal is now rendered by `RichTextEditorV2` instead of relying on NodeView-local state, so it survives image NodeView remounts.
- The resize handle also starts dragging from the same captured control path.
- Selected images continue to show the object toolbar and resize handle.
- Double-clicking an image object now opens the `이미지 편집` dialog directly.
- Keyboard activation on the image object can also open the detailed image editor.
- Clicking outside the selected image returns to normal text editing mode.

## Checks

- `pnpm exec vitest run src/__tests__/news-rich-content-links.test.tsx -t "selects image objects"`: initially exposed a ProseMirror mouse-down handling error in jsdom, then PASS after the NodeView captured the event.
- `pnpm exec vitest run src/__tests__/news-rich-content-links.test.tsx -t "image|pointer down|normal text editing mode"`: PASS, 13 tests passed.
- `pnpm exec vitest run src/__tests__/news-rich-content-links.test.tsx -t "as soon as the toolbar edit button is pressed"`: FAIL before the toolbar pointer-press fix, then PASS.
- `pnpm exec vitest run src/__tests__/news-rich-content-links.test.tsx -t "image editor|toolbar edit|image objects|pointer down|normal text editing mode"`: PASS, 8 tests passed.
- `pnpm exec vitest run src/__tests__/news-rich-content-links.test.tsx -t "toolbar edit|as soon as the toolbar edit button|image editor|image objects|pointer down"`: PASS, 7 tests passed.
- `pnpm exec vitest run src/__tests__/news-rich-content-links.test.tsx src/__tests__/news-admin-controls.test.tsx`: PASS, 112 tests passed. jsdom printed the existing `Window.scrollTo()` not implemented warning.
- `pnpm lint`: PASS.
- `pnpm exec vitest run src/__tests__/portal-shell.test.tsx -t "changes the logged-in user's password"`: PASS after one full-suite run hit the known unrelated portal-shell timing miss.
- `pnpm test`: PASS on rerun, 73 files and 463 tests passed. A first full run had one unrelated `portal-shell` password-change test miss its success text, but the focused test passed immediately and the full suite passed on rerun. jsdom printed existing `Window.scrollTo()` not implemented warnings.
- `pnpm build`: PASS.

## Risks Or Follow-up

- This keeps edits as image-node presentation metadata. It still does not rasterize a new edited bitmap.

---
# Verification - Rich Image Editor Layer Fix

## Implemented Fix

- Identified the likely real-browser cause: the image editor dialog opened at `z-50`, below the free-board create/edit overlay layers (`z-[120]` and `z-[130]`), so it could be hidden behind the writing modal.
- Raised rich editor internal portal layers for image editor and link dialog to `z-[220]`.
- Added regression coverage that the toolbar edit button opens the image editor dialog with the higher layer class.

## Checks

- `pnpm exec vitest run src/__tests__/news-rich-content-links.test.tsx -t "full pointer click sequence"`: FAIL before implementation because the dialog still had `z-50`.
- `pnpm exec vitest run src/__tests__/news-rich-content-links.test.tsx -t "full pointer click sequence"`: PASS after implementation.
- `pnpm exec vitest run src/__tests__/news-rich-content-links.test.tsx -t "image editor|toolbar edit|two-column gallery|image objects"`: PASS, 9 tests passed.
- `pnpm exec vitest run src/__tests__/news-rich-content-links.test.tsx src/__tests__/news-admin-controls.test.tsx`: PASS, 113 tests passed. jsdom printed the existing `Window.scrollTo()` not implemented warning.
- `pnpm lint`: PASS.
- `pnpm test`: PASS, 73 files and 464 tests passed. jsdom printed existing `Window.scrollTo()` not implemented warnings.
- `pnpm build`: PASS.

## Browser Checks

- Existing dev server detected on `http://localhost:3000`.
- Browser automation package was not available in this repo, so the visible click path was covered by component tests and build/lint/full test verification.

## Risks Or Follow-up

- If the running dev page still shows the old behavior after this change, hard refresh or restart the Next dev server because stale `.next` dev chunks can retain prior `z-50` output.

---

## Implemented Feature

- Added `CommentReaction` storage for emoji reactions on `CoopNewsComment` and `FreeComment`.
- Added `/api/news/comment-reactions` to create, cancel, or replace a user's reaction on a comment or reply.
- Added reaction summaries to loaded comment data.
- Added a shared reaction bar and emoji picker to notice/news comments, free-board comments, and development-log comments.
- Kept author labels, comment text, reply behavior, and permission rules unchanged.

## Changed Files

- `src/components/news/free-board.tsx`
- `src/components/news/news-client.tsx`
- `src/components/news/development-log.tsx`
- `src/components/news/comment-reaction-bar.tsx`
- `src/app/api/news/comment-reactions/route.ts`
- `src/lib/news/comment-reactions.ts`
- `src/lib/news/types.ts`
- `src/app/news/page.tsx`
- `src/app/api/news/route.ts`
- `src/app/api/news/free/route.ts`
- `src/app/api/news/comments/route.ts`
- `prisma/schema.prisma`
- `prisma/migrations/20260625192000_add_comment_reactions/migration.sql`
- `src/__tests__/news-admin-controls.test.tsx`
- `src/__tests__/news-development-log-component.test.tsx`
- `src/__tests__/comment-reactions-api.test.ts`

## Checks

- `pnpm vitest run src/__tests__/comment-reactions-api.test.ts`: FAIL before route creation, then PASS after API implementation.
- `pnpm vitest run src/__tests__/news-admin-controls.test.tsx -t "emoji reactions"`: FAIL before UI implementation, then PASS after reaction bar integration.
- `pnpm vitest run src/__tests__/news-development-log-component.test.tsx -t "emoji reactions"`: FAIL before UI implementation, then PASS after development-log integration.
- `pnpm prisma generate`: PASS.
- `pnpm prisma validate`: PASS.
- `pnpm lint`: PASS.
- `pnpm build`: PASS.
- `pnpm test`: PASS on rerun, 73 files and 442 tests. A first full run had one unrelated `portal-shell` password-change test miss its success text, but the focused test passed immediately and the full suite passed on rerun. jsdom printed pre-existing `window.scrollTo` not implemented warnings.

## Browser Checks

- Local dev server check: port 3000 is already in use, so the site appears to be running at `http://localhost:3000`.
- Automated browser screenshot verification was not completed in this environment; behavior is covered by Testing Library DOM tests for the reaction bar and picker entry points.

## Risks Or Follow-up

- Manual visual confirmation in a real browser is useful before deployment if automated browser verification is unavailable.

---

# Verification - Rich Image Object Editor

## Implemented Feature

- Replaced the dense selected-image node control bar with object-style image selection.
- Selected images now show a visible object frame, compact `이미지 빠른 도구` toolbar, and a direct resize handle.
- Removed immediate node-local slider/crop/rotation controls from the selected image surface.
- Added a separate `이미지 편집` modal with pixel width/height inputs, zoom, fit, crop position, rotation, cancel, and apply controls.
- Extended image metadata/rendering to preserve `data-pixel-width` and `data-pixel-height` through the editor and sanitizer.
- Updated the governing request summary, spec selection, V2 design spec, and implementation plan to describe the Naver-mail-style image editing model.

## Checks

- `pnpm exec vitest run src/__tests__/news-rich-content-links.test.tsx -t "object toolbar|object resize|normal text editing mode"`: FAIL before implementation for the expected reason; the editor still exposed `이미지 편집 노드`, `이미지 노드 크기`, crop preset buttons, and a rotation handle.
- `pnpm exec vitest run src/__tests__/news-rich-content-links.test.tsx -t "object toolbar|object resize|normal text editing mode"`: PASS after implementation, 3 tests passed.
- `pnpm exec vitest run src/__tests__/news-rich-content-links.test.tsx`: PASS, 21 tests passed.
- `pnpm exec vitest run src/__tests__/news-admin-controls.test.tsx -t "pasted|붙여넣기|rich text editor|본문 이미지"`: PASS, 1 test passed.
- `pnpm exec vitest run src/__tests__/news-rich-content-links.test.tsx src/__tests__/news-admin-controls.test.tsx`: PASS, 104 tests passed.
- `pnpm lint`: PASS.
- `pnpm test`: PASS, 73 files and 455 tests passed. jsdom printed existing `Window.scrollTo()` not implemented warnings.
- `pnpm build`: PASS.

## Browser Checks

- Existing dev server responded at `http://localhost:3000/news` with HTTP 200.
- Chrome headless desktop viewport 1440x1100: `/news` rendered, screenshot saved to `_workspace/news-image-object-editor-desktop.png`.
- Chrome headless mobile viewport 390x1200: `/news` rendered, screenshot saved to `_workspace/news-image-object-editor-mobile.png`.
- The rich editor itself remains login/admin gated in the live app; component and admin-flow tests cover the selected image object toolbar and separate editor modal.

## Risks Or Follow-up

- The separate image editor currently stores presentation metadata on the image node. It does not rasterize and upload a newly edited bitmap. A future slice can add canvas-based bitmap export if true destructive image editing is required.
- The public mobile `/news` screenshot still shows the existing wide card/header content outside this editor-specific change. No public layout code was changed in this follow-up.

---

# Verification - Rich Image Gallery

## Implemented Feature

- Added multi-image rich body gallery support to `src/components/news/notice-rich-editor.tsx`.
- Added `2열` and `대표+2열` template controls next to the image insertion action.
- Kept single-image insertion as a standalone resizable image.
- Added sanitizer support so only trusted uploaded/storage image sources survive inside `data-notice-gallery` blocks.
- Added focused regression coverage in `src/__tests__/news-rich-content-links.test.tsx`.
- Added current feature spec and plan under `docs/superpowers/specs/2026-06-27-news-rich-image-gallery-design.md` and `docs/superpowers/plans/2026-06-27-news-rich-image-gallery.md`.

## Checks

- `pnpm exec vitest run src/__tests__/news-rich-content-links.test.tsx`: PASS, 12 tests passed.
- `pnpm lint`: PASS.
- `pnpm test`: PASS, 73 files and 446 tests passed. jsdom printed existing `Window.scrollTo()` not implemented warnings.
- `pnpm build`: PASS.

## Browser Checks

- Dev server: `http://127.0.0.1:3002`.
- `/news?tab=free` desktop Chrome headless 1343px viewport: loaded news surface, `overflowX=false`, screenshot saved to `_workspace/news-gallery-desktop.png`.
- `/news?tab=free` mobile Chrome headless 478px viewport: loaded news surface, `overflowX=false`, screenshot saved to `_workspace/news-gallery-mobile.png`.
- Codex in-app browser MCP connection failed with a session metadata error, so local Chrome CDP was used as fallback.
- The rich editor controls are login-gated and were not visible in the unauthenticated browser check; focused component tests cover the editor controls and multi-image insertion behavior.

## Risks Or Follow-up

- none

---

# Verification - Rich Editor External Value Sync Flush Fix

## Implemented Fix

- Moved external `value` synchronization out of the React effect call stack by scheduling `editor.commands.setContent(...)` with a cancellable timer.
- Added empty-document equivalence so Tiptap's `<p></p>` placeholder does not schedule a stale reset over newly uploaded images.
- Added regression coverage proving external HTML updates are applied asynchronously instead of during the effect.

## Checks

- `pnpm exec vitest run src/__tests__/news-rich-content-links.test.tsx src/__tests__/news-admin-controls.test.tsx`: PASS, 105 tests passed. jsdom printed the existing `Window.scrollTo()` not implemented warning.
- `pnpm lint`: PASS.
- `pnpm test`: PASS, 73 files and 456 tests passed. jsdom printed existing `Window.scrollTo()` not implemented warnings.
- `pnpm build`: PASS.

---

# Verification - Rich Editor Image NodeView Follow-up

## Implemented Feature

- Removed the legacy full-width selected-image editing bar from the V2 rich editor.
- Added a Tiptap React NodeView for body images so selected images show controls directly on the image node.
- Added node-attached resize and rotation handles, plus local size, align, fit, crop focus, rotation, and delete controls.
- Preserved normal text editing by deselecting the image node when the editor body is clicked.
- Normalized existing `<p><img /></p>` stored body HTML before loading it into the editor so prior image content still opens as editable image nodes.

## Checks

- `pnpm exec vitest run src/__tests__/news-rich-content-links.test.tsx`: PASS, 21 tests passed.
- `pnpm exec vitest run src/__tests__/news-admin-controls.test.tsx`: PASS, 83 tests passed.
- `pnpm exec vitest run src/__tests__/news-rich-content-links.test.tsx src/__tests__/news-admin-controls.test.tsx`: PASS, 104 tests passed.
- `pnpm lint`: PASS.
- `pnpm test`: PASS, 73 files and 455 tests passed. jsdom printed existing `Window.scrollTo()` not implemented warnings.
- `pnpm build`: PASS.

## Browser Checks

- Existing dev server responded at `http://localhost:3000/news` with HTTP 200.
- Chrome headless desktop viewport 1440x1100: `/news` rendered, screenshot saved to `_workspace/news-image-nodeview-desktop.png`.
- Chrome headless mobile viewport 390x1200: `/news` rendered, screenshot saved to `_workspace/news-image-nodeview-mobile.png`.
- Codex in-app browser and `node_repl` browser automation were unavailable due MCP sandbox metadata errors. The editor surface is login/admin gated, so the image NodeView behavior is verified by component and admin-flow tests.

## Risks Or Follow-up

- The public mobile `/news` screenshot still shows existing wide card/header content outside this editor-specific change. No public layout code was changed in this follow-up.

---

# Verification - Professional Rich Editor V2

## Implemented Feature

- Replaced the legacy handmade rich editor entry point with a Tiptap-based V2 editor.
- Added professional text controls for font family, font size, bold, underline, strike, text color, highlight, alignment, lists, indentation, and line height.
- Preserved and expanded link editing, including clicked-link edit mode and internal `/news?...` link normalization.
- Kept image insertion default as normal body images while preserving explicit `2열` and `대표+2열` image-only templates.
- Added selected-image controls for size, original-ratio/cover fit, crop focus, rotation, and direct resize/rotation handles.
- Expanded sanitizer support for safe paragraph/span formatting and image metadata.

## Checks

- `pnpm exec vitest run src/__tests__/news-rich-content-links.test.tsx`: PASS, 21 tests passed.
- `pnpm exec vitest run src/__tests__/news-admin-controls.test.tsx`: PASS, 83 tests passed.
- `pnpm lint`: PASS.
- `pnpm test`: PASS, 73 files and 455 tests passed. jsdom printed existing `Window.scrollTo()` not implemented warnings.
- `pnpm build`: PASS.

## Browser Checks

- Existing dev server: `http://localhost:3000`.
- `/news` desktop Chrome headless 1440px viewport: loaded news surface, screenshot saved to `_workspace/news-rich-editor-v2-desktop.png`.
- `/news` mobile Chrome headless 390px viewport: loaded news surface, screenshot saved to `_workspace/news-rich-editor-v2-mobile.png`.
- Codex in-app browser MCP connection failed with a session metadata error, so local Chrome headless screenshots were used as fallback.
- The rich editor controls are permission-gated in the app; focused component and admin-flow tests cover the actual editor toolbar, image paste/insert, link editing, selected-image controls, and submit flows.

## Risks Or Follow-up

- none

---

# Verification - Rich Image Editor Text Input Fix

## Implemented Fix

- Fixed the selected-image state so clicking the editor body after selecting an image exits image editing mode and returns to normal text editing.
- Added regression coverage proving the rich body editor remains writable after image controls are shown.

## Checks

- `pnpm exec vitest run src/__tests__/news-rich-content-links.test.tsx`: PASS, 18 tests passed.
- `pnpm lint`: PASS.
- `pnpm test`: PASS, 73 files and 452 tests passed. jsdom printed existing `Window.scrollTo()` not implemented warnings.
- `pnpm build`: PASS.

## Browser Checks

- Restarted dev server: `http://localhost:3000`.
- `/news?tab=free` desktop Chrome headless 1365px viewport: `overflowX=false`, screenshot saved to `_workspace/news-input-fix-desktop.png`.
- `/news?tab=free` mobile Chrome headless 390px viewport: `overflowX=false`, screenshot saved to `_workspace/news-input-fix-mobile.png`.

---

# Verification - Rich Image Gallery Text Column Fix

## Implemented Fix

- Made inserted two-column and featured image gallery blocks non-editable inside the rich editor.
- Preserved `2열` as an image-only layout so body text typed afterward stays in normal one-column paragraphs.
- Added regression coverage proving text after a two-column gallery is outside the gallery block.

## Checks

- `pnpm exec vitest run src/__tests__/news-rich-content-links.test.tsx`: PASS, 19 tests passed.
- `pnpm lint`: PASS.
- `pnpm test`: PASS, 73 files and 453 tests passed. jsdom printed existing `Window.scrollTo()` not implemented warnings.
- `pnpm build`: PASS.

## Browser Checks

- Restarted dev server: `http://localhost:3000`.
- `/news?tab=free` desktop Chrome headless 1365px viewport: `overflowX=false`, screenshot saved to `_workspace/news-text-column-fix-desktop.png`.
- `/news?tab=free` mobile Chrome headless 390px viewport: `overflowX=false`, screenshot saved to `_workspace/news-text-column-fix-mobile.png`.

---

# Verification - Rich Image Gallery Editing Follow-up

## Implemented Feature

- Changed image insertion default to `본문 이미지`, so multiple selected images are inserted as normal body images unless `2열` or `대표+2열` is explicitly selected.
- Changed gallery image defaults to `data-fit="contain"` and `object-fit:contain`, preserving original aspect ratio instead of cropping by default.
- Added sanitized image presentation metadata: `data-fit`, `data-crop-x`, `data-crop-y`, and `data-rotate`.
- Expanded the selected image editing panel with size, fit (`원본비율` / `채우기`), crop focus presets, and right-rotation controls.
- Added accessible selected-image drag handles for direct resize and rotation.
- Updated the feature spec and plan to include inline image mode, selected image editing controls, and direct handles.

## Checks

- `pnpm exec vitest run src/__tests__/news-rich-content-links.test.tsx`: PASS, 16 tests passed.
- `pnpm lint`: PASS.
- `pnpm test`: PASS, 73 files and 450 tests passed. jsdom printed existing `Window.scrollTo()` not implemented warnings.
- `pnpm build`: PASS. The first attempt timed out while the dev server was running; after stopping the dev server, the production build completed successfully.

## Browser Checks

- Restarted dev server: `http://localhost:3000`.
- `/news?tab=free` desktop Chrome headless 1365px viewport: loaded news surface, `overflowX=false`, screenshot saved to `_workspace/news-gallery-handle-desktop.png`.
- `/news?tab=free` mobile Chrome headless 390px viewport: loaded news surface, `overflowX=false`, screenshot saved to `_workspace/news-gallery-handle-mobile.png`.
- The rich editor controls remain login-gated and were not visible in the unauthenticated browser check; focused component tests cover the editor controls and selected-image updates.

## Risks Or Follow-up

- none
# Verification - Free Board Wide Editor

## Implemented Feature

- Replaced the narrow free-board create/edit right drawer with a wide responsive editing dialog.
- Added a desktop two-column workspace: `게시글 설정` for author/type/date/attachment/admin toggles and `게시글 본문 편집 영역` for title plus rich body editor.
- Kept existing submit behavior, attachment upload behavior, rich editor props, and PATCH payload behavior unchanged.
- Added focused regression coverage for the wide editing workspace.

## Changed Files

- `src/components/news/free-board.tsx`
- `src/__tests__/news-admin-controls.test.tsx`
- `docs/superpowers/specs/2026-06-28-free-board-wide-editor-design.md`
- `docs/superpowers/plans/2026-06-28-free-board-wide-editor.md`
- `_workspace/00_input/request-summary.md`
- `_workspace/01_scope/spec-selection.md`
- `_workspace/04_review/ui-review.md`
- `_workspace/final/verification.md`

## Checks

- `pnpm exec vitest run src/__tests__/news-admin-controls.test.tsx -t "wide editing workspace"`: FAIL before implementation because the UI still exposed the old narrow `게시글 수정 드로어`.
- `pnpm exec vitest run src/__tests__/news-admin-controls.test.tsx -t "wide editing workspace|allows post editing|shows free-board attachments"`: PASS, 3 tests passed.
- `pnpm exec vitest run src/__tests__/news-admin-controls.test.tsx`: PASS, 84 tests passed. jsdom printed the existing `Window.scrollTo()` not implemented warning.
- `pnpm lint`: PASS.
- `pnpm test`: PASS, 73 files and 457 tests passed. jsdom printed existing `Window.scrollTo()` not implemented warnings.
- `pnpm build`: PASS.

## Browser Checks

- Existing dev server detected on `http://localhost:3000`.
- Chrome headless desktop viewport 1440x1100 captured `/news?tab=free` to `_workspace/free-board-wide-editor-news-desktop.png`.
- Chrome headless mobile viewport 390x1200 captured `/news?tab=free` to `_workspace/free-board-wide-editor-news-mobile.png`.
- The wide editing dialog remains login/session gated in the running app; its visible structure is covered by the focused component test.

## Risks Or Follow-up

- none

---
# Verification - Content Empathy Label Follow-up

## Implemented Feature

- Renamed the user-facing common content reaction from `좋아요` to `공감`.
- Changed notice/free-board/development-log/document/disclosure list column headers to `공감`.
- Changed the shared button display to `👍 공감 N` before selection and `🧡 공감 N` after selection.
- Updated accessible button labels, tooltips, and API/client error copy to use `공감`.
- Kept the existing single `ContentReaction` storage/API model unchanged.
- Kept multi-emoji post/document reactions out of scope for this slice.

## Changed Files

- `src/components/content-like-button.tsx`
- `src/app/api/content-reactions/route.ts`
- `src/components/news/notice-board.tsx`
- `src/components/news/free-board.tsx`
- `src/components/news/development-log.tsx`
- `src/components/news/comment-reaction-bar.tsx`
- `src/components/portal/document-table.tsx`
- `src/components/disclosure/meetings-table.tsx`
- `src/__tests__/content-view-counts.test.tsx`
- `src/__tests__/news-admin-controls.test.tsx`
- `docs/superpowers/plans/2026-07-06-content-empathy-label.md`
- `_workspace/00_input/request-summary.md`
- `_workspace/01_scope/spec-selection.md`
- `_workspace/04_review/ui-review.md`

## Checks

- `pnpm vitest run src/__tests__/content-view-counts.test.tsx`: FAIL before implementation because headers and accessible names still used `좋아요`.
- `pnpm vitest run src/__tests__/content-view-counts.test.tsx`: PASS after implementation, 9 tests passed.
- `pnpm vitest run src/__tests__/content-view-counts.test.tsx src/__tests__/news-admin-controls.test.tsx`: PASS, 111 tests passed. jsdom printed the existing `Window.scrollTo()` not implemented warning.
- `pnpm lint`: PASS.
- `pnpm test`: PASS, 87 files and 581 tests passed. jsdom printed existing `Window.scrollTo()` not implemented warnings.
- `pnpm build`: PASS.

## Browser Checks

- Existing dev server checked on `http://localhost:3000`.
- `http://localhost:3000/news`: HTTP 200.
- `http://localhost:3000/disclosure`: HTTP 200.

## Risks Or Follow-up

- A three-choice post/document reaction system would require a separate data/API/UI change and was intentionally not included here.

---
# Verification - Rich Image Editor Duplicate Image Fix

## Implemented Fix

- Moved the full-screen image edit dialog out of the Tiptap `NodeViewWrapper` and into `document.body` via React portal.
- Prevented image editor chrome, labels, and preview images from becoming part of the editable ProseMirror document DOM.
- Added regression coverage proving the editor body does not contain the image edit dialog while editing and that applying image edits still saves a single image node.

## Checks

- `pnpm exec vitest run src/__tests__/news-rich-content-links.test.tsx -t "keeps image editor controls out"`: FAIL before implementation because the editor body contained the image edit dialog and labels.
- `pnpm exec vitest run src/__tests__/news-rich-content-links.test.tsx -t "keeps image editor controls out"`: PASS after implementation.
- `pnpm exec vitest run src/__tests__/news-rich-content-links.test.tsx`: PASS, 23 tests passed.
- `pnpm exec vitest run src/__tests__/news-rich-content-links.test.tsx src/__tests__/news-admin-controls.test.tsx`: PASS, 107 tests passed. jsdom printed the existing `Window.scrollTo()` not implemented warning.
- `pnpm lint`: PASS.
- `pnpm test`: PASS, 73 files and 458 tests passed. jsdom printed existing `Window.scrollTo()` not implemented warnings.
- `pnpm build`: PASS.

## Risks Or Follow-up

- none

---
