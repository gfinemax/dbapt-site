# Verification

## Verification Addendum: Disclosure Card Guide Removal And Spacing Tightening

## Implemented Change

- Removed the visible `읽기 가이드` inner panel from disclosure cards.
- Reduced non-meeting disclosure card padding from `p-6` to `p-5`.
- Tightened the title/description spacing and reduced the gap between the description and registered/empty document area.
- Reduced registered/empty document box padding and list item spacing while preserving upload status, document previews, and `자료실 열기` actions.

## Checks Run

- Focused test: `pnpm test -- src/__tests__/disclosure-page.test.tsx src/__tests__/document-upload-form.test.tsx` passed, 2 files and 4 tests. The test runner emitted existing jsdom `window.scrollTo` not-implemented warnings after tab clicks.
- `pnpm lint` passed with one existing warning in `src/components/portal/document-table.tsx` for unused `handleDownload`.
- `pnpm build` passed.

## Browser Checks

- Used the existing local dev server at `http://127.0.0.1:3000`; no new dev server was started.
- Connected Chrome desktop check for `/disclosure` confirmed `읽기 가이드` is no longer rendered in `section-rules`.
- Browser check confirmed visible rules cards use compact `p-5` padding and the registered document area starts at `mt-4 pt-3`.
- Desktop check reported no horizontal overflow.

## Unresolved Risks Or Follow-Up Specs

- Existing unrelated full-suite seed mismatch remains in `src/__tests__/portal-auth-flow.test.tsx:101` from earlier verification.

---

## Verification Addendum: Folder-Style Registration For Public Disclosure Cards

## Implemented Change

- Extended the existing protected document folder table beyond the meeting folders so public disclosure cards can open the same drawer experience.
- `운영관리규정`, `회계관리규정`, `선거관리규정`, `조합원 연명부`, and other non-meeting disclosure cards now use `자료실 열기` to open a folder table instead of only routing to the generic portal drawer.
- Admin users can use `+ 신규 문서 등록` inside that drawer, and the upload form defaults `문서함 세부 분류` to the opened card's category.
- Expanded the document folder category type and badge handling so the shared table supports 규약/규정/연명부/사업·감리 subcategories.
- Added explicit upload subcategories for accounting and business/supervision cards, including `외부회계감사`, `내부감사`, `자금운용계획`, `에스크로 명세서`, `용역 계약서`, `공사진행/토지`, `추진실적`, and `감리 보고서`.
- Added a regression test for opening `운영관리규정 문서함` and confirming the upload form defaults to `운영관리규정`.

## Checks Run

- Focused test: `pnpm test -- src/__tests__/disclosure-page.test.tsx src/__tests__/document-upload-form.test.tsx` passed, 2 files and 4 tests. The test runner emitted existing jsdom `window.scrollTo` not-implemented warnings after tab clicks.
- `pnpm lint` passed with one existing warning in `src/components/portal/document-table.tsx` for unused `handleDownload`.
- `pnpm build` passed.
- After adding accounting and business/supervision subcategories, the same focused test, lint, and build checks were rerun and passed with the same existing lint warning and jsdom warnings.
- `pnpm test` failed only in the existing DB seed verification at `src/__tests__/portal-auth-flow.test.tsx:101`; the fixture no longer includes a pending document where the test expects one. Other 80 tests passed.

## Browser Checks

- Used the existing local dev server at `http://127.0.0.1:3000`; no new dev server was started.
- Connected Chrome desktop check for `/disclosure` confirmed the session is admin, `운영관리규정` is visible, `자료실 열기` is visible, and there is no horizontal overflow.
- Browser click automation was limited by the connected browser adapter selecting duplicate/off-screen DOM and not exposing reliable event dispatch for this page. The actual drawer/open/register flow is covered by the focused component test.

## Unresolved Risks Or Follow-Up Specs

- Existing full-suite seed mismatch remains in `src/__tests__/portal-auth-flow.test.tsx:101`.

---

## Verification Addendum: Regulation Cards And Upload Categories

## Implemented Change

- Added regulation cards under `1. 규약 및 연명부`:
  - `운영관리규정`
  - `회계관리규정`
  - `선거관리규정`
  - `기타 내부 운영규정`
- Added `읽기 가이드` chips to the 규약/규정/연명부 cards so long documents are easier to scan.
- Added regulation submenus under `1. 규약 및 연명부`.
- Added matching admin upload subcategories to `DocumentUploadForm`, including `정관 및 조합규약`, `운영관리규정`, `회계관리규정`, `선거관리규정`, `기타 내부 운영규정`, and `조합원 연명부`.
- Expanded primary document file input from PDF-only to `.pdf,.hwp,.hwpx,.doc,.docx`.
- Connected non-meeting disclosure cards to real uploaded documents by `subCategory`. Logged-in users now see uploaded document previews, latest date, and `문서 보기` actions per card; empty cards explain which admin subcategory to use for upload.
- Added regression tests for regulation card previews and upload form options.

## Checks Run

- Red test: `pnpm test -- src/__tests__/disclosure-page.test.tsx` failed before implementation because `운영관리규정` was not rendered under `규약 및 연명부`.
- Red test: `pnpm test -- src/__tests__/document-upload-form.test.tsx` failed before implementation because regulation subcategories and non-PDF accept formats were missing.
- Focused tests after implementation:
  - `pnpm test -- src/__tests__/disclosure-page.test.tsx` passed, 1 file and 2 tests. The test runner emitted existing jsdom `window.scrollTo` not-implemented warnings after tab clicks.
  - `pnpm test -- src/__tests__/document-upload-form.test.tsx` passed, 1 file and 1 test.
  - Final focused run `pnpm test -- src/__tests__/disclosure-page.test.tsx src/__tests__/document-upload-form.test.tsx` passed, 2 files and 3 tests. The same existing jsdom `window.scrollTo` warnings were emitted.
