# UI Review

## Reviewed Change
- Feature: Common content empathy counts and friendlier 공감 buttons for 소통마당 and 공개자료
- Governing spec: Current user-approved request to apply common content reactions to all 소통마당 and 공개자료 surfaces
- Implementation plan: `docs/superpowers/plans/2026-07-06-content-empathy-label.md`
- Files or pages reviewed: `src/app/api/content-reactions/route.ts`, `src/components/content-like-button.tsx`, `src/components/news/notice-board.tsx`, `src/components/news/free-board.tsx`, `src/components/news/coop-newsletter.tsx`, `src/components/news/development-log.tsx`, `src/components/portal/document-table.tsx`, `src/components/disclosure/meetings-table.tsx`, Prisma migration, related regression tests, local `/news`, local `/disclosure`

## Boundary Review
- Finding: PASS
- Evidence: The new mutation requires a logged-in session and only targets existing `COOP_NEWS`, `FREE_POST`, or `DOCUMENT` records. It does not expose private comments, member/payment data, document file delivery, anonymous mutation, voting, notifications, or ranking feeds. Public/read-only share visitors can see counts but cannot create likes without login.

## Truthful Presentation Review
- Finding: PASS
- Evidence: The UI labels show the persisted `ContentReaction` count and mark the current user's existing selection with an accessible `선택됨` label. The display now uses `👍 공감 N` before selection and `🧡 공감 N` after selection, while the accessible label remains count-based and truthful. Existing 조회수/열람수 wording remains separate, so view counts and 공감 counts are not conflated.

## Design And Accessibility Review
- Finding: PASS
- Evidence: The button uses existing rounded pill controls, stone borders, ember accent for selected state, a stable minimum width, and compact table/card placement. The inactive thumbs-up and selected orange heart are decorative (`aria-hidden`) and do not replace the text label. `aria-label` includes the content title, count, and selected state, and row-click propagation is stopped on the button. Local `/news` and `/disclosure` returned HTTP 200 after restarting the dev server with the regenerated Prisma client.

## Outcome
- Result: PASS
- Required action: none

---

## Reviewed Change
- Feature: Very short Kakao share URLs
- Governing spec: Current user-approved follow-up to shorten copied Kakao/OpenChat URLs beyond `/share/...`
- Implementation plan: `docs/superpowers/plans/2026-07-05-short-share-url-code.md`
- Files or pages reviewed: `src/lib/short-share-url.ts`, `src/app/s/[code]/page.tsx`, `src/lib/notifications/openchat-announcements.ts`, `src/app/share/free/[id]/page.tsx`, `src/app/share/notice/[id]/page.tsx`, `src/app/share/newsletter/[id]/page.tsx`, `src/app/share/document/[id]/page.tsx`, related regression tests

## Boundary Review
- Finding: PASS
- Evidence: The new `/s/[code]` route resolves only to the same four already-approved public share kinds: free-board, notice, newsletter, and approved disclosure document. Free-board metadata still requires `isPublicShareEnabled: true`, disclosure metadata still requires `category: DISCLOSURE` and `status: APPROVED`, and visitors are redirected to the same canonical `/news?...` or `/disclosure?document=...` pages. No private member/payment data, document file delivery, voting, comments, or public mutation capability is exposed.

## Truthful Presentation Review
- Finding: PASS
- Evidence: Generated OpenChat/Kakao messages now contain `/s/[code]` links, while existing `/share/...` routes remain available for previously copied links. The route still emits Open Graph/Twitter metadata from the same content title, description, and cropped/social preview image priority, so the Kakao card remains tied to the actual post or public document.

## Design And Accessibility Review
- Finding: PASS
- Evidence: No new visual styling was introduced. `/s/[code]` reuses the existing `ShareRedirectPage` fallback screen with clear destination copy and a `바로 이동` link. The implementation adds no navigation, decorative motion, new controls, or layout changes.

## Outcome
- Result: PASS
- Required action: none

---

# UI Review

## Reviewed Change
- Feature: Content author display policy
- Governing spec: User-approved request in this session for author labels across 소통마당 and applicable public-data surfaces
- Implementation plan: Current implementation plan for common author label helper, news/free-board/comment wiring, and memberType data propagation
- Files or pages reviewed: `/news` desktop and mobile, notice list/detail author labels, free-board author helper tests, notice/comment/newsletter author formatting tests

## Boundary Review
- Finding: PASS
- Evidence: The change only updates visible author labels and User field selection for existing news/free-board/comment data. It does not expose new public routes, change login gates, add document access, alter mutations, or add personal-data surfaces. 공개자료 currently has no document author/uploader user field to relabel.

## Truthful Presentation Review
- Finding: PASS
- Evidence: Member and preliminary member labels now show the stored display name directly, refund users show `(환불)`, related-party users show `(관계자)`, and the admin public names `운영자`/`사무국` remain untagged. Existing `(나)` self marker is preserved.

