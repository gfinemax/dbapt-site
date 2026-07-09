# Notice List Accumulation Readability Implementation Plan

**Goal:** Improve the notice-board list as notices accumulate by reducing always-visible admin controls, giving mobile users a readable card list, and keeping title/date/count metadata scannable.

**Architecture:** Keep the existing `NoticeBoard` data flow, routes, APIs, permissions, detail modal, bookmark behavior, reactions, OpenChat copy behavior, and board-copy behavior. Change only the notice list presentation and component tests.

**Scope:**
- Collapse administrator row actions behind a compact per-row management menu.
- Render a mobile-only notice card list instead of forcing the table as the primary mobile reading surface.
- Preserve the desktop table and current sorted data.
- Keep important notice semantics and existing badges, but reduce repeated visual clutter.

**Explicitly Excluded:**
- No API, route, permission, schema, comment, reaction, bookmark, copy-tool, public-share, or detail-view behavior changes.
- No free-board redesign in this slice.
- No pagination/filtering implementation in this slice.

## Tasks

- [x] Add focused tests for collapsed admin actions and mobile card markup.
- [x] Update `NoticeBoard` desktop admin column to show one management menu button per row.
- [x] Add mobile notice cards with title, badges, date, author, view count, empathy, bookmark, and admin menu.
- [x] Verify with focused tests, full validation, and desktop/mobile browser checks.
