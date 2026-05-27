# dbapt-site Harness Team Spec

## Goal

Carry one approved `dbapt-site` product specification through implementation planning, implementation, UI-scope review when applicable, and verified completion. This workflow manages evidence and boundaries; it does not introduce new product functionality.

## Canonical Inputs

- `AGENTS.md` for repository-wide implementation and validation rules
- `DESIGN.md` whenever UI, layout, color, motion, typography, or imagery changes
- `docs/superpowers/specs/*.md` for approved product and feature design
- `docs/superpowers/plans/*.md` for executable implementation tasks

## Pattern

The outer workflow is a sequential **Pipeline**. A limited **Producer-Reviewer** quality gate applies when work changes visible UI or the public/login-gated access boundary.

## Roles

| Role | Responsibility | Reusable skill | Writes |
| --- | --- | --- | --- |
| `dbapt-site-orchestrator` | Select the approved basis, require a plan before implementation, route required review, and verify completion | `.agents/skills/dbapt-site-orchestrator/SKILL.md` | `_workspace/00_input/request-summary.md`, `_workspace/01_scope/spec-selection.md`, `_workspace/final/verification.md` |
| `dbapt-site-ui-review` | Evaluate visible/access-scope changes against the approved spec and UI rules | `.agents/skills/dbapt-site-ui-review/SKILL.md` | `_workspace/04_review/ui-review.md` |

## Phase Order

### Phase 0: Request Summary

- Inputs: user request and current repository state
- Action: capture the requested feature, exclusions, and any unresolved decision
- Output: `_workspace/00_input/request-summary.md`
- Complete when: one current feature slice and its exclusions are explicit

### Phase 1: Specification Selection

- Inputs: request summary and existing product specs
- Action: identify the approved spec that governs the requested work; stop for approval when none exists or when it conflicts with the request
- Output: `_workspace/01_scope/spec-selection.md`
- Complete when: the selected spec and its implementation boundary are recorded

### Phase 2: Implementation Planning

- Inputs: approved selected spec
- Action: use the Superpowers planning workflow to create or approve an implementation plan
- Output: `docs/superpowers/plans/YYYY-MM-DD-<topic>.md`
- Complete when: a user-approved plan exists before product code changes begin

### Phase 3: Implementation

- Inputs: approved implementation plan, `AGENTS.md`, and `DESIGN.md` for UI changes
- Action: execute plan tasks with their prescribed tests and commits
- Output: code, tests, and supporting artifacts named by the implementation plan
- Complete when: plan tasks are implemented and any required UI review input is available

### Phase 4: UI Scope Review

- Applies when: the work changes visible UI or public/login-gated access presentation
- Inputs: request summary, selected spec, implementation plan, changed code, and rendered output when visible
- Action: run `dbapt-site-ui-review`
- Output: `_workspace/04_review/ui-review.md`
- Complete when: result is `PASS`, or work is stopped for `ESCALATE`; `FIX` requires correction and one repeated review before completion

### Phase 5: Verification and Completion

- Inputs: implemented changes and UI review result when required
- Action: run required repository checks and record only evidence actually observed
- Output: `_workspace/final/verification.md`
- Complete when: required checks pass or unresolved failure is reported without claiming completion

## Handoff Files

| From | To | File | Purpose |
| --- | --- | --- | --- |
| request intake | orchestrator | `_workspace/00_input/request-summary.md` | Freeze the requested feature slice and exclusions |
| orchestrator | planner/implementer | `_workspace/01_scope/spec-selection.md` | Name the controlling approved spec and boundary |
| implementer | ui-review | implementation plan and changed UI | Supply the intended scope and rendered implementation |
| ui-review | orchestrator | `_workspace/04_review/ui-review.md` | Gate completion of visible or access-boundary changes |
| orchestrator | user | `_workspace/final/verification.md` | Preserve the observed completion evidence |

## Review Outcomes

- `PASS`: the change remains within approved scope and does not imply unavailable functionality.
- `FIX`: the implementation can be corrected without changing approved requirements; fix and repeat review once.
- `ESCALATE`: a missing or conflicting policy decision prevents a safe determination; ask the user before implementation continues.

## Failure Policy

- If no approved spec covers the request, return to design approval before product implementation.
- If request and spec conflict, record the conflict in `_workspace/01_scope/spec-selection.md` and ask for direction.
- If UI review returns `FIX`, do not report completion until the correction is reviewed.
- If UI review still returns `FIX` after one revision, evaluate whether the spec needs revision rather than looping indefinitely.
- If validation commands fail, record the failure and do not claim the work is ready.
- If browser verification is required but unavailable, record the reason and residual risk.

## Validation Requirements

For UI implementation work, run:

```powershell
pnpm lint
pnpm test
pnpm build
```

For visible changes, open the running page in the Codex browser and check desktop and mobile layouts. Review keyboard focus and reduced-motion behavior when the changed surface includes interaction or decoration.

## Test Scenarios

### Normal Flow

- Request: implement the approved role-specific portal preview pages.
- Governing spec: `docs/superpowers/specs/2026-05-26-daebang-role-specific-portal-preview-design.md`.
- Expected evidence: request summary, spec selection, implementation plan, `PASS` UI review, and final validation record.

### Failure Flow

- Request or implementation: add login-gated information-disclosure content directly to public navigation without an approved spec change.
- Expected result: UI review records `FIX` when it is an implementation drift or `ESCALATE` when the requested scope itself conflicts with the approved public/login boundary.
- Completion rule: no completion claim until the issue is resolved through correction or approved design change.

## Removable Logic

Do not add model-specific retries or recovery prompts to this core contract. Any temporary execution workaround belongs in a separate, removable note rather than this durable team spec.