## Design And Accessibility Review
- Finding: PASS
- Evidence: No layout, color, typography, motion, navigation, or control behavior was changed. Chrome/Playwright verification at 1440px and 390px opened `/news`, confirmed the notice table renders author labels, and found no document-level horizontal overflow.

## Outcome
- Result: PASS
- Required action: none

---

## Reviewed Change
- Feature: Content view/read counts for notices, free-board posts, and public disclosure documents
- Governing spec: Current user-approved request to show how many times homepage notices/posts/public materials were viewed
- Implementation plan: `docs/superpowers/plans/2026-07-05-content-view-counts.md`
- Files or pages reviewed: `src/components/news/notice-board.tsx`, `src/components/news/news-client.tsx`, `src/components/news/free-board.tsx`, `src/components/portal/document-table.tsx`, `src/components/disclosure/meetings-table.tsx`, `src/app/api/news/[id]/view/route.ts`, `src/app/api/news/free/[id]/view/route.ts`, `src/app/api/documents/[id]/view/route.ts`, `src/app/api/documents/[id]/merged-view/route.ts`, Prisma migration

## Boundary Review
- Finding: PASS
- Evidence: The change adds counters to already existing notice, free-board, and disclosure document surfaces. Free-board count increments respect the existing login/public-share boundary, and document file access still uses the existing approved disclosure/session checks. No member data, payment data, comments, votes, private documents, or new public mutation capability is exposed.

## Truthful Presentation Review
- Finding: PASS
- Evidence: Labels use `조회 N회` for notice/free-board posts and `열람 N회` for documents. Notice/free-board/disclosure list surfaces also state that counts are collected from `2026.07.05`. The numbers come from persisted database counters and increment only on the existing detail/file viewing flows. Document viewing remains successful even if the optional counter update fails.

## Design And Accessibility Review
- Finding: PASS
- Evidence: The new labels are small muted metadata text placed in dedicated list columns and existing detail/file metadata, using existing typography and neutral colors. The notice list now uses the list column for `조회수` instead of a comment button, free-board keeps `댓글` and adds `조회수`, and disclosure adds `열람수`. They do not add new cards, decorative motion, or action controls, and they preserve existing mobile table/card layouts. Codex browser was unavailable in this environment (`agent.browsers.list()` returned `[]`), so visible layout confidence is from component tests, production build, and local server HTTP checks.

## Outcome
- Result: PASS
- Required action: none

---

## Reviewed Change
- Feature: Admin 1.91:1 Kakao/social preview cropper for notices, free-board posts, and public disclosure documents
- Governing spec: Current user request to let administrators crop Kakao preview images; existing `/news` and `/disclosure?document=...` public social-preview behavior
- Implementation plan: `docs/superpowers/plans/2026-07-05-social-preview-cropper.md`
- Files or pages reviewed: `src/components/social-preview-cropper.tsx`, `src/lib/social-preview-crop.ts`, `src/components/news/notice-board.tsx`, `src/components/news/news-client.tsx`, `src/components/news/free-board.tsx`, `src/components/portal/document-upload-form.tsx`, `src/components/library/library-client.tsx`, `src/app/disclosure/page.tsx`, `src/app/api/documents/route.ts`, `src/app/api/documents/[id]/route.ts`, Prisma migration, `/news`, `/library`

## Boundary Review
- Finding: PASS
- Evidence: The new cropper is only attached to existing administrator create/edit surfaces for notices, free-board social preview images, and document upload/edit forms. Public visitors only receive metadata image selection for already public/shared content; no private documents, member data, payment data, comments, votes, or new public mutation capability is exposed.

## Truthful Presentation Review
- Finding: PASS
- Evidence: Labels say `카톡 미리보기 이미지 (선택)` and the crop modal states that the 1.91:1 box controls what appears in Kakao. Generated files are uploaded as public social preview images and stored in `socialImagePath`; `/disclosure?document=...` uses that image only for approved disclosure documents and falls back to the existing hero image when absent.

## Design And Accessibility Review
- Finding: PASS
- Evidence: The cropper uses the existing warm canvas, stone borders, dark pill CTA, compact labels, and no new decorative motion. The full image preview area is a focusable drag target with an accessible label, and 크롭 크기 plus 가로/세로 위치 sliders let admins shrink the 1.91:1 box first, then move it on both axes when the source image allows. Headless Chrome checks rendered `/news` and `/library` at desktop/mobile widths without blank pages, and regression coverage verifies crop dimensions, ratio-preserving resize, bounded movement, create/edit upload flow, document metadata, and public Open Graph output.

## Outcome
- Result: PASS
- Required action: none

---

