# Contribution Dashboard MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a polished member contribution dashboard that is truthful with no ERP data and ready for future ERP ledger synchronization.

**Architecture:** Keep the existing `ContributionSummary` as the current approved summary source, then layer a richer dashboard view model over it. Add Prisma models for profile, payment plan, stages, ledger entries, sync runs, and view logs without requiring live ERP calls. Render the new dashboard from typed props in `PortalShell`.

**Tech Stack:** Next.js App Router, TypeScript, React, Tailwind CSS, Prisma, Vitest, Testing Library.

---

### Task 1: Scope Artifacts

**Files:**
- Create: `_workspace/00_input/request-summary.md`
- Create: `_workspace/01_scope/spec-selection.md`

- [ ] Record the approved request, exclusions, governing spec, and planning status.

### Task 2: Dashboard View Model Tests

**Files:**
- Create: `src/__tests__/contribution-dashboard.test.ts`
- Modify: `src/lib/contribution-types.ts`
- Modify: `src/lib/contribution-serializer.ts`

- [ ] Write tests that prove missing data returns `WAITING`/`자료 대기` fields without fake totals.
- [ ] Write tests that prove summary totals produce payment progress and status fields.
- [ ] Run `pnpm test -- src/__tests__/contribution-dashboard.test.ts` and verify RED.
- [ ] Implement the typed dashboard view model and serializer helpers.
- [ ] Re-run the focused test and verify GREEN.

### Task 3: API Extension Tests

**Files:**
- Modify: `src/__tests__/contribution-api.test.ts`
- Modify: `src/app/api/me/contributions/route.ts`

- [ ] Extend the self API test to expect profile, stages, ledger entries, and dashboard payload for the current user only.
- [ ] Run the API test and verify RED.
- [ ] Update the route to load the extended data and record a contribution view log when available.
- [ ] Re-run the API test and verify GREEN.

### Task 4: Prisma Model Foundation

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `prisma/migrations/20260614110000_add_contribution_dashboard_foundation/migration.sql`

- [ ] Add `MemberContributionProfile`, `ContributionPaymentPlan`, `ContributionPaymentStage`, `ContributionLedgerEntry`, `ContributionSyncRun`, and `ContributionViewLog`.
- [ ] Add relations and indexes needed for self-only reads and future ERP sync.
- [ ] Run `pnpm exec prisma format` and `pnpm exec prisma generate`.

### Task 5: Member Dashboard UI

**Files:**
- Create: `src/components/portal/contribution-dashboard.tsx`
- Modify: `src/components/portal/portal-shell.tsx`
- Modify: `src/components/portal/personal-library-drawer-host.tsx`
- Modify: `src/components/landing/home-client.tsx`
- Modify: `src/lib/personal-library-data.ts`

- [ ] Write/extend component tests proving pending and populated dashboard states render correctly.
- [ ] Run the focused portal tests and verify RED.
- [ ] Replace the member contribution card with the dashboard component.
- [ ] Pass the dashboard data through personal library loaders and shell props.
- [ ] Re-run focused portal tests and verify GREEN.

### Task 6: ERP Adapter Contract

**Files:**
- Create: `src/lib/contributions/erp-contract.ts`

- [ ] Add server-only TypeScript types for the future ERP ledger API response.
- [ ] Include a mapper signature that converts ERP records into the internal dashboard shape.
- [ ] Do not add browser-side ERP calls.

### Task 7: Review And Verification

**Files:**
- Create/Modify: `_workspace/04_review/ui-review.md`
- Create/Modify: `_workspace/final/verification.md`

- [ ] Run `pnpm lint`.
- [ ] Run `pnpm test`.
- [ ] Run `pnpm build`.
- [ ] Verify the member portal in desktop and mobile browser layouts.
- [ ] Complete the `dbapt-site-ui-review` checklist with `PASS` before reporting ready.
