# Disclosure Drawer Table Readability Implementation Plan

## Scope

Implement `docs/superpowers/specs/2026-07-10-disclosure-drawer-table-readability-design.md` across all public disclosure material-library folders without changing notices, the free board, data flows, permissions, or document actions.

## Task 1: Add focused regression coverage

Files:

- `src/__tests__/disclosure-page.test.tsx`

Steps:

1. Add long Korean title fixtures covering the meeting-minutes and correspondence folder paths that share `MeetingsTable`.
2. Assert that the desktop table exposes the intended role-aware minimum width.
3. Assert that the title node uses single-line truncation and no longer uses `break-all`.
4. Assert that the shared fix covers all material-library folder categories without folder-specific markup.
5. Assert that the mobile card list remains present and keeps its existing readable wrapping behavior.
6. Run the focused disclosure test and confirm the new assertions fail before implementation.

## Task 2: Stabilize the drawer table layout

Files:

- `src/components/disclosure/meetings-table.tsx`

Steps:

1. Retain `table-fixed` and the existing horizontal overflow wrapper.
2. Add member/admin minimum table widths sized for their visible column sets.
3. Set the title column to `252px` and compact the fixed widths and horizontal padding of date, deadline, view, reaction, bookmark, and admin columns.
4. Replace the desktop title container's `break-all` behavior with a `min-w-0`, single-line, truncated title contract shared by every material-library folder.
5. Widen the shared desktop drawer to `max-w-5xl` so the compact table fits without a bottom scrollbar at the intended desktop width.
6. Leave the mobile card renderer and every click/action handler unchanged.
7. Run the focused disclosure test and confirm it passes.

## Task 3: Review and verify

Steps:

1. Run `pnpm lint`.
2. Run `pnpm test`.
3. Run `pnpm build`.
4. Open the disclosure page in the Codex browser and inspect meeting-minutes and correspondence material-library drawers at desktop and mobile widths.
5. Verify the same behavior across all folder types, long titles, member/admin auxiliary columns, internal horizontal scrolling, and absence of page-level horizontal overflow.
6. Run the `dbapt-site-ui-review` gate and require `PASS`.
7. Record observed evidence in `_workspace/final/verification.md`.
