# UI Review

## Reviewed Change
- Feature: Free-board focused post mobile reading width
- Governing spec: Existing free-board focused-post workflow and current user mobile screenshot report
- Implementation plan: Direct layout bug-fix slice; no separate plan file
- Files or pages reviewed: `src/components/news/free-board.tsx`, `src/__tests__/news-admin-controls.test.tsx`, `/news?tab=free&post=<id>` focused post panel

## Boundary Review
- Finding: PASS
- Evidence: The change only reduces mobile padding inside the existing free-board focused reading panel and its rich-content body. Routes, APIs, permissions, public-share gating, posting, editing, comments, attachments, and copy tools are unchanged.

## Truthful Presentation Review
- Finding: PASS
- Evidence: The panel still presents the same post title, author/date metadata, content, attachments, and comments/read-only messaging. No new data, capability, or private information is implied.

## Design And Accessibility Review
- Finding: PASS
- Evidence: The desktop shell/content width contracts remain `780px` and `680px`. On mobile, the free-board focused panel no longer keeps the old `p-6` outer padding and instead uses `px-3 py-4 sm:p-8`; the free-board rich body adds `max-sm:px-3 max-sm:py-4`, giving text and image galleries more usable width while preserving the shared notice rich-content defaults. Regression coverage verifies these classes on the focused post panel.

## Outcome
- Result: PASS
- Required action: none

---

## Reviewed Change
- Feature: Free-board new-post drawer backdrop behavior
- Governing spec: Existing free-board writing workflow and current user bug report
- Implementation plan: Direct bug-fix slice; no separate plan file
- Files or pages reviewed: `src/components/news/free-board.tsx`, `src/__tests__/news-admin-controls.test.tsx`, `/news?tab=free` new-post drawer behavior

## Boundary Review
- Finding: PASS
- Evidence: The change only refines the new-post writing drawer layer and close behavior. Posting, editing, comments, public share, copy tools, routes, APIs, permissions, and schema are unchanged.

## Truthful Presentation Review
- Finding: PASS
- Evidence: The drawer still presents the same writing fields and explicit `닫기` control. Empty drafts can close from the backdrop, while dirty drafts require confirmation before losing content. It does not imply any new autosave, delivery, approval, or private-data capability.

## Design And Accessibility Review
- Finding: PASS
- Evidence: No layout, color, typography, or motion was changed. The drawer now matches the notice-write pattern by rendering the fixed drawer as a direct sibling above the backdrop instead of inside a full-screen `pointer-events-none` wrapper. The explicit close button remains keyboard/click accessible. Regression coverage verifies that the drawer does not have a `pointer-events-none` parent, clicking the outside backdrop closes an empty drawer, and dirty drafts require confirmation before closing.

## Outcome
- Result: PASS
- Required action: none

---

## Reviewed Change
- Feature: Free-board public-share social preview image
- Governing spec: Current user request plus existing `/news?tab=free&post=...` public-share boundary
- Implementation plan: Direct metadata-only slice; no separate plan file
- Files or pages reviewed: `src/app/news/page.tsx`, `src/lib/news/social-preview.ts`, `src/lib/site-metadata.ts`, `/news?tab=free&post=<id>` metadata behavior

## Boundary Review
- Finding: PASS
- Evidence: The change only reads a free-board post in `generateMetadata` when the URL targets `tab=free&post=<id>` and the post has `isPublicShareEnabled: true`. Private or non-shared posts keep the default site preview image.

## Truthful Presentation Review
- Finding: PASS
- Evidence: The preview title, description, and image come from the same shared post title/content already used by the public-share page. No new login-gated data, comments, bookmarks, personal data, document access, payment, voting, or mutation capability is presented.

## Design And Accessibility Review
- Finding: PASS
- Evidence: No rendered page layout, typography, navigation, motion, or interactive UI was changed. The default root social image remains `public/assets/hero/community-hero-04.png`; shared free-board links use the first safe image in the post body or legacy `imagePath` fallback.

## Outcome
- Result: PASS
- Required action: none

---

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
- Evidence: Chrome CDP verification at 1440px found the notice table title rendered with `white-space: nowrap`, `overflow: hidden`, and `text-overflow: ellipsis`; title height stayed one line at 19px, author/comment cells stayed `nowrap`, and desktop table internal overflow was false. Verification at 390px kept internal table scrolling and 0px document horizontal overflow. Component tests cover the same badge/title split and one-line truncation contract for notices and the free board, plus member `760px` table width and admin-only free-board `관리` column.

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
