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
