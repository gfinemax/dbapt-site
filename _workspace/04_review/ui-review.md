# UI Review

## Reviewed Change

- Feature: Add ERP-sync guidance to the logged-in refund-member refund/settlement/payment card, expand that card to the full portal grid width, remove demo test account information from the login page, replace new-member signup with a dedicated phone-number/password approval request screen, remove login destination route guidance, and add account permission guidance to the login page
- Governing spec: `docs/superpowers/specs/2026-06-14-contribution-dashboard-mvp-design.md`, `docs/superpowers/specs/2026-05-28-daebang-auth-and-document-disclosure-design.md`
- Implementation plan: small approved logged-in portal presentation fix; no separate plan file
- Files or pages reviewed:
  - `src/components/portal/portal-shell.tsx`
  - `src/app/login/login-client.tsx`
  - `src/lib/auth.ts`
  - `src/lib/signup-password.ts`
  - `src/__tests__/portal-shell.test.tsx`
  - `src/__tests__/portal-preview-pages.test.tsx`
  - `src/__tests__/phone-signup-auth.test.ts`
  - `/login`
  - `/portal/refund`

## Boundary Review

- Finding: PASS
- Evidence: The change stays inside the authenticated refund-member portal, the login/signup page, and pending-user auth creation. Public navigation, member/admin surfaces, document access, and authorization gates are unchanged. The new login-page permission guide explains existing role-based access categories without exposing admin destination details or changing routing.

## Truthful Presentation Review

- Finding: PASS
- Evidence: The new copy states that refund-member refund/settlement/payment status will be reflected after ERP program integration. It does not claim a live ERP connection, does not add browser-side ERP calls, and preserves existing approved values when they are supplied by the server. The login/signup page no longer displays demo credential strings, test-account access, or login destination route guidance. The permission guide states that 관계자/기타 승인 계정 can only view materials within the office-approved range. Signup requests are created as `PENDING` users and do not grant protected access until office approval.

## Design And Accessibility Review

- Finding: PASS
- Evidence: The card keeps the existing stone-card and parchment-card visual language, uses the full `md:grid-cols-2` portal width via `md:col-span-2`, and introduces no new motion. Removing the demo credential and route-guidance panels reduces login-page clutter. The account permission guide reuses the existing soft-panel and inset white-card treatment. The dedicated signup screen uses ordinary labeled inputs for name, phone, password, password confirmation, and memo, with a clear return-to-login button. The password rules are visible in the signup screen and enforced server-side, including phone-number, date-like birthdate, repeated-character, and sequential-number rejection.

## Outcome

- Result: PASS
- Required action: none
