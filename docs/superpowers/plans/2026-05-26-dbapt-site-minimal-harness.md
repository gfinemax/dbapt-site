# dbapt-site Minimal Harness Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a small repository-local Meta Harness workflow that carries approved `dbapt-site` product specs through planning, UI-scope review, and verified completion without expanding product functionality.

**Architecture:** Keep existing `docs/superpowers/specs/` and `docs/superpowers/plans/` as the product-design and implementation-plan sources of truth. Add one durable Pipeline team spec, two repo-local skills, and a deterministic `_workspace/` contract; update `AGENTS.md` only with pointers into the new workflow. The harness itself is documentation and workflow infrastructure, not portal feature implementation.

**Tech Stack:** Markdown artifact contracts, repo-local Codex-compatible `SKILL.md` files with YAML frontmatter, PowerShell structural validation, existing Next.js repository rules.

---

## Scope Boundary

This plan implements `docs/superpowers/specs/2026-05-26-dbapt-site-minimal-harness-design.md` only. It does not implement `/portal/member`, `/portal/refund`, `/portal/admin`, authentication, document access, accounting, payment reminders, messaging, voting, or any new visible website UI.

The existing untracked `DATA/` path is unrelated to this plan and must not be added, edited, deleted, or committed.

## File Map

| Path | Responsibility |
|---|---|
| `docs/harness/dbapt-site/team-spec.md` | Canonical Pipeline workflow, role boundaries, handoffs, failure policy, and scenario checks |
| `.agents/skills/dbapt-site-orchestrator/SKILL.md` | Reusable entry workflow for carrying an approved feature from request selection through verification |
| `.agents/skills/dbapt-site-ui-review/SKILL.md` | Reusable UI quality gate for public/private scope and truthful preview presentation |
| `_workspace/README.md` | Deterministic per-task evidence directory and file-format contract |
| `AGENTS.md` | Short repo-wide pointers that require use of the harness for planned feature work and visible/access-scope changes |

### Task 1: Establish the Durable Team Spec

**Files:**
- Create: `docs/harness/dbapt-site/team-spec.md`

- [ ] **Step 1: Verify that the team spec does not already exist**

Run:

```powershell
if (Test-Path 'docs\harness\dbapt-site\team-spec.md') { throw 'team-spec.md already exists; inspect before proceeding' } else { 'Expected precondition: team-spec.md is not present' }
```

Expected: output contains `Expected precondition: team-spec.md is not present`.

- [ ] **Step 2: Write the Pipeline team specification**

Create `docs/harness/dbapt-site/team-spec.md` with this exact content:

```markdown
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
```

- [ ] **Step 3: Validate required team-spec sections**

Run:

```powershell
$path = 'docs\harness\dbapt-site\team-spec.md'
$required = @('# dbapt-site Harness Team Spec','## Pattern','## Roles','## Phase Order','## Handoff Files','## Failure Policy','## Validation Requirements','## Test Scenarios')
$text = Get-Content -Raw $path
$missing = $required | Where-Object { -not $text.Contains($_) }
if ($missing) { throw ('Missing sections: ' + ($missing -join ', ')) }
'PASS: team spec includes workflow, handoff, failure, validation, and scenario contracts'
```

Expected: `PASS: team spec includes workflow, handoff, failure, validation, and scenario contracts`.

- [ ] **Step 4: Commit the canonical team specification**

Run:

```powershell
git add -- 'docs/harness/dbapt-site/team-spec.md'
git commit -m "docs: add dbapt-site harness team spec"
```

Expected: one commit containing only `docs/harness/dbapt-site/team-spec.md`.

### Task 2: Add the Orchestrator Skill

**Files:**
- Create: `.agents/skills/dbapt-site-orchestrator/SKILL.md`

- [ ] **Step 1: Verify that the orchestrator skill does not already exist**

Run:

```powershell
if (Test-Path '.agents\skills\dbapt-site-orchestrator\SKILL.md') { throw 'orchestrator skill already exists; inspect before proceeding' } else { 'Expected precondition: orchestrator skill is not present' }
```

Expected: output contains `Expected precondition: orchestrator skill is not present`.

- [ ] **Step 2: Write the repository-local orchestrator skill**