- Required validation:
  - `pnpm lint` passed with one existing warning in `src/components/portal/document-table.tsx` for unused `handleDownload`.
  - `pnpm test` failed only in the existing DB seed verification at `src/__tests__/portal-auth-flow.test.tsx:88`; current database has 2 documents and the test expects at least 3. Other test files, including the new disclosure/upload tests, passed.
  - `pnpm build` passed.

## Browser Checks

- Used the existing local dev server at `http://127.0.0.1:3000`; no new dev server was started.
- Local `/disclosure` check confirmed `운영관리규정`, `회계관리규정`, `선거관리규정`, `기타 운영규정`, `읽기 가이드`, and the updated section subtitle are present.
- Connected Chrome desktop check for `/disclosure` confirmed `section-rules` renders the new regulation cards, read guide text, and public lock/upload status.
- Desktop check reported no horizontal overflow at viewport `1828x1263`.
- Admin upload form subcategory and file-format support were verified by the focused component test. The browser admin upload screen was not checked because the current browser session was not authenticated as an admin.
- Mobile viewport resizing was not exposed by the connected browser backend in this session, and the project does not have Playwright CLI installed for an alternate mobile visual run. Mobile visual verification remains limited to the responsive component structure and focused tests.

## Unresolved Risks Or Follow-Up Specs

- Existing full-suite seed mismatch remains from earlier verification: current DB document count is lower than `src/__tests__/portal-auth-flow.test.tsx:88` expects.

---

# Verification

## Verification Addendum: Disclosure Agreement Category Move

## Implemented Change

- Moved `공동사업주체 시공예정사 간의 업무협약서` from `1. 규약 및 연명부` to `4. 사업 및 감리`.
- Removed the `시공자 협약서` submenu from the `규약 및 연명부` tab.
- Added the `시공자 협약서` submenu to the `사업 및 감리` tab.
- Updated the `규약 및 연명부` section subtitle so it no longer says the section contains 시공 협약 documents.
- Added a Disclosure page regression test for the category placement.

## Checks Run

- Red test: `pnpm test -- src/__tests__/disclosure-page.test.tsx` failed before implementation because the agreement still appeared in `section-rules`.
- Focused test after implementation: `pnpm test -- src/__tests__/disclosure-page.test.tsx` passed, 1 file and 1 test. The test runner emitted an existing jsdom `window.scrollTo` not-implemented warning after the tab click.

## Browser Checks

- Used the existing local dev server at `http://127.0.0.1:3000`; no new dev server was started.
- Local SSR check for `/disclosure` confirmed `규약 및 연명부` subtitle no longer mentions 시공 협약 documents and the agreement card appears later in `사업 및 감리`.
- Connected Chrome desktop check for `/disclosure` confirmed `section-rules` does not contain `공동사업주체 시공예정사 간의 업무협약서`, while `section-operations` does contain it.
- Desktop check reported no horizontal overflow.
- The connected browser extension exposed duplicate off-screen nav buttons and did not provide a reliable click-state check for the `4. 사업 및 감리` submenu. The focused component test verified that clicking the `4. 사업 및 감리` tab exposes `시공자 협약서`.

## Unresolved Risks Or Follow-Up Specs

- Existing full-suite seed mismatch remains from earlier verification: current DB document count is lower than `src/__tests__/portal-auth-flow.test.tsx:88` expects.

---

# Verification

## Verification Addendum: Premium Unit Plan Text Detail Removal

## Implemented Change

- Changed the premium unit-plan description from `59㎡A, 59㎡B, 74㎡A, 84㎡` to `48㎡A, 59㎡, 74㎡, 84㎡`.
- Kept the four premium floor-plan images in the single-column gallery.
- Removed the visible text blocks below each premium image card:
  - type label such as `확장형`
  - card title such as `59㎡A`
  - household badge such as `78세대`
  - area definition list such as `전용면적`, `공급면적`, and `계약면적`
- Updated the Business page regression test to verify the new copy and absence of the former detail list/content.

## Checks Run

- Red test: `pnpm test -- src/__tests__/business-page.test.tsx` failed before implementation because the new `48㎡A, 59㎡, 74㎡, 84㎡` copy was not rendered.
- Focused test after implementation: `pnpm test -- src/__tests__/business-page.test.tsx` passed, 1 file and 3 tests.

## Browser Checks

- Used the existing local dev server at `http://127.0.0.1:3000`; no new dev server was started.
- Local SSR check for `/business` included the new `48㎡A, 59㎡, 74㎡, 84㎡` description.
- Connected Chrome desktop check for `http://127.0.0.1:3000/business#unit` confirmed the new description is visible.
- Desktop check confirmed 4 premium image cards remain, `premium-unit-gallery` contains no `dl` detail list, and the former visible details `78세대`, `59.99㎡`, `84.17㎡`, and `세대수 별도 표기 없음` are absent from page text.
- Desktop check reported no horizontal overflow. The two lower images remained lazy-load pending in the connected browser check, but their image elements and alt texts remained present in the gallery.

## Unresolved Risks Or Follow-Up Specs

- Existing full-suite seed mismatch remains from earlier verification: current DB document count is lower than `src/__tests__/portal-auth-flow.test.tsx:88` expects.

---

# Verification

## Verification Addendum: About Organization Chart Hierarchy

## Implemented Change

- Reordered the organization chart governance row to render as:
  - `이사회`
  - `조합장`
  - `감사`
- Changed the lower organization chart group from two side-by-side cards to a vertical stack:
  - `사무국`
  - `전문 협력사`
- Simplified the desktop connector line from the governance row to the secretariat stack.
- Added regression assertions for the governance row order and secretariat/support stack order.
- Updated the harness request, scope, and UI review notes for the public `조합소개 > 조직 및 협력사` change.

## Checks Run

