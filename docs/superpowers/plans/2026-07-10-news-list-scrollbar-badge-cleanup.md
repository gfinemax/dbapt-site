# News List Scrollbar And Notice Badge Cleanup

## Scope

- Hide the visible horizontal scrollbar on notice and free-board list table wrappers while preserving their existing internal overflow behavior.
- Remove the `실제자료` badge from the notice list because it is an internal real-data marker, not useful public-facing metadata.
- Keep understandable notice badges such as `중요` and `첨부`.

## Non-Goals

- No route, API, database, permission, comment, reaction, bookmark, copy-tool, public-share, or detail-view behavior changes.
- No broad redesign of public materials, disclosure tables, or other portal tables.

## Verification

- Focused component regression for notice/free-board table wrappers and notice badge output.
- Full repo validation: lint, test, build.
- Local Chrome check for `/news?tab=notice`.
