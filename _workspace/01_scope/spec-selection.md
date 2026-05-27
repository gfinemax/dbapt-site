# Specification Selection

## Selected Approved Specification

- `docs/superpowers/specs/2026-05-26-daebang-role-specific-portal-preview-design.md`

## Implementation Boundary

- Create three individually addressable, static role preview routes for member, refund-member, and administrator use cases.
- Reuse a shared portal layout driven by typed static content.
- Keep `/login` as a preparation page while adding clearly labeled navigation into preview screens.
- Render only cards and empty/status states that explain future service scope.
- Preserve the existing public landing navigation and login-gated boundary.

## Conflicts

- None. The requested continuation matches the next target identified by the installed harness and the approved role-specific portal preview specification.

## Planning Decision

- Implementation planning may proceed.
- Product code must not change until the implementation plan is written and approved for execution.

## Subsequent Approved Visual Refinement

- After reviewing the running page, the user directly approved a replacement hero background and compact headline presentation on the public landing page.
- The refinement stays within the existing landing visual rules and does not change the role-preview access boundary or functional implementation scope.
