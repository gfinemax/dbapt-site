# Notice Full-Screen Reader Implementation Plan

**Goal:** Use the viewport for notice reading instead of constraining long documents and evidence images to a left-side drawer.

**Architecture:** Keep the existing notice selection, deep-link, scroll-lock, editing, and action state in place. Replace only the notice-detail shells with full-screen responsive dialog layers, keep the header outside the scrolling region, and center read content in a 1200px maximum-width canvas. Editing retains the established 680px form width.

## Scope

- [x] Replace the `NewsClient` notice drawer with a full-screen responsive dialog.
- [x] Apply the same reader geometry to the standalone `NoticeBoard` fallback.
- [x] Preserve close, share, edit, delete, attachment, comment, and shared-link behavior.
- [x] Update focused tests to assert full-screen geometry and the 1200px reading canvas.
- [x] Run focused tests, lint, the full test suite, and a production build.
- [x] Complete desktop and mobile browser review and record the UI gate result.
