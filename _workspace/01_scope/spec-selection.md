# Spec Selection - Notice Detail Mobile Readability

## Selected Approved Spec Path

`docs/superpowers/specs/2026-05-25-daebang-housing-cooperative-portal-design.md`

## Implementation Boundary

Refine only existing read-view presentation for 소통마당 notice details and shared HTML rich-content bodies: keep the 780px shell / 680px content contract, improve mobile title scale and metadata wrapping, show notice representative images without cropping, and make rich-content images full width on narrow screens. Public-material PDF surfaces stay on `PdfViewerModal`, whose mobile viewer rules are verified rather than replaced.

## Conflicts Between Request And Spec

none

## Planning May Continue

yes

---

# Spec Selection - Notice List Accumulation Readability

## Selected Approved Spec Path

`docs/superpowers/specs/2026-05-25-daebang-housing-cooperative-portal-design.md`

## Implementation Boundary

Refine only the existing notice list presentation: collapse administrator row actions behind one compact menu, add a mobile card list for notice rows, and keep existing notice data, sorting, metadata, reactions, bookmarks, copy actions, and delete actions wired to the same handlers. Keep routes, APIs, schemas, permissions, detail view, public-share behavior, and free-board presentation unchanged.

## Conflicts Between Request And Spec

none

## Planning May Continue

yes

---

# Spec Selection - Common Content Likes

## Selected Approved Spec Path

User-approved request in this session; no separate `docs/superpowers` spec exists for this incremental operational change.

## Implementation Boundary

Add a shared like model/API and show a user-facing `공감 N` affordance on free-board posts, notice/newsletter/development content, and disclosure documents without changing access gates, the single-reaction data model, or exposing private document contents.

## Conflicts Between Request And Spec

none

## Planning May Continue

yes

---

# Spec Selection - News List Consistency

## Selected Approved Spec Path

`docs/superpowers/specs/2026-05-25-daebang-housing-cooperative-portal-design.md`

## Implementation Boundary

Refine only the existing notice and free-board list table presentation: 760px member table minimum width, 820px admin table minimum width, compact row/header padding, softer important badges, dedicated bookmark column, compact comment pills, title/badge cell separation with one-line truncated titles, no vertical lettering in utility columns, and admin-only free-board management column. Keep existing routes, APIs, data models, permissions, comments, bookmarks, copy tools, open-chat announcements, public-share behavior, and detail/edit surfaces unchanged.

## Conflicts Between Request And Spec

none

## Planning May Continue

yes

---

# Spec Selection - Rich Content View Top Gap Tightening

## Spec Selection - Notice List Readability

## Selected Approved Spec Path

`docs/superpowers/specs/2026-05-25-daebang-housing-cooperative-portal-design.md`

## Implementation Boundary

Refine only the existing notice-board list table presentation: denser row padding, quieter number column, compact comment pill, and a secondary metadata row for badges/bookmark controls. Keep the same table, routes, data flow, permissions, comments, bookmarks, admin actions, and detail drawer behavior.

## Conflicts Between Request And Spec

none

## Planning May Continue

yes

---

## Spec Selection - Communication Menu Label

## Selected Approved Spec Path

`docs/superpowers/specs/2026-05-25-daebang-housing-cooperative-portal-design.md`

## Implementation Boundary

Rename only user-facing copy for the existing public news/community section from `조합소식` to `소통마당`. Keep `/news` route, API paths, Prisma models, permissions, tabs, and data behavior unchanged. A small landing notice-card `min-w-0` fix is allowed because required mobile browser verification found horizontal overflow in the touched visible surface.

## Conflicts Between Request And Spec

The original approved public navigation label used `조합소식`; the current user request explicitly supersedes that display label with `소통마당` while preserving the same public navigation boundary.

## Planning May Continue

yes

---

## Selected Approved Spec Path

`docs/superpowers/specs/2026-07-01-news-content-width-unification-design.md`

## Implementation Boundary

Refine only the notice/free-board rich-content read-mode section gap by removing the extra column `space-y` gap between the meta/header block and `NoticeRichContent`. Keep edit-mode form spacing and all existing shared body surface rules intact. The implementation may add focused regression tests. It must not change database schema, APIs, permissions, comments, reactions, bookmarks, copy tools, open-chat announcements, public-share behavior, or rich-editor capabilities.