## Reviewed Change
- Feature: Short Kakao share URLs
- Governing spec: Current user-approved follow-up to `docs/superpowers/plans/2026-07-05-social-preview-cropper.md`
- Implementation plan: reuse existing social preview metadata builders on short `/share/...` routes
- Files or pages reviewed: `src/app/share/free/[id]/page.tsx`, `src/app/share/notice/[id]/page.tsx`, `src/app/share/newsletter/[id]/page.tsx`, `src/app/share/document/[id]/page.tsx`, `src/components/share/share-redirect-page.tsx`, `src/lib/notifications/openchat-announcements.ts`

## Boundary Review
- Finding: PASS
- Evidence: Free-board share metadata still requires `isPublicShareEnabled: true`. Document share metadata still requires `category: DISCLOSURE` and `status: APPROVED`. Notice/newsletter routes reuse already-public `CoopNews` data only. No private comments, member data, payment data, document file delivery, or mutation capability is exposed.

## Truthful Presentation Review
- Finding: PASS
- Evidence: The generated Kakao/OpenChat copy now links to short share URLs while the routes redirect to the same canonical `/news?...` and `/disclosure?document=...` pages. The Open Graph title, description, and image continue to come from the same public post/document metadata and existing Kakao preview image priority.

## Design And Accessibility Review
- Finding: PASS
- Evidence: The only new visible UI is a minimal warm-canvas redirect screen with a clear title, short explanatory text, and a fallback `바로 이동` link. It uses the existing warm canvas, white card, inset stone outline, and dark pill action style. The screen is responsive and does not introduce navigation or new workflow controls.

## Outcome
- Result: PASS
- Required action: none

---

## Reviewed Change
- Feature: Dedicated Kakao/social preview image for free-board posts
- Governing spec: Existing `/news?tab=free&post=...` public social preview behavior and current user request to also support free-board posts
- Implementation plan: Direct admin editing slice; no separate plan file
- Files or pages reviewed: `src/components/news/free-board.tsx`, `src/app/api/news/free/route.ts`, `src/lib/news/free-board-api.ts`, `src/lib/news/free-board-list.ts`, `src/lib/news/social-preview.ts`, related regression tests

## Boundary Review
- Finding: PASS
- Evidence: The change adds an administrator-only `socialImagePath` create/update path for free-board posts. General member posting, private comments, document data, member data, payments, voting, and public mutation permissions are unchanged.

## Truthful Presentation Review
- Finding: PASS
- Evidence: Admins can now choose a `카톡 미리보기 이미지 (선택)` for free-board posts. Public social metadata uses that explicit image first, then the public body image, then the existing image/hero fallback.

## Design And Accessibility Review
- Finding: PASS
- Evidence: The visible UI change is limited to a labeled optional image file input inside the existing free-board post settings panel, using the same rounded dashed file-input styling as adjacent controls. Regression coverage verifies API persistence, edit upload payloads, and social-preview priority.

## Outcome
- Result: PASS
- Required action: none

---

## Reviewed Change
- Feature: Dedicated Kakao/social preview image for news posts
- Governing spec: Existing `/news` public social preview behavior and current user request to choose the Kakao preview image
- Implementation plan: Direct metadata and admin editing slice; no separate plan file
- Files or pages reviewed: `src/components/news/notice-board.tsx`, `src/components/news/news-client.tsx`, `src/app/news/page.tsx`, `src/lib/news/social-preview.ts`, `src/app/api/news/route.ts`, `prisma/schema.prisma`, related migration and tests

## Boundary Review
- Finding: PASS
- Evidence: The change adds an admin-controlled `socialImagePath` field for news/free-board posts and uses it only for public social metadata. It does not expose private comments, documents, member data, payments, voting, or any new public mutation capability.

## Truthful Presentation Review
- Finding: PASS
- Evidence: Admins can now upload a separate `카톡 미리보기 이미지` when creating or editing notices. Kakao/Open Graph metadata uses that explicit image first, then the public post body image, then the existing card image or hero fallback.

## Design And Accessibility Review
- Finding: PASS
- Evidence: The visible UI change is limited to a labeled optional file input in existing notice create/edit forms, using the same rounded input and file-button styling as adjacent attachment controls. Regression coverage verifies create/edit upload payloads, API persistence, metadata priority, and existing board-copy behavior.

## Outcome
- Result: PASS
- Required action: none

---

## Reviewed Change
- Feature: Notice/newsletter social preview body-image fallback
- Governing spec: Existing `/news` public social preview behavior and current user Kakao preview request
- Implementation plan: Direct metadata bug-fix slice; no separate plan file
- Files or pages reviewed: `src/app/news/page.tsx`, `src/lib/news/social-preview.ts`, `src/__tests__/news-page-metadata.test.ts`, `src/__tests__/news-social-preview.test.ts`

