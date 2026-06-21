# Daebang Household Plan Breakdown Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a readable public `/business` overview block that explains the current `254세대` district-unit-plan count and future `270세대 예정` minor-change plan by housing category and unit type.

**Architecture:** Keep the change inside the existing `OverviewTab` surface, immediately below the three summary cards and above `통합 건축개요`. Use local data arrays in the component because this is static public presentation content, not runtime operational data.

**Tech Stack:** Next.js App Router, React, TypeScript, Tailwind CSS, Vitest, Testing Library.

---

### Task 1: Regression Test

**Files:**
- Modify: `src/__tests__/business-page.test.tsx`

- [ ] **Step 1: Add a failing test for household plan breakdowns**

Add a test that renders `BusinessClient` and asserts:

```tsx
expect(screen.getByRole("heading", { name: "평형별 세대계획" })).toBeInTheDocument();
expect(screen.getByRole("heading", { name: "현재 지구단위계획 254세대" })).toBeInTheDocument();
expect(screen.getByRole("heading", { name: "향후 경미한 변경 270세대 예정" })).toBeInTheDocument();
expect(screen.getByText("분양주택 236세대")).toBeInTheDocument();
expect(screen.getByText("공공주택 18세대")).toBeInTheDocument();
expect(screen.getByText("분양주택 252세대")).toBeInTheDocument();
expect(screen.getAllByText("48㎡ (19평형)").length).toBeGreaterThan(0);
expect(screen.getAllByText("59㎡ (24평형)").length).toBeGreaterThan(0);
expect(screen.getAllByText("74㎡ (30평형)").length).toBeGreaterThan(0);
expect(screen.getAllByText("84㎡ (34평형)").length).toBeGreaterThan(0);
expect(screen.getByText("236 + 18 = 254세대")).toBeInTheDocument();
expect(screen.getByText("252 + 18 = 270세대 예정")).toBeInTheDocument();
```

- [ ] **Step 2: Run the focused test and confirm RED**

Run: `pnpm vitest run src/__tests__/business-page.test.tsx`

Expected: FAIL because the `평형별 세대계획` heading is not rendered yet.

### Task 2: Overview UI

**Files:**
- Modify: `src/components/business/overview-tab.tsx`

- [ ] **Step 1: Add static household plan data**

Add `householdPlans` inside `OverviewTab` with two plan groups:

```tsx
{
  title: "현재 지구단위계획 254세대",
  total: "254세대",
  formula: "236 + 18 = 254세대",
  groups: [
    { title: "분양주택", total: "236세대", rows: [...] },
    { title: "공공주택", total: "18세대", rows: [...] },
  ],
}
```

The future group should use `252 + 18 = 270세대 예정`.

- [ ] **Step 2: Render the household plan block**

Insert a `stone-card` block after the summary cards. Render two plan panels, each containing sale/public housing subsections and compact rows for unit type, current/future count, and change.

- [ ] **Step 3: Preserve existing public wording**

Keep the existing summary cards, `통합 건축개요`, and `향후 계획` wording. Do not expose private documents or unsupported final-approval claims.

### Task 3: Validation And Review

**Files:**
- Modify: `_workspace/04_review/ui-review.md`
- Modify: `_workspace/final/verification.md`

- [ ] **Step 1: Run focused and required checks**

Run:

```powershell
pnpm vitest run src/__tests__/business-page.test.tsx
pnpm lint
pnpm test
pnpm build
```

- [ ] **Step 2: Browser-check visible overview**

Open `/business#overview` and verify desktop/mobile layout has no horizontal overflow and the new household plan block appears between the summary cards and `통합 건축개요`.

- [ ] **Step 3: Record UI review and verification**

Update `_workspace/04_review/ui-review.md` with a `PASS`, `FIX`, or `ESCALATE` result. Update `_workspace/final/verification.md` with changed files, command results, browser evidence, and unresolved risks.
