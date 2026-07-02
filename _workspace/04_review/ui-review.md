# UI Review

## Reviewed Change
- Feature: News list consistency
- Governing spec: `docs/superpowers/specs/2026-05-25-daebang-housing-cooperative-portal-design.md`
- Implementation plan: `docs/superpowers/plans/2026-07-02-notice-list-readability.md`
- Files or pages reviewed: `/news?tab=notice` and `/news?tab=free` desktop and mobile, notice/free-board list tables, important badges, comment actions, bookmark column

## Boundary Review
- Finding: PASS
- Evidence: The change only refines the existing notice and free-board list presentation. It does not alter routes, APIs, schema, permissions, comments, bookmark persistence, copy tools, open-chat announcements, public-share behavior, or edit/detail workflows.

## Truthful Presentation Review
- Finding: PASS
- Evidence: The lists continue to show the same titles, authors, dates, comments, type/material badges, and bookmark actions. `보관` was moved into a clearer dedicated column without changing the underlying personal-library behavior.

## Design And Accessibility Review
- Finding: PASS
- Evidence: Chrome CDP verification at 1440px found the notice member table using `table-fixed` and `min-width: 760px`, and the admin free-board table using `table-fixed` and `min-width: 820px`, with `tableScrollWidth` equal to `tableClientWidth` at 862px on desktop. Verification at 390px kept internal table scrolling and 0px document horizontal overflow. Component tests cover the member `760px` table width and confirm the free-board `관리` column is hidden for members and visible for admins.

## Outcome
- Result: PASS
- Required action: none

---

## Reviewed Change
- Feature: Notice list readability
- Governing spec: `docs/superpowers/specs/2026-05-25-daebang-housing-cooperative-portal-design.md`
- Implementation plan: `docs/superpowers/plans/2026-07-02-notice-list-readability.md`
- Files or pages reviewed: `/news?tab=notice` desktop and mobile, notice-board table row, comment action, title metadata badges

## Boundary Review
- Finding: PASS
- Evidence: The change only refines the existing notice list presentation. It does not alter `/news`, APIs, permissions, comments, bookmarks, admin actions, or the detail drawer.

## Truthful Presentation Review
- Finding: PASS
- Evidence: The list still shows the same notice title, author, date, comments, and metadata. The comment button remains accessible as `댓글 N개 보기` while showing a shorter visual label.

## Design And Accessibility Review
- Finding: PASS
- Evidence: The row uses denser padding, smaller metadata badges, a compact bordered comment pill, and an 860px internal table minimum width so mobile uses internal horizontal scrolling instead of wrapping each row vertically. Chrome CDP verification found document overflow 0px on desktop and mobile; first notice row height stayed 72px in both viewports.

## Outcome
- Result: PASS
- Required action: none

---

## Reviewed Change
- Feature: Communication menu label
- Governing spec: `docs/superpowers/specs/2026-05-25-daebang-housing-cooperative-portal-design.md`
- Implementation plan: `docs/superpowers/plans/2026-07-02-communication-menu-label.md`
- Files or pages reviewed: `/` desktop and mobile, public navigation, landing notice/library cards, search/library/issue/terms copy, open-chat/news API visible messages

## Boundary Review
- Finding: PASS
- Evidence: The change renames visible copy from `조합소식` to `소통마당` without exposing new public features, changing `/news`, or changing API/database behavior.

## Truthful Presentation Review
- Finding: PASS
- Evidence: The wording continues to describe the existing notice, newsletter, development-log, FAQ, and free-board surface. No new authentication, document access, payment, voting, or personal-data capability is implied.

## Design And Accessibility Review
- Finding: PASS
- Evidence: Typography, colors, and navigation structure remain unchanged. Chrome CDP verification at 1440px and 390px found `소통마당`, no remaining `조합소식` text on the rendered landing page, and 0px horizontal overflow after adding `min-w-0` to the touched landing notice/library cards.

## Outcome
- Result: PASS
- Required action: none