## Conflicts Between Request And Spec

none

## Planning May Continue

yes

---

# Spec Selection - Rich Content View Spacing Parity

## Selected Approved Spec Path

`docs/superpowers/specs/2026-07-01-news-content-width-unification-design.md`

## Implementation Boundary

Refine only the notice/free-board rich-content view presentation so it uses the same body surface as edit mode without extra view-only wrapper padding or typography, and preserve empty editor paragraphs as visible blank lines in sanitized view HTML. The implementation may add focused regression tests. It must not change database schema, APIs, permissions, comments, reactions, bookmarks, copy tools, open-chat announcements, public-share behavior, or rich-editor capabilities.

## Conflicts Between Request And Spec

none

## Planning May Continue

yes

---

# Spec Selection - Free Board Side Edit

## Selected Approved Spec Path

`docs/superpowers/specs/2026-07-01-news-content-width-unification-design.md`

## Implementation Boundary

Use the approved shared news article width/body surface rules while changing only the free-board editing presentation: existing post editing moves into the left focused post panel, and new post writing remains a right-side drawer. The implementation may add tests for the side-edit workflow and drawer positioning. It must not change database schema, APIs, permissions, comments, reactions, bookmarks, copy tools, open-chat announcements, public-share behavior, or rich-editor capabilities.

## Conflicts Between Request And Spec

none

## Planning May Continue

yes

---

# Spec Selection - Shared Article Body Surface

## Selected Approved Spec Path

`docs/superpowers/specs/2026-07-01-news-content-width-unification-design.md`

## Implementation Boundary

Keep the existing `680px` article content width and unify the inner article body surface across notice/free-board rich view and edit modes, plus development-log read/edit text surfaces. The implementation may add shared CSS class constants and regression tests for padding, font size, line-height, and paragraph margin. It must not change database schema, APIs, permissions, comments, reactions, bookmarks, copy tools, open-chat announcements, public-share behavior, or rich-editor features.

## Conflicts Between Request And Spec

none

## Planning May Continue

yes

---

# Spec Selection - News Read/Edit Typography And Width Tightening

## Selected Approved Spec Path

`docs/superpowers/specs/2026-07-01-news-content-width-unification-design.md`

## Implementation Boundary

Tighten only the shared notice/free-board article shell and body canvas widths, and align the rich editor's default body typography with the published rich-content typography. Keep notice and free-board interaction models, routes, APIs, permissions, comments, reactions, bookmarks, copy tools, open-chat announcements, public-share behavior, and database schema unchanged.

## Conflicts Between Request And Spec

The previous spec used a `860px` shell and `760px` content canvas. The current user request asks for a narrower reading line length, so the same spec is updated to `780px` shell and `680px` content canvas.

## Planning May Continue

yes

---

# Spec Selection - Rich Editor Double Click Crop Entry

## Selected Approved Spec Path

`docs/superpowers/specs/2026-06-27-news-rich-editor-v2-design.md`

## Implementation Boundary

Refine only the existing rich-editor image NodeView click handling so a native double-click or two quick normal clicks on an image enters inline crop mode. Keep the existing crop toolbar, crop metadata, upload flow, APIs, permissions, schema, comments, and public navigation unchanged.

## Conflicts Between Request And Spec

none

## Planning May Continue

yes

---

# Spec Selection - Rich Editor Crop Empty Src Regression

## Selected Approved Spec Path

`docs/superpowers/specs/2026-06-27-news-rich-editor-v2-design.md`

## Implementation Boundary

Refine only the existing rich-editor image node parsing, rendering, and image metadata update path. Crop/resize/rotate updates must keep existing image source attributes, and the editor must not render image elements with an empty `src`. Do not change uploads, APIs, storage schema, permissions, comments, public navigation, or posting workflows.

## Conflicts Between Request And Spec

none

## Planning May Continue

yes

---

# Spec Selection - Published Two-Column Gallery Display

## Selected Approved Spec Path

`docs/superpowers/specs/2026-06-27-news-rich-editor-v2-design.md`

## Implementation Boundary

