# Notice Mobile Image Width Parity

## Scope

- Match notice-detail mobile reading width with the free-board focused post panel.
- Let notice representative images and rich-body images use the wider mobile reading canvas.
- Preserve image aspect ratios by keeping `height:auto` and `object-fit:contain` on mobile/read surfaces.

## Non-Goals

- No route, API, database, permission, comment, reaction, bookmark, copy-tool, public-share, upload, editor behavior, or schema changes.
- No desktop width change beyond preserving the existing `780px` shell and `680px` content contract.

## Implementation Steps

- Change the main notice detail drawer mobile padding from `p-6` to `px-3 py-4 sm:p-8`.
- Change the standalone notice-board read modal mobile padding from `p-6.5` to `px-3 py-4 sm:p-6.5`.
- Add `h-auto` to notice representative images while keeping `w-full`, `max-h-none`, and `object-contain`.
- Keep existing shared rich-content mobile image rules in `NoticeRichContent`: full mobile width, max-width, `height:auto`, and `object-contain`.

## Verification

- Focused tests for notice drawer/modal width and representative image classes.
- Full repo validation: lint, test, build.
- Local Chrome check for notice detail mobile rendering.