- Red test: `pnpm test -- src/__tests__/about-client.test.tsx` failed before implementation because `organization-governance-row` did not exist.
- Focused test after implementation: `pnpm test -- src/__tests__/about-client.test.tsx` passed, 1 file and 1 test.
- `pnpm lint`: passed with one existing warning in `src/components/portal/document-table.tsx` for unused `handleDownload`.
- `pnpm test`: failed in existing DB seed verification at `src/__tests__/portal-auth-flow.test.tsx:88`; current database has 2 documents and the test expects at least 3. Other 76 tests passed.
- `pnpm build`: passed.

## Browser Checks

- Used the existing local dev server at `http://127.0.0.1:3000`; no new dev server was started.
- Connected Chrome desktop check for `http://127.0.0.1:3000/about#section-organization` confirmed the visible chart governance row is `이사회`, `조합장`, `감사`.
- Desktop check confirmed the visible secretariat stack is `사무국`, then `전문 협력사`, with `전문 협력사` below `사무국` and no horizontal overflow.
- Mobile viewport resizing was not exposed by the connected browser backend in this session, so mobile visual verification remains limited to the responsive component structure and focused tests.

## Unresolved Risks Or Follow-Up Specs

- Existing full-suite seed mismatch still needs separate cleanup: current DB document count is lower than `src/__tests__/portal-auth-flow.test.tsx:88` expects.

---

# Verification

## Verification Addendum: Premium Unit Plan Image Gallery

## Implemented Change

- Changed the premium unit gallery from a two-column desktop grid to a forced single-column sequence so each 평형 card appears one at a time.
- Added a regression assertion that `premium-unit-gallery` uses `grid-cols-1` and does not use `lg:grid-cols-2`.
- Copied the four downloaded premium unit-plan images into `public/assets/business/units/`:
  - `unit-59a-premium.png`
  - `unit-59b-premium.png`
  - `unit-74a-premium.png`
  - `unit-84-premium.png`
- Added a `사업현황 > 세대계획` premium unit gallery for:
  - `59㎡A` / `78세대`
  - `59㎡B` / `18세대`
  - `74㎡A` / `33세대`
  - `84㎡` / `세대수 별도 표기 없음`
- Reflected the visible area breakdowns from each image.
- Kept the existing 분양주택/공공주택 세대계획 tables unchanged.
- Updated the Business page regression test for all four unit image alt texts and the single-column gallery layout.

## Checks Run

- Red layout test: `pnpm test -- src/__tests__/business-page.test.tsx` failed before implementation because `premium-unit-gallery` was not present and the layout was still a two-column desktop grid.
- Focused layout test after implementation: `pnpm test -- src/__tests__/business-page.test.tsx` passed, 1 file and 3 tests.
- Red test: `pnpm test -- src/__tests__/business-page.test.tsx` failed before implementation because `프리미엄 평형 정보 59㎡A 평면도` was not rendered.
- Focused test: `pnpm test -- src/__tests__/business-page.test.tsx` passed, 1 file and 3 tests.
- `pnpm lint`: passed with one existing warning in `src/components/portal/document-table.tsx` for unused `handleDownload`.
- `pnpm test`: failed in existing DB seed verification at `src/__tests__/portal-auth-flow.test.tsx:88`; current database has 2 documents and the test expects at least 3. Other 76 tests passed.
- `pnpm build`: passed.

## Browser Checks

- Used the existing local dev server at `http://127.0.0.1:3000`; no new dev server was started.
- Connected Chrome desktop check for `http://127.0.0.1:3000/business#unit` confirmed all four expected image alt texts exist.
- Desktop check confirmed the gallery class is `mt-6 grid grid-cols-1 gap-6`, has 4 cards, and no adjacent cards share the same row.
- Desktop check confirmed four `#unit` images completed loading with nonzero natural dimensions.
- Desktop check reported no horizontal overflow at viewport `1166x1259`.
- Mobile viewport resizing was not exposed by the connected browser backend in this session, so mobile visual verification remains limited to the responsive component structure and tests.

## Unresolved Risks Or Follow-Up Specs

- Existing full-suite seed mismatch still needs separate cleanup: current DB document count is lower than `src/__tests__/portal-auth-flow.test.tsx:88` expects.

---

# Verification

## Verification Addendum: Business Plan View Briefing Image Reflection

## Implemented Change

- Updated `사업현황 > 조감도·배치도` to show briefing content in a clearer sequence:
  - `변경 조감도`
  - `당초 배치도`
  - `당초 조감도`
- Added compact source summary cards for briefing pages 14, 10, and 12.
- Promoted the `당초 설계(안) 배치도` image into its own larger card.
- Updated layout notes to call out 101~105동, 등용로변 출입 체계, 근린생활시설·사회복지시설, and 공공보행통로.
- Kept the caution that images are briefing references, not confirmed renderings or final approval drawings.
- Updated the Business page regression test for the new plan-view labels and layout note.

## Checks Run

- `pnpm test -- src/__tests__/business-page.test.tsx`: passed, 1 file and 3 tests.
- `Invoke-WebRequest http://localhost:3000/business`: passed; SSR output includes `변경 조감도`, `당초 배치도`, `등용로변 출입 체계`, and `당초 설계(안) 배치도`.
- `pnpm lint`: passed with one existing warning in `src/components/portal/document-table.tsx`.
- `pnpm build`: passed.
- `pnpm test`: failed in existing DB seed verification at `src/__tests__/portal-auth-flow.test.tsx:88`; current database has 2 documents and the test expects at least 3. Other 76 tests passed.

## Browser Checks

- Automated browser visual review could not be completed because the callable in-app browser tool was not exposed in this session; local `/business` SSR output was checked instead.

## Unresolved Risks Or Follow-Up Specs

- Existing full-suite seed mismatch still needs separate cleanup: current DB document count is lower than `src/__tests__/portal-auth-flow.test.tsx:88` expects.