Refine only the existing rich-editor gallery HTML generation and published rich-content sanitization/display contract so saved `data-notice-gallery="two-column"` and `featured-grid` image galleries render with the editor's intended two-column grid. Do not change uploads, APIs, permissions, routes, comments, schema, public navigation, or normal body text flow.

## Conflicts Between Request And Spec

none

## Planning May Continue

yes

---

# Spec Selection - News Content Width Unification

## Selected Approved Spec Path

`docs/superpowers/specs/2026-07-01-news-content-width-unification-design.md`

## Implementation Boundary

Apply one shared article body canvas width to notice read/edit/write surfaces and free-board read/edit/write surfaces. The free-board width is intentionally reduced from the existing wide layout, while notice surfaces are widened only enough to share the same content canvas. The implementation changes visual layout classes and regression tests only; it does not change board permissions, data mutations, rich-editor behavior, comments, or routes.

## Conflicts Between Request And Spec

none

## Planning May Continue

yes

---

# Spec Selection - News Board Copy Tool

## Selected Approved Spec Path

`docs/superpowers/specs/2026-07-01-news-board-copy-design.md`

## Implementation Boundary

Implement administrator-only copy actions between `CoopNews` notices and `FreePost` free-board posts. The copy creates a new target row and leaves the source unchanged. Only title, rich content, attachment metadata, important/starred state, display author label, and registered date are copied. Comments, reactions, bookmarks, open-chat announcements, view counts, public-share settings, destructive movement, schema changes, and access-boundary changes are out of scope.

## Conflicts Between Request And Spec

none

## Planning May Continue

yes

---

# Spec Selection - Footer Credit Date

## Selected Approved Spec Path

`docs/superpowers/specs/2026-05-25-daebang-housing-cooperative-portal-design.md`

## Implementation Boundary

Update only the shared public footer credit text in `src/components/landing/site-footer.tsx` and its exact-copy regression test. The public landing/footer remains a public information surface; no authenticated or private functionality is introduced.

## Conflicts Between Request And Spec

none

## Planning May Continue

yes

---

# Spec Selection - Free Board Gallery Blank Space

## Selected Approved Spec Path

`docs/superpowers/specs/2026-06-27-news-rich-editor-v2-design.md`

## Implementation Boundary

Refine only `NoticeRichContent` published rich-content spacing. Gallery images are rendered as normal document-flow gallery content, so their saved image-layer metadata must not contribute extra root `padding-bottom`. True standalone `front`/`behind` layer images should continue to reserve bottom space so comments do not overlap.

## Conflicts Between Request And Spec

none

## Planning May Continue

yes

---

# Spec Selection

## Selected Approved Spec Path - Published Layer Image Text Flow Regression

`docs/superpowers/specs/2026-06-27-news-rich-editor-v2-design.md`

## Implementation Boundary - Published Layer Image Text Flow Regression

Refine only `NoticeRichContent` image display rendering for trusted `front`/`behind` image metadata. The layer wrapper should remain zero-height so following body text is not pushed down at the insertion point, while the rich-content root may reserve bottom space based on saved image dimensions, offset, zoom, and rotation so comments do not overlap. No route, schema, upload, permission, comment, storage, or destructive bitmap changes.

## Conflicts Between Request And Spec - Published Layer Image Text Flow Regression

none

## Planning May Continue - Published Layer Image Text Flow Regression

yes

---

## Selected Approved Spec Path - Published Layer Image Overlaps Comment Box

`docs/superpowers/specs/2026-06-27-news-rich-editor-v2-design.md`

## Implementation Boundary - Published Layer Image Overlaps Comment Box

Refine only `NoticeRichContent` image sanitization/display rendering for trusted `front`/`behind` image metadata. The rendered layer may reserve document-flow height based on saved pixel dimensions, offset, zoom, and rotation so following comment content does not overlap. No route, schema, upload, permission, comment, storage, or destructive bitmap changes.

## Conflicts Between Request And Spec - Published Layer Image Overlaps Comment Box

none

## Planning May Continue - Published Layer Image Overlaps Comment Box

yes

---

## Selected Approved Spec Path - Edit Preview And Published Rich Content Diverge

`docs/superpowers/specs/2026-06-27-news-rich-editor-v2-design.md`

