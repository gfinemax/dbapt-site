# Personal Content Bookmarks Implementation Plan

**Goal:** Let logged-in users save notice, cooperative newsletter, and free-board posts into the existing personal library drawer.

**Architecture:** Add a per-user `PersonalContentBookmark` table keyed by target type and target id. Keep the existing document bookmark flow unchanged. Load saved content through `loadPersonalLibraryData`, mark news/free-board list items with the current user's saved state, and render a separate "보관한 게시글" tab in `PersonalDocumentHub`.

**Tasks**

- [x] Add focused tests for content bookmark API create/delete behavior.
- [x] Add focused tests for loading saved coop news and free-board posts into personal library data.
- [x] Add focused tests for showing saved content inside the personal library drawer.
- [x] Add UI tests proving notice, newsletter, and free-board bookmark buttons call the authenticated API.
- [x] Add `PersonalContentBookmark` Prisma model and migration.
- [x] Add `/api/me/content-bookmarks` route using only the current session user id.
- [x] Add shared news bookmark button and wire it into notice, newsletter, and free-board surfaces.
- [x] Add saved content tab to the personal library hub.
- [x] Run repository validation and UI review.
