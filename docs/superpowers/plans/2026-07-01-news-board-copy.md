# News Board Copy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add administrator-only copy actions between notices and free-board posts without moving source content or copying comments.

**Architecture:** Add one focused API route at `/api/news/board-copy` that validates administrator access, reads the source row, and creates the target row with conservative field mapping. Add small UI actions to the existing notice and free-board management controls and refresh the current board after success.

**Tech Stack:** Next.js App Router route handlers, Prisma, React, TypeScript, Testing Library, Vitest.

---

### Task 1: API Copy Route

**Files:**
- Create: `src/app/api/news/board-copy/route.ts`
- Test: `src/__tests__/news-board-copy-api.test.ts`

- [x] **Step 1: Write failing API coverage**

Cover admin-only access, notice-to-free copy, free-to-notice copy, missing source handling, and the rule that comments/reactions/bookmarks/open-chat data are not copied.

- [x] **Step 2: Verify red**

Run `pnpm exec vitest run src/__tests__/news-board-copy-api.test.ts` and confirm it fails because the route does not exist.

- [x] **Step 3: Implement route**

Create `POST /api/news/board-copy` with body `{ sourceType, sourceId }`. Allow `sourceType` values `COOP_NEWS` and `FREE_POST`. Reject unauthenticated and non-admin requests. Copy only approved scalar fields and use the current admin session id as target `authorId`.

- [x] **Step 4: Verify green**

Run `pnpm exec vitest run src/__tests__/news-board-copy-api.test.ts` and confirm it passes.

### Task 2: Admin UI Actions

**Files:**
- Modify: `src/components/news/notice-board.tsx`
- Modify: `src/components/news/free-board.tsx`
- Test: `src/__tests__/news-admin-controls.test.tsx`

- [x] **Step 1: Write failing UI coverage**

Cover administrator-visible copy controls on notice and free-board rows, hidden controls for non-admin users, fetch payloads, refresh calls, and confirm cancellation.

- [x] **Step 2: Verify red**

Run `pnpm exec vitest run src/__tests__/news-admin-controls.test.tsx -t "board copy"` and confirm it fails because the controls are missing.

- [x] **Step 3: Implement controls**

Add `자유게시판으로 복사` to notice management actions and `공지사항으로 복사` to free-board management actions. Use `confirm`, call `/api/news/board-copy`, alert on completion/failure, and call `onRefresh`.

- [x] **Step 4: Verify green**

Run the focused UI tests and confirm they pass.

### Task 3: Review And Verification

**Files:**
- Modify: `_workspace/00_input/request-summary.md`
- Modify: `_workspace/01_scope/spec-selection.md`
- Modify: `_workspace/04_review/ui-review.md`
- Modify: `_workspace/final/verification.md`

- [x] **Step 1: Record scope and UI review**

Record the approved copy-only scope and run the UI review gate.

- [x] **Step 2: Run required checks**

Run `pnpm lint`, `pnpm test`, and `pnpm build`.

- [x] **Step 3: Browser check**

Start or reuse a dev server and verify `/news?tab=free` desktop and mobile layouts do not introduce horizontal overflow.