Create `.agents/skills/dbapt-site-orchestrator/SKILL.md` with this exact content:

```markdown
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
```

- [ ] **Step 3: Validate frontmatter and required workflow references**

Run:

```powershell
$path = '.agents\skills\dbapt-site-orchestrator\SKILL.md'
$text = Get-Content -Raw $path
$required = @('name: dbapt-site-orchestrator','description:','_workspace/00_input/request-summary.md','_workspace/01_scope/spec-selection.md','dbapt-site-ui-review','_workspace/final/verification.md','pnpm lint','pnpm test','pnpm build')
$missing = $required | Where-Object { -not $text.Contains($_) }
if ($missing) { throw ('Missing orchestrator requirements: ' + ($missing -join ', ')) }
'PASS: orchestrator skill declares frontmatter, handoffs, review routing, and verification'
```

Expected: `PASS: orchestrator skill declares frontmatter, handoffs, review routing, and verification`.

- [ ] **Step 4: Commit the orchestrator skill**

Run:

```powershell
git add -- '.agents/skills/dbapt-site-orchestrator/SKILL.md'
git commit -m "feat: add dbapt-site orchestrator skill"
```

Expected: one commit containing only the orchestrator skill.

### Task 3: Add the UI Review Skill

**Files:**
- Create: `.agents/skills/dbapt-site-ui-review/SKILL.md`

- [ ] **Step 1: Verify that the UI review skill does not already exist**

Run:

```powershell
if (Test-Path '.agents\skills\dbapt-site-ui-review\SKILL.md') { throw 'UI review skill already exists; inspect before proceeding' } else { 'Expected precondition: UI review skill is not present' }
```

Expected: output contains `Expected precondition: UI review skill is not present`.

- [ ] **Step 2: Write the scoped UI reviewer skill**

Create `.agents/skills/dbapt-site-ui-review/SKILL.md` with this exact content:

```markdown
---
name: dbapt-site-ui-review
description: Review dbapt-site visible and access-scope changes for approved boundaries, truthful preview language, and repository UI rules.
---

# dbapt-site UI Review

## When To Use

Use this skill after an implementation changes any visible page, navigation, role-specific preview, login-gated presentation, layout, typography, imagery, or motion.

This is a reviewer skill. It identifies whether an implementation conforms to approved decisions; it does not expand the product design or invent replacement UI.

## Required Inputs

- the user request captured in `_workspace/00_input/request-summary.md`
- the selected approved spec recorded in `_workspace/01_scope/spec-selection.md`
- the relevant implementation plan under `docs/superpowers/plans/`
- changed UI files and, for visible work, the rendered pages
- `AGENTS.md`
- `DESIGN.md` for visual changes

## Review Checklist

### Public And Login-Gated Boundary

- Public navigation remains limited to items approved for public display.
- `정보공개`, `회계·실적보고`, personal payment/refund data, discussions, and voting are not exposed as public working features unless a later approved spec permits it.
- Role-specific pages show only the roles and services authorized by the controlling spec.

### Truthful Preview Language

- A preview page clearly identifies itself as a preview or preparation screen.
- No active control implies working authentication, document access, data mutation, approval, notification delivery, voting, or personal-data availability when those features are not implemented.
- No fabricated balances, counts, documents, alerts, user names, or operational results appear as live data.

### Visual And Accessibility Rules

- Visible changes follow `AGENTS.md` and, where applicable, `DESIGN.md`.
- Korean and UI typography remains Pretendard.
- Canvas, card, CTA, icon, hero artwork, and motion constraints remain within repository rules when those surfaces are touched.
- Keyboard focus remains visible for interactive elements.
- Mobile layout has no horizontal overflow in the reviewed surface.
- Decorative motion does not interfere with content and stops under reduced-motion settings when motion is changed.

## Output Contract

Write `_workspace/04_review/ui-review.md` using this form:

```markdown
# UI Review

## Reviewed Change
- Feature:
- Governing spec:
- Implementation plan:
- Files or pages reviewed:

## Boundary Review
- Finding:
- Evidence:

## Truthful Presentation Review
- Finding:
- Evidence:

