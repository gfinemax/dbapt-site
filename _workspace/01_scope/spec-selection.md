# Spec Selection

- selected approved spec path: `docs/superpowers/plans/2026-06-25-free-board-public-share.md`.
- implementation boundary: Reuse existing `FreePost`, `/news?tab=free&post=...`, and the current left focus panel. Add administrator-controlled `isPublicShareEnabled` state. For unauthenticated visitors, load only the requested post when public sharing is enabled and render it read-only. Keep full 자유게시판 list loading, comments, writing, editing, deleting, and openchat copy behind login/admin/member permissions.
- conflicts between the request and spec: none. The user explicitly approved the per-post public share approach after the tradeoff discussion.
- whether planning may continue: yes, because the approved slice is narrow and does not expose full board access or private member workflows.
