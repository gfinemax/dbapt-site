# Request Summary - News Content Width Unification

## Requested Feature Slice

- Unify notice and free-board article content widths so writing mode and read mode render on the same content canvas.
- Reduce the free-board article width from the current wide layout while applying the same content-width condition to notice writing and notice reading.
- Keep shell types intact where useful: notice writing can remain a right-side drawer and free-board writing can remain a modal, but their article body canvas should share the same width rule.

## Explicitly Excluded Scope

- No changes to posting permissions, comments, reactions, bookmarks, copy tools, open-chat announcements, or public-share behavior.
- No editor feature changes beyond layout width classes.
- No navigation, route, schema, or API behavior changes.

## Candidate Governing Specification

`docs/superpowers/specs/2026-07-01-news-content-width-unification-design.md`

## Unanswered Decision

none

---

# Request Summary - News Board Copy Tool

## Requested Feature Slice

- Add an administrator convenience tool to copy an existing notice into the free board or an existing free-board post into notices.
- Keep the first implementation low risk: copy the post body and attachment metadata only, keep the source post unchanged, and do not copy comments/reactions/bookmarks/open-chat announcements.

## Explicitly Excluded Scope

- No destructive move/delete behavior.
- No comment, reply, reaction, bookmark, open-chat, view-count, or public-share migration.
- No schema migration or cross-board relationship tracking.
- No public navigation or access-boundary expansion.

## Candidate Governing Specification

`docs/superpowers/specs/2026-07-01-news-board-copy-design.md`

## Unanswered Decision

none

---

# Request Summary - Footer Credit Date

## Requested Bug Fix Slice

- Change the shared footer credit text from `Website created & maintained by 오학동 · 2026` to `Website created & maintained by 오학동 · 2026.6.17`.
- Keep footer layout, links, address, and contact number unchanged.

## Explicitly Excluded Scope

- No navigation, access boundary, footer layout, styling, or route changes.
- No unrelated date/copy changes elsewhere in the site.

## Candidate Governing Specification

`docs/superpowers/specs/2026-05-25-daebang-housing-cooperative-portal-design.md`

## Unanswered Decision

none

---

# Request Summary - Free Board Gallery Blank Space

## Requested Bug Fix Slice

- In the free-board focused post view, a rich-content image gallery can leave a large blank area before the comment section.
- Optimize the empty space below the post body while preserving the existing comment overlap protection for true `front`/`behind` layer images.
- Fix only the published rich-content display spacing calculation.

## Explicitly Excluded Scope

- No comment workflow, schema, route, upload, permission, or post save API changes.
- No redesign of the free-board focused post panel beyond the blank-space behavior.
- No destructive bitmap crop/export pipeline.

## Candidate Governing Specification

`docs/superpowers/specs/2026-06-27-news-rich-editor-v2-design.md`

## Unanswered Decision

none

---

# Request Summary

## Requested Bug Fix Slice - Published Layer Image Text Flow Regression

- After fixing comment overlap, saved `front`/`behind` layer images again push following body text below the image in published rich content.
- Published content should match the edit intent: text remains in its original flow beside/around the layer image, while the overall body still reserves enough bottom space so comments do not overlap the image.
- Fix only the rich-content display contract for existing layer image metadata.

## Explicitly Excluded Scope - Published Layer Image Text Flow Regression

- No comment workflow, schema, route, upload, permission, or post save API changes.
- No destructive bitmap crop/export pipeline.
- No new page-layout engine beyond existing rich editor image metadata.

## Candidate Governing Specification - Published Layer Image Text Flow Regression

`docs/superpowers/specs/2026-06-27-news-rich-editor-v2-design.md`

## Unanswered Decision - Published Layer Image Text Flow Regression

none

---

## Requested Bug Fix Slice - Published Layer Image Overlaps Comment Box

