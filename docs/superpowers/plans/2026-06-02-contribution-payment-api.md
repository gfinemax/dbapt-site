# Contribution Payment API Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first API-ready contribution and overdue-payment slice for logged-in members/refund members and admin-approved payment imports.

**Architecture:** Add Prisma models for contribution summaries, admin import batches, import rows, and payment notice drafts. Admin APIs create validation batches and approve them into user-visible summaries; the self API reads only the current session user's contribution data. Portal pages pass the data into `PortalShell` for login-gated display.

**Tech Stack:** Next.js App Router route handlers, TypeScript, Prisma/PostgreSQL, Vitest, React Testing Library.

---

### Task 1: Data Model And Migration

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `prisma/migrations/20260602150000_add_contribution_payment_api/migration.sql`

- [ ] Add `ContributionSummary`, `PaymentImportBatch`, `PaymentImportRow`, and `PaymentNotice` models.
- [ ] Add matching relations to `User`.
- [ ] Generate the SQL migration with non-destructive table creation and indexes.
- [ ] Run `pnpm exec prisma generate`.

### Task 2: API Contracts And Tests

**Files:**
- Create: `src/__tests__/contribution-api.test.ts`

- [ ] Write tests proving `GET /api/me/contributions` returns only the current session user's summary and notices.
- [ ] Write tests proving non-admin users cannot create or approve payment imports.
- [ ] Write tests proving admin import approval upserts summaries and creates draft notices for unpaid/overdue rows.
- [ ] Run the tests and confirm they fail before implementation.

### Task 3: API Implementation

**Files:**
- Create: `src/lib/contribution-types.ts`
- Create: `src/lib/contribution-import.ts`
- Create: `src/app/api/me/contributions/route.ts`
- Create: `src/app/api/admin/payment-imports/route.ts`
- Create: `src/app/api/admin/payment-imports/[id]/approve/route.ts`

- [ ] Implement shared parsing and validation helpers.
- [ ] Implement session-gated self-read API without accepting a `userId` query parameter.
- [ ] Implement admin-only import creation with row validation.
- [ ] Implement admin-only approval that writes user-visible summaries and draft notices.
- [ ] Re-run the focused API tests until they pass.

### Task 4: Portal Display

**Files:**
- Modify: `src/app/portal/member/page.tsx`
- Modify: `src/app/portal/refund/page.tsx`
- Modify: `src/components/portal/portal-shell.tsx`
- Modify: `src/__tests__/portal-shell.test.tsx`

- [ ] Fetch the current user's contribution summary and notices on member/refund portal pages.
- [ ] Render the values in the account-specific status card.
- [ ] Keep empty/fallback copy truthful when no approved contribution data exists.
- [ ] Test that member and refund portal cards render supplied contribution data.

### Task 5: Review And Verification

**Files:**
- Update: `_workspace/00_input/request-summary.md`
- Update: `_workspace/01_scope/spec-selection.md`
- Update: `_workspace/04_review/ui-review.md`
- Update: `_workspace/final/verification.md`

- [ ] Record the request, governing spec, UI review, and verification evidence.
- [ ] Run `pnpm lint`.
- [ ] Run focused contribution and portal tests.
- [ ] Run `pnpm test` and record any existing failures separately.
- [ ] Run `pnpm build`.
