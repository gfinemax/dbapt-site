# Spec Selection

- Selected approved spec path: `docs/superpowers/specs/2026-05-25-daebang-housing-cooperative-portal-design.md`
- Implementation boundary:
  - Remove the upper-right "Delete" (삭제) button from the free-board focus panel.
  - Implement a new "Edit" (수정) button in the upper right of the free-board focus panel that pre-fills and opens the edit drawer.
  - Add a server-side `PATCH` handler in `/api/news/free/route.ts` to process post modification for authorized users (author of the post or admin).
  - Pre-fill the existing `NoticeRichEditor` inside the drawer and label it properly (e.g. "토론 게시글 수정" and "수정 완료" button) when in edit mode.
  - Make sure `pnpm lint`, `pnpm test`, and `pnpm build` pass.
- Conflicts between request and spec: none
- Planning may continue: yes