## Design And Accessibility Review
- Finding:
- Evidence:

## Outcome
- Result: PASS | FIX | ESCALATE
- Required action: none | <specific correction or decision required>
```

## Outcome Rules

- Return `PASS` only when the reviewed implementation complies with the governing spec and repository UI rules.
- Return `FIX` when the approved scope is clear and the implementation has a specific correctable drift.
- Return `ESCALATE` when a product-policy or access-scope decision is missing or contradictory.
- For `FIX`, review the corrected implementation once more before completion is claimed.

## Common Blocking Findings

- Showing login-gated service content directly in public navigation.
- Presenting static preview cards as working personal account or document functionality.
- Adding real-looking private data or action controls without an approved implementation scope.
- Skipping required desktop/mobile or reduced-motion verification for a touched visual surface.
```

- [ ] **Step 3: Validate frontmatter, result vocabulary, and boundary checks**

Run:

```powershell
$path = '.agents\skills\dbapt-site-ui-review\SKILL.md'
$text = Get-Content -Raw $path
$required = @('name: dbapt-site-ui-review','description:','Public And Login-Gated Boundary','Truthful Preview Language','Visual And Accessibility Rules','_workspace/04_review/ui-review.md','PASS | FIX | ESCALATE','Pretendard','reduced-motion')
$missing = $required | Where-Object { -not $text.Contains($_) }
if ($missing) { throw ('Missing UI reviewer requirements: ' + ($missing -join ', ')) }
'PASS: UI review skill declares boundary, truthfulness, accessibility, and outcome checks'
```

Expected: `PASS: UI review skill declares boundary, truthfulness, accessibility, and outcome checks`.

- [ ] **Step 4: Commit the UI review skill**

Run:

```powershell
git add -- '.agents/skills/dbapt-site-ui-review/SKILL.md'
git commit -m "feat: add dbapt-site ui review skill"
```

Expected: one commit containing only the UI reviewer skill.

### Task 4: Define the Workspace Evidence Contract

**Files:**
- Create: `_workspace/README.md`

- [ ] **Step 1: Verify that no workspace contract already exists**

Run:

```powershell
if (Test-Path '_workspace\README.md') { throw '_workspace README already exists; inspect before proceeding' } else { 'Expected precondition: workspace README is not present' }
```

Expected: output contains `Expected precondition: workspace README is not present`.

- [ ] **Step 2: Write the deterministic evidence-path documentation**

Create `_workspace/README.md` with this exact content:

```markdown
# dbapt-site Workflow Evidence

`_workspace/` holds temporary, inspectable handoff and verification evidence for work performed through the repository harness. It is not a product-content directory and does not replace approved specs or plans.

## When Files Are Created

Create evidence files only when a concrete feature implementation begins. Installing the harness itself requires only this README; do not pre-fill records for work that has not happened.

## Directory Contract

```text
_workspace/
├── README.md
├── 00_input/
│   └── request-summary.md
├── 01_scope/
│   └── spec-selection.md
├── 04_review/
│   └── ui-review.md
└── final/
    └── verification.md
```

## File Contracts

### `00_input/request-summary.md`

- requested feature slice
- explicitly excluded scope
- candidate governing spec
- unanswered decision, or `none`

### `01_scope/spec-selection.md`

- selected approved spec path
- concise implementation boundary
- detected conflicts, or `none`
- whether implementation planning may proceed

### `04_review/ui-review.md`

- implemented feature, governing spec, plan, and reviewed files/pages
- boundary, truthful-presentation, and design/accessibility findings with evidence
- one outcome: `PASS`, `FIX`, or `ESCALATE`
- required action

This file is required only for visible UI changes or public/login-gated access-presentation changes.

### `final/verification.md`

- implemented feature and changed-file summary
- checks actually run and observed results
- browser checks actually completed for visible changes
- residual risk or follow-up spec need, or `none`

## Evidence Rules

- Record observed outcomes only; do not describe planned checks as completed checks.
- Keep temporary recovery instructions out of the durable evidence contract.
- Do not store private user data, live credentials, or unpublished document content here.
- Preserve evidence while the related implementation is under review; prune or archive it only through an explicit repository decision.
```

