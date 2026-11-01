# Correspondence Reply Selection Design

## Approved Request

The administrator asked for `회신` to be available directly in the `수발신 구분` selector and for `회신 불필요` to become selected when `회신` is chosen.

## Approved Scope

- Add `회신` to the correspondence-type selector in both document registration and document editing.
- Treat `회신` as the direct replacement for the separate `회신 공문으로 등록` checkbox.
- When `회신` is selected, show `회신 불필요` as selected and clear any reply due date from the form state.
- Keep the existing optional received-document target selector for reply documents.
- Keep stored `replyNotRequired` semantics limited to received documents; for a reply document, the selected control is a form-state cue and the persisted correspondence type is `회신`.

## Excluded Scope

- Database schema changes.
- Changes to reply-completion calculation or public document grouping.
- Changes to authentication, notification delivery, or disclosure access boundaries.

## Acceptance Criteria

1. `수발신 구분` offers `수신`, `발신`, `회신`, and `기타` where applicable.
2. Selecting `회신` selects the visible `회신 불필요` control and removes the reply-due-date input.
3. Selecting `회신` shows the existing reply-target selector.
4. Registration and editing no longer require a second reply-type checkbox.
5. Existing received-document `회신 불필요` behavior remains editable and persists as before.
