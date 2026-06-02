# Verification

## Implemented Fix

- Fixed the missing post-login 안내 modal by adding the same `조합원 개인 자료실 등록 알림` trigger to `PortalShell`.
- Root cause: authenticated `/login` requests redirect to `/portal/admin`, `/portal/member`, or `/portal/refund`, so the homepage-only modal in `HomeClient` was skipped after actual login.
- Included administrator sessions in the announcement target roles.
- Kept drawer-mode `PortalShell` excluded so opening the side drawer does not show a duplicate modal.
- Kept the existing `dbapt_announce_popup_dismissed_until` localStorage dismissal behavior.
- Applied the modal primary button color and corner shape to the right-side vertical `조합원 개인 자료실` badge: `bg-ember-orange`, white text, `rounded-l-[12px]`, `shadow-none`, and `hover:bg-[#e03700]`.
- Hid the main page scrollbar in `src/app/globals.css` using Firefox, Edge/IE, and WebKit scrollbar rules while keeping page scrolling functional.

## Changed Files

- `src/components/portal/portal-shell.tsx`
- `src/components/landing/home-client.tsx`
- `src/components/landing/site-header.tsx`
- `src/app/globals.css`
- `src/__tests__/portal-shell.test.tsx`
- `src/__tests__/landing-page.test.tsx`
- `src/__tests__/site-header.test.tsx`
- `_workspace/00_input/request-summary.md`
- `_workspace/01_scope/spec-selection.md`
- `_workspace/04_review/ui-review.md`
- `_workspace/final/verification.md`

## Checks Run

- Reproduced failure first: `pnpm test src/__tests__/portal-shell.test.tsx` failed before the fix because the portal page did not render `조합원 개인 자료실 등록 알림`.
- Focused test: `pnpm test src/__tests__/portal-shell.test.tsx` passed, 1 test.
- Focused test: `pnpm test src/__tests__/landing-page.test.tsx` passed, 9 tests.
- Related focused test: `pnpm test src/__tests__/portal-shell.test.tsx src/__tests__/landing-page.test.tsx src/__tests__/site-header.test.tsx src/__tests__/library-page.test.tsx` passed, 4 files and 15 tests.
- Focused test after badge restyle: `pnpm test src/__tests__/site-header.test.tsx` passed, 1 test.
- Focused regression tests after badge restyle: `pnpm test src/__tests__/portal-shell.test.tsx src/__tests__/landing-page.test.tsx` passed, 2 files and 10 tests.
- `pnpm lint`: pass with one existing warning in `src/components/portal/document-table.tsx`.
- `pnpm build`: pass.
- Browser verification: connected Chrome on `/portal/admin` found the restored 안내 modal after clearing `dbapt_announce_popup_dismissed_until`, with `조합원 개인 자료실 등록 알림`, `자료실 열기`, and `오늘 하루 이 창 열지 않기`.
- Browser verification: connected Chrome on `/` found the right-side badge with `rgb(255, 62, 0)` background, white text, zero-width borders, `12px` left-side radius with square right edge, and transparent zero-offset box-shadow layers.
- Browser verification: connected Chrome on `/business` found `scrollbar-width: none` on `html` and `body`; `innerWidth` equaled `clientWidth`, and wheel scrolling moved `scrollY` to about `900`.
- `pnpm test`: 8 files and 58 tests passed; 1 existing DB seed verification test failed because the current database has 2 documents and `src/__tests__/portal-auth-flow.test.tsx:71` expects at least 3.

## Browser Checks

- Dev server: `http://localhost:3000`
- Desktop logged-in check: connected Chrome opened `/portal/admin` with an authenticated admin session and verified the 안내 modal appears.

## Unresolved Risks Or Follow-Up Specs

- Full `pnpm test` remains blocked by the current seeded document count mismatch described above.