- [ ] **Step 3: Validate that the evidence contract uses the team-spec paths**

Run:

```powershell
$teamSpec = Get-Content -Raw 'docs\harness\dbapt-site\team-spec.md'
$workspace = Get-Content -Raw '_workspace\README.md'
$paths = @('_workspace/00_input/request-summary.md','_workspace/01_scope/spec-selection.md','_workspace/04_review/ui-review.md','_workspace/final/verification.md')
$missing = $paths | Where-Object { -not $teamSpec.Contains($_) -or -not $workspace.Contains(($_ -replace '_workspace/','')) }
if ($missing) { throw ('Workspace/team spec path mismatch: ' + ($missing -join ', ')) }
'PASS: workspace evidence paths correspond to the team spec handoffs'
```

Expected: `PASS: workspace evidence paths correspond to the team spec handoffs`.

- [ ] **Step 4: Commit the workspace evidence contract**

Run:

```powershell
git add -- '_workspace/README.md'
git commit -m "docs: define dbapt-site workspace evidence contract"
```

Expected: one commit containing only `_workspace/README.md`.

### Task 5: Connect the Harness from Repository Guidance

**Files:**
- Modify: `AGENTS.md`

- [ ] **Step 1: Confirm that the harness pointer is not already in `AGENTS.md`**

Run:

```powershell
if ((Get-Content -Raw 'AGENTS.md').Contains('docs/harness/dbapt-site/team-spec.md')) { throw 'Harness pointer already present; inspect before changing AGENTS.md' } else { 'Expected precondition: harness pointer is not present' }
```

Expected: output contains `Expected precondition: harness pointer is not present`.

- [ ] **Step 2: Add two durable workflow rules under `## Working Rules`**

Insert these bullets after the existing first-implementation-slice rule in `AGENTS.md`:

```markdown
- Follow `docs/harness/dbapt-site/team-spec.md` when carrying an approved feature from plan through implementation and verification.
- For visible UI changes or public/login-gated access presentation changes, complete the `dbapt-site-ui-review` gate defined by the harness before reporting the work ready.
```

Expected resulting portion:

```markdown
- Keep the first implementation slice truthful: it is a public landing page and login-gated service preview, not working authentication, document disclosure, accounting, payment reminder, voting, or messaging integration.
- Follow `docs/harness/dbapt-site/team-spec.md` when carrying an approved feature from plan through implementation and verification.
- For visible UI changes or public/login-gated access presentation changes, complete the `dbapt-site-ui-review` gate defined by the harness before reporting the work ready.
- Use warm canvas `#fbfaf9`, inset stone card outlines, dark pill primary CTA, and restrained colorful accents as defined in `DESIGN.md`.
```

- [ ] **Step 3: Validate the short pointer and canonical file existence**

Run:

```powershell
$agents = Get-Content -Raw 'AGENTS.md'
$requiredPaths = @('docs\harness\dbapt-site\team-spec.md','.agents\skills\dbapt-site-orchestrator\SKILL.md','.agents\skills\dbapt-site-ui-review\SKILL.md','_workspace\README.md')
$missingPaths = $requiredPaths | Where-Object { -not (Test-Path $_) }
if ($missingPaths) { throw ('Missing harness files: ' + ($missingPaths -join ', ')) }
if (-not $agents.Contains('docs/harness/dbapt-site/team-spec.md') -or -not $agents.Contains('dbapt-site-ui-review')) { throw 'AGENTS.md does not link the harness and review gate' }
'PASS: AGENTS.md points to existing minimal harness artifacts'
```

Expected: `PASS: AGENTS.md points to existing minimal harness artifacts`.

- [ ] **Step 4: Commit the repository guidance pointer**

Run:

```powershell
git add -- 'AGENTS.md'
git commit -m "docs: link dbapt-site harness workflow"
```

Expected: one commit containing only `AGENTS.md`.

### Task 6: Validate the Minimal Harness as a Whole

**Files:**
- Verify only: `docs/harness/dbapt-site/team-spec.md`
- Verify only: `.agents/skills/dbapt-site-orchestrator/SKILL.md`
- Verify only: `.agents/skills/dbapt-site-ui-review/SKILL.md`
- Verify only: `_workspace/README.md`
- Verify only: `AGENTS.md`

- [ ] **Step 1: Run structural consistency checks**

Run:

```powershell
$files = @(
  'docs\harness\dbapt-site\team-spec.md',
  '.agents\skills\dbapt-site-orchestrator\SKILL.md',
  '.agents\skills\dbapt-site-ui-review\SKILL.md',
  '_workspace\README.md',
  'AGENTS.md'
)
$missingFiles = $files | Where-Object { -not (Test-Path $_) }
if ($missingFiles) { throw ('Missing files: ' + ($missingFiles -join ', ')) }

