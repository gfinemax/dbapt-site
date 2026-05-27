---
name: dbapt-site-orchestrator
description: Carry an approved dbapt-site feature spec through planning, implementation, required UI review, and verification evidence.
---

# dbapt-site Orchestrator

## When To Use

Use this skill when implementing or resuming an approved `dbapt-site` feature, especially a change that follows a document in `docs/superpowers/specs/` or `docs/superpowers/plans/`.

Do not use this skill to invent product scope. If an approved spec is missing or conflicts with the request, stop at the specification-selection step and ask for resolution.

## Required Inputs

- the user's current request
- `AGENTS.md`
- the relevant approved specification under `docs/superpowers/specs/`
- an implementation plan under `docs/superpowers/plans/`, or approval to create one
- `DESIGN.md` if visible UI changes are included

## Workflow

### 1. Summarize The Request

Create `_workspace/00_input/request-summary.md` containing:

- requested feature slice
- explicitly excluded scope
- candidate governing specification
- unanswered decision, or `none`

### 2. Select The Governing Spec

Create `_workspace/01_scope/spec-selection.md` containing:

- selected approved spec path
- implementation boundary copied in concise form from that spec
- conflicts between the request and spec, or `none`
- whether planning may continue

If planning may not continue, ask the user for the required decision and do not modify product code.

### 3. Require An Implementation Plan

If no approved implementation plan exists for the selected spec, use the Superpowers planning workflow to create one before implementation. Product code changes start only after the plan is approved.

### 4. Execute The Approved Plan

Follow the plan task by task. Observe `AGENTS.md`; read `DESIGN.md` before touching UI, layout, color, motion, typography, or imagery.

### 5. Route UI Review When Required

Run `.agents/skills/dbapt-site-ui-review/SKILL.md` whenever the implementation changes visible UI or public/login-gated access presentation. Completion requires a `PASS` review result.

### 6. Verify And Record Completion

Write `_workspace/final/verification.md` with:

- implemented feature and changed file summary
- required checks actually run and their results
- browser checks actually completed for visible changes
- unresolved risks or follow-up specs, or `none`

For UI work, the required commands are:

```powershell
pnpm lint
pnpm test
pnpm build
```

## Expected Outputs

- `_workspace/00_input/request-summary.md`
- `_workspace/01_scope/spec-selection.md`
- a governing plan under `docs/superpowers/plans/`
- `_workspace/04_review/ui-review.md` when review applies
- `_workspace/final/verification.md`

## Failure Policy

- Missing approved spec: return to design work rather than beginning implementation.
- Request/spec conflict: record the conflict and ask the user.
- `FIX` UI review: correct the implementation and review once more.
- `ESCALATE` UI review: stop and obtain the missing product or policy decision.
- Failed validation: report the failure; do not claim readiness.

## Boundaries

- Do not expose login-only materials in public navigation without an approved spec change.
- Do not present authentication, private data access, document delivery, accounting operations, notifications, voting, or approval actions as live unless a later approved specification implements them.
- Keep coordination sequential by default; do not introduce parallel agents for this workflow without a separately approved need.
