# Spec Selection

## Selected Approved Spec

`docs/superpowers/specs/2026-06-14-contribution-dashboard-mvp-design.md`
`docs/superpowers/specs/2026-05-28-daebang-auth-and-document-disclosure-design.md`

## Implementation Boundary

This pass changes only the logged-in refund-member portal presentation in `src/components/portal/portal-shell.tsx`, login/signup presentation in `src/app/login/login-client.tsx`, the matching server-side auth action in `src/lib/auth.ts`, and phone/password validation utilities in `src/lib/signup-password.ts`. It adds ERP-sync guidance for refund/settlement/payment status, expands the refund status card to the full two-column portal grid width, removes demo test account information from the login page entirely, implements phone-number plus password signup requests as `PENDING` users for office approval, makes the signup entry switch to a dedicated signup screen without login destination route guidance, and adds a login-page account permission guide for 정식 조합원, 환불 조합원, and 관계자/기타 승인 계정. It does not add live ERP calls, browser-side ERP access, new data sources, public navigation, SMS phone verification, arbitrary email/login-ID signup, password reset, Kakao OAuth, or access-boundary changes.

## Conflicts

none

## May Planning Continue

yes
