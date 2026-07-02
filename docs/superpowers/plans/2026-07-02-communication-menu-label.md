# Communication Menu Label Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans if this plan is implemented in a separate session. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rename the public-facing `조합소식` section label to `소통마당` wherever it appears in user-visible copy, while keeping existing `/news` routes and internal identifiers stable.

**Architecture:** Treat this as a copy-only public UI and notification language update. Do not rename routes, APIs, database models, or `news` implementation identifiers.

**Tech Stack:** Next.js App Router, TypeScript, Tailwind CSS, Vitest.

---

### Task 1: Update Public Navigation And Connected Copy

**Files:**
- Modify: `src/content/landing.ts`
- Modify: `src/content/site-search.ts`
- Modify: `src/content/library.ts`
- Modify: `src/content/issues.ts`
- Modify: `src/components/landing/notices-section.tsx`
- Modify: `src/components/library/library-client.tsx`
- Modify: `src/app/search/page.tsx`
- Modify: `src/app/issues/page.tsx`
- Modify: `src/app/terms/page.tsx`
- Modify: `docs/operations/user-manual.md`

- [x] Replace public-facing `조합소식` section labels with `소통마당`.
- [x] Keep `/news`, `/api/news`, and internal `news` names unchanged.
- [x] Preserve board/tab labels such as `공지사항`, `조합뉴스`, `개발일지`, `자유게시판`, and `FAQ`.

### Task 2: Update Operational Notification Copy

**Files:**
- Modify: `src/lib/notifications/openchat-announcements.ts`
- Modify: `src/app/api/openchat/announcements/route.ts`
- Modify: `src/app/api/news/route.ts`
- Modify: `src/lib/news/development-log.ts`
- Modify: `src/components/news/coop-newsletter.tsx`

- [x] Rename open-chat announcement header from `조합소식 안내` to `소통마당 안내`.
- [x] Rename generic API/operator-facing error text from `조합소식` to `소통마당 글`.
- [x] Rename generated development-log topic title to `소통마당 소통 개선`.

### Task 3: Update Tests And Verify

**Files:**
- Modify: `src/__tests__/landing-page.test.tsx`
- Modify: `src/__tests__/openchat-announcements.test.ts`
- Modify: `src/__tests__/news-admin-controls.test.tsx`
- Modify: `src/__tests__/openchat-announcements-api.test.ts`
- Modify: `src/__tests__/news-notice-deep-link.test.tsx`

- [x] Write failing expectations for `소통마당` in landing and open-chat announcement tests.
- [x] Implement the copy update and make the focused tests pass.
- [x] Run `pnpm lint`, `pnpm test`, and `pnpm build`.
- [x] Verify desktop and mobile rendered pages have `소통마당`, no `조합소식`, and no horizontal overflow.