---

# Verification

## Verification Addendum: About Organization Chart

## Implemented Change

- Added `대방동 지역주택조합 조직도` to the `조직 및 협력사` tab.
- Matched the organization chart nodes to the partner status cards with rounded white boxes, each icon and organization title on the same centered row, colored icon badges, a 25% narrower top assembly node, narrower fixed node widths, and straight SVG branch connector lines with rounded corners while preserving the diagram hierarchy.
- Separated internal governance roles from external partner status:
  - `조합원 총회`
  - `조합장`
  - `이사회`
  - `감사`
  - `사무국`
  - `전문 협력사`
- Added a separate `협력사 현황` heading above the existing partner cards.
- Updated the former internal `조합 행정기구 및 이사회` partner card to `법무·회계 자문기관` to avoid duplicating the organization chart.
- Added an About component regression test for the organization/partner separation.

## Checks Run

- `pnpm test -- src/__tests__/about-client.test.tsx src/__tests__/site-header.test.tsx`: passed, 2 files and 6 tests.
- `pnpm test -- src/__tests__/about-client.test.tsx`: passed, 1 file and 1 test after the stronger organization-chart visual refinement.
- `pnpm test -- src/__tests__/about-client.test.tsx`: passed, 1 file and 1 test after reducing organization node right-side empty space.
- `pnpm test -- src/__tests__/about-client.test.tsx`: passed, 1 file and 1 test after replacing segmented connector divs with rounded SVG connector paths.
- `pnpm test -- src/__tests__/about-client.test.tsx`: passed, 1 file and 1 test after centering organization node contents and reducing the top assembly node width.
- `pnpm test -- src/__tests__/about-client.test.tsx`: passed, 1 file and 1 test after aligning each icon and organization title on the same row and restoring the previous div connector treatment.
- `pnpm test -- src/__tests__/about-client.test.tsx`: passed, 1 file and 1 test after replacing connector lines with straight SVG branches and rounded corners.
- `pnpm lint`: passed with one existing warning in `src/components/portal/document-table.tsx`.
- `pnpm build`: passed.
- `pnpm test`: failed in existing DB seed verification at `src/__tests__/portal-auth-flow.test.tsx:88`; current database has 2 documents and the test expects at least 3. Other 76 tests passed.
- `Invoke-WebRequest http://localhost:3000/about`: passed; SSR output includes `data-organization-chart`, `대방동 지역주택조합 조직도`, `조합원 총회`, and `전문 협력사`.

## Browser Checks

- Automated browser visual review could not be completed because the callable in-app browser tool was not exposed in this session; local `/about` SSR output was checked instead.

## Unresolved Risks Or Follow-Up Specs

- Existing full-suite seed mismatch still needs separate cleanup: current DB document count is lower than `src/__tests__/portal-auth-flow.test.tsx:88` expects.

---

# Verification

## Verification Addendum: Active Navigation Indicator Refinement

## Implemented Change

- Replaced the active desktop nav underline with a shorter centered rounded bar.
- Kept the active menu title in Ember Orange and bold weight.
- Marked the visual indicator as `aria-hidden`.
- Added a focused regression test for the compact rounded active indicator.

## Checks Run

- `pnpm test -- src/__tests__/site-header.test.tsx`: passed, 1 file and 5 tests.
- `pnpm lint`: passed with one existing warning in `src/components/portal/document-table.tsx`.
- `pnpm build`: passed.
- `pnpm test`: failed in existing DB seed verification at `src/__tests__/portal-auth-flow.test.tsx:88`; current database has 2 documents and the test expects at least 3. Other 75 tests passed.

## Browser Checks

- Automated browser visual review could not be completed because the callable in-app browser tool was not exposed in this session.

## Unresolved Risks Or Follow-Up Specs

- Existing full-suite seed mismatch still needs separate cleanup: current DB document count is lower than `src/__tests__/portal-auth-flow.test.tsx:88` expects.

---

# Verification

## Verification Addendum: Corrected Signup Name As Member Display Name

## Implemented Change

- Updated session creation so `signupName` becomes the member-facing display name when present.
- Preserved the original Google profile name in `User.name`.
- Updated the pending page to read the original Google profile name from the database and keep showing it separately when it differs from the corrected application name.

## Checks Run

- `pnpm test -- src/__tests__/portal-auth-flow.test.tsx -t "corrected signup name"`: passed, 1 test.
- `pnpm test -- src/__tests__/portal-shell.test.tsx src/__tests__/google-auth.test.ts`: passed, 2 files and 7 tests.
- `pnpm lint`: passed with one existing warning in `src/components/portal/document-table.tsx`.
- `pnpm build`: passed.
- `pnpm test`: failed in existing DB seed verification at `src/__tests__/portal-auth-flow.test.tsx:88`; current database has 2 documents and the test expects at least 3. Other 74 tests passed.

## Browser Checks

- Automated browser visual review could not be completed because the callable in-app browser tool was not exposed in this session.

## Unresolved Risks Or Follow-Up Specs

- Existing full-suite seed mismatch still needs separate cleanup: current DB document count is lower than `src/__tests__/portal-auth-flow.test.tsx:88` expects.

---

# Verification

## Verification Addendum: Admin Editable Signup Name

## Implemented Change

- Added `updateSignupNameAction` for admin-only correction of pending applicants' `signupName`.
- Added an editable `신청 이름` input and `신청 이름 저장` action to the admin pending social signup table.
- Kept the original Google profile name visible as `Google 이름` when it differs from the corrected application name.
- Updated the pending applicant page to use the corrected application name for the welcome heading and detail row, while still showing the Google-authenticated name separately when different.
- Hardened the Google OAuth route test setup so missing-credential tests no longer depend on local `.env` values.

## Checks Run

