# UI Review

## Reviewed Change

- Feature: Remove the visible `읽기 가이드` inner boxes from disclosure cards and reduce unnecessary internal card whitespace.
- Governing spec: `docs/superpowers/specs/2026-05-25-daebang-housing-cooperative-portal-design.md`, public `공개자료` presentation scope.
- Implementation plan: Small presentation cleanup in `DisclosureClient`.
- Files or pages reviewed: `src/components/disclosure/disclosure-client.tsx`, `src/__tests__/disclosure-page.test.tsx`, public `/disclosure`.

## Boundary Review

- Finding: PASS. The change removes only visual guide panels and tightens spacing.
- Evidence: Document categories, permissions, protected upload workflow, document drawer behavior, and `자료실 열기` actions remain unchanged.

## Truthful Presentation Review

- Finding: PASS. Removing the guide boxes reduces explanatory UI without inventing or hiding document availability status.
- Evidence: Upload status, uploaded document previews, empty upload states, and protected session labels remain rendered.

## Design And Accessibility Review

- Finding: PASS. The cards are simpler and keep the existing title, description, divider, status, and action structure while reducing the description-to-document gap.
- Evidence: Regression test verifies `읽기 가이드` no longer appears in the `규약 및 연명부` card section. The visible card padding, divider spacing, and uploaded/empty document box padding are reduced without changing actions.

## Outcome

- Result: PASS
- Required action: none

---

## Reviewed Change

- Feature: Add the same folder-table registration experience to public disclosure cards outside the meeting section, including regulation, accounting, and business/supervision subcategories.
- Governing spec: `docs/superpowers/specs/2026-05-25-daebang-housing-cooperative-portal-design.md`, public `공개자료` scope and existing protected document infrastructure.
- Implementation plan: Reuse the existing document drawer/table and `DocumentUploadForm`; default upload subcategory to the opened card's folder.
- Files or pages reviewed: `src/components/disclosure/disclosure-client.tsx`, `src/components/disclosure/meetings-table.tsx`, `src/__tests__/disclosure-page.test.tsx`, public `/disclosure`.

## Boundary Review

- Finding: PASS. The change does not create public upload or alter the document mutation API.
- Evidence: Upload remains behind the existing admin-only document workflow. Logged-out users still see protected login framing, while logged-in admin users can open the shared folder table and use `+ 신규 문서 등록`.

## Truthful Presentation Review

- Finding: PASS. The folder table is opened for the actual card subcategory and the upload form defaults to that same subcategory.
- Evidence: `운영관리규정` opens `운영관리규정 문서함`, and the regression test verifies the upload form's `문서함 세부 분류` value is `운영관리규정`. Accounting and business/supervision cards now also have explicit subcategories that match upload options.

## Design And Accessibility Review

- Finding: PASS. The implementation reuses the established side drawer, table, search, pagination, and modal form patterns shown in the meeting document folders.
- Evidence: No new visual system was introduced. The same `자료실 열기`, `폴더 카드로 보기`, `+ 신규 문서 등록`, and `DocumentUploadForm` controls are used for the added public disclosure folder flow.

## Outcome

- Result: PASS
- Required action: none

---

## Reviewed Change

- Feature: Add management regulation cards to `1. 규약 및 연명부`, add matching admin upload subcategories, and show uploaded document previews inside each regulation card for logged-in users.
- Governing spec: `docs/superpowers/specs/2026-05-25-daebang-housing-cooperative-portal-design.md`, public `공개자료` scope and existing protected document infrastructure.
- Implementation plan: Existing public disclosure category presentation plus existing admin document upload form/API.
- Files or pages reviewed: `src/components/disclosure/disclosure-client.tsx`, `src/components/portal/document-upload-form.tsx`, `src/__tests__/disclosure-page.test.tsx`, `src/__tests__/document-upload-form.test.tsx`, public `/disclosure` and admin upload workflow.

## Boundary Review

- Finding: PASS. Upload remains inside the existing authenticated admin document form and protected API.
- Evidence: No public upload route, unauthenticated document read, payment/accounting workflow, or new private-data exposure was added. Public cards still show protected-document framing, while logged-in previews use documents already loaded for the current session.

## Truthful Presentation Review

- Finding: PASS. Regulation cards describe document categories and show real uploaded document previews only when matching documents are supplied.
- Evidence: New cards are `운영관리규정`, `회계관리규정`, `선거관리규정`, and `기타 내부 운영규정`. Upload counts derive from `documents` matching each card's `subCategory`; empty states say the 자료 is not uploaded yet instead of inventing content.

## Design And Accessibility Review

- Finding: PASS. The implementation reuses existing disclosure cards, submenu pills, protected status badges, and document-view button patterns.
- Evidence: Each regulation card includes a compact `읽기 가이드`, uploaded-document list, and `문서 보기` action. Focused tests verify the new cards, submenus, upload subcategory options, file accept formats, and uploaded document previews.

## Outcome

- Result: PASS
- Required action: none

---

# UI Review

## Reviewed Change

- Feature: Move `공동사업주체 시공예정사 간의 업무협약서` from `1. 규약 및 연명부` to `4. 사업 및 감리`.
- Governing spec: `docs/superpowers/specs/2026-05-25-daebang-housing-cooperative-portal-design.md`, public `공개자료` scope.
- Implementation plan: Existing public disclosure category presentation; no new access or workflow surface.
- Files or pages reviewed: `src/components/disclosure/disclosure-client.tsx`, `src/__tests__/disclosure-page.test.tsx`, public `/disclosure` presentation.