## Boundary Review
- Finding: PASS
- Evidence: The change only expands public `/news?tab=notice&news=...` and `/news?tab=newsletter&news=...` metadata generation to use the already public post content and image fields. It does not expose private free-board posts, comments, documents, member data, payment data, or any mutation capability.

## Truthful Presentation Review
- Finding: PASS
- Evidence: The social preview image now reflects the first safe image embedded in the shared public post body, then the post image field, then the existing community hero fallback. The preview title and description still come from the same public post content.

## Design And Accessibility Review
- Finding: PASS
- Evidence: No rendered page layout, typography, navigation, motion, or interactive UI was changed. Regression coverage verifies that notice metadata looks up the requested public notice and uses the first body image for Open Graph and Twitter images; the shared preview helper continues to reject unsafe image sources.

## Outcome
- Result: PASS
- Required action: none

---

## Reviewed Change
- Feature: Free-board editor mouse-selection and registeredAt correction
- Governing spec: Existing free-board rich-content editing workflow and current user report
- Implementation plan: Direct bug-fix slice; no separate plan file
- Files or pages reviewed: `src/components/news/rich-text-editor-v2.tsx`, `src/components/news/free-board.tsx`, `src/app/api/news/free/route.ts`, `src/app/api/news/route.ts`, `src/lib/news/korea-date-time.ts`, related regression tests

## Boundary Review
- Finding: PASS
- Evidence: The change only adjusts editor click handling and administrator `registeredAt` parsing/defaulting. Posting permissions, edit permissions, public-share gating, comments, attachments, bookmarks, and routes remain unchanged.

## Truthful Presentation Review
- Finding: PASS
- Evidence: New administrator free-board posts no longer submit a client-prefilled registration timestamp, so the server/database creation time remains the default unless an administrator explicitly enters a registration date. Existing edit mode still shows and can update the saved registration date.

## Design And Accessibility Review
- Finding: PASS
- Evidence: No layout, color, typography, imagery, or motion was changed. Regression coverage verifies that mouse-selected text is not collapsed by the editor root-click fallback, image node selection can still be cleared by clicking the editor body, native input selection events do not rewrite rich formatting, new admin free-board posts start with a blank registration date, and `datetime-local` values are parsed as Korea wall-clock time.

## Outcome
- Result: PASS
- Required action: none

---

## Reviewed Change
- Feature: Rich editor mouse-selection formatting preservation
- Governing spec: Existing notice/free-board rich-content editing workflow and current user report
- Implementation plan: Direct editor bug-fix slice; no separate plan file
- Files or pages reviewed: `src/components/news/rich-text-editor-v2.tsx`, `src/__tests__/news-rich-content-links.test.tsx`, free-board focused post edit mode

## Boundary Review
- Finding: PASS
- Evidence: The change only gates the rich editor's native DOM `input` fallback so selection-style input events do not rewrite saved HTML. Routes, APIs, permissions, posting, comments, attachments, public-share behavior, and editor toolbar capabilities are unchanged.

## Truthful Presentation Review
- Finding: PASS
- Evidence: The editor still exposes the same writing surface and formatting controls. It does not add or imply any new moderation, approval, storage, or private-data capability.

## Design And Accessibility Review
- Finding: PASS
- Evidence: No visual styling, layout, color, typography, or motion was changed. Regression coverage verifies that selecting formatted text and receiving a native input event does not call `onChange` with normalized DOM HTML, while the existing editor and notice/free-board tests continue to cover real content updates.

## Outcome
- Result: PASS
- Required action: none

---

## Reviewed Change
- Feature: Mobile rich-content image aspect-ratio preservation
- Governing spec: Existing news/free-board rich-content reading workflow and current user mobile screenshot report
- Implementation plan: Direct rendering bug-fix slice; no separate plan file
- Files or pages reviewed: `src/components/news/notice-rich-editor.tsx`, `src/__tests__/news-rich-content-links.test.tsx`, free-board focused post rich content on mobile

## Boundary Review
- Finding: PASS
- Evidence: The change only adds mobile CSS overrides to the read-only `NoticeRichContent` renderer so saved inline image heights and `object-fit:fill` do not distort images on small screens. Routes, APIs, permissions, posting, editing, comments, attachments, public-share gating, and stored HTML are unchanged.

## Truthful Presentation Review
- Finding: PASS
- Evidence: The page continues to show the same post body images and metadata. No new data, action capability, private content, or fabricated state is presented.

## Design And Accessibility Review
- Finding: PASS
- Evidence: The read view now applies `max-sm:[&_img]:!h-auto max-sm:[&_img]:!object-contain`, preserving image aspect ratio on mobile while leaving desktop rendering and editor resizing behavior intact. Regression coverage verifies that saved pixel-sized images still retain their stored inline dimensions but receive the mobile proportional-display overrides.

## Outcome
- Result: PASS
- Required action: none

---

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