- `pnpm test -- src/__tests__/portal-shell.test.tsx`: passed, 4 tests.
- `pnpm test -- src/__tests__/google-auth.test.ts src/__tests__/portal-preview-pages.test.tsx src/__tests__/site-header.test.tsx src/__tests__/portal-shell.test.tsx`: passed, 4 files and 15 tests.
- `pnpm lint`: passed with one existing warning in `src/components/portal/document-table.tsx`.
- `pnpm build`: passed.
- `pnpm test`: failed in existing DB seed verification at `src/__tests__/portal-auth-flow.test.tsx:71`; current database has 2 documents and the test expects at least 3. Other 73 tests passed.

## Browser Checks

- Automated browser visual review could not be completed because the callable in-app browser tool was not exposed in this session.

## Unresolved Risks Or Follow-Up Specs

- Full test suite remains blocked by the seeded document count mismatch above.

---

# Verification

## Implemented Feature

- Added API-ready contribution payment data models and migration:
  - `ContributionSummary`
  - `PaymentImportBatch`
  - `PaymentImportRow`
  - `PaymentNotice`
- Added current-user read API: `GET /api/me/contributions`.
- Added admin-only import API: `POST /api/admin/payment-imports`.
- Added admin-only approval API: `POST /api/admin/payment-imports/[id]/approve`.
- Approval writes user-visible contribution summaries and draft unpaid/overdue notices; external SMS/Kakao/payment integrations are not connected.
- Wired `/portal/member` and `/portal/refund` to fetch the current user's contribution summary and draft/approved notices.
- Updated `PortalShell` to show contribution totals, paid amount, unpaid amount, overdue unpaid amount, late fee, due date, and the first draft notice.
- Preserved the previous login-name based personal-library label work.

## Changed Files

- `prisma/schema.prisma`
- `prisma/migrations/20260602150000_add_contribution_payment_api/migration.sql`
- `src/lib/contribution-types.ts`
- `src/lib/contribution-import.ts`
- `src/lib/contribution-serializer.ts`
- `src/app/api/me/contributions/route.ts`
- `src/app/api/admin/payment-imports/route.ts`
- `src/app/api/admin/payment-imports/[id]/approve/route.ts`
- `src/app/portal/member/page.tsx`
- `src/app/portal/refund/page.tsx`
- `src/components/portal/portal-shell.tsx`
- `src/__tests__/contribution-api.test.ts`
- `src/__tests__/portal-shell.test.tsx`
- `docs/superpowers/plans/2026-06-02-contribution-payment-api.md`
- `_workspace/00_input/request-summary.md`
- `_workspace/01_scope/spec-selection.md`
- `_workspace/04_review/ui-review.md`
- `_workspace/final/verification.md`

## Checks Run

- `pnpm exec prisma generate`: passed.
- `pnpm exec prisma migrate deploy`: applied `20260602150000_add_contribution_payment_api`.
- Red API test: `pnpm test src/__tests__/contribution-api.test.ts` failed before implementation because route files did not exist.
- Red portal test: `pnpm test src/__tests__/portal-shell.test.tsx` failed before implementation because the member card still rendered fixed payment copy.
- Focused API test: `pnpm test src/__tests__/contribution-api.test.ts` passed, 4 tests.
- Focused portal test: `pnpm test src/__tests__/portal-shell.test.tsx` passed, 2 tests.
- Combined focused tests: `pnpm test src/__tests__/contribution-api.test.ts src/__tests__/portal-shell.test.tsx src/__tests__/site-header.test.tsx` passed, 3 files and 7 tests.
- `pnpm lint`: passed with one existing warning in `src/components/portal/document-table.tsx`.
- `pnpm test`: 9 files and 63 tests passed; 1 existing DB seed verification test failed because the current database has 2 documents and `src/__tests__/portal-auth-flow.test.tsx:71` expects at least 3.
- `pnpm build`: passed.

## Browser Checks

- Not rerun in this update because the callable local Browser tool was not exposed in this session.

## Unresolved Risks Or Follow-Up Specs

- Full `pnpm test` remains blocked by the current seeded document count mismatch described above.
- External accounting-system ingestion, SMS, Kakao 알림톡, payment-gateway callbacks, and sent-notice result webhooks are intentionally deferred.

---

# Verification Addendum: Sitemap Duplicate Footer Cleanup

## Implemented Change

- Removed the logged-in footer block from the sitemap drawer in `src/components/landing/site-header.tsx`.
- Preserved the logged-out sitemap login prompt.
- Added a regression test in `src/__tests__/site-header.test.tsx` confirming the logged-in sitemap drawer does not repeat `운영자 개인 자료실 열기`.

## Checks Run

- `pnpm test -- src/__tests__/site-header.test.tsx`: passed, 2 tests.
- `pnpm lint`: passed with one existing warning in `src/components/portal/document-table.tsx`.
- `pnpm test`: failed in existing DB seed verification at `src/__tests__/portal-auth-flow.test.tsx:71`; current database has 2 documents and the test expects at least 3.
- `pnpm build`: passed.

## Browser Checks

- Used the connected Chrome browser backend against the existing local dev server at `http://localhost:3000`.
- Confirmed `/portal/admin` sitemap drawer opens while logged in as `운영자`.
- Confirmed `운영자 개인 자료실 열기` is absent from the opened sitemap drawer.
- Confirmed no horizontal overflow at the checked desktop viewport.
- Mobile viewport resizing was not exposed by the connected browser backend, so mobile visual verification could not be completed in-browser this session.

## Unresolved Risks Or Follow-Up Specs

- Full test suite remains blocked by the seeded document count mismatch above.

---

# Verification Addendum: Signup Application Inputs

## Implemented Change

- Added signup application fields to `User`:
  - `signupName`
  - `signupPhone`
  - `signupMemo`