## Boundary Review

- Finding: PASS. The change moves one public preview card between existing disclosure categories only.
- Evidence: No route, login check, download action, document mutation, private document exposure, payment data, or admin/member workflow was added.

## Truthful Presentation Review

- Finding: PASS. The agreement now sits under the business/supervision category, matching the document subject more closely.
- Evidence: `규약 및 연명부` now describes only bylaws and member register content, while `사업 및 감리` includes the construction-partner agreement card and `시공자 협약서` submenu.

## Design And Accessibility Review

- Finding: PASS. The existing card, tab, and submenu UI patterns are unchanged.
- Evidence: The moved card reuses the same item renderer, date/status badges, and responsive grid behavior. Focused Disclosure page tests verify the card is absent from `section-rules`, present in `section-operations`, and exposed through the `4. 사업 및 감리` submenu.

## Outcome

- Result: PASS
- Required action: none

---

# UI Review

## Reviewed Change

- Feature: Update the `사업현황 > 세대계획` premium unit-plan description to `48㎡A, 59㎡, 74㎡, 84㎡` and remove visible text details below the four image cards.
- Governing spec: `docs/superpowers/specs/2026-05-25-daebang-housing-cooperative-portal-design.md`, public `사업정보` scope.
- Implementation plan: `docs/superpowers/plans/2026-06-01-daebang-business-status.md`.
- Files or pages reviewed: `src/components/business/unit-tab.tsx`, `src/__tests__/business-page.test.tsx`, public `/business#unit` presentation.

## Boundary Review

- Finding: PASS. The change adjusts public unit-plan presentation only.
- Evidence: No routes, login checks, document access, payment data, sales state, or admin/member actions were added. The section remains on the public `/business` informational page.

## Truthful Presentation Review

- Finding: PASS. The description now names the requested type set and the image cards no longer duplicate or restate area/household details outside the images.
- Evidence: The premium unit-plan text lists `48㎡A, 59㎡, 74㎡, 84㎡`, and the gallery articles render the floor-plan images without the former `확장형`, 세대수, or 면적 definition list blocks.

## Design And Accessibility Review

- Finding: PASS. The gallery keeps the existing single-column card layout and image `alt` text while removing only the bottom text content.
- Evidence: Focused Business page tests verify the new copy, confirm no `dl` detail list exists inside `premium-unit-gallery`, and confirm the four image alt texts remain rendered.

## Outcome

- Result: PASS
- Required action: none

---

# UI Review

## Reviewed Change

- Feature: Adjust the `조직 및 협력사` organization chart hierarchy so the governance row reads `이사회`, `조합장`, `감사` and `전문 협력사` appears below `사무국`.
- Governing spec: `docs/superpowers/specs/2026-05-25-daebang-housing-cooperative-portal-design.md`, public `조합소개` scope.
- Implementation plan: Existing public about page organization section; no new access or workflow surface.
- Files or pages reviewed: `src/components/about/about-client.tsx`, `src/__tests__/about-client.test.tsx`.

## Boundary Review

- Finding: PASS. The change adjusts public organization-chart presentation only.
- Evidence: No routes, login checks, document access, payment data, or admin/member actions were added. The section remains on the public `/about` informational surface.

## Truthful Presentation Review

- Finding: PASS. The organization chart still describes role categories and support relationships without adding unverified names, contracts, or operational status.
- Evidence: The chart continues to use the role nodes `조합원 총회`, `이사회`, `조합장`, `감사`, `사무국`, and `전문 협력사`. The external partner status cards remain under the separate `협력사 현황` heading.

## Design And Accessibility Review

- Finding: PASS. The chart keeps the existing warm recessed panel, stone-card node styling, centered node content, and `aria-hidden` connector treatment.
- Evidence: The governance row is rendered through `organization-governance-row` in the requested order, and the secretariat/support group is rendered as `organization-secretariat-stack` with `전문 협력사` below `사무국`. Focused About component tests verify both structures.

## Outcome

- Result: PASS
- Required action: none

---

# UI Review

## Reviewed Change

- Feature: Show the downloaded 59㎡A, 59㎡B, 74㎡A, and 84㎡ premium unit-plan images one at a time in `사업현황 > 세대계획`.
- Governing spec: `docs/superpowers/specs/2026-05-25-daebang-housing-cooperative-portal-design.md`, public `사업정보` scope.
- Implementation plan: `docs/superpowers/plans/2026-06-01-daebang-business-status.md`.
- Files or pages reviewed: `src/components/business/unit-tab.tsx`, `src/__tests__/business-page.test.tsx`, `public/assets/business/units/*.png`, public `/business#unit` presentation.

## Boundary Review

- Finding: PASS. The change adds public unit-plan reference information only.
- Evidence: No route, login check, private document access, pricing, contract action, payment data, or admin/member workflow was added. The content remains inside the public `/business` informational page.

## Truthful Presentation Review

- Finding: PASS. The section identifies the unit-plan content as attached/downloaded premium unit-detail information and separates it from the broader household-count tables.
- Evidence: The added cards list only visible image-grounded details for 59㎡A, 59㎡B, 74㎡A, and 84㎡. The 84㎡ image does not show a household count, so the UI says `세대수 별도 표기 없음` instead of inventing one.

