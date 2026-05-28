# 대방동지역주택조합 Phase 2 안정화 계획

## Scope

This plan stabilizes the already-implemented Phase 2 authentication and secure document disclosure slice governed by `docs/superpowers/specs/2026-05-28-daebang-auth-and-document-disclosure-design.md`.

## Tasks

1. Fix the lint failure in portal preview tests without changing product behavior.
2. Align `/login` copy and links with the implemented authenticated portal flow: demo accounts log in to role-gated pages; protected portal pages are not offered as unauthenticated preview links.
3. Ensure seeded document metadata points to locally available demo PDF files so secure downloads can be exercised.
4. Re-run `pnpm lint`, `pnpm test`, and `pnpm build`.
5. Complete the dbapt-site UI review gate because the login/access presentation changes.

## Out Of Scope

- New authentication providers
- Production account management
- Real cooperative document content
- New public navigation entries
- Accounting, notification, voting, or messaging integrations
