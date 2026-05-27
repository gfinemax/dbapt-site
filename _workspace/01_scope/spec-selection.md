# Specification Selection

## Selected Approved Specification

- `docs/superpowers/specs/2026-05-25-daebang-housing-cooperative-portal-design.md` (High-level Portal Design)
- `docs/superpowers/specs/2026-05-28-daebang-auth-and-document-disclosure-design.md` (Detailed Auth & Document Disclosure Spec - *Proposed*)

## Implementation Boundary

- Replace the mock credential-less previews on `/login` and `/portal/*` with actual session-based authorization checks.
- Establish user schemas for Roles: Regular Member (`member`), Refund Member (`refund`), and Administrator (`admin`).
- Build CRUD APIs and interfaces for administrators to upload and manage documents, and members to search, filter, and view them.
- Ensure that audit logs are created for every view or download operation of sensitive files.
- Ensure all public pages (Landing Page, Terms, Privacy Policy) remain fully public and do not require authentication.

## Conflicts

- None. The requested work aligns with Phase 2 defined in the parent Portal Design spec. However, because the parent spec is high-level, a new detailed specification (`docs/superpowers/specs/2026-05-28-daebang-auth-and-document-disclosure-design.md`) must be drafted and approved before implementation begins.

## Planning Decision

- Detailed specification and implementation plan must be drafted.
- Product code changes will not commence until both the detailed specification and the implementation plan are explicitly approved by the user.

---