## Design And Accessibility Review

- Finding: PASS with one browser viewport limitation. The image gallery follows the existing stone-card, warm recessed panel, compact badge, and responsive grid patterns used in the business page.
- Evidence: The unit gallery uses `next/image` with explicit alt text, contained `object-contain` imagery, compact area data, and a forced single-column layout so each 평형 card appears one at a time. Focused Business page tests verify the gallery has `grid-cols-1` and no `lg:grid-cols-2`. Connected Chrome desktop verification confirmed 4 cards, no adjacent cards sharing the same row, all 4 images loaded, and no horizontal overflow. Mobile viewport resizing was not exposed by the connected browser backend.

## Outcome

- Result: PASS
- Required action: none

---

# UI Review

## Reviewed Change

- Feature: Refine the `사업현황 > 조감도·배치도` section to surface the briefing images and layout notes more clearly.
- Governing spec: `DESIGN.md` card, imagery, and truthful public information presentation rules.
- Implementation plan: Existing public `/business#plan` section; no access or workflow behavior change.
- Files or pages reviewed: `src/components/business/plan-tab.tsx`, `src/__tests__/business-page.test.tsx`.

## Boundary Review

- Finding: PASS. The change reorganizes public briefing-image presentation only.
- Evidence: No routes, login checks, document access, payment data, or admin/member actions were added. The section remains on the public `/business` informational surface.

## Truthful Presentation Review

- Finding: PASS. The section labels the images as 2025.09.06 briefing-material references and preserves the caution that they are not final permit drawings.
- Evidence: The revised section identifies `변경 조감도`, `당초 배치도`, and `당초 조감도` by briefing page source, and the caution text states the images should not be interpreted as confirmed renderings or final approval drawings.

## Design And Accessibility Review

- Finding: PASS with one browser-tool limitation.
- Evidence: The plan section now uses compact summary cards, a larger standalone layout-image card, and the existing image alt text for all briefing images. Focused Business page tests passed and local `/business` SSR output included the new labels. Callable browser automation was not exposed in this session.

## Outcome

- Result: PASS
- Required action: none

---

# UI Review

## Reviewed Change

- Feature: Add a cooperative organization chart to the `조직 및 협력사` section and separate it from partner status cards.
- Governing spec: `DESIGN.md` card, color, and public information presentation rules.
- Implementation plan: Existing public about page organization tab; no new access or workflow surface.
- Files or pages reviewed: `src/components/about/about-client.tsx`, `src/__tests__/about-client.test.tsx`.

## Boundary Review

- Finding: PASS. The change adds public explanatory organization content only.
- Evidence: No routes, login checks, document access, payment data, or admin/member actions were added. The section remains on the public `/about` informational surface.

## Truthful Presentation Review

- Finding: PASS. The organization chart describes role categories and governance flow without exposing unverified personal lists or operational results.
- Evidence: The chart uses `조합원 총회`, `조합장`, `이사회`, `감사`, `사무국`, and `전문 협력사` as role nodes, and the partner section is labeled separately as `협력사 현황`.

## Design And Accessibility Review

- Finding: PASS with one browser-tool limitation.
- Evidence: The organization chart preserves the top-to-bottom governance diagram while using the same icon-plus-white-card pattern as the partner status cards, with each node icon and title aligned on the same centered row, a smaller top assembly node, narrower fixed node widths to reduce right-side empty space, straight SVG branch connector lines with rounded corners marked `aria-hidden`, charcoal headings, and compact explanatory copy. Focused About component tests passed. Callable browser automation was not exposed in this session.

## Outcome

- Result: PASS
- Required action: none

---

# UI Review

## Reviewed Change

- Feature: Refine the active desktop navigation indicator from a full-width underline to a compact rounded bar.
- Governing spec: `DESIGN.md` navigation and color token rules.
- Implementation plan: Existing public header navigation; no product scope or access behavior change.
- Files or pages reviewed: `src/components/landing/site-header.tsx`, `src/__tests__/site-header.test.tsx`.

## Boundary Review

- Finding: PASS. The change is visual-only and does not add, remove, or expose navigation destinations.
- Evidence: `megaMenuNavigation` items, routes, auth controls, sitemap behavior, and role-gated access behavior are unchanged.

## Truthful Presentation Review

- Finding: PASS. The indicator communicates the current page only and does not imply progress, completion, or a workflow step.
- Evidence: The active state remains tied to the current `pathname`; no numeric step markers or segmented progress UI were added.

## Design And Accessibility Review

- Finding: PASS with one browser-tool limitation.
- Evidence: The active nav label keeps the existing Ember Orange text treatment and now uses a 3px rounded bar centered under the label, preserving the warm canvas/header style. The indicator is `aria-hidden`, so it does not add redundant screen-reader output. Focused header tests passed. Callable browser automation was not exposed in this session.

## Outcome

- Result: PASS
- Required action: none

---

# UI Review

## Reviewed Change

- Feature: Use the corrected signup/application name as the member-facing display name after approval.
- Governing spec: `docs/superpowers/specs/2026-05-28-daebang-auth-and-document-disclosure-design.md`.
- Implementation plan: Existing Google OAuth pending-approval workflow; keep `User.name` as the Google-authenticated source and use `signupName` as the corrected display name when present.
- Files or pages reviewed: `src/lib/auth.ts`, `src/app/portal/pending/page.tsx`, `src/__tests__/portal-auth-flow.test.tsx`.