- A saved rich-editor image layer is displayed over the free-board comment/empty-comment box.
- The published post should preserve image placement while reserving enough document height so comments start below the image.
- Fix only the rich-content display contract for existing `front`/`behind` image metadata.

## Explicitly Excluded Scope - Published Layer Image Overlaps Comment Box

- No comment workflow, schema, route, upload, permission, or post save API changes.
- No destructive bitmap crop/export pipeline.
- No new page-layout engine beyond existing rich editor image metadata.

## Candidate Governing Specification - Published Layer Image Overlaps Comment Box

`docs/superpowers/specs/2026-06-27-news-rich-editor-v2-design.md`

## Unanswered Decision - Published Layer Image Overlaps Comment Box

none

---

## Requested Bug Fix Slice - Edit Preview And Published Rich Content Diverge

- In free-board edit mode, rich text and an inline/placed image appear in one intended arrangement.
- After publishing, the rendered post shows the same text and image in a different layout than the edit surface.
- The saved HTML display path should preserve the author's image layout intent from the existing rich editor metadata.
- Fix only the rich editor save/display contract that makes `NoticeRichContent` diverge from `RichTextEditorV2`.

## Explicitly Excluded Scope - Edit Preview And Published Rich Content Diverge

- No schema, upload, route, permission, comment, or posting workflow changes.
- No destructive bitmap crop/export pipeline.
- No new page-layout engine beyond the existing rich editor image metadata.
- No redesign of the free-board modal beyond the minimum needed to preserve rendered content.

## Candidate Governing Specification - Edit Preview And Published Rich Content Diverge

`docs/superpowers/specs/2026-06-27-news-rich-editor-v2-design.md`

## Unanswered Decision - Edit Preview And Published Rich Content Diverge

none

---

## Requested Bug Fix Slice - Saved Layer Image Position Resets In Display

- After moving an image in the editor and saving the post, the displayed post returns the image to its original document-flow position.
- Saved `front`/`behind` image metadata should survive display sanitization.
- The rendered post should preserve `data-layout`, `data-offset-x`, `data-offset-y`, and the corresponding visual placement style.

## Explicitly Excluded Scope - Saved Layer Image Position Resets In Display

- No database schema, upload, route, permission, or storage workflow changes.
- No destructive bitmap crop/export pipeline.
- No new page-layout engine beyond the existing rich editor image metadata.

## Candidate Governing Specification - Saved Layer Image Position Resets In Display

`docs/superpowers/specs/2026-06-27-news-rich-editor-v2-design.md`

## Unanswered Decision - Saved Layer Image Position Resets In Display

none

---

## Requested Bug Fix Slice - Layer Image Disappears In Edit Mode

- When entering edit mode or clicking the fourth/fifth image layer controls, the image disappears.
- The layer image should remain visible after loading existing `front`/`behind` image content.
- The layer image should remain visible immediately after choosing `텍스트 뒤에 배치` or `텍스트 앞에 배치`.

## Explicitly Excluded Scope - Layer Image Disappears In Edit Mode

- No destructive bitmap editing or raster export pipeline.
- No upload, schema, route, permission, or storage workflow changes.
- No full page-layout engine beyond the existing rich editor image layer modes.

## Candidate Governing Specification - Layer Image Disappears In Edit Mode

`docs/superpowers/specs/2026-06-27-news-rich-editor-v2-design.md`

## Unanswered Decision - Layer Image Disappears In Edit Mode

none

---

## Requested Feature Slice - Front Behind Image Layer Drag

- The fourth and fifth bottom image menu controls should work as real layer controls.
- `텍스트 뒤에 배치` should place the image beneath/behind text instead of behaving like a normal inline image.
- `텍스트 앞에 배치` should place the image above text.
- Dragging an image in those layer modes should move the image and persist the moved position.
- Keep this within the existing rich editor image metadata model.

## Explicitly Excluded Scope - Front Behind Image Layer Drag

- No destructive bitmap editing or raster export pipeline.
- No upload, schema, route, permission, or storage workflow changes.
- No full page-layout engine for arbitrary document objects outside the rich editor image NodeView.

