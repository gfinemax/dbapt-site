# Free Board List And Rich Editor Plan

> **For agentic workers:** Execute with TDD. Keep the free-board scope login-gated and do not expand disclosure, accounting, voting, or messaging features.

**Goal:** Make the free board read like the notice board list, make post authoring support direct body-image insertion inside the editor, move selected discussions into a focused left-side panel, and support YouTube-style one-level replies inside focused discussions.

**Architecture:** Reuse the existing notice rich editor/sanitized renderer for free-board body HTML. Keep `/api/news/free` as the post/comment API. Add nullable `FreeComment.parentId` for one-level reply threading and normalize replies to replies under the top-level parent. Broaden `/api/upload` only for authenticated body-image uploads while keeping attachments admin-only.

## Tasks

- [x] Add regression tests for member body-image upload permission and admin-only attachment upload.
- [x] Add regression tests for a notice-style free-board table and editor body-image insertion.
- [x] Add regression tests for opening a free-board item in a left focus panel and syncing the selected post to the URL.
- [x] Add regression tests for free-board comment replies, parent-post validation, and one-level reply rendering/submission.
- [x] Replace free-board card feed with a notice-style table/list.
- [x] Replace inline detail expansion with a left-side focus panel for post body, comments, and comment input.
- [x] Keep `post` URL query state in sync when opening/closing the focus panel.
- [x] Add `FreeComment.parentId` persistence and API validation for reply creation.
- [x] Render free-board replies under top-level comments with collapsed `답글 N개 보기` controls and inline reply input.
- [x] Replace free-board write textarea with the shared rich body editor.
- [x] Render free-board post bodies with the sanitized rich-content renderer and use plain text for search/list previews.
- [x] Update workspace review and verification records.
- [x] Run final `pnpm lint`, `pnpm test`, `pnpm build`, and `/news` runtime check.