- Added migration `20260603080000_add_signup_application_fields`.
- Added `신청자 이름`, `연락처`, and `전달 메모` inputs inside the login-page `신규 가입 신청` panel.
- OAuth start route stores submitted application fields in a short-lived secure cookie.
- OAuth callback persists those fields onto the pending user record.
- Admin pending-user approval table now displays the submitted name, phone, and memo where available.

## Checks Run

- `pnpm exec prisma generate`: passed.
- `pnpm exec prisma migrate deploy`: applied `20260603080000_add_signup_application_fields`.
- `pnpm test -- src/__tests__/google-auth.test.ts src/__tests__/portal-preview-pages.test.tsx src/__tests__/portal-shell.test.tsx src/__tests__/site-header.test.tsx`: passed, 4 files and 14 tests.
- `pnpm lint`: passed with one existing warning in `src/components/portal/document-table.tsx`.
- `pnpm build`: passed.
- `pnpm test`: failed in existing DB seed verification at `src/__tests__/portal-auth-flow.test.tsx:71`; current database has 2 documents and the test expects at least 3. Other 72 tests passed.

## Browser Checks

- Automated browser visual review could not be completed because the callable in-app browser tool was not exposed in this session.

## Unresolved Risks Or Follow-Up Specs

- Google signup still requires `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` to be configured in the target environment.
- Full test suite remains blocked by the seeded document count mismatch above.

---

# Verification Addendum: Signup Badge For Google Registration

## Implemented Change

- Added a logged-out `가입 신청` badge to the desktop header.
- Added a `가입 신청` action to the logged-out sitemap drawer.
- Added a `신규 가입 신청` badge on the login page.
- All signup badges route to `/api/auth/google`, which is the existing Google OAuth registration/login entry point.

## Checks Run

- `pnpm test -- src/__tests__/landing-page.test.tsx src/__tests__/site-header.test.tsx src/__tests__/portal-preview-pages.test.tsx`: passed, 3 files and 18 tests.
- `pnpm lint`: passed with one existing warning in `src/components/portal/document-table.tsx`.
- `pnpm build`: passed.
- `pnpm test`: failed in existing DB seed verification at `src/__tests__/portal-auth-flow.test.tsx:71`; current database has 2 documents and the test expects at least 3. Other 70 tests passed.
- Local server check for `http://localhost:3000/`: returned 200, included `가입 신청`, and included `/api/auth/google`.
- Local server check for `http://localhost:3000/login`: returned 200, included `신규 가입 신청`, and included `/api/auth/google`.

## Browser Checks

- Automated browser visual review could not be completed because the callable in-app browser tool was not exposed in this session.

## Unresolved Risks Or Follow-Up Specs

- Google signup still requires `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` to be configured in the target environment.
- Full test suite remains blocked by the seeded document count mismatch above.

---

# Verification Addendum: Public Header Login Badge Removal

## Implemented Change

- Removed the logged-out top-right `조합원 로그인` badge from the public header.
- Kept the login action inside the sitemap drawer.
- Kept other login entry points intact, including the hero CTA and mobile bottom login tab.

## Checks Run

- `pnpm test -- src/__tests__/site-header.test.tsx`: passed, 1 file and 4 tests.
- `pnpm lint`: passed with one existing warning in `src/components/portal/document-table.tsx`.
- `pnpm build`: passed.
- `pnpm test`: failed in existing DB seed verification at `src/__tests__/portal-auth-flow.test.tsx:71`; current database has 2 documents and the test expects at least 3. Other 71 tests passed.
- Local server check for `http://localhost:3000/`: returned 200 and retained the hero login path.

## Browser Checks

- Automated browser visual review could not be completed because the callable in-app browser tool was not exposed in this session.

## Unresolved Risks Or Follow-Up Specs

- Full test suite remains blocked by the seeded document count mismatch above.

---

# Verification Addendum: Login-Scoped Signup Guidance

## Implemented Change

- Removed the public `가입 신청` badge from the logged-out desktop header.
- Removed the `가입 신청` action from the logged-out sitemap drawer.
- Changed the login page `신규 가입 신청` control from a direct OAuth link to an expandable guidance button.
- Added a short signup process panel with `Google 계정으로 신청하기`, which remains linked to `/api/auth/google`.

## Checks Run

- `pnpm test -- src/__tests__/site-header.test.tsx src/__tests__/portal-preview-pages.test.tsx`: passed, 2 files and 7 tests.
- `pnpm lint`: passed with one existing warning in `src/components/portal/document-table.tsx`.
- `pnpm build`: passed.
- `pnpm test`: failed in existing DB seed verification at `src/__tests__/portal-auth-flow.test.tsx:71`; current database has 2 documents and the test expects at least 3. Other 70 tests passed.
- Local server check for `http://localhost:3000/`: returned 200, did not include `가입 신청`, and still included `조합원 로그인`.
- Local server check for `http://localhost:3000/login`: returned 200, included `처음 이용하는 조합원인가요`, and included `신규 가입 신청`.

## Browser Checks

- Automated browser visual review could not be completed because the callable in-app browser tool was not exposed in this session.

## Unresolved Risks Or Follow-Up Specs

- Google signup still requires `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` to be configured in the target environment.
- Full test suite remains blocked by the seeded document count mismatch above.
- Mobile browser viewport visual check remains pending because viewport control was unavailable in the connected browser backend.

---

# Verification Addendum: Login Hydration Mismatch Fix

## Implemented Change

- Split `/login` into a server page wrapper and a client login UI component.
- Server wrapper reads `searchParams.error` and passes `googleError` into `LoginClient`.
- Removed client-side URL query reading from the initial render path, so the Google OAuth error alert is present consistently in SSR and client hydration.
- Updated page render tests to await the async server page wrapper for `/login`.

## Checks Run

