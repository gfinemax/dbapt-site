# 2026-08-26 Admin Operations Sidebar Implementation Plan

## Goal

Give authenticated administrators a role-specific, working navigation rail while preserving the existing member and refund service rail.

## Tasks

1. Split `PersonalLibraryNavigation` by role. Keep the current member/refund section controls unchanged and render administrator operations groups only for `ADMIN`.
2. Connect administrator in-page items to stable focus targets for dashboard, signup approvals, and the document management table. Apply the existing document-table category filter when a document category item is selected.
3. Link existing administrator routes for new document registration, PeopleOn member management, and security audit logs; link the existing notice and free-board administration surfaces.
4. Show only complete counts derived from current `documents` and `pendingUsers` props. Do not badge audit logs because the drawer receives only a recent subset. Add a working logout control using the existing auth action; omit an account shortcut because the drawer has no administrator account surface to target.
5. Add focused regression coverage for administrator labels, destinations, counts, section focus, filtering, and preservation of member navigation.
6. Run lint, full tests, build, desktop/mobile browser checks, and the required UI review.

## Boundaries

- Do not create new operational capabilities or routes.
- Do not expose administrator navigation publicly.
- Do not change access control or data mutation behavior.
- Do not alter the existing member/refund sidebar interaction contract.
