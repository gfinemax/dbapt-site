# Verification

## Implemented Feature

- Reduced repeated `자료 대기` labels in the pending contribution dashboard.
- Changed null summary values to compact `대기` labels inside the four metric cards.
- Replaced the dominant black pending progress panel with a lower-emphasis parchment panel.
- Replaced the previous left/right split with a horizontal band layout.
- Changed pending payment stage hints to a responsive stage grid: 5 columns at 800px and 2 columns on mobile.
- Split long stage labels into readable title/detail lines while preserving full labels as accessible names.
- Left-aligned the payment stage heading and description to prevent broken heading text and awkward right-aligned copy.
- Restored direct portal document viewing by giving `PortalShell` its own PDF viewer state when no external document opener is supplied.
- Changed successful document bookmarking to switch into `내 보관함` immediately.
- Changed the PDF viewer to open in full viewport mode by default, with `화면 축소` as the initial toggle action.
- Shortened the empty recent ledger copy.
- Made the summary metric grid render as 2x2 on mobile and 4 columns on wide screens.

## Changed File Summary

- UI: `src/components/portal/contribution-dashboard.tsx`
- Tests: `src/__tests__/contribution-dashboard-component.test.tsx`
- Harness notes: `_workspace/00_input/request-summary.md`, `_workspace/01_scope/spec-selection.md`, `_workspace/04_review/ui-review.md`, `_workspace/final/verification.md`

## Checks Run

- `pnpm test -- src/__tests__/contribution-dashboard-component.test.tsx`: PASS, 1 file / 4 tests.
- `pnpm test -- src/__tests__/contribution-dashboard-component.test.tsx src/__tests__/contribution-dashboard.test.ts src/__tests__/portal-shell.test.tsx src/__tests__/personal-library-drawer-host.test.tsx`: PASS, 4 files / 11 tests.
- `pnpm test -- src/__tests__/portal-shell.test.tsx src/__tests__/personal-document-hub.test.tsx`: PASS, 2 files / 9 tests.
- `pnpm test -- src/__tests__/portal-shell.test.tsx src/__tests__/personal-document-hub.test.tsx src/__tests__/personal-document-bookmarks-api.test.ts src/__tests__/personal-library-drawer-host.test.tsx src/__tests__/pdf-viewer-modal.test.tsx src/__tests__/document-merged-view-api.test.ts`: PASS, 6 files / 19 tests.
- `pnpm test -- src/__tests__/pdf-viewer-modal.test.tsx`: PASS, 1 file / 6 tests.
- `pnpm test -- src/__tests__/portal-shell.test.tsx src/__tests__/personal-library-drawer-host.test.tsx src/__tests__/pdf-viewer-modal.test.tsx`: PASS, 3 files / 13 tests.
- `pnpm lint`: PASS.
- `pnpm test`: PASS, 33 files / 189 tests. jsdom printed expected `Window's scrollTo()` not implemented notices.
- `pnpm build`: PASS.

## Browser Checks

- In-app Browser `iab` was unavailable and the connected Chrome extension could not create a controllable tab, so Chrome headless CDP was used.
- `/portal/member` 800x900 with a synthetic member session:
  - dashboard rendered
  - exact `자료 대기` labels reduced to 1
  - lower-emphasis progress panel rendered full-width inside the dashboard
  - stage grid used 5 columns in 1 row
  - visible stage labels rendered as number, title, and optional detail without duplicated hidden copy
  - no horizontal overflow: `scrollWidth=800`, `clientWidth=800`
- `/portal/member` mobile 390x844 with a synthetic member session:
  - dashboard rendered
  - exact `자료 대기` labels reduced to 1
  - stage grid used 2 columns and wrapped into 3 rows
  - visible stage labels rendered as number, title, and optional detail without duplicated hidden copy
  - progress panel background was parchment: `rgb(248, 247, 244)`
  - no horizontal overflow: `scrollWidth=390`, `clientWidth=390`
- `/portal/member` desktop 1000x900 with a synthetic member session:
  - clicking the first `열람` button created `data-testid="pdf-viewer-panel"`
  - viewer iframe source was `/api/documents/<id>/view`
  - no horizontal overflow: `scrollWidth=1000`, `clientWidth=1000`
- `/portal/member` desktop 1200x900 with a synthetic member session:
  - clicking `열람` opened the viewer panel at `w-[95vw]` and `h-[95vh]`
  - measured panel size: `1140x855`
  - initial viewer toggle button was `화면 축소`
  - no horizontal overflow: `scrollWidth=1200`, `clientWidth=1200`

## Unresolved Risks Or Follow-Up Specs

- none