## Implementation Boundary - Edit Preview And Published Rich Content Diverge

Refine only the existing rich-editor HTML persistence/display contract so `NoticeRichContent` renders trusted image metadata consistently with `RichTextEditorV2`. The fix may update sanitizer output and rich-content display styles for existing image layout attributes. No route, schema, upload, permission, storage, destructive bitmap export, or full page-layout engine changes.

## Conflicts Between Request And Spec - Edit Preview And Published Rich Content Diverge

none

## Planning May Continue - Edit Preview And Published Rich Content Diverge

yes

---

## Selected Approved Spec Path - Saved Layer Image Position Resets In Display

`docs/superpowers/specs/2026-06-27-news-rich-editor-v2-design.md`

## Implementation Boundary - Saved Layer Image Position Resets In Display

Refine only rich-content image sanitization and display style generation so saved editor metadata (`data-layout`, `data-align`, `data-zoom`, `data-offset-x`, `data-offset-y`) renders consistently after a post is saved. No route, schema, upload, permission, storage, destructive bitmap export, or full page-layout engine changes.

## Conflicts Between Request And Spec - Saved Layer Image Position Resets In Display

none

## Planning May Continue - Saved Layer Image Position Resets In Display

yes

---

## Selected Approved Spec Path - Front Behind Image Layer Drag

`docs/superpowers/specs/2026-06-27-news-rich-editor-v2-design.md`

## Implementation Boundary - Front Behind Image Layer Drag

Refine only the existing `RichTextEditorV2` image NodeView and saved image metadata. The `behind` and `front` layout modes may render as movable layers with stored `data-offset-x` and `data-offset-y` values. Drag movement is supported for those layer modes only. No route, schema, upload, permission, storage, destructive bitmap export, or full page-layout engine changes.

## Conflicts Between Request And Spec - Front Behind Image Layer Drag

none

## Planning May Continue - Front Behind Image Layer Drag

yes

---

## Selected Approved Spec Path - Inline Image Double-Click Crop Mode

`docs/superpowers/specs/2026-06-27-news-rich-editor-v2-design.md`

## Implementation Boundary - Inline Image Double-Click Crop Mode

Refine only the existing `RichTextEditorV2` image NodeView interaction. Double-click may switch the selected image object into an inline crop state with internal handles and explicit save/cancel controls. Saving crop updates only existing image presentation metadata (`data-fit`, `data-crop-x`, `data-crop-y`, `data-zoom`). No route, schema, upload, permission, storage, destructive bitmap export, or page-fixed layout changes.

## Conflicts Between Request And Spec - Inline Image Double-Click Crop Mode

none

## Planning May Continue - Inline Image Double-Click Crop Mode

yes

---

## Selected Approved Spec Path - Google Docs Image Toolbar Clone Follow-up

`docs/superpowers/specs/2026-06-27-news-rich-editor-v2-design.md`

## Implementation Boundary - Google Docs Image Toolbar Clone Follow-up

Refine only the existing `RichTextEditorV2` image NodeView selection UI. The rotation angle label may move into the rotated object surface beside the rotation handle, and the bottom selected-image toolbar may be restyled as an icon-only Google Docs-like popup. Layout actions continue to update existing `data-layout` metadata. No route, schema, upload, permission, storage, bitmap export, or absolute positioning changes.

## Conflicts Between Request And Spec - Google Docs Image Toolbar Clone Follow-up

none

## Planning May Continue - Google Docs Image Toolbar Clone Follow-up

yes

---

## Selected Approved Spec Path - Google Docs Rotated Image Object And Options Panel

`docs/superpowers/specs/2026-06-27-news-rich-editor-v2-design.md`

## Implementation Boundary - Google Docs Rotated Image Object And Options Panel

Refine only the existing `RichTextEditorV2` image NodeView and its advanced image options surface. Rotation must be applied to the same visual object that owns the outline, handles, and rotate handle. The bottom document-object toolbar may expose a real placement menu backed by existing `data-layout` metadata. Detailed image controls may move from a full-screen editor into a right-side options panel while keeping the same metadata persistence. No route, schema, upload, permission, bitmap export, or page-fixed absolute positioning changes.