## Boundary Review

- Finding: PASS. The change affects display naming only and does not expand member permissions, document access, or public surfaces.
- Evidence: `createSessionToken` still emits the same session fields and role, but resolves `name` from `signupName || name`. Role routing and access checks remain unchanged.

## Truthful Presentation Review

- Finding: PASS. The corrected application name is used for member-facing greetings while the original Google-authenticated name remains available for the pending review screen.
- Evidence: `/portal/pending` now reads the stored `User.name` separately as `googleProfileName` and only shows `Google 인증 이름` when it differs from the corrected display name.

## Design And Accessibility Review

- Finding: PASS with one browser-tool limitation.
- Evidence: No new layout or control was introduced. Existing text slots now receive the corrected display name. A focused session-token test verifies the member-facing session name policy. Callable browser automation was not exposed in this session.

## Outcome

- Result: PASS
- Required action: none

---

# UI Review

## Reviewed Change

- Feature: Let administrators correct the signup/application name for pending Google applicants.
- Governing spec: `docs/superpowers/specs/2026-05-28-daebang-auth-and-document-disclosure-design.md`.
- Implementation plan: Existing Google OAuth pending-approval workflow; keep the original Google profile name visible while allowing an admin-maintained application name.
- Files or pages reviewed: `src/lib/auth.ts`, `src/components/portal/portal-shell.tsx`, `src/app/portal/pending/page.tsx`, `src/__tests__/portal-shell.test.tsx`.

## Boundary Review

- Finding: PASS. The edit action is admin-only and scoped to `PENDING` users.
- Evidence: `updateSignupNameAction` checks the current session role before updating and uses a `PENDING` role filter on the target user. Approved member/refund roles are not updated by this action.

## Truthful Presentation Review

- Finding: PASS. The administratively corrected application name is separated from the original Google-authenticated name.
- Evidence: The pending applicant page uses the corrected `signupName` for the welcome/name display while the admin table continues to show `Google 이름` when it differs from the application name.

## Design And Accessibility Review

- Finding: PASS with one browser-tool limitation.
- Evidence: The admin table uses a labeled compact input and a small explicit `신청 이름 저장` action inside the existing pending-approval table. Focused tests verify the input value, preserved Google name display, and server action call. Callable browser automation was not exposed in this session.

## Outcome

- Result: PASS
- Required action: none

---

# UI Review

## Reviewed Change

- Feature: Contribution payment status and overdue unpaid notice presentation for logged-in member/refund portals
- Governing spec: `docs/superpowers/specs/2026-05-25-daebang-housing-cooperative-portal-design.md`
- Implementation plan: `docs/superpowers/plans/2026-06-02-contribution-payment-api.md`
- Files or pages reviewed: `/portal/member`, `/portal/refund`, `src/components/portal/portal-shell.tsx`, `src/app/portal/member/page.tsx`, `src/app/portal/refund/page.tsx`, contribution API route handlers, Prisma migration, focused tests

## Boundary Review

- Finding: The change keeps contribution/payment details inside authenticated member/refund/admin surfaces.
- Evidence: `GET /api/me/contributions` reads only the current session user's `userId`; admin import and approval routes require `ADMIN`; public navigation and document access were not expanded.

## Truthful Presentation Review

- Finding: User-facing payment information is shown only after approved import data exists; otherwise the portal uses pending/empty copy.
- Evidence: Admin imports create `PENDING` batches first. Only the approval route writes `ContributionSummary` and draft `PaymentNotice` rows. Draft notices explicitly state they are not sent before admin approval.

## Design And Accessibility Review

- Finding: The visible card change preserves the existing stone-card, warm canvas, badge, and compact portal dashboard patterns.
- Evidence: Focused portal tests verify the member card displays approved contribution figures, overdue status, and draft notice text. Browser review was not rerun because the callable local Browser tool was not exposed in this session.

## Outcome

- Result: PASS
- Required action: none

---

# UI Review

## Reviewed Change
- Feature: Remove duplicated logged-in sitemap drawer footer profile and personal-library CTA.
- Governing spec: `docs/superpowers/specs/2026-05-26-daebang-role-specific-portal-preview-design.md`
- Implementation plan: Existing site-header/navigation implementation; no new product scope added.
- Files or pages reviewed: `src/components/landing/site-header.tsx`, `src/__tests__/site-header.test.tsx`, `/portal/admin` sitemap drawer on local dev server.

## Boundary Review
- Finding: PASS. The change removes duplicated authenticated UI from the sitemap drawer and does not expose any new public or login-gated capability.
- Evidence: Public navigation entries are unchanged. Logged-in portal access remains through the existing header/profile surfaces and the fixed personal-library badge.

## Truthful Presentation Review
- Finding: PASS. No new preview, data, document, payment, approval, voting, or notification behavior is presented as live.
- Evidence: The sitemap drawer only lists existing menu links after the logged-in footer CTA is removed.

