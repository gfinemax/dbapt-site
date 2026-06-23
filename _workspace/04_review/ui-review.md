# UI Review

## Reviewed Change
- Feature: Shared visible/editable `등록일` for 공지사항, 자유게시판, 조합뉴스, and 개발일지 while keeping `작성일` as an internal system record. 조합뉴스 remains the existing card view, with 열람/작성/수정 moved into a left slide panel; follow-up blank/scrolled-away panel regressions were corrected by matching the existing left drawer layer/scroll pattern, rendering through `document.body`, and scrolling to the top on open. FAQ is unchanged.
- Governing spec: `docs/superpowers/plans/2026-06-01-daebang-news-admin-media-controls.md`, `docs/superpowers/plans/2026-06-21-news-development-log.md`.
- Implementation plan: User-approved release-date/register-date plan from this thread, recorded in `_workspace/00_input/request-summary.md` and `_workspace/01_scope/spec-selection.md`.
- Files or pages reviewed: `/news`, `/news?tab=free`, `/news?tab=newsletter`, `/news?tab=development`, `src/components/news/notice-board.tsx`, `src/components/news/news-client.tsx`, `src/components/news/coop-newsletter.tsx`, `src/components/news/development-log.tsx`, `src/app/api/news/route.ts`, `src/app/api/news/free/route.ts`, `src/app/news/page.tsx`, `src/app/page.tsx`, `prisma/schema.prisma`.

## Boundary Review
- Finding: PASS
- Evidence: The change stays inside existing 조합소식 communication surfaces. It does not expose FAQ changes, private document disclosure, account data, payments, voting, or new public access. `registeredAt` edits are guarded server-side where relevant, and direct `createdAt` mutation is rejected for both `CoopNews` and `FreePost`.

## Truthful Presentation Review
- Finding: PASS
- Evidence: Lists, cards, and detail panels now present `등록일` as the visible date. `작성일` remains a system record and is not offered as an edit control. 조합뉴스 is still rendered as cards, and its 열람/작성/수정 flows use a left slide panel instead of a centered modal. FAQ behavior is untouched.

## Design And Accessibility Review
- Finding: PASS
- Evidence: Added date controls and the 조합뉴스 slide panel use existing compact rounded inputs, warm canvas/card surfaces, and current drawer patterns. The 조합뉴스 panels now use the same visible left drawer layer/scroll structure as the existing working panels (`z-[130]`, panel-level `overflow-y-auto`), render as `document.body` portals, and reset viewport scroll on open. Tests cover notice list sorting, newsletter card date display, newsletter left slide-panel detail/create/edit flows, notice edit payload, development-log edit controls, and API guards. HTTP checks returned 200 for `/news`, `/news?tab=free`, `/news?tab=newsletter`, and `/news?tab=development`; Chrome CDP confirmed a clicked newsletter card opens a top-aligned detail panel.

## Outcome
- Result: PASS
- Required action: none
