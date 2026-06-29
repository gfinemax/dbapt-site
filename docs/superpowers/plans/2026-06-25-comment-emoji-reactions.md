# Comment Emoji Reactions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add emoji reactions to every comment and reply surface in 조합소식: 공지사항, 자유게시판, 조합뉴스, and 개발일지.

**Architecture:** Store reactions in one `CommentReaction` table with optional foreign keys to `CoopNewsComment` and `FreeComment` so deletes cascade correctly. Expose a common toggle API that validates the target comment, then returns the updated reaction summary for that comment. Render a shared reaction bar under every comment and reply, with quick emoji chips and an emoji picker modal.

**Tech Stack:** Next.js App Router route handlers, Prisma/PostgreSQL, TypeScript, React client components, Vitest/Testing Library.

---

### Task 1: Data Model And API

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `prisma/migrations/<timestamp>_add_comment_reactions/migration.sql`
- Create: `src/lib/news/comment-reactions.ts`
- Create: `src/app/api/news/comment-reactions/route.ts`
- Test: `src/__tests__/comment-reactions-api.test.ts`

- [ ] Add `CommentReaction` with `emoji`, `userId`, optional `coopNewsCommentId`, optional `freeCommentId`, timestamps, cascade relations, and unique constraints per user/comment target.
- [ ] Add API tests for login requirement, invalid emoji rejection, unknown target rejection, create reaction, remove same emoji, and replace different emoji.
- [ ] Implement helpers to validate supported emoji and summarize counts as `{ emoji, count, selectedByCurrentUser }`.
- [ ] Implement `POST /api/news/comment-reactions` with body `{ targetType, targetId, emoji }`.

### Task 2: Server Data Mapping

**Files:**
- Modify: `src/lib/news/types.ts`
- Modify: `src/app/news/page.tsx`
- Modify: `src/app/api/news/route.ts`
- Modify: `src/app/api/news/free/route.ts`
- Modify: `src/app/api/news/comments/route.ts`
- Test: `src/__tests__/news-admin-controls.test.tsx`

- [ ] Extend `NewsCommentView` with `reactionSummary`.
- [ ] Include reactions and reacting user IDs when loading `CoopNewsComment` and `FreeComment`.
- [ ] Map loaded reactions to summaries using the current session ID.
- [ ] Ensure newly created comments return an empty `reactionSummary`.

### Task 3: Shared Reaction UI

**Files:**
- Create: `src/components/news/comment-reaction-bar.tsx`
- Modify: `src/components/news/news-client.tsx`
- Modify: `src/components/news/free-board.tsx`
- Modify: `src/components/news/development-log.tsx`
- Test: `src/__tests__/news-admin-controls.test.tsx`
- Test: `src/__tests__/news-development-log-component.test.tsx`

- [ ] Add quick emoji chips and a `+` button.
- [ ] Add an accessible emoji picker dialog with search, recent section, and basic emoji grid.
- [ ] Optimistically update local comment state after the API returns the updated summary.
- [ ] Render the reaction bar below every top-level comment and reply in notice/news, free-board, and development-log surfaces.

### Task 4: Review And Verification

**Files:**
- Modify: `_workspace/00_input/request-summary.md`
- Modify: `_workspace/01_scope/spec-selection.md`
- Modify: `_workspace/04_review/ui-review.md`
- Modify: `_workspace/final/verification.md`

- [ ] Record the approved scope and UI review.
- [ ] Run focused reaction tests.
- [ ] Run `pnpm prisma generate` after schema changes.
- [ ] Run `pnpm lint`, `pnpm build`, and `pnpm test`.