## Design And Accessibility Review
- Finding: PASS with one verification limitation.
- Evidence: Focused test confirms `운영자 개인 자료실 열기` is not repeated after opening the sitemap drawer. Browser DOM review on `http://localhost:3000/portal/admin` confirmed the sitemap opens, the duplicated CTA text is absent, and there is no horizontal overflow at the checked desktop viewport. Mobile viewport resizing was not available through the connected browser backend in this session.

## Outcome
- Result: PASS
- Required action: none

---

# UI Review

## Reviewed Change
- Feature: Make the global right-side personal-library action open the drawer on `/business`, `/news`, and `/library`.
- Governing spec: `docs/superpowers/specs/2026-05-25-daebang-housing-cooperative-portal-design.md`, authenticated personal-library/document access boundary.
- Implementation plan: Reuse the existing authenticated `PortalShell` drawer and shared personal-library data loading without adding a new public access surface.
- Files or pages reviewed: `src/components/portal/personal-library-drawer-host.tsx`, `src/lib/personal-library-data.ts`, `src/app/business/page.tsx`, `src/app/news/page.tsx`, `src/app/library/page.tsx`, authenticated `/business`, `/news`, and `/library`.

## Boundary Review
- Finding: PASS.
- Evidence: The right-side action still appears only for logged-in sessions through the existing global header. The new host loads the same role-scoped approved/admin document data and renders the existing `PortalShell` in drawer mode; no public document access, upload, payment, voting, or messaging surface was added.

## Truthful Presentation Review
- Finding: PASS.
- Evidence: The drawer displays session-derived personal-library labels and real loaded document/payment/admin data only when a session exists. Logged-out pages do not show the right-side action, and no fabricated document or account content was introduced.

## Design And Accessibility Review
- Finding: PASS.
- Evidence: The drawer uses the existing warm canvas, stone border, right-side slide-over, labeled close button, and `aria-label` pattern already used on landing/about/disclosure. Browser checks confirmed `/business`, `/news`, and `/library` open `운영자 개인 자료실 드로어` from the desktop right-side badge and that the mobile drawer has no horizontal overflow.

## Outcome
- Result: PASS
- Required action: none

---

# UI Review

## Reviewed Change
- Feature: Remove static library index placeholder entries from material drawers when uploaded documents exist.
- Governing spec: `docs/superpowers/specs/2026-05-25-daebang-housing-cooperative-portal-design.md`, 자료실 truthful presentation boundary.
- Implementation plan: `docs/superpowers/plans/2026-06-02-daebang-library-index.md`.
- Files or pages reviewed: `src/components/library/library-client.tsx`, `src/__tests__/library-page.test.tsx`, `/library` on local dev server.

## Boundary Review
- Finding: PASS.
- Evidence: The change only removes placeholder fallback entries from mixed material lists when real uploaded documents exist. It does not change public navigation, authentication, document access, upload, or admin mutation permissions.

## Truthful Presentation Review
- Finding: PASS.
- Evidence: DB-backed uploaded documents now render without appending static `자료실 색인` placeholders such as `조합규약 및 정관` and `정식 조합원 연명부`.

## Design And Accessibility Review
- Finding: PASS.
- Evidence: No new controls or layout surfaces were added. Browser check for `/library` showed page content, no framework error overlay, no console errors, and no horizontal overflow at the checked desktop viewport.

## Outcome
- Result: PASS
- Required action: none

---

# UI Review

## Reviewed Change
- Feature: Add admin-only edit and delete management for uploaded material entries inside the `/library` material drawer.
- Governing spec: `docs/superpowers/specs/2026-05-25-daebang-housing-cooperative-portal-design.md`, authenticated document management and 자료실 boundaries.
- Implementation plan: `docs/superpowers/plans/2026-06-02-daebang-library-index.md` plus existing `PATCH`/`DELETE /api/documents/[id]` behavior.
- Files or pages reviewed: `src/components/library/library-client.tsx`, `src/app/library/page.tsx`, `src/__tests__/library-page.test.tsx`, `/library` on local dev server.

## Boundary Review
- Finding: PASS.
- Evidence: Edit/delete controls are gated by `isAdmin` and only render for DB-backed `실제 업로드` entries. Logged-out and non-admin library behavior remains read-only, and static `자료실 색인` fallback entries are not presented as mutable CMS data.

## Truthful Presentation Review
- Finding: PASS.
- Evidence: The library page continues to describe gated materials as indexed or member-only. The new mutation controls call the existing admin-only document API and do not add public upload, approval, accounting, voting, notification, or private-data surfaces.

## Design And Accessibility Review
- Finding: PASS.
- Evidence: Buttons use visible icon+text labels, form fields have labels, and focusable controls remain inside the existing drawer surface. Browser checks for `/library` at desktop and mobile widths showed page content, no framework error overlay, no console errors, and no horizontal overflow.

## Outcome
- Result: PASS
- Required action: none

---

# UI Review

## Reviewed Change
- Feature: Match notice read-mode rich content typography and line height to the notice edit-mode rich editor.
- Governing spec: Existing `조합소식` notice administration presentation; no access-scope expansion.
- Implementation plan: `docs/superpowers/plans/2026-06-01-daebang-news-admin-media-controls.md`.
- Files or pages reviewed: `src/components/news/notice-rich-editor.tsx`, `src/__tests__/news-admin-controls.test.tsx`, `/news?tab=notice` notice drawer on local dev server.

