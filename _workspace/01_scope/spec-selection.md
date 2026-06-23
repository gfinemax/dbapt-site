# Spec Selection

- selected approved spec path: `docs/superpowers/plans/2026-06-01-daebang-news-admin-media-controls.md` and `docs/superpowers/plans/2026-06-21-news-development-log.md`.
- implementation boundary: Reuse existing `CoopNews` for 공지사항, 조합뉴스, and 개발일지; reuse existing `FreePost` for 자유게시판. Add/display/edit `registeredAt` without changing FAQ, tab access boundaries, or the existing 조합뉴스 card presentation. Move 조합뉴스 detail/create/edit interaction into a left slide panel while keeping `createdAt` immutable as an internal system record.
- conflicts between the request and spec: none. The request extends the approved news admin and development-log workflows with a shared visible date field.
- whether planning may continue: yes, because the user approved the implementation plan in this thread and the work stays inside the existing news/public communication surfaces.