## Conflicts Between Request And Spec - Google Docs Rotated Image Object And Options Panel

none

## Planning May Continue - Google Docs Rotated Image Object And Options Panel

yes

---

## Selected Approved Spec Path - Non-Clipping Image Rotation Feedback

`docs/superpowers/specs/2026-06-27-news-rich-editor-v2-design.md`

## Implementation Boundary - Non-Clipping Image Rotation Feedback

Refine only the existing `RichTextEditorV2` selected image NodeView and compatible rich-content rendering. Selected images may show an angle label and rotated object outline. Rotated images must not be clipped by the frame or forced into a `cover` crop frame. Continue to persist rotation through existing `data-rotate` metadata. No route, schema, upload, permission, bitmap export, or absolute layout changes.

## Conflicts Between Request And Spec - Non-Clipping Image Rotation Feedback

none

## Planning May Continue - Non-Clipping Image Rotation Feedback

yes

---

## Selected Approved Spec Path - Google Docs Middle Handles And Top Rotation

`docs/superpowers/specs/2026-06-27-news-rich-editor-v2-design.md`

## Implementation Boundary - Google Docs Middle Handles And Top Rotation

Refine only the existing `RichTextEditorV2` selected image NodeView. The top rotation handle must be visually above the selected image. Middle resize handles must mutate pixel dimensions (`data-pixel-width` or `data-pixel-height`) rather than crop metadata, while corner handles preserve proportional resize behavior. Saved/public rendering must avoid unintended `cover` crop frames after pixel resizing. No route, schema, upload, permission, or absolute layout changes.

## Conflicts Between Request And Spec - Google Docs Middle Handles And Top Rotation

none

## Planning May Continue - Google Docs Middle Handles And Top Rotation

yes

---

## Selected Approved Spec Path - Google Docs Style Image Handles And Rotation

`docs/superpowers/specs/2026-06-27-news-rich-editor-v2-design.md`

## Implementation Boundary - Google Docs Style Image Handles And Rotation

Refine only the existing `RichTextEditorV2` image NodeView selection UI and presentation metadata behavior. Selected images may show smaller Google Docs style resize handles, a top rotation handle, and a compact bottom layout toolbar. Rotation and layout changes must continue to save through the existing HTML attributes (`data-rotate`, `data-layout`, etc.). No route, schema, upload, permission, or absolute page layout system changes.

## Conflicts Between Request And Spec - Google Docs Style Image Handles And Rotation

none

## Planning May Continue - Google Docs Style Image Handles And Rotation

yes

---

## Selected Approved Spec Path - Free Board Compact Fixed-Width Composer

`docs/superpowers/specs/2026-06-28-free-board-wide-editor-design.md`

## Implementation Boundary - Free Board Compact Fixed-Width Composer

Continue within the existing free-board create/edit dialog. Refine only the dialog shell and form layout: narrower fixed maximum dialog/content width, taller visible rich body writing area, reduced header copy, title/body-first ordering, and compact settings/attachment controls after the editor. Keep the existing state, validation, upload, API payload, permissions, and rich editor commands unchanged.

## Conflicts Between Request And Spec - Free Board Compact Fixed-Width Composer

none

## Planning May Continue - Free Board Compact Fixed-Width Composer

yes

---

## Selected Approved Spec Path - Google Docs Image Crop Intent And Handle Roles

`docs/superpowers/specs/2026-06-27-news-rich-editor-v2-design.md`

## Implementation Boundary - Google Docs Image Crop Intent And Handle Roles

Refine only the existing `RichTextEditorV2` image NodeView interactions. Image surface pointer/mouse movement should select the image object only, not mutate crop metadata. Resize handles must use the actual pressed handle direction. No route, schema, upload, permission, or storage contract changes.

## Conflicts Between Request And Spec - Google Docs Image Crop Intent And Handle Roles

none

## Planning May Continue - Google Docs Image Crop Intent And Handle Roles

yes

---

## Selected Approved Spec Path - Google Docs Style Clean Image Controls

`docs/superpowers/specs/2026-06-27-news-rich-editor-v2-design.md`

## Implementation Boundary - Google Docs Style Clean Image Controls

