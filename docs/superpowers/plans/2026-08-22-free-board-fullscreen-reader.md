# Free-Board Full-Screen Reader Implementation Plan

**Goal:** Give free-board posts the same wide, full-screen reading experience as notices.

**Architecture:** Keep `FreeBoard` selection, URL, public-share, mutation, and editor state unchanged. Replace only the focused-post side drawer with a responsive full-screen dialog, keep its header outside the scrolling region, and center read content in a 1200px canvas. Editing remains within the established 680px document column, and new-post writing remains a separate right drawer.

## Scope

- [x] Replace the focused-post left drawer with a full-screen responsive dialog.
- [x] Keep read content in a centered 1200px canvas and retain the 680px edit form.
- [x] Preserve close, URL, sharing, bookmark, edit, delete, attachment, comment, reply, and reaction behavior.
- [x] Update focused tests for the new geometry and accessibility semantics.
- [x] Run focused tests, lint, the full test suite, and a production build.
- [x] Complete desktop and mobile browser review and record the UI gate result.
