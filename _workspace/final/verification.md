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
