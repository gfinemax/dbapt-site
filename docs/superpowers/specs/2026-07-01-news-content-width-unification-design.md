# News Content Width Unification Design

## Goal

Make notice and free-board article writing and reading use a consistent article body canvas so the layout seen while composing matches the layout seen while reading.

## Approved Scope

- Use a shared article body canvas width of `max-w-[760px]`.
- Use a shared article shell width of `max-w-[860px]` where the shell must contain the article body plus padding and controls.
- Apply the shared widths to:
  - public notice detail drawer in `NewsClient`
  - notice read modal and notice write drawer in `NoticeBoard`
  - free-board focus/read panel
  - free-board create/edit modal
- Keep existing interaction models:
  - notice writing remains a right-side drawer
  - free-board writing remains a modal
  - free-board reading remains a left focus panel
  - notice detail remains a left drawer or centered modal depending on the existing surface

## Out Of Scope

- No permission or access-boundary changes.
- No route, API, database, or schema changes.
- No comment, reaction, bookmark, copy, open-chat, or public-share behavior changes.
- No rich-editor feature changes beyond its containing width.

## Acceptance Criteria

- Notice read and write surfaces expose a `max-w-[760px]` article content container.
- Free-board read and write surfaces expose the same `max-w-[760px]` article content container.
- Free-board shell width is reduced from `max-w-[920px]` to `max-w-[860px]`.
- Notice shells that contain article body content use `max-w-[860px]` rather than the narrower legacy drawer/modal widths.
- Focused component tests fail before the width change and pass after implementation.
- Desktop and mobile browser checks show no horizontal overflow on `/news?tab=free`.