Refine only the existing `RichTextEditorV2` image NodeView selection UI. The default selected-image state should be a Google Docs style object selection surface with one compact `이미지 레이아웃 도구` toolbar and 8 resize handles. Advanced image editing remains the existing `이미지 편집` dialog. No route, schema, API, upload, permission, or persistence contract changes.

## Conflicts Between Request And Spec - Google Docs Style Clean Image Controls

none

## Planning May Continue - Google Docs Style Clean Image Controls

yes

---

## Selected Approved Spec Path - Google Docs Style Inline Image Editing

`docs/superpowers/specs/2026-06-27-news-rich-editor-v2-design.md`

## Implementation Boundary - Google Docs Style Inline Image Editing

Continue within the existing Tiptap `RichTextEditorV2` rich body field. Images may store presentation metadata in the existing HTML string as `data-width`, `data-fit`, `data-crop-x`, `data-crop-y`, `data-rotate`, `data-align`, `data-layout`, and `data-zoom`. The primary editing surface is the selected image object inside the editor, with direct layout, crop, zoom, and resize controls. The detailed modal remains an advanced helper. No storage, API, route, or permission behavior changes.

## Conflicts Between Request And Spec - Google Docs Style Inline Image Editing

none

## Planning May Continue - Google Docs Style Inline Image Editing

yes

---

## Selected Approved Spec Path

`docs/superpowers/specs/2026-06-27-news-rich-editor-v2-design.md`

## Implementation Boundary

Implement a Tiptap-based `RichTextEditorV2` for the existing news/free-board rich body field. The editor must save HTML through the existing content string flow and render through the existing `NoticeRichContent` surface. Text formatting must support font family, font size, line-height, inline marks, alignment, lists, indent/outdent, links, and color controls. Images must be selected and manipulated like document objects: selection outline, direct resize handle, compact floating toolbar for quick alignment/fit/delete/edit actions, and a separate image editing modal for detailed pixel size, crop, and rotation changes. The separate legacy selected-image toolbar/sub-toolbar and the dense node-local slider/text preset bar are out of scope and should be removed. Multi-image `2열` and `대표+2열` layouts remain image-only gallery blocks and must not turn body text into two columns.

## Conflicts Between Request And Spec

none

## Planning May Continue

yes
# Spec Selection - Free Board Wide Editor

- Selected approved spec path: `docs/superpowers/specs/2026-06-28-free-board-wide-editor-design.md`.
- Implementation boundary: replace the free-board create/edit drawer with a wide responsive dialog; keep existing data flow and rich editor behavior.
- Conflicts between request and spec: none.
- Planning may continue: yes.

---

# Spec Selection - Short Kakao Share URLs

- Selected approved plan path: `docs/superpowers/plans/2026-07-05-social-preview-cropper.md`.
- Implementation boundary: add very short public `/s/[code]` share routes for free-board, notice, newsletter, and approved disclosure document links; reuse existing social preview image builders and redirect visitors to the canonical pages. Update generated OpenChat/Kakao copy to use the shortest URLs.
- Conflicts between request and plan: none.
- Planning may continue: yes.

---

# Spec Selection - Content View Counts

- Selected approved plan path: `docs/superpowers/plans/2026-07-05-content-view-counts.md`.
- Implementation boundary: show and increment simple aggregate counts for notice/newsletter views, free-board post views, and disclosure document PDF reads. Show the baseline date for aggregate counts, use dedicated list columns for notice/free-board/disclosure counts, and preserve free-board comment-count visibility. Use existing public/access boundaries and do not add download analytics or source attribution.
- Conflicts between request and plan: none.
- Planning may continue: yes.

---

# Spec Selection - Free Board Comment Editing

## Selected Approved Spec Path

User-approved request in this session; no separate `docs/superpowers` spec exists for this incremental free-board comment workflow change.

## Implementation Boundary

Add edit capability to existing free-board comments and replies only. Reuse the current free-board `PATCH /api/news/free` route, existing author/admin permission rule, existing comment display-author choices for admins, and existing focused post panel UI patterns. Do not change access gates, schemas, post editing, public-share read-only behavior, notice comment editing, reaction behavior, or deletion behavior.

## Conflicts Between Request And Spec

none

## Planning May Continue

yes