## Boundary Review
- Finding: PASS.
- Evidence: The change only updates shared rich-content typography classes and a focused rendering test. No navigation, authentication, upload, document disclosure, payment, voting, or messaging behavior changed.

## Truthful Presentation Review
- Finding: PASS.
- Evidence: Notice content still renders sanitized stored notice HTML through `NoticeRichContent`; no new preview claims, operational data, or action controls were added.

## Design And Accessibility Review
- Finding: PASS.
- Evidence: Browser checks on `http://127.0.0.1:3000/news?tab=notice` showed the notice drawer body renders `.notice-rich-content` at `12px` font size and `19.5px` line height on both desktop and mobile, matching the editor body class. No Next.js error overlay, no console errors, and no mobile horizontal overflow were detected.

## Outcome
- Result: PASS
- Required action: none

---

# UI Review

## Reviewed Change
- Feature: Let administrators edit the empty-document guidance shown in disclosure cards.
- Governing spec: `DESIGN.md`, protected information-disclosure document workflow.
- Implementation plan: Store per-subcategory empty-card guidance in `DisclosureEmptyMessage`, load it into disclosure cards, and expose an admin-only edit modal when no uploaded documents exist.
- Files or pages reviewed: `src/components/disclosure/disclosure-client.tsx`, `src/components/disclosure/disclosure-page-client-shell.tsx`, `src/app/disclosure/page.tsx`, `src/app/api/disclosure-empty-messages/route.ts`, `prisma/schema.prisma`, authenticated `/disclosure`.

## Boundary Review
- Finding: PASS. Only administrators can mutate the guidance text, and this does not expose new document access or upload capabilities.
- Evidence: The API checks `session.role === "ADMIN"` and the edit button is rendered only for admin sessions.

## Truthful Presentation Review
- Finding: PASS. The feature changes only explanatory copy for empty document cards.
- Evidence: Uploaded document counts, protected access labels, document opening, registration, and management controls remain unchanged.

## Design And Accessibility Review
- Finding: PASS with one browser limitation.
- Evidence: The edit action is a compact text button inside the existing empty panel, and the modal uses labeled inputs with the existing warm canvas, stone borders, and dark pill save action. Component and API tests cover rendering and persistence; browser automation was unavailable in this session.

## Outcome
- Result: PASS
- Required action: none

---

# UI Review

## Reviewed Change
- Feature: Add admin document metadata editing from the disclosure folder list.
- Governing spec: `DESIGN.md`, protected information-disclosure document workflow.
- Implementation plan: Reuse the existing admin-only document API and folder-list management column; add an edit modal for uploaded document metadata without changing file access.
- Files or pages reviewed: `src/components/disclosure/meetings-table.tsx`, `src/app/api/documents/[id]/route.ts`, `src/__tests__/disclosure-page.test.tsx`, `src/__tests__/document-upload-api.test.ts`, authenticated `/disclosure` document drawer.

## Boundary Review
- Finding: PASS. Editing is available only to administrators and only for real uploaded document records.
- Evidence: Mock rows do not render edit controls, the PATCH route still requires `ADMIN`, and the edit form updates metadata only.

## Truthful Presentation Review
- Finding: PASS. The UI does not imply file replacement or new public access.
- Evidence: The modal explicitly states that attachments remain unchanged, while title, description, folder classification, dates, and important status can be edited.

## Design And Accessibility Review
- Finding: PASS with one browser limitation.
- Evidence: The edit control uses a compact icon button in the existing management column, keeps visible focusable form controls with labels, and focused component/API tests cover the modal opening and PATCH contract. Browser automation was unavailable in this session.

## Outcome
- Result: PASS
- Required action: none

---

# UI Review

## Reviewed Change
- Feature: Add a real signup application input form inside the login-page signup panel.
- Governing spec: `docs/superpowers/specs/2026-05-28-daebang-auth-and-document-disclosure-design.md`.
- Implementation plan: Existing Google OAuth pending-approval flow, expanded with application fields stored on pending users.
- Files or pages reviewed: `src/app/login/login-client.tsx`, Google OAuth route handlers, `src/components/portal/portal-shell.tsx`, Prisma migration, focused tests.

## Boundary Review
- Finding: PASS. Signup input remains inside the login page and still routes through Google OAuth before pending approval.
- Evidence: The form submits to `/api/auth/google`; callback stores the input on `PENDING` user records and private access remains blocked until admin approval.

## Truthful Presentation Review
- Finding: PASS. The form describes approval waiting and does not imply immediate membership or document access.
- Evidence: The panel states Google verification, office/member-list review, and approval before access.

## Design And Accessibility Review
- Finding: PASS with one browser-tool limitation.
- Evidence: The signup panel uses existing soft-panel/card input styling, explicit labels for `신청자 이름`, `연락처`, and `전달 메모`, and focused tests confirm the fields appear after clicking `신규 가입 신청`. Callable browser automation was not exposed in this session.

## Outcome
- Result: PASS
- Required action: none

---

# UI Review

## Reviewed Change
- Feature: Keep disclosure registration-card preview height sized for three uploaded documents while top-aligning one-document previews.
- Governing spec: `DESIGN.md`, public `공개자료` authenticated preview presentation.
- Implementation plan: Remove vertical card distribution from the disclosure subcategory card and reserve a fixed preview panel height for registered documents.
- Files or pages reviewed: `src/components/disclosure/disclosure-client.tsx`, authenticated `/disclosure` card layout.

