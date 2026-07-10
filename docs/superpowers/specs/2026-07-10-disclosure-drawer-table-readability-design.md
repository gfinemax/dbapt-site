# Disclosure Drawer Table Readability Design

## Status

Approved by the user's narrowed request on 2026-07-10.

## Goal

Keep document titles readable inside every public disclosure material-library drawer instead of allowing the title column to collapse into one-character vertical wrapping.

## Approved Scope

- Apply the change to every document list rendered inside disclosure material-library drawers through the shared `MeetingsTable` component.
- Cover general assembly minutes, board minutes, delegate minutes, incoming correspondence, outgoing/reply correspondence, and other correspondence folders.
- Give the desktop/tablet table a role-aware minimum width that preserves a practical title column.
- Keep the table horizontally scrollable when the drawer viewport is narrower than that minimum width.
- Render list titles on one line with truncation instead of `break-all` character wrapping.
- Widen the desktop drawer and compact auxiliary columns so the full administrator table fits without a bottom scrollbar at the intended desktop width.
- Keep the title column at `252px`, approximately one third narrower than the previously protected administrator title space.
- Preserve the existing mobile card list below the `md` breakpoint.

## Out Of Scope

- Notice and free-board lists.
- Routes, APIs, database schema, permissions, or access boundaries.
- Document mutations, viewing, reactions, bookmarks, or open-chat copy behavior.
- Disclosure surfaces outside these material-library drawers, including cards and document detail/view surfaces.

## Acceptance Criteria

- A long Korean document title does not render one character per line in any desktop/tablet material-library drawer table.
- The same layout contract applies to all six material-library folder types through the shared renderer.
- The title column retains usable width for both member and administrator column sets.
- The desktop drawer uses `max-w-5xl`, compact `8px` horizontal cell padding, and a `728px` administrator table contract.
- Narrow drawer widths use internal horizontal overflow without expanding the page canvas.
- Mobile continues to use the existing card list.
- Focused disclosure tests cover the minimum-width and title-truncation contract.
- Required lint, test, build, desktop browser, and mobile browser checks are completed before readiness is reported.
