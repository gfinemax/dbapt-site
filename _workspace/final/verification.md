# Verification

## Implemented Feature

- Updated `src/components/portal/portal-shell.tsx` so the logged-in refund-member status card spans the full portal grid width.
- Added a truthful ERP-sync guidance panel: refund-member refund/settlement and payment status will be reflected in the member's own screen after ERP program integration.
- Kept existing approved refund/payment values visible when supplied by the server.
- Added `src/__tests__/portal-shell.test.tsx` coverage for the full-width refund card and ERP guidance copy.
- Updated `src/app/login/login-client.tsx` so demo test account information is no longer rendered on the login page.
- Added `src/__tests__/portal-preview-pages.test.tsx` coverage to ensure demo credential strings remain hidden even if `NEXT_PUBLIC_SHOW_DEMO_CREDENTIALS=true`.
- Replaced the Google-based signup request UI with a phone-number and password application form.
- Added `signupWithPhonePasswordAction` in `src/lib/auth.ts` to create `PENDING` users with normalized phone login IDs and hashed passwords.
- Added password validation for 8+ characters, letters plus numbers, optional special characters, and blocked phone-number, date-like birthdate, repeated-character, and sequential-number patterns.
- Updated office approval logic so existing phone login IDs are preserved when pending users are approved.
- Added `src/__tests__/phone-signup-auth.test.ts` coverage for password rules, pending phone signup creation, password hashing, and approval preserving phone login IDs.
- Removed the admin-account destination helper text from the login page route guidance.
- Changed `신규 가입 신청` so it opens a dedicated signup screen instead of expanding inside the member login screen.
- Removed the login destination route guidance card from the login/signup page.
- Added a login-page account permission guide for 정식 조합원, 환불 조합원, and 관계자/기타 승인 계정 access differences.

## Checks Run

- `pnpm test -- src/__tests__/portal-shell.test.tsx`: PASS, 1 file / 6 tests
- `pnpm test -- src/__tests__/portal-preview-pages.test.tsx`: PASS, 1 file / 6 tests
- `pnpm test -- src/__tests__/phone-signup-auth.test.ts`: PASS, 1 file / 3 tests
- `pnpm test -- src/__tests__/phone-signup-auth.test.ts src/__tests__/portal-preview-pages.test.tsx src/__tests__/portal-shell.test.tsx`: PASS, 3 files / 15 tests
- `pnpm test -- src/__tests__/portal-preview-pages.test.tsx`: PASS, 1 file / 6 tests
- `pnpm test -- src/__tests__/about-client.test.tsx src/__tests__/landing-page.test.tsx src/__tests__/library-page.test.tsx src/__tests__/portal-shell.test.tsx`: PASS, 4 files / 34 tests
- `pnpm test -- src/__tests__/disclosure-page.test.tsx src/__tests__/news-admin-controls.test.tsx`: PASS, 2 files / 65 tests
- `pnpm lint`: PASS
- `pnpm test`: PASS, 35 files / 209 tests
- `pnpm build`: PASS
- `Invoke-WebRequest -UseBasicParsing http://127.0.0.1:3000/login`: PASS, 200 OK; phone-or-member-ID login copy present; signup entry point present; demo credential heading absent

## Browser Checks

- Codex in-app Browser capability was not exposed in this session. Tool discovery exposed Node REPL instead.
- Playwright import was available, but browser launch was blocked because the local Chromium executable was not installed under the Playwright cache.
- Fallback component-test, production build, and HTTP verification completed for the rendered refund-member portal card and login page, including the `md:col-span-2` full-width layout class, ERP guidance copy, phone-password signup UI coverage, account permission guidance, demo credential removal, and route-guidance removal.

## Unresolved Risks Or Follow-Up Specs

- none
