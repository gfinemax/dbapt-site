# Request Summary

## Requested Feature Slice

- Continue with the next product task after installing the `dbapt-site` minimal harness.
- Implement role-specific portal preview pages for the approved first UI slice:
  - `/portal/member`
  - `/portal/refund`
  - `/portal/admin`
- Add clear preview entry links from `/login`.

## Explicitly Excluded Scope

- Working login, authentication, authorization, sessions, or role switching
- Live documents, download/search/posting behavior, accounting data, payments, refund data, notifications, voting, approvals, or administrator mutations
- Exposing login-gated content through the public landing navigation
- Fabricated personal amounts, document counts, alert counts, or operational results

## Candidate Governing Specification

- `docs/superpowers/specs/2026-05-26-daebang-role-specific-portal-preview-design.md`

## Decision Status

- User approval to continue: received through the instruction to proceed with the next work after identifying this spec as the next implementation target.
- Unanswered decision: none.

## Approved Visual Follow-up

- The user selected a revised public landing hero background with the slim six-person composition and landscaped apartment complex.
- The user requested reduced upper whitespace, no floating decorations, and a desktop headline fixed to two intended lines.
- The user subsequently requested reducing the remaining whitespace between the header and hero card and tightening the hero's vertical spacing.
- This follow-up changes only public landing presentation; it does not expose login-gated content or add service behavior.
