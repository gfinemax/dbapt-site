# Rich Content View Spacing Parity Plan

## Goal

- Make notice and free-board view mode spacing match edit mode more closely.
- Remove view-only wrapper padding and line-height classes around rich content.
- Preserve empty editor paragraphs as visible blank lines in published content.
- Keep saved paragraph line-height attributes in sanitized view HTML.

## Scope

- `src/components/news/notice-rich-editor.tsx`
- `src/components/news/news-client.tsx`
- `src/components/news/notice-board.tsx`
- `src/components/news/free-board.tsx`
- `src/__tests__/news-rich-content-links.test.tsx`
- `src/__tests__/news-admin-controls.test.tsx`

## Non-goals

- No rich editor replacement.
- No API, route, schema, permission, comment, reaction, bookmark, open-chat, or public-share behavior changes.
- No database data migration.

## Implementation Steps

1. Add regression tests for visible blank line preservation and view-only wrapper spacing removal.
2. Convert empty sanitized paragraphs to `<p><br /></p>` so legacy/editor empty paragraphs keep line height in view mode.
3. Remove extra `pt-2` and legacy wrapper typography around `NoticeRichContent` in notice drawer, notice-board dialog, and free-board focused panel.
4. Verify focused tests, full lint/test/build, and browser desktop/mobile rendering.
