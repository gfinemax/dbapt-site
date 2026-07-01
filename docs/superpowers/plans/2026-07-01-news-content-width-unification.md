# News Content Width Unification Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Align notice and free-board article writing and reading widths around one shared article content canvas.

**Architecture:** Add a small shared layout constant module for news article shell and content widths, then wire existing notice and free-board surfaces to those constants. Keep existing drawers, modals, permissions, and rich-editor behavior intact.

**Tech Stack:** Next.js App Router, TypeScript, Tailwind CSS, Vitest, Testing Library.

---

### Task 1: Lock The Width Contract In Tests

**Files:**
- Modify: `src/__tests__/news-admin-controls.test.tsx`

- [ ] **Step 1: Update notice detail and notice write assertions**

Assert that the public notice detail drawer, notice detail body, and notice write drawer use the shared shell/content width classes.

- [ ] **Step 2: Update free-board read and write assertions**

Change existing free-board expectations from `max-w-[920px]` and `max-w-[820px]` to `max-w-[860px]` and `max-w-[760px]`.

- [ ] **Step 3: Verify RED**

Run: `pnpm exec vitest run src/__tests__/news-admin-controls.test.tsx -t "width|focus panel|fixed-width|notice detail drawer|selected notice display author"`

Expected: FAIL because current components still use the old width classes and do not expose all requested content-width containers.

### Task 2: Add Shared News Layout Width Constants

**Files:**
- Create: `src/lib/news/content-layout.ts`

- [ ] **Step 1: Add constants**

Create constants for `NEWS_ARTICLE_SHELL_MAX_WIDTH_CLASS`, `NEWS_ARTICLE_SHELL_MAX_WIDTH_STYLE`, and `NEWS_ARTICLE_CONTENT_MAX_WIDTH_CLASS`.

- [ ] **Step 2: Use static Tailwind class strings**

Keep literal `max-w-[860px]` and `max-w-[760px]` strings in the file so Tailwind can scan them.

### Task 3: Apply Widths To Notice Surfaces

**Files:**
- Modify: `src/components/news/news-client.tsx`
- Modify: `src/components/news/notice-board.tsx`

- [ ] **Step 1: Public notice detail drawer**

Replace the detail drawer shell width with the shared shell width and wrap read/edit content with a shared content-width container.

- [ ] **Step 2: NoticeBoard read modal**

Replace the legacy `max-w-xl` modal width with the shared shell width and apply the shared content-width container to the scrollable article area.

- [ ] **Step 3: NoticeBoard new notice drawer**

Replace the legacy `max-w-lg` drawer width with the shared shell width and apply the shared content-width container to the form.

### Task 4: Apply Widths To Free-Board Surfaces

**Files:**
- Modify: `src/components/news/free-board.tsx`

- [ ] **Step 1: Free-board focused read panel**

Reduce the focus panel shell from `max-w-[920px]` to the shared shell width and reduce the focused article document from `max-w-[820px]` to the shared content width.

- [ ] **Step 2: Free-board create/edit modal**

Reduce the modal shell from `max-w-[920px]` to the shared shell width and reduce the body/footer content columns from `max-w-[820px]` to the shared content width.

### Task 5: Verify And Review

**Files:**
- Modify: `_workspace/04_review/ui-review.md`
- Modify: `_workspace/final/verification.md`

- [ ] **Step 1: Run focused tests**

Run: `pnpm exec vitest run src/__tests__/news-admin-controls.test.tsx -t "width|focus panel|fixed-width|notice detail drawer|selected notice display author"`

- [ ] **Step 2: Run required checks**

Run: `pnpm lint`, `pnpm test`, and `pnpm build`.

- [ ] **Step 3: Browser verification**

Run the local app and verify `/news?tab=free` on desktop and mobile has no horizontal overflow.

- [ ] **Step 4: UI review**

Record a PASS review if the implementation changes only layout width and does not alter access boundaries or truthful presentation.