## Boundary Review
- Finding: PASS. This is a layout-only change and does not alter document access, upload, approval, or download behavior.
- Evidence: Document filtering, drawer opening, and protected upload controls remain unchanged.

## Truthful Presentation Review
- Finding: PASS. The preview still shows only matching uploaded documents and keeps the same latest-date and document-count semantics.
- Evidence: The registered document panel continues to render from `displayDocs` and the surrounding status labels are unchanged.

## Design And Accessibility Review
- Finding: PASS with one browser limitation.
- Evidence: The three-document visual footprint is preserved with a minimum preview height, while removing card-level `justify-between` prevents a single uploaded document from being pushed to the bottom. Browser automation was unavailable in this session, so verification is by code inspection and build checks.

## Outcome
- Result: PASS
- Required action: none

---

# UI Review

## Reviewed Change
- Feature: Remove the logged-out top-right login badge from the public header.
- Governing spec: `docs/superpowers/specs/2026-05-28-daebang-auth-and-document-disclosure-design.md`.
- Implementation plan: Existing login-scoped access presentation; no new product scope added.
- Files or pages reviewed: `src/components/landing/site-header.tsx`, `src/__tests__/site-header.test.tsx`.

## Boundary Review
- Finding: PASS. Public header auth CTAs are reduced, not expanded.
- Evidence: Logged-out top-right header no longer renders `가입 신청` or `조합원 로그인`; login access remains available through the hero, sitemap drawer, and mobile bottom navigation.

## Truthful Presentation Review
- Finding: PASS. The change avoids presenting login as a broad public-header conversion badge.
- Evidence: The remaining login surfaces are contextual to portal access and protected menu entry points.

## Design And Accessibility Review
- Finding: PASS with one browser-tool limitation.
- Evidence: Focused header tests confirm logged-out auth badges are absent from the public header and the sitemap drawer still exposes `조합원 로그인`. Local server response for `/` returned 200. Callable browser automation was not exposed in this session.

## Outcome
- Result: PASS
- Required action: none

---

# UI Review

## Reviewed Change
- Feature: Remove public signup badge and make login-page signup guidance expandable.
- Governing spec: `docs/superpowers/specs/2026-05-28-daebang-auth-and-document-disclosure-design.md`.
- Implementation plan: Existing Google OAuth pending-approval flow; signup remains inside the 조합원 로그인 context.
- Files or pages reviewed: `src/components/landing/site-header.tsx`, `src/app/login/login-client.tsx`, header and login focused tests.

## Boundary Review
- Finding: PASS. Signup is no longer presented as a public header conversion action.
- Evidence: Logged-out header and sitemap now expose only `조합원 로그인`; signup guidance appears inside `/login`.

## Truthful Presentation Review
- Finding: PASS. The login page presents signup as an approval-pending request, not immediate membership.
- Evidence: The expandable panel explains Google authentication, office/member-list review, and approval before private data access.

## Design And Accessibility Review
- Finding: PASS with one browser-tool limitation.
- Evidence: The signup entry uses an existing compact pill button inside a soft panel, with `aria-expanded` and visible focus styles. Focused tests passed. Local server responses confirmed `/` no longer contains `가입 신청` and `/login` contains the signup prompt. Callable browser automation was not exposed in this session.

## Outcome
- Result: PASS
- Required action: none

---

# UI Review

## Reviewed Change
- Feature: Add logged-out signup badges for Google OAuth registration testing.
- Governing spec: `docs/superpowers/specs/2026-05-28-daebang-auth-and-document-disclosure-design.md`.
- Implementation plan: Existing Google OAuth pending-approval flow; no separate public account form added.
- Files or pages reviewed: `src/components/landing/site-header.tsx`, `src/app/login/login-client.tsx`, related landing/header/login tests.

## Boundary Review
- Finding: PASS. The signup badges point to the existing Google OAuth entry route and create only approval-gated `PENDING` users.
- Evidence: The badges link to `/api/auth/google`; the OAuth callback continues to route new users to `/portal/pending` until administrator approval.

## Truthful Presentation Review
- Finding: PASS. The UI says `가입 신청` rather than implying immediate full membership.
- Evidence: The login page copy states that Google-account signup is received in approval-pending state.

## Design And Accessibility Review
- Finding: PASS with one browser-tool limitation.
- Evidence: The header uses the existing dark pill CTA style and the login page uses a compact dark pill inside an existing soft panel. Focused tests passed. Local server responses for `/` and `/login` include the signup badge text and `/api/auth/google` link. Callable browser automation was not exposed in this session.

## Outcome
- Result: PASS
- Required action: none

---

# UI Review

## Reviewed Change
- Feature: Fix login page hydration mismatch for Google OAuth error messages.
- Governing spec: `docs/superpowers/specs/2026-05-28-daebang-auth-and-document-disclosure-design.md`.
- Implementation plan: Existing auth/login presentation cleanup; no new product scope added.
- Files or pages reviewed: `src/app/login/page.tsx`, `src/app/login/login-client.tsx`, `src/__tests__/linked-pages.test.tsx`, `src/__tests__/portal-preview-pages.test.tsx`.

## Boundary Review
- Finding: PASS. The change only moves login error query handling to the server page wrapper and does not expose new authenticated data or actions.
- Evidence: `/login/page.tsx` reads `searchParams.error` server-side and passes a plain `googleError` prop to the client login UI.

