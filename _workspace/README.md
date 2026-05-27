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
