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