$team = Get-Content -Raw $files[0]
$orchestrator = Get-Content -Raw $files[1]
$review = Get-Content -Raw $files[2]
$workspace = Get-Content -Raw $files[3]
$agents = Get-Content -Raw $files[4]

$handoffs = @('_workspace/00_input/request-summary.md','_workspace/01_scope/spec-selection.md','_workspace/04_review/ui-review.md','_workspace/final/verification.md')
foreach ($handoff in $handoffs) {
  if (-not $team.Contains($handoff) -or -not $orchestrator.Contains($handoff)) { throw ('Missing orchestrator/team handoff: ' + $handoff) }
}
if (-not $review.Contains('_workspace/04_review/ui-review.md')) { throw 'Reviewer output contract is missing' }
if (-not $agents.Contains('docs/harness/dbapt-site/team-spec.md')) { throw 'AGENTS team-spec pointer is missing' }
if ($orchestrator -notmatch '^---\r?\nname: dbapt-site-orchestrator\r?\n') { throw 'Orchestrator YAML frontmatter is invalid or absent' }
if ($review -notmatch '^---\r?\nname: dbapt-site-ui-review\r?\n') { throw 'Reviewer YAML frontmatter is invalid or absent' }
'PASS: minimal harness artifacts and handoffs are internally consistent'
```

Expected: `PASS: minimal harness artifacts and handoffs are internally consistent`.

- [ ] **Step 2: Run the documented normal-flow scenario check**

Run:

```powershell
$team = Get-Content -Raw 'docs\harness\dbapt-site\team-spec.md'
$required = @(
  'docs/superpowers/specs/2026-05-26-daebang-role-specific-portal-preview-design.md',
  '_workspace/00_input/request-summary.md',
  '_workspace/01_scope/spec-selection.md',
  '_workspace/04_review/ui-review.md',
  '_workspace/final/verification.md',
  'PASS'
)
$missing = $required | Where-Object { -not $team.Contains($_) }
if ($missing) { throw ('Normal flow scenario is incomplete: ' + ($missing -join ', ')) }
'PASS: normal-flow scenario routes the approved portal preview spec through review and verification'
```

Expected: `PASS: normal-flow scenario routes the approved portal preview spec through review and verification`.

- [ ] **Step 3: Run the documented failure-flow scenario check**

Run:

```powershell
$team = Get-Content -Raw 'docs\harness\dbapt-site\team-spec.md'
$review = Get-Content -Raw '.agents\skills\dbapt-site-ui-review\SKILL.md'
$failureTerms = @('public navigation','login-gated','FIX','ESCALATE')
$missing = $failureTerms | Where-Object { -not $team.Contains($_) -and -not $review.Contains($_) }
if ($missing) { throw ('Failure-flow guard is incomplete: ' + ($missing -join ', ')) }
'PASS: failure-flow scenario blocks unapproved public exposure of gated features'
```

Expected: `PASS: failure-flow scenario blocks unapproved public exposure of gated features`.

- [ ] **Step 4: Check for unintended staged or untracked inclusion**

Run:

```powershell
git status --short --branch
git diff --check
git diff --cached --check
```

Expected: no whitespace errors; `DATA/` may remain untracked but is not staged or committed by this plan.

- [ ] **Step 5: Confirm the next product-plan target**

After validation, report that the next planning target is:

```text
docs/superpowers/specs/2026-05-26-daebang-role-specific-portal-preview-design.md
```

Expected: the harness is ready to record and review implementation of the already approved role-specific portal preview work; no portal implementation is claimed as part of the harness setup.