## Truthful Presentation Review
- Finding: PASS. Missing Google OAuth configuration is presented as a setup/error state without creating a fake user session.
- Evidence: The visible message is still limited to OAuth setup guidance, and the fake `구글조합원 (가상)` login path remains removed.

## Design And Accessibility Review
- Finding: PASS with one browser-console verification limitation.
- Evidence: Focused tests cover the login page render path after the async server wrapper. Local server response for `/login?error=google_not_configured` returned 200, included `조합원 로그인` and the OAuth setup guidance, and did not include `구글조합원`. A callable in-app browser console tool was not exposed in this session, and Playwright was not installed in the REPL path, so runtime console capture could not be completed.

## Outcome
- Result: PASS
- Required action: none

---

# UI Review

## Reviewed Change
- Feature: Replace fake Google login with real Google OAuth profile capture.
- Governing spec: `docs/superpowers/specs/2026-05-28-daebang-auth-and-document-disclosure-design.md`.
- Implementation plan: Existing auth hardening and login-gated account workflow; no new public data surface added.
- Files or pages reviewed: `src/app/login/page.tsx`, `src/app/api/auth/google/route.ts`, `src/app/api/auth/google/callback/route.ts`, `src/lib/auth.ts`, `src/__tests__/google-auth.test.ts`.

## Boundary Review
- Finding: PASS. Google login now enters through OAuth and stores the authenticated profile only in user/session records.
- Evidence: Callback upserts by verified Google email, creates new users as `PENDING`, preserves the existing approval-gated flow, and redirects pending users to `/portal/pending`.

## Truthful Presentation Review
- Finding: PASS. The login button no longer implies a fake Google account login.
- Evidence: The old `googleMockLoginAction` with `google_member_preview@gmail.com` and `구글조합원 (가상)` was removed. Missing Google OAuth configuration shows an explicit setup message.

## Design And Accessibility Review
- Finding: PASS.
- Evidence: The Google button remains a visible link with the same pill styling. Browser check confirmed `/login?error=google_not_configured` shows configuration guidance, does not show `구글조합원 (가상)`, and has no horizontal overflow.

## Outcome
- Result: PASS
- Required action: none

---

# UI Review

## Reviewed Change
- Feature: Restore personal contribution payment details in the login announcement modal and main personal-library drawer.
- Governing spec: `docs/superpowers/specs/2026-05-25-daebang-housing-cooperative-portal-design.md`, section `납부와 미납 안내`.
- Implementation plan: `docs/superpowers/plans/2026-06-02-contribution-payment-api.md`.
- Files or pages reviewed: `src/app/page.tsx`, `src/components/landing/home-client.tsx`, `src/components/portal/portal-shell.tsx`, `src/components/portal/contribution-summary-mini.tsx`, landing and portal focused tests.

## Boundary Review
- Finding: PASS. Contribution summary data is still fetched only for the authenticated session user and shown only in logged-in modal/drawer surfaces.
- Evidence: `src/app/page.tsx` reads `ContributionSummary` and `PaymentNotice` by `session.id`; public navigation and logged-out landing sections are unchanged.

## Truthful Presentation Review
- Finding: PASS. The modal and drawer show approved/import-backed contribution values only when a `contributionSummary` exists.
- Evidence: `ContributionSummaryMini` returns `null` without contribution data. Existing empty-state portal copy remains for missing data.

## Design And Accessibility Review
- Finding: PASS with one browser limitation.
- Evidence: Focused tests confirm the login announcement shows `내 분담금 요약` and the main personal-library drawer shows `내 분담금 현황` with supplied payment values. Connected browser rendered the local page without horizontal overflow, but browser cookie injection was unavailable, so authenticated modal visualization was covered by component tests.

## Outcome
- Result: PASS
- Required action: none

---

# UI Review

## Reviewed Change
- Feature: Hide main hero entry CTA buttons for logged-in users.
- Governing spec: `docs/superpowers/specs/2026-05-26-daebang-role-specific-portal-preview-design.md`
- Implementation plan: Existing landing-page authenticated presentation cleanup; no new product scope added.
- Files or pages reviewed: `src/components/landing/hero-section.tsx`, `src/components/landing/home-client.tsx`, `src/__tests__/landing-page.test.tsx`, logged-in `/` on local dev server.

## Boundary Review
- Finding: PASS. The change removes login-oriented public CTA chrome after authentication and does not expose additional private features publicly.
- Evidence: Logged-in users still reach member/admin surfaces through existing authenticated header and portal surfaces; public navigation is unchanged.

## Truthful Presentation Review
- Finding: PASS. Logged-in users no longer see a stale `조합원 로그인` prompt in the hero.
- Evidence: The hero action group is conditional on `!isLoggedIn`; business information remains available through normal navigation and feature cards.

## Design And Accessibility Review
- Finding: PASS with one verification limitation.
- Evidence: Focused landing test confirms hero entry actions are hidden after login. Browser check at `http://localhost:3000/` confirmed logged-in hero text remains visible, `조합원 로그인` and `사업정보 보기` are absent from the hero, and there is no horizontal overflow at the checked desktop viewport. Mobile viewport resizing was not available through the connected browser backend in this session.

## Outcome
- Result: PASS
- Required action: none
