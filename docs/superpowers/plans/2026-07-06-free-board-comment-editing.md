# Free Board Comment Editing Plan

## Goal

Allow users to edit free-board comments and replies they are already allowed to delete, while keeping administrators able to select the public display author.

## Scope

- Add a `commentId` edit branch to `PATCH /api/news/free`.
- Add a free-board comment edit payload helper.
- Add focused post panel state for comment editing.
- Show `수정` beside `삭제` for mutable top-level comments and replies.
- Render a compact edit form with `댓글 수정 내용`, and `댓글 수정 작성자` for administrators.
- Increase the free-board comment edit textarea from 4 rows to 6 rows, and the main comment composer from 3 rows to 5 rows.
- Add regression tests for the API branch, UI edit flow, and payload helper.

## Out Of Scope

- Comment edit history.
- Moderation or approval workflow.
- Schema changes.
- Public-share comment editing.
- Rich-editor comments.

## Verification

- Watch focused tests fail before implementation.
- Pass focused free-board comment tests.
- Run `pnpm lint`, `pnpm test`, and `pnpm build`.
- Record UI review and verification notes.
