# Disclosure Document Bookmark Implementation Plan

**Goal:** Expose the existing per-user document bookmark capability on the public disclosure menu, so logged-in users can save real disclosure documents from both compact card lists and the folder document list into their personal library.

**Architecture:** Reuse `PersonalDocumentBookmark` and `/api/me/document-bookmarks`. Enrich disclosure page documents with the current user's bookmark flags, keep bookmark state in the disclosure page shell, and pass updated documents to the public disclosure UI and personal library drawer.

## Task 1: Disclosure Data Enrichment

- [x] Load the current user's `PersonalDocumentBookmark` rows for disclosure page documents.
- [x] Attach `isBookmarkedByCurrentUser` to serialized disclosure documents.
- [x] Keep document visibility and approval filtering unchanged.

## Task 2: Shared Bookmark Control

- [x] Extract a reusable document bookmark button around `/api/me/document-bookmarks`.
- [x] Preserve the existing personal library hub behavior.
- [x] Expose a callback so parent surfaces can synchronize document state.

## Task 3: Disclosure Surface Integration

- [x] Add the bookmark action to compact "등록 자료" rows.
- [x] Add the bookmark action to the "자료실 열기" list on desktop and mobile.
- [x] Prevent bookmark clicks from opening the PDF viewer or folder row.
- [x] Keep the action login-only and document-only.

## Task 4: Tests

- [x] Add disclosure tests proving bookmark controls appear in compact card rows.
- [x] Add disclosure tests proving bookmark controls appear in the folder list.
- [x] Add interaction tests for POST/DELETE calls and event isolation.
- [x] Keep unauthenticated surfaces free of mutation controls.

## Task 5: Review And Verification

- [x] Run focused disclosure and personal library tests.
- [x] Run `pnpm lint`.
- [x] Run `pnpm test`.
- [x] Run `pnpm build`.
- [x] Record UI review and verification evidence.