- `pnpm test -- src/__tests__/google-auth.test.ts src/__tests__/linked-pages.test.tsx src/__tests__/portal-preview-pages.test.tsx`: passed, 3 files and 10 tests.
- `pnpm lint`: passed with one existing warning in `src/components/portal/document-table.tsx`.
- `pnpm build`: passed.
- `pnpm test`: failed in existing DB seed verification at `src/__tests__/portal-auth-flow.test.tsx:71`; current database has 2 documents and the test expects at least 3. Other 69 tests passed.
- Local server check for `http://localhost:3000/login?error=google_not_configured`: returned 200, included `조합원 로그인`, included Google OAuth setup guidance, and did not include `구글조합원`.

## Browser Checks

- Automated browser console capture could not be completed in this session because the callable in-app browser tool was not exposed, and Playwright was not installed in the Node REPL path.

## Unresolved Risks Or Follow-Up Specs

- Full test suite remains blocked by the seeded document count mismatch above.

---

# Verification Addendum: Contribution Details In Login Modal And Personal Library

## Implemented Change

- Added `ContributionSummaryMini` for compact personal contribution/payment display.
- Loaded the current session user's contribution summary and draft/approved payment notices on `/`.
- Passed contribution data from `HomeClient` into the main personal-library drawer `PortalShell`.
- Added the compact contribution summary to the landing login announcement modal and the portal login announcement modal.

## Checks Run

- `pnpm test -- src/__tests__/landing-page.test.tsx src/__tests__/portal-shell.test.tsx`: passed, 14 tests.
- `pnpm lint`: passed with one existing warning in `src/components/portal/document-table.tsx`.
- `pnpm test`: failed in existing DB seed verification at `src/__tests__/portal-auth-flow.test.tsx:71`; current database has 2 documents and the test expects at least 3. Other 67 tests passed.
- `pnpm build`: passed.

## Browser Checks

- Used the connected Chrome browser backend against the existing local dev server at `http://localhost:3000`.
- Confirmed the local page rendered without horizontal overflow.
- Attempted authenticated browser verification as `member1`; the connected browser did not submit the server-action form, and its page evaluation API did not allow setting cookies. Authenticated contribution modal/drawer rendering was therefore verified through focused component tests.
- Created temporary contribution rows for `member1` with `sourceBatchId=codex-verify-login-summary` for browser verification setup, then deleted the temporary `PaymentNotice` and `ContributionSummary` rows before completion.

## Unresolved Risks Or Follow-Up Specs

- Full test suite remains blocked by the seeded document count mismatch above.
- Authenticated visual verification in the connected browser remains limited by the browser backend's inability to submit the server action or set a session cookie in this session.

---

# Verification Addendum: Real Google Profile Login

## Implemented Change

- Replaced fake Google login action with real OAuth redirect route: `GET /api/auth/google`.
- Added OAuth callback route: `GET /api/auth/google/callback`.
- Callback exchanges the auth code, reads Google userinfo, and persists the verified profile:
  - `User.email`
  - `User.name`
  - `User.image`
  - `User.emailVerified`
- New Google users remain `PENDING`; existing approved users keep their role and `loginId`.
- Session JWT now includes email and image when available.
- Login page Google button now links to `/api/auth/google` and shows a setup/error message when OAuth env vars are missing.

## Checks Run

- `pnpm test -- src/__tests__/google-auth.test.ts`: passed, 2 tests.
- `pnpm lint`: passed with one existing warning in `src/components/portal/document-table.tsx`.
- `pnpm build`: passed.
- `pnpm test`: failed in existing DB seed verification at `src/__tests__/portal-auth-flow.test.tsx:71`; current database has 2 documents and the test expects at least 3. Other 69 tests passed.

## Browser Checks

- Used the connected Chrome browser backend against the existing local dev server at `http://localhost:3000`.
- Confirmed the Google login control is a link to `/api/auth/google`.
- With no Google OAuth env vars in `.env`, confirmed the route returns to `/login?error=google_not_configured`.
- Confirmed the login page shows the Google OAuth setup guidance, does not show `구글조합원 (가상)`, and has no horizontal overflow.

## Required Runtime Configuration

- Set `GOOGLE_CLIENT_ID`.
- Set `GOOGLE_CLIENT_SECRET`.
- Optional: set `GOOGLE_REDIRECT_URI`; otherwise the app uses `/api/auth/google/callback` based on the current request origin.
- Register the same redirect URI in the Google Cloud OAuth client.

## Unresolved Risks Or Follow-Up Specs

- Full test suite remains blocked by the seeded document count mismatch above.
- A live Google OAuth round trip could not be completed in this environment because Google OAuth credentials are not present in `.env`.

---

# Verification Addendum: Logged-In Hero CTA Cleanup

## Implemented Change

- Added an `isLoggedIn` prop to `HeroSection`.
- Passed `!!session` from `HomeClient` into `HeroSection`.
- Hid the hero CTA group containing `조합원 로그인` and `사업정보 보기` when a user is logged in.
- Added a landing-page regression test for the logged-in hero state.

## Checks Run

- `pnpm test -- src/__tests__/landing-page.test.tsx`: passed, 10 tests.
- `pnpm lint`: passed with one existing warning in `src/components/portal/document-table.tsx`.
- `pnpm test`: failed in existing DB seed verification at `src/__tests__/portal-auth-flow.test.tsx:71`; current database has 2 documents and the test expects at least 3. Other 65 tests passed.
- `pnpm build`: passed.

## Browser Checks

- Used the connected Chrome browser backend against the existing local dev server at `http://localhost:3000`.
- Confirmed logged-in `/` renders the hero without `조합원 로그인`, `사업정보 보기`, or `[data-hero-actions]`.
- Confirmed no horizontal overflow at the checked desktop viewport.
- Captured a desktop screenshot showing the logged-in hero with the CTA row removed.
- Mobile viewport resizing was not exposed by the connected browser backend, so mobile visual verification could not be completed in-browser this session.

## Unresolved Risks Or Follow-Up Specs

