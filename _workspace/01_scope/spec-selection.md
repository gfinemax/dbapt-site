# Specification Selection

## Selected approved spec path

- `docs/superpowers/specs/2026-09-24-account-recovery-manual-sms-design.md`

## Implementation boundary

- Public account-help requests use exact name and registered-phone matching without exposing account existence.
- Administrators process requests by immutable user ID, select office or personal mobile delivery, and manually send a prepared ID-help message or 12-hour one-time reset link.
- Reset tokens are stored only as hashes, are single-use, and invalidate previous tokens and existing sessions.
- No live Kakao/SMS provider and no administrator personal number storage are included.

## Conflicts or missing decisions

- none.

## Whether planning may continue

- Yes. The user approved the specification and explicitly requested implementation.
