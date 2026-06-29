# Free Board Wide Editor Design

## Goal

Make the free-board post create/edit surface comfortable for long rich-text posts and image editing.

## Scope

- Replace the narrow right-side create/edit drawer with a wide editing dialog.
- Keep the existing create/edit state, validation, upload, and save API behavior.
- On desktop, use a centered document-style flow rather than an indefinitely expanding workspace.
- On mobile, use a full-screen single-column layout.
- Keep the existing rich editor commands and image editing behavior unchanged, while allowing the free-board body field to use a taller visible writing area.

## Out Of Scope

- Changing free-board API payloads or permissions.
- Changing comment editing.
- Adding autosave, draft recovery, or preview mode.
- Reworking notice-board or development-log editing surfaces.

## UX Requirements

- The editing surface must provide substantially more horizontal space than the previous `max-w-lg` drawer.
- The body editor must be in the wider main column on desktop.
- Metadata fields, attachment controls, and admin-only toggles should move to a narrower supporting column on desktop.
- The primary submit action must remain visible at the bottom of the dialog container.
- The dialog must remain keyboard-addressable with an accessible dialog name.

## Follow-up UX Requirements - Compact Fixed-Width Composer

- The create/edit surface must not grow indefinitely on very wide screens.
- The dialog shell should be capped near a document-editor width, with the actual input content capped more narrowly for comfortable reading and image editing.
- The refined shell target is `920px`, with the actual input/footer column capped at `820px`.
- The body editor should use the available vertical space better with a taller minimum editing area.
- The writing flow should appear before secondary setup controls: title, body editor, then post type, attachment, and admin-only settings.
- Header helper copy should be removed when it duplicates what the interface already communicates.
- Attachment controls should be visually smaller than the title/body editing area.

## Testing Requirements

- Add focused component coverage that opens an existing free-board post for editing and verifies the wide workspace structure.
- Re-run existing free-board edit tests to prove PATCH behavior is unchanged.
- Add focused coverage that opens the new post composer and verifies fixed-width classes, taller body editor classes, removed helper copy, and title/body-first ordering.