## Candidate Governing Specification - Front Behind Image Layer Drag

`docs/superpowers/specs/2026-06-27-news-rich-editor-v2-design.md`

## Unanswered Decision - Front Behind Image Layer Drag

none

---

## Requested Feature Slice - Inline Image Double-Click Crop Mode

- Double-clicking a selected/editor image should enter an inline crop mode instead of opening the detailed image settings panel.
- Crop mode should show an internal crop box with corner/edge handles, similar to the reference screenshot.
- The author should be able to adjust the crop box, then save or cancel explicitly.
- Crop must not occur implicitly from cursor position or normal image dragging.
- Keep image editing non-destructive: store presentation metadata on the existing image node instead of rasterizing or uploading a new image file.

## Explicitly Excluded Scope - Inline Image Double-Click Crop Mode

- No destructive bitmap crop/export pipeline.
- No upload, schema, route, permission, or storage workflow changes.
- No page-fixed free-positioning engine.
- No replacement of the advanced right-side image options panel.

## Candidate Governing Specification - Inline Image Double-Click Crop Mode

`docs/superpowers/specs/2026-06-27-news-rich-editor-v2-design.md`

## Unanswered Decision - Inline Image Double-Click Crop Mode

none

---

## Requested Bug Fix Slice - Bottom Image Layout Menu Actions

- The Google Docs-like bottom image menu is visible but its contents do not appear to work.
- The icon controls look like empty or low-contrast boxes.
- Make each bottom menu item clearly visible and make each item store its own placement mode when clicked.

## Explicitly Excluded Scope - Bottom Image Layout Menu Actions

- No full page-fixed absolute positioning engine.
- No destructive bitmap editing or raster export changes.
- No API, schema, upload, permission, or storage workflow changes.

---

## Requested Feature Slice - Google Docs Image Toolbar Clone Follow-up

- Move the rotation angle label so it sits to the right of the circular rotation handle and moves with that handle while the selected image rotates.
- Replace the still-unsatisfactory bottom text/dropdown style image menu with a Google Docs-like icon popup toolbar.
- The bottom popup should use icon-only layout controls and a More button like the user's third reference image.
- Keep the existing document-flow layout metadata; do not introduce page-fixed absolute positioning.

## Explicitly Excluded Scope - Google Docs Image Toolbar Clone Follow-up

- No API, schema, upload, permission, or storage workflow changes.
- No destructive bitmap export or rasterized crop pipeline.
- No full page-layout/free-positioning engine.

## Candidate Governing Specification - Google Docs Image Toolbar Clone Follow-up

`docs/superpowers/specs/2026-06-27-news-rich-editor-v2-design.md`

## Unanswered Decision - Google Docs Image Toolbar Clone Follow-up

none

---

## Requested Feature Slice - Google Docs Rotated Image Object And Options Panel

- Make the selected-image outline, resize handles, and rotation handle match the actually rotated image, instead of staying on an unrotated bounding box.
- Turn the bottom `텍스트와 함께 이동` dropdown into a real Google Docs-like image placement menu.
- Support image placement choices such as `글자처럼 처리`, `텍스트 감싸기`, and `텍스트와 함께 이동` through the existing document-flow layout metadata.
- Convert detailed image controls from a full-screen editing surface toward a right-side image options panel for size, rotation, zoom, fit, crop focus, and related settings.
- Keep image editing metadata-based inside the existing rich editor HTML contract.

## Explicitly Excluded Scope - Google Docs Rotated Image Object And Options Panel

- No bitmap rasterization/export pipeline.
- No upload, schema, route, permission, or storage workflow changes.
- No page-fixed absolute-position desktop publishing system.
- No destructive crop workflow.

## Candidate Governing Specification - Google Docs Rotated Image Object And Options Panel

`docs/superpowers/specs/2026-06-27-news-rich-editor-v2-design.md`