- Full test suite remains blocked by the seeded document count mismatch above.
- Mobile browser viewport visual check remains pending because viewport control was unavailable in the connected browser backend.

---

# Verification Addendum: Library Material Admin Management

## Implemented Change

- Added `isAdmin` propagation from `src/app/library/page.tsx` into `LibraryClient`.
- Added local document list management in the library page so edited/deleted uploaded entries update immediately inside the material drawer.
- Added admin-only `수정` and `삭제` controls for DB-backed `실제 업로드` material entries.
- Added inline edit form for title, description, category, subcategory, document date, published date, and important-document flag.
- Reused existing admin-only `PATCH /api/documents/[id]` and `DELETE /api/documents/[id]`; no new public mutation surface was added.

## Checks Run

- `pnpm vitest run src/__tests__/library-page.test.tsx`: passed, 5 tests.
- `pnpm vitest run src/__tests__/document-upload-api.test.ts`: passed, 4 tests.
- `pnpm lint`: passed with one existing warning in `src/components/portal/document-table.tsx`.
- `pnpm test`: failed in existing `src/__tests__/portal-auth-flow.test.tsx` seed verification; `pending` document is `undefined`. Other 90 tests passed.
- `pnpm build`: passed.

## Browser Checks

- Checked `http://127.0.0.1:3000/library` with headless Chrome at 1280x900 and 390x844.
- Desktop and mobile checks confirmed page content renders, no Next.js error overlay is present, no console errors are reported, and no horizontal overflow is detected.
- Admin-only drawer controls were verified by component tests because browser verification did not inject an authenticated admin session.

## Unresolved Risks Or Follow-Up Specs

- Static `자료실 색인` fallback entries remain code-managed and are intentionally not editable from the UI.
- Full `pnpm test` remains blocked by the existing portal seed pending-document mismatch.

---

# Verification Addendum: Library Placeholder Cleanup

## Implemented Change

- Changed the library material drawer so real uploaded documents are shown by themselves.
- Static `자료실 색인` fallback entries are no longer appended when matching uploaded documents exist.
- Added a regression test that confirms uploaded 조합규약 materials do not show the placeholder entries `조합규약 및 정관` and `정식 조합원 연명부`.

## Checks Run

- `pnpm vitest run src/__tests__/library-page.test.tsx -t "does not mix static index placeholders"`: passed.
- `pnpm vitest run src/__tests__/library-page.test.tsx`: passed, 6 tests.
- `pnpm lint`: passed with one existing warning in `src/components/portal/document-table.tsx`.
- `pnpm build`: passed.

## Browser Checks

- Checked `http://127.0.0.1:3000/library` at 1280x900 with headless Chrome.
- Confirmed page content renders, no framework error overlay is present, no console errors are reported, and no horizontal overflow is detected.

## Unresolved Risks Or Follow-Up Specs

- Full `pnpm test` was not rerun for this small cleanup; the suite was already known to be blocked by the existing portal seed pending-document mismatch.

---

# Verification Addendum: Chairman Signature Restore

## Implemented Change

- Copied the provided PNG into `public/assets/about/chairman-signature.png` without changing the file bytes.
- Rendered the signature image to the right of `대방동 지역주택조합 조합장` in the `/about` greeting sign-off.
- Kept the image aspect ratio by using `h-14 w-auto object-contain`.
- Added a regression test that confirms the signature image renders and `안동연(인)` is not shown.

## Checks Run

- `pnpm test src/__tests__/about-client.test.tsx`: passed, 2 tests.
- `pnpm lint`: passed with one existing warning in `src/components/portal/document-table.tsx`.
- `pnpm build`: passed.
- `pnpm test`: failed in existing `src/__tests__/portal-auth-flow.test.tsx` seed verification; `pending` document is `undefined`. Other 93 tests passed.
- SHA256 check: source PNG and `public/assets/about/chairman-signature.png` matched exactly.

## Browser Checks

- Checked `http://127.0.0.1:3000/about?tab=greetings` at 1280x900 and 390x844 with headless Chrome.
- Confirmed the signature asset loads from `/assets/about/chairman-signature.png` with natural size 3588x1184.
- Confirmed `대방동 지역주택조합 조합장` remains visible, `안동연(인)` is absent, and no horizontal overflow is detected on desktop or mobile.
- The page DOM includes the same signature image inside the closed about drawer because the drawer reuses `AboutClient`; the visible main sign-off renders correctly.

## Unresolved Risks Or Follow-Up Specs

- Full `pnpm test` remains blocked by the existing portal seed pending-document mismatch.

---

# Verification Addendum: Chairman Signature Transparent Background

## Implemented Change

- Updated `public/assets/about/chairman-signature.png` so the opaque checkerboard/light background is transparent.
- Kept the image dimensions at 3588x1184 and left the existing `/about` sign-off layout unchanged.

## Checks Run

- PIL asset inspection: alpha extrema `0..255`, corner alpha `[0, 0, 0, 0]`, transparent pixels `3,681,563`, visible pixels `566,629`.
- Browser canvas inspection at `http://127.0.0.1:3000/about?tab=greetings`: desktop 1280x900 and mobile 390x844 both loaded `/assets/about/chairman-signature.png` with corner alpha `[0, 0, 0, 0]`.
- Browser checks also confirmed no horizontal overflow at both viewports.
- `pnpm test src/__tests__/about-client.test.tsx`: passed, 2 tests.
- `pnpm lint`: passed with one existing warning in `src/components/portal/document-table.tsx`.
- `pnpm build`: passed.
- `pnpm test`: failed in existing `src/__tests__/portal-auth-flow.test.tsx` seed verification; `pending` document is `undefined`. Other 93 tests passed.

## Unresolved Risks Or Follow-Up Specs

- Full `pnpm test` remains blocked by the existing portal seed pending-document mismatch.
