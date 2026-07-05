# Short Share URL Code Implementation Plan

Goal: Make OpenChat/Kakao announcement links shorter than `/share/<kind>/<uuid>` by using `/s/[code]` for free-board posts, notices, newsletters, and public disclosure documents.

## Scope

Included:
- Deterministic short-code helper for UUID content ids.
- Fallback short-code helper for non-UUID test or legacy ids.
- Public `/s/[code]` route that emits the same Open Graph metadata as the corresponding `/share/...` route.
- OpenChat/Kakao announcement copy updated to use `/s/[code]`.

Excluded:
- New database tables or fields.
- External URL shortener service.
- Kakao Share API.
- Hiding raw URLs inside Kakao chat bubbles.

## Tasks

- [ ] Add failing tests for short-code encode/decode and URL building.
- [ ] Add failing tests for `/s/[code]` route metadata for all four content kinds.
- [ ] Add failing tests proving generated OpenChat/Kakao messages use `/s/` instead of `/share/`.
- [ ] Implement the short-code helper and `/s/[code]` route.
- [ ] Update announcement generation.
- [ ] Run focused tests, then `pnpm lint`, `pnpm test`, and `pnpm build`.

## Risk Notes

- Existing `/share/...` routes must remain available for already copied links and Kakao cache stability.
- Production content ids are UUIDs, so the normal code path should be compact. Non-UUID ids are supported for tests and legacy safety but may be longer.