## Unanswered Decision - Google Docs Rotated Image Object And Options Panel

none

---

## Requested Feature Slice - Non-Clipping Image Rotation Feedback

- Show the selected image rotation angle near the rotation handle.
- Show a rotated blue outline while an image has rotation, similar to the Google Docs reference.
- Prevent rotated images from being clipped/cropped by the image frame.
- Preserve the existing document-flow image layout, resize handles, and rotation metadata model.

## Explicitly Excluded Scope - Non-Clipping Image Rotation Feedback

- No bitmap rasterization/export pipeline.
- No upload, schema, route, permission, or storage workflow changes.
- No absolute-position desktop publishing system.
- No separate detailed editor screen replacement.

## Candidate Governing Specification - Non-Clipping Image Rotation Feedback

`docs/superpowers/specs/2026-06-27-news-rich-editor-v2-design.md`

## Unanswered Decision - Non-Clipping Image Rotation Feedback

none

---

## Requested Feature Slice - Google Docs Middle Handles And Top Rotation

- Make the implemented selected-image controls match the Google Docs reference more closely.
- Move the rotation dot above the top-center resize handle.
- Ensure the top, bottom, left, and right middle handles work.
- Middle handles should stretch or compress the image dimensions, not crop the image.
- Corner handles should continue proportional image resizing.
- Avoid unintended crop/cover changes caused by cursor position or image selection state.

## Explicitly Excluded Scope - Google Docs Middle Handles And Top Rotation

- No API, schema, upload, route, permission, or storage workflow changes.
- No bitmap crop/export pipeline.
- No full absolute-position desktop publishing system.
- No new separate detailed editor screen.

## Candidate Governing Specification - Google Docs Middle Handles And Top Rotation

`docs/superpowers/specs/2026-06-27-news-rich-editor-v2-design.md`

## Unanswered Decision - Google Docs Middle Handles And Top Rotation

none

---

## Requested Feature Slice - Google Docs Style Image Handles And Rotation

- Refine selected rich-editor images so the resize nodes are smaller and closer to the Google Docs reference.
- Add a top-center rotation dot above the selected image and support rotating the selected image by dragging it.
- Rework the selected-image floating toolbar into a compact bottom popup menu with document layout choices and `텍스트와 함께 이동`.
- Keep image movement tied to the existing document-flow layout modes instead of introducing page-fixed absolute positioning.

## Explicitly Excluded Scope - Google Docs Style Image Handles And Rotation

- No API, schema, upload, permission, or storage route changes.
- No bitmap rasterization/export pipeline.
- No full desktop-publishing absolute-position layout system.
- No change to multi-image gallery storage semantics.

## Candidate Governing Specification - Google Docs Style Image Handles And Rotation

`docs/superpowers/specs/2026-06-27-news-rich-editor-v2-design.md`

## Unanswered Decision - Google Docs Style Image Handles And Rotation

none

---

## Requested Feature Slice - Free Board Compact Fixed-Width Composer

- Refine the free-board create/edit interface after the wide modal implementation.
- Keep the modal comfortable, but prevent the writing surface from expanding indefinitely on very wide screens.
- Further reduce the composer width so the writing surface feels like a document instead of a full-width canvas.
- Increase the rich body editor's blank writing area so authors can use the lower empty space for actual writing.
- Remove unnecessary header helper copy and reduce the large empty setup area.
- Put the writing flow first: title, body editor, then compact settings and attachment controls.
- Keep existing create/edit, upload, rich editor, and submit behavior unchanged.

## Explicitly Excluded Scope - Free Board Compact Fixed-Width Composer

- No API, permission, schema, comment, autosave, draft recovery, or preview-mode changes.
- No notice-board or development-log editor redesign.
- No rich-editor behavior change beyond the free-board body field's visible minimum writing height.

## Candidate Governing Specification - Free Board Compact Fixed-Width Composer

