# UI Review

## Reviewed Change

- Feature: Post-login 안내 modal, matching right-side vertical badge style, and hidden page scrollbar
- Governing spec: Existing authenticated portal preview and repository UI rules in `AGENTS.md`
- Implementation plan: Not required for this narrow correction
- Files or pages reviewed: `/portal/admin`, `/`, `/business`, `src/app/globals.css`, `src/components/portal/portal-shell.tsx`, `src/components/landing/home-client.tsx`, `src/components/landing/site-header.tsx`, `src/__tests__/portal-shell.test.tsx`, `src/__tests__/landing-page.test.tsx`, `src/__tests__/site-header.test.tsx`

## Boundary Review

- Finding: The change does not alter public navigation, roles, permissions, redirects, or public document access.
- Evidence: The modal renders only when an authenticated `MEMBER`, `REFUND`, or `ADMIN` session is present on a non-drawer `PortalShell`. `/login` still redirects to the correct `/portal/*` route through the existing proxy behavior.

## Truthful Presentation Review

- Finding: The 안내 modal remains truthful for a login-gated portal surface.
- Evidence: It appears only after authentication and describes role-gated information disclosure and security audit logging already present in the portal flow. The primary action scrolls to the existing portal document section instead of exposing a new route or public action.

## Design And Accessibility Review

- Finding: The restored modal and side badge follow the existing warm canvas, stone border, rounded panel, and orange pill-button visual language.
- Evidence: Browser check on `/portal/admin` found `조합원 개인 자료실 등록 알림`, `자료실 열기`, and `오늘 하루 이 창 열지 않기` after clearing the dismissal flag and reloading an authenticated admin session. Browser check on `/` found the right-side badge with `rgb(255, 62, 0)` background, white text, zero-width borders, `12px` left-side radius with square right edge, and transparent zero-offset box-shadow layers. Browser check on `/business` confirmed `scrollbar-width: none`, no client-width loss from a visible scrollbar, and wheel scrolling still works.

## Outcome

- Result: PASS
- Required action: none
