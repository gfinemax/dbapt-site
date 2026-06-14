# Personal Library Curated Documents Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the member/refund personal library full public document table with a curated recommendation queue plus persistent personal document stash.

**Architecture:** Keep `DocumentTable` as the full table for admin and general document browsing. Add `PersonalDocumentHub` for member/refund personal library surfaces, using per-document metadata loaded by `loadPersonalLibraryData`. Add a Prisma bookmark join table and a small authenticated API route to toggle saved documents.

**Tech Stack:** Next.js App Router, React, TypeScript, Prisma, Vitest, Testing Library, Tailwind CSS.

---

### Task 1: Bookmark Data Model

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `prisma/migrations/20260614093000_add_personal_document_bookmarks/migration.sql`

- [ ] Add `PersonalDocumentBookmark` with unique `(userId, documentId)` and user/document relations.
- [ ] Keep the table scoped to personal saved state only.

### Task 2: Personal Library Data Enrichment

**Files:**
- Modify: `src/components/portal/document-table.tsx`
- Modify: `src/lib/personal-library-data.ts`
- Modify: `src/lib/document-serializer.ts`

- [ ] Extend `Document` view data with optional `isViewedByCurrentUser` and `isBookmarkedByCurrentUser`.
- [ ] Load current user's view/download logs and bookmarks.
- [ ] Attach flags to serialized documents for non-admin personal library rendering.

### Task 3: Bookmark API

**Files:**
- Create: `src/app/api/me/document-bookmarks/route.ts`
- Test: `src/__tests__/personal-document-bookmarks-api.test.ts`

- [ ] Write failing tests proving authenticated POST creates a bookmark and DELETE removes it.
- [ ] Implement the route with `getSession()` and Prisma.
- [ ] Keep users from mutating another user's bookmark by deriving `userId` only from session.

### Task 4: Curated Document Hub

**Files:**
- Create: `src/components/portal/personal-document-hub.tsx`
- Modify: `src/components/portal/portal-shell.tsx`
- Test: `src/__tests__/personal-document-hub.test.tsx`

- [ ] Write failing tests for recommendation filtering and saved documents.
- [ ] Implement `PersonalDocumentHub` with tabs, counts, cards, and bookmark actions.
- [ ] Use `PersonalDocumentHub` for member/refund logged-in personal library documents.
- [ ] Keep admin on the existing `DocumentTable`.

### Task 5: Review And Verification

**Files:**
- Modify: `_workspace/00_input/request-summary.md`
- Modify: `_workspace/01_scope/spec-selection.md`
- Modify: `_workspace/04_review/ui-review.md`
- Create/modify: `_workspace/final/verification.md`

- [ ] Run focused tests.
- [ ] Run `pnpm lint`.
- [ ] Run `pnpm test`.
- [ ] Run `pnpm build`.
- [ ] Run UI review and record PASS/FIX/ESCALATE.