`docs/superpowers/specs/2026-06-28-free-board-wide-editor-design.md`

## Unanswered Decision - Free Board Compact Fixed-Width Composer

none

---

## Requested Feature Slice - Google Docs Image Crop Intent And Handle Roles

- Stop selected images from entering crop/cover mode just because the cursor is inside the image or the image surface is dragged.
- Preserve the author's current image fit and crop metadata unless the user explicitly opens advanced image editing or chooses a crop/fit control.
- Make the 8 resize handles behave according to their visual role: side handles change width, top/bottom handles change height, and corner handles resize proportionally.
- Ensure bottom/top handle resizing does not accidentally change image width.

## Explicitly Excluded Scope - Google Docs Image Crop Intent And Handle Roles

- No destructive bitmap crop/export pipeline.
- No upload, schema, route, permission, or posting workflow changes.
- No new detailed image editor screen.

---

## Requested Feature Slice - Google Docs Style Clean Image Controls

- Simplify the selected-image UI to match Google Docs more closely.
- Default selected image state should show a blue object outline, 8 resize handles, and one compact floating layout toolbar.
- Remove the cluttered quick controls from the default selected state, including always-visible zoom sliders, crop preset rows, fit buttons, and delete controls.
- Keep detailed crop, exact pixel size, rotation, zoom, and fit controls behind `이미지 고급 설정`.
- Ensure the advanced edit control actually opens the image editor from the real free-board create modal.

## Explicitly Excluded Scope - Google Docs Style Clean Image Controls

- No bitmap export/rasterization pipeline.
- No API, schema, upload, permission, or navigation changes.
- No collaborative editing or document history features.

---

## Requested Feature Slice - Google Docs Style Inline Image Editing

- Improve the rich editor so selected images can be edited directly in the document like text-adjacent objects.
- Support selection outline, 8 resize handles, direct resize drag, inline/wrap/block layout controls, crop-position controls, and zoom inside an image frame.
- Keep the detailed image editor as an advanced/helper path, not the primary editing path.
- Keep multi-image `2열` and `대표+2열` as image-only gallery insertion modes; body text must remain normal one-column text unless explicitly authored otherwise.

## Explicitly Excluded Scope - Google Docs Style Inline Image Editing

- No bitmap rasterization/export pipeline.
- No database schema change.
- No upload API or permission change.
- No public navigation or access-scope change.

## Candidate Governing Specification - Google Docs Style Inline Image Editing

`docs/superpowers/specs/2026-06-27-news-rich-editor-v2-design.md`

## Unanswered Decision - Google Docs Style Inline Image Editing

none

---

## Requested Feature Slice

Replace the current basic news rich body editor with a more professional editor modeled after the user's second screenshot:

- font family selection
- font size selection
- bold, italic, underline, strikethrough
- text color and background color controls
- paragraph alignment
- bullet and ordered lists
- indent and outdent
- line-height selection
- link insertion/editing
- inline image insertion and image-like-font manipulation through a selected image node, not a separate legacy top image toolbar
- image node selection that looks like an object editor: selection outline, resize handle, compact floating toolbar, and a separate image editing modal for detailed crop/rotate/size editing
- two-column and featured image gallery insertion as image-only layouts

## Explicitly Excluded Scope

- No database schema change.
- No public navigation or access-policy change.
- No change to news/free-board API permissions.
- No collaborative editing, document version history, or external document import.

## Candidate Governing Specification

`docs/superpowers/specs/2026-06-27-news-rich-editor-v2-design.md`

## Unanswered Decision

none
# Request Summary - Free Board Wide Editor

- Requested feature slice: widen the free-board post edit/create surface so rich text and image editing are not cramped.
- Explicitly excluded scope: API changes, permission changes, comment editing, autosave, notice/development-log editor redesign.
- Candidate governing specification: `docs/superpowers/specs/2026-06-28-free-board-wide-editor-design.md`.
- Unanswered decision: none.

---
