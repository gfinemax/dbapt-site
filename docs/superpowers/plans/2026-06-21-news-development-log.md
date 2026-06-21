# News Development Log Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a single `개발일지` tab under `조합소식` where commit-like update records can be auto-drafted, reviewed by admins, and published as public development logs.

**Architecture:** Reuse the existing `CoopNews` table and news API patterns instead of adding a new database model. Published logs use category `DEVELOPMENT_LOG`; admin-only drafts and hidden logs use `DEVELOPMENT_LOG_DRAFT` and `DEVELOPMENT_LOG_HIDDEN`. Deterministic draft formatting and category filtering live in small helpers under `src/lib/news/*`, while the UI stays in a focused `DevelopmentLog` component.

**Tech Stack:** Next.js App Router, React, TypeScript, Prisma, Tailwind CSS, Vitest, Testing Library.

---

### Task 1: Data Helpers

**Files:**
- Create: `src/lib/news/development-log.ts`
- Test: `src/__tests__/news-development-log.test.ts`

- [ ] **Step 1: Write failing tests for development-log classification and draft format.**
- [ ] **Step 2: Run `pnpm vitest run src/__tests__/news-development-log.test.ts` and confirm RED.**
- [ ] **Step 3: Implement category constants, version generation, filtering, status labels, and draft formatting.**
- [ ] **Step 4: Re-run the focused helper test and confirm GREEN.**

### Task 2: Server API

**Files:**
- Create: `src/app/api/news/development-log/draft/route.ts`
- Modify: `src/app/api/news/route.ts`

- [ ] **Step 1: Add an admin-only draft endpoint that creates a `DEVELOPMENT_LOG_DRAFT` CoopNews record using recent git commits when available.**
- [ ] **Step 2: Allow existing news PATCH requests to move development logs between draft, published, and hidden categories.**
- [ ] **Step 3: Keep public GET behavior compatible with existing categories.**

### Task 3: UI Tab

**Files:**
- Create: `src/components/news/development-log.tsx`
- Modify: `src/components/news/news-client.tsx`
- Modify: `src/app/news/page.tsx`
- Modify: `src/content/landing.ts`
- Modify: `src/content/site-search.ts`

- [ ] **Step 1: Add `development` as a valid news tab and route query value.**
- [ ] **Step 2: Render published logs for everyone and draft/hidden logs only for admins.**
- [ ] **Step 3: Add admin controls for auto-draft generation, publish, hide, and delete.**
- [ ] **Step 4: Add connected navigation/search labels for `조합소식 > 개발일지`.**

### Task 4: Verification And Review

**Files:**
- Modify: `_workspace/00_input/request-summary.md`
- Modify: `_workspace/01_scope/spec-selection.md`
- Modify: `_workspace/04_review/ui-review.md`
- Modify: `_workspace/final/verification.md`

- [ ] **Step 1: Run focused tests for news development log behavior.**
- [ ] **Step 2: Run `pnpm lint`, `pnpm test`, and `pnpm build`.**
- [ ] **Step 3: Browser-check `/news?tab=development` as public and record a UI review PASS/FIX/ESCALATE.**
