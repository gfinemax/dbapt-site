# UI Review

# UI Review - Published Layer Image Text Flow Regression

## Reviewed Change
- Feature: keep published `front`/`behind` layer images out of text flow while reserving root body bottom space for the image.
- Governing spec: `docs/superpowers/specs/2026-06-27-news-rich-editor-v2-design.md`
- Implementation plan: `docs/superpowers/plans/2026-06-27-news-rich-editor-v2.md`
- Files or pages reviewed: `src/components/news/notice-rich-editor.tsx`, `src/__tests__/news-rich-content-links.test.tsx`, `/news?tab=free`.

## Boundary Review
- Finding: PASS
- Evidence: The fix is limited to published rich-content image display and regression coverage. It does not change comments, APIs, uploads, schema, permissions, public navigation, or post storage.

## Truthful Presentation Review
- Finding: PASS
- Evidence: Existing saved image metadata is rendered without changing the author's intended text flow. No unavailable feature claims, fake data, or new controls were introduced.

## Design And Accessibility Review
- Finding: PASS
- Evidence: The layer wrapper stays `height:0px` so following text is not pushed down at the image insertion point, while `.notice-rich-content` reserves `padding-bottom:270px` for the tested `240px` image with `30px` vertical offset. Browser verification of `/news?tab=free` in a logged-out session found the free-board content locked and no horizontal overflow on desktop 1440px or mobile 390px.

## Outcome
- Result: PASS
- Required action: none

---

# UI Review - Published Layer Image Overlaps Comment Box

## Reviewed Change
- Feature: reserve published rich-content height for saved `front`/`behind` image layers so comments do not appear under the image.
- Governing spec: `docs/superpowers/specs/2026-06-27-news-rich-editor-v2-design.md`
- Implementation plan: `docs/superpowers/plans/2026-06-27-news-rich-editor-v2.md`
- Files or pages reviewed: `src/components/news/notice-rich-editor.tsx`, `src/__tests__/news-rich-content-links.test.tsx`, `/news?tab=free`.

## Boundary Review
- Finding: PASS
- Evidence: The fix is limited to published rich-content image display height and tests. It does not change comments, APIs, uploads, schema, permissions, public navigation, or post storage.

## Truthful Presentation Review
- Finding: PASS
- Evidence: Existing saved image metadata is rendered without covering subsequent comment UI. No unavailable feature claims, fake data, or new controls were introduced.

## Design And Accessibility Review
- Finding: PASS
- Evidence: The changed layer wrapper reserves visible image height while preserving the positioned image surface. Focused tests verify the saved layer reserves `270px` for a `240px` image with `30px` vertical offset. Browser verification of `/news?tab=free` returned HTTP 200 and no horizontal overflow on desktop 1440px and mobile 390px.

## Outcome
- Result: PASS
- Required action: none

---

# UI Review - Edit Preview And Published Rich Content Diverge

## Reviewed Change
- Feature: preserve saved rich-editor image layout metadata so published free-board/news content matches the edit surface intent.
- Governing spec: `docs/superpowers/specs/2026-06-27-news-rich-editor-v2-design.md`
- Implementation plan: `docs/superpowers/plans/2026-06-27-news-rich-editor-v2.md`
- Files or pages reviewed: `src/components/news/notice-rich-editor.tsx`, `src/__tests__/news-rich-content-links.test.tsx`, `/news?tab=free`.

## Boundary Review
- Finding: PASS
- Evidence: The implementation is limited to trusted rich-content image sanitization/display rendering and focused tests. It does not change routes, uploads, schema, permissions, public navigation, or the post save API.

## Truthful Presentation Review
- Finding: PASS
- Evidence: The rendered post now preserves existing saved image metadata instead of implying a different published layout. No fake data, unavailable controls, or new public/private access claims were introduced.

## Design And Accessibility Review
- Finding: PASS
- Evidence: Component coverage verifies `front`/`behind` image layers render as zero-flow positioned objects with preserved offsets and visible image dimensions. Browser verification of `/news?tab=free` returned HTTP 200 and no horizontal overflow at 1440px desktop and 390px mobile. The default loaded free-board page did not include an open layer-image post (`layerNodeCount=0`), so layer-specific DOM parity is covered by the component test.

## Outcome
- Result: PASS
- Required action: none

---

# UI Review - Saved Layer Image Position Resets In Display

## Reviewed Change
- Feature: preserve saved rich-editor image placement metadata when rendering a saved post.
- Governing spec: `docs/superpowers/specs/2026-06-27-news-rich-editor-v2-design.md`
- Files or pages reviewed: `src/components/news/notice-rich-editor.tsx`, `src/__tests__/news-rich-content-links.test.tsx`.

## Boundary Review
- Finding: PASS
- Evidence: The change is limited to rich-content HTML sanitization, image display style generation, and focused tests. It does not change APIs, uploads, database schema, permissions, public navigation, or post storage contracts.

## Truthful Presentation Review
- Finding: PASS
- Evidence: Saved image placement metadata is now preserved in the rendered post instead of being silently reset. The fix does not claim destructive bitmap editing, private data access, or a full document-layout engine.

## Design And Accessibility Review
- Finding: PASS
- Evidence: The rendered post now mirrors the editor's existing image layout metadata for inline/block/wrap/front/behind placement, alignment, zoom, and layer offsets. No new unlabeled controls or interaction surfaces are introduced.

## Outcome
- Result: PASS
- Required action: none

---

# UI Review - Layer Image Disappears In Edit Mode

## Reviewed Change
- Feature: keep front/behind layer images visible after loading edit-mode content or choosing the fourth/fifth image layer buttons.
- Governing spec: `docs/superpowers/specs/2026-06-27-news-rich-editor-v2-design.md`
- Implementation plan: `docs/superpowers/plans/2026-06-27-news-rich-editor-v2.md`
- Files or pages reviewed: `src/components/news/rich-text-editor-v2.tsx`, `src/__tests__/news-rich-content-links.test.tsx`.

## Boundary Review
- Finding: PASS
- Evidence: The change is limited to the rich editor image NodeView layer-surface CSS and focused tests. It does not change APIs, uploads, database schema, permissions, public navigation, or post storage contracts beyond the existing image presentation metadata.

## Truthful Presentation Review
- Finding: PASS
- Evidence: Existing `front` and `behind` layer images now remain visible in edit mode. The fix does not add or imply destructive image processing, private data access, or a full page-layout engine.

## Design And Accessibility Review
- Finding: PASS
- Evidence: Layer images keep the existing labeled `이미지 객체` selection surface and toolbar. The internal layer surface no longer inherits `max-w-full` from its zero-width wrapper, so stored and newly selected front/behind images keep their explicit pixel width instead of collapsing.

## Outcome
- Result: PASS
- Required action: none

---

# UI Review - Front Behind Image Layer Drag

## Reviewed Change
- Feature: make the selected-image `텍스트 뒤에 배치` and `텍스트 앞에 배치` controls act as movable text layers.
- Governing spec: `docs/superpowers/specs/2026-06-27-news-rich-editor-v2-design.md`
- Implementation plan: `docs/superpowers/plans/2026-06-27-news-rich-editor-v2.md`
- Files or pages reviewed: `src/components/news/rich-text-editor-v2.tsx`, `src/__tests__/news-rich-content-links.test.tsx`.

## Boundary Review
- Finding: PASS
- Evidence: The change is limited to the rich editor image NodeView, image metadata attributes, and focused component tests. It does not change routes, uploads, database schema, permissions, storage, public navigation, or posting APIs.

## Truthful Presentation Review
- Finding: PASS
- Evidence: `behind` and `front` now behave as rich-editor image layer modes with stored `data-offset-x` and `data-offset-y`. The feature remains an editor presentation control and does not imply destructive image processing or a full page-layout publishing engine.

## Design And Accessibility Review
- Finding: PASS
- Evidence: The existing icon-only `이미지 레이아웃 도구` remains labeled and keyboard-focusable. Layer images keep the labeled `이미지 객체`, resize handles, rotation handle, and toolbar. `behind` renders as a lower, semi-transparent layer so text can read over it, while `front` renders above text. Dragging a front/behind image updates the persisted offsets and the toolbar follows the image position.

## Outcome
- Result: PASS
- Required action: none

---

# UI Review - Inline Image Double-Click Crop Mode

## Reviewed Change
- Feature: double-click selected rich-editor images into an inline crop mode with internal crop handles and explicit save/cancel controls.
- Governing spec: `docs/superpowers/specs/2026-06-27-news-rich-editor-v2-design.md`
- Implementation plan: `docs/superpowers/plans/2026-06-27-news-rich-editor-v2.md`
- Files or pages reviewed: `src/components/news/rich-text-editor-v2.tsx`, `src/__tests__/news-rich-content-links.test.tsx`.

## Boundary Review
- Finding: PASS
- Evidence: The change is limited to the rich editor image NodeView and focused component tests. It does not change upload routes, database schema, permissions, storage workflow, public navigation, or posting APIs.

## Truthful Presentation Review
- Finding: PASS
- Evidence: Crop mode is explicit and non-destructive. It updates existing image presentation metadata (`data-fit`, `data-crop-x`, `data-crop-y`, `data-zoom`) only when the author chooses `자르기 저장`; normal image dragging and cursor position do not silently crop.

## Design And Accessibility Review
- Finding: PASS
- Evidence: Double-clicking an image now shows an `이미지 자르기 도구` toolbar and labeled internal crop handles such as `자르기 왼쪽 위` and `자르기 오른쪽 아래`. While crop mode is active, the regular selected-image layout toolbar is hidden to avoid conflicting controls, and the author can choose `자르기 저장`, `자르기 취소`, or `자르기 초기화`.

## Outcome
- Result: PASS
- Required action: none

---

# UI Review - Selected Image Movement And Toolbar Spacing

## Reviewed Change
- Feature: keep the selected-image toolbar from covering body text and allow selected images to participate in native document drag movement.
- Files or pages reviewed: `src/components/news/rich-text-editor-v2.tsx`, `src/__tests__/news-rich-content-links.test.tsx`.

## Boundary Review
- Finding: PASS
- Evidence: The change is limited to the rich editor image NodeView and component tests. It does not change APIs, uploads, persistence schema, auth, or public navigation.

## Truthful Presentation Review
- Finding: PASS
- Evidence: The selected image is now marked draggable and no longer prevents default mouse-down on the image move surface, enabling native editor drag behavior. This is not a free-positioning canvas; it remains document-flow drag movement.

## Design And Accessibility Review
- Finding: PASS
- Evidence: The selected image node reserves `56px` of bottom space while the toolbar is visible, preventing the floating menu from hiding following body text. The image remains keyboard-selectable and keeps the existing accessible group and button labels.

## Outcome
- Result: PASS
- Required action: none

---

# UI Review - Bottom Image Layout Menu Functional Fix

## Reviewed Change
- Feature: make the first through fifth selected-image layout buttons actually change the image's document placement behavior.
- Files or pages reviewed: `src/components/news/rich-text-editor-v2.tsx`, `src/__tests__/news-rich-content-links.test.tsx`.

## Boundary Review
- Finding: PASS
- Evidence: The change stays in the rich editor image node and tests. It does not change uploads, routes, database schema, auth, or permissions.

## Truthful Presentation Review
- Finding: PASS
- Evidence: Image nodes are now configured as inline-capable so `글자처럼 처리` can actually keep images in text flow. `block`, `wrap`, `behind`, and `front` remain document-flow presentation modes rather than a full free-positioning page engine.

## Design And Accessibility Review
- Finding: PASS
- Evidence: The five icon buttons retain accessible labels and now visibly update the selected node classes after click. Tests cover inline text flow and distinct placement class changes.

## Outcome
- Result: PASS
- Required action: none

---

# UI Review - Bottom Image Layout Menu Actions

## Reviewed Change
- Feature: make the bottom selected-image placement menu visibly usable and wire every icon to its own layout mode.
- Files or pages reviewed: `src/components/news/rich-text-editor-v2.tsx`, `src/__tests__/news-rich-content-links.test.tsx`.

## Boundary Review
- Finding: PASS
- Evidence: The change stays inside the rich editor image NodeView and its component tests. It only expands image presentation metadata from `inline/block/wrap` to also recognize `behind/front`; no route, upload, schema, permission, or storage workflow was changed.

## Truthful Presentation Review
- Finding: PASS
- Evidence: The `behind` and `front` modes are implemented as document-flow layering hints, not as a page-fixed free-positioning engine. The UI does not imply destructive bitmap editing.

## Design And Accessibility Review
- Finding: PASS
- Evidence: The five layout icons now render as SVG controls with `stroke="currentColor"` so they do not appear as blank boxes. Each icon button keeps an accessible Korean label and persists a distinct `data-layout` value. The active control remains a rounded blue icon highlight.

## Outcome
- Result: PASS
- Required action: none

---

# UI Review - Google Docs Image Toolbar Clone Follow-up

## Reviewed Change
- Feature: attach the rotation angle label to the rotation handle and replace the bottom image layout control with an icon-only Google Docs-like popup.
- Governing spec: `docs/superpowers/specs/2026-06-27-news-rich-editor-v2-design.md`
- Implementation plan: `docs/superpowers/plans/2026-06-27-news-rich-editor-v2.md`
- Files or pages reviewed: `src/components/news/rich-text-editor-v2.tsx`, `src/__tests__/news-rich-content-links.test.tsx`.

## Boundary Review
- Finding: PASS
- Evidence: The change is limited to the existing rich editor image NodeView selection UI and tests. It does not touch routes, schemas, uploads, permissions, public navigation, or stored post contracts beyond existing image presentation metadata.

## Truthful Presentation Review
- Finding: PASS
- Evidence: The icon popup still edits document-flow image metadata only. It does not imply destructive bitmap editing, page-fixed free positioning, collaboration, or unsupported document features.

## Design And Accessibility Review
- Finding: PASS
- Evidence: The rotation angle label now lives inside the same rotatable surface as the rotation handle and is positioned beside that handle with counter-rotation for readability. The bottom toolbar no longer uses the wide `이미지 배치 방식` text dropdown; it exposes five icon-only layout buttons, a separator, and the More/options button in a rounded popup. The active layout control uses a small rounded blue icon highlight instead of a full rectangular tab. Buttons retain accessible names such as `글자처럼 처리`, `이미지 텍스트 감싸기`, `텍스트와 함께 이동`, and `이미지 고급 설정`.

## Outcome
- Result: PASS
- Required action: none

---

# UI Review - Google Docs Rotated Image Object And Options Panel

## Reviewed Change
- Feature: rotate selected image object controls together, enable the bottom image placement dropdown, and move detailed image settings into a right-side options panel.
- Governing spec: `docs/superpowers/specs/2026-06-27-news-rich-editor-v2-design.md`
- Implementation plan: `docs/superpowers/plans/2026-06-27-news-rich-editor-v2.md`
- Files or pages reviewed: `src/components/news/rich-text-editor-v2.tsx`, `src/__tests__/news-rich-content-links.test.tsx`.

## Boundary Review
- Finding: PASS
- Evidence: The change stays inside the existing rich editor image NodeView, detailed image options UI, tests, and planning docs. It does not change routes, schemas, uploads, permissions, public navigation, storage workflow, or introduce absolute-position page layout.

## Truthful Presentation Review
- Finding: PASS
- Evidence: The UI edits existing image presentation metadata only: `data-layout`, `data-rotate`, pixel size, zoom, fit, and crop focus. It does not imply destructive bitmap editing, image export, document collaboration, or page-fixed free positioning.

## Design And Accessibility Review
- Finding: PASS
- Evidence: The selected image still exposes the labeled `이미지 객체` group, 8 labeled resize handles, and a labeled `이미지 회전 핸들`. Rotated selection chrome now lives inside the same rotatable surface as the image, so handles and outline match the visible image. The bottom toolbar exposes an accessible `이미지 배치 방식` menu with `글자처럼 처리`, `텍스트 감싸기`, and `위아래 배치`. Detailed settings now render as a right-side `이미지 편집` options panel with size/rotation, text wrapping, adjustment, and alt-text sections. Focused component tests cover the interactions. `http://localhost:3000/news?tab=free` returned HTTP 200, but direct browser click verification could not run because the local Playwright executable and Chrome/Edge commands were not available in this shell.

## Outcome
- Result: PASS
- Required action: none

---

# UI Review - Non-Clipping Image Rotation Feedback

## Reviewed Change
- Feature: selected-image rotation angle label, rotated outline, and non-clipping rotation rendering.
- Governing spec: `docs/superpowers/specs/2026-06-27-news-rich-editor-v2-design.md`
- Implementation plan: `docs/superpowers/plans/2026-06-27-news-rich-editor-v2.md`
- Files or pages reviewed: `src/components/news/rich-text-editor-v2.tsx`, `src/components/news/notice-rich-editor.tsx`, `src/__tests__/news-rich-content-links.test.tsx`, `/news?tab=free` HTTP check.

## Boundary Review
- Finding: PASS
- Evidence: The change stays inside the existing rich editor image NodeView, safe rich-content image style generation, tests, and planning docs. It does not change routes, schemas, upload behavior, permissions, document storage, or introduce a bitmap export pipeline.

## Truthful Presentation Review
- Finding: PASS
- Evidence: The UI shows only presentation metadata already stored as `data-rotate`. The angle label and rotated outline do not imply destructive image processing, rasterized rotation, or page-fixed placement.

## Design And Accessibility Review
- Finding: PASS
- Evidence: The selected image keeps the existing labeled `이미지 객체` group and `이미지 회전 핸들`. Non-zero rotation now shows a compact visible angle label and a blue rotated outline while keeping the original document-flow controls. The rotated image frame uses visible overflow only when rotation is active so the image is not clipped by the frame. Focused DOM tests verify the angle label, rotated outline, and visible frame overflow. Local browser click verification could not run because the Playwright CLI is not installed in this workspace; `http://localhost:3000/news?tab=free` returned HTTP 200.

## Outcome
- Result: PASS
- Required action: none

---

# UI Review - Google Docs Middle Handles And Top Rotation

## Reviewed Change
- Feature: Google Docs style selected-image middle-handle resizing and top rotation placement.
- Governing spec: `docs/superpowers/specs/2026-06-27-news-rich-editor-v2-design.md`
- Implementation plan: `docs/superpowers/plans/2026-06-27-news-rich-editor-v2.md`
- Files or pages reviewed: `src/components/news/rich-text-editor-v2.tsx`, `src/components/news/notice-rich-editor.tsx`, `src/__tests__/news-rich-content-links.test.tsx`, `src/__tests__/news-admin-controls.test.tsx`.

## Boundary Review
- Finding: PASS
- Evidence: The change stays inside the existing rich editor image NodeView, notice rich-content rendering helpers, tests, and planning docs. It does not change APIs, schemas, upload routes, permissions, storage workflows, or add absolute-position page layout.

## Truthful Presentation Review
- Finding: PASS
- Evidence: Middle handles now save direct pixel dimensions as image presentation metadata and keep crop metadata unchanged. Pixel-sized images render without a lingering `cover` aspect-ratio crop frame, so the UI no longer implies crop behavior when the author is stretching or compressing the object.

## Design And Accessibility Review
- Finding: PASS
- Evidence: Selected images keep the `이미지 객체` group, 8 labeled resize handles, a labeled `이미지 회전 핸들` positioned above the top-center node, and the compact bottom `이미지 레이아웃 도구`. Focused tests verify side handles update `data-pixel-width`, top/bottom handles update `data-pixel-height`, corner handles write proportional pixel dimensions, and advanced/default toolbar behavior remains intact. Browser automation could not run in this session because the in-app browser runtime returned a sandbox metadata error and the local Playwright CLI is not installed; `http://localhost:3000/news?tab=free` returned HTTP 200.

## Outcome
- Result: PASS
- Required action: none

---

# UI Review - Google Docs Style Image Handles And Rotation

## Reviewed Change
- Feature: smaller Google Docs style selected-image handles, top rotation handle, and compact bottom document-object toolbar.
- Governing spec: `docs/superpowers/specs/2026-06-27-news-rich-editor-v2-design.md`
- Implementation plan: `docs/superpowers/plans/2026-06-27-news-rich-editor-v2.md`
- Files or pages reviewed: `src/components/news/rich-text-editor-v2.tsx`, `src/components/news/notice-rich-editor.tsx`, `src/__tests__/news-rich-content-links.test.tsx`.

## Boundary Review
- Finding: PASS
- Evidence: The change stays inside the existing rich editor image NodeView, sanitizer rotation normalization, tests, and planning docs. It does not change routes, schemas, upload behavior, permissions, public navigation, or the saved HTML storage contract beyond existing image presentation metadata.

## Truthful Presentation Review
- Finding: PASS
- Evidence: The selected-image UI only edits authored image presentation metadata: resize, document-flow layout mode, and `data-rotate`. It does not imply bitmap export, destructive crop, collaborative editing, document history, or page-fixed desktop publishing.

## Design And Accessibility Review
- Finding: PASS
- Evidence: Selected images now keep the `이미지 객체` group, expose 8 labeled resize handles with smaller `size-2` visual nodes, expose a labeled `이미지 회전 핸들`, and show a compact rounded bottom `이미지 레이아웃 도구` with `텍스트와 함께 이동`. Focused tests verify layout selection updates `data-layout`, rotation drag updates `data-rotate`, and advanced controls stay out of the default selection. Browser automation was not available in this shell because Chrome/Edge commands were not discoverable, so this review relies on component DOM and interaction tests.

## Outcome
- Result: PASS
- Required action: none

---

# UI Review - Free Board Compact Fixed-Width Composer

## Reviewed Change
- Feature: compact fixed-width free-board create/edit composer.
- Governing spec: `docs/superpowers/specs/2026-06-28-free-board-wide-editor-design.md`
- Implementation plan: `docs/superpowers/plans/2026-06-28-free-board-wide-editor.md`
- Files or pages reviewed: `src/components/news/free-board.tsx`, `src/__tests__/news-admin-controls.test.tsx`, `/news?tab=free` create modal via Chrome CDP.

## Boundary Review
- Finding: PASS
- Evidence: The change only refines the authenticated free-board create/edit modal layout. It does not change routes, APIs, upload behavior, permissions, schema, comments, autosave, preview, notice-board editing, or development-log editing.

## Truthful Presentation Review
- Finding: PASS
- Evidence: The modal still presents the same create/edit action and the same post type, attachment, rich body, and submit controls. No new live service, autosave, preview, public sharing, or private-data capability is implied.

## Design And Accessibility Review
- Finding: PASS
- Evidence: The dialog remains a named `role="dialog"` with `aria-modal="true"`. The shell is now capped with `max-w-[920px]` and an inline `maxWidth: 920px` fallback; the inner writing column is capped at `max-w-[820px]`. The rich body textbox now has `min-h-[360px] sm:min-h-[420px]`, giving the document area more usable writing height while keeping the modal narrower on wide screens. The redundant helper copy remains removed, title and rich body appear before the compact `게시글 설정` panel, and focused DOM tests verify the fixed width and taller body editor.

## Outcome
- Result: PASS
- Required action: none

---

# UI Review - Google Docs Image Crop Intent And Handle Roles

## Reviewed Change
- Feature: prevent unintended image crop/cover changes and make resize handles follow their visual direction.
- Governing spec: `docs/superpowers/specs/2026-06-27-news-rich-editor-v2-design.md`
- Implementation plan: `docs/superpowers/plans/2026-06-27-news-rich-editor-v2.md`
- Files or pages reviewed: `src/components/news/rich-text-editor-v2.tsx`, `src/__tests__/news-rich-content-links.test.tsx`, `/news?tab=free` create modal via Chrome CDP.

## Boundary Review
- Finding: PASS
- Evidence: The change is limited to image NodeView pointer and resize behavior plus regression tests. It does not change routes, schema fields, upload APIs, permissions, navigation, or post persistence contracts.

## Truthful Presentation Review
- Finding: PASS
- Evidence: The editor no longer silently changes `contain` images into `cover` crop mode on image-surface dragging. Crop/fit changes remain explicit presentation edits through the advanced image tools.

## Design And Accessibility Review
- Finding: PASS
- Evidence: The selected image still exposes the `이미지 객체` group, blue frame, compact `이미지 레이아웃 도구`, and 8 labeled resize handles. Browser verification in the real free-board create modal confirmed surface dragging preserved `data-fit="contain"` and `data-crop-x/y="center"`, while the bottom handle preserved `data-width="50"` and changed only height. Screenshot: `_workspace/google-docs-image-crop-intent-fixed.png`.

## Outcome
- Result: PASS
- Required action: none

---

# UI Review - Google Docs Style Clean Image Controls

## Reviewed Change
- Feature: simplify selected rich-editor images into a Google Docs style object control surface.
- Governing spec: `docs/superpowers/specs/2026-06-27-news-rich-editor-v2-design.md`
- Implementation plan: `docs/superpowers/plans/2026-06-27-news-rich-editor-v2.md`
- Files or pages reviewed: `src/components/news/rich-text-editor-v2.tsx`, `src/__tests__/news-rich-content-links.test.tsx`, `src/__tests__/news-admin-controls.test.tsx`, `/news?tab=free` create modal via Chrome CDP.

## Boundary Review
- Finding: PASS
- Evidence: The change is limited to the existing rich body editor image NodeView and editor tests. It does not add or change routes, schemas, upload APIs, permissions, navigation, or posting workflow.

## Truthful Presentation Review
- Finding: PASS
- Evidence: The UI now presents only document-object image controls by default. Exact pixel editing, crop, zoom, rotation, fit, and reset-like operations remain inside the advanced `이미지 편집` dialog, so the default surface no longer implies destructive bitmap editing.

## Design And Accessibility Review
- Finding: PASS
- Evidence: Selected images expose `이미지 객체`, a blue object frame, 8 labeled resize handles, and a single compact `이미지 레이아웃 도구` toolbar. The legacy `이미지 빠른 도구`, default zoom slider, and default crop preset buttons are not present. The advanced button carries the `data-notice-image-open-editor` marker so the NodeView capture path opens the `이미지 편집` dialog reliably in the real free-board create modal. Browser verification screenshot: `_workspace/google-docs-image-control-verified.png`.

## Outcome
- Result: PASS
- Required action: none

---

# UI Review - Google Docs Style Inline Image Editing

## Reviewed Change
- Feature: direct in-document image object editing with selection frame, 8 resize handles, layout controls, crop-position controls, and zoom-in-frame behavior.
- Governing spec: `docs/superpowers/specs/2026-06-27-news-rich-editor-v2-design.md`
- Implementation plan: `docs/superpowers/plans/2026-06-27-news-rich-editor-v2.md`
- Files or pages reviewed: `src/components/news/rich-text-editor-v2.tsx`, `src/__tests__/news-rich-content-links.test.tsx`, `src/__tests__/news-admin-controls.test.tsx`, `/news?tab=free` create modal via Chrome CDP.

## Boundary Review
- Finding: PASS
- Evidence: The change stays inside the existing rich body editor and tests. It does not add routes, schema fields, upload endpoints, permission changes, public navigation, private data access, voting, notification, or document features.

## Truthful Presentation Review
- Finding: PASS
- Evidence: The controls only edit authored image presentation metadata. The detailed image editor remains an advanced dialog; no unsupported bitmap export or destructive image processing is claimed.

## Design And Accessibility Review
- Finding: PASS
- Evidence: Selected images expose an `이미지 객체` group, visible object frame, `이미지 빠른 도구`, `이미지 배치 도구`, labeled crop/zoom controls, and 8 labeled resize buttons. Chrome CDP verified the real create-modal flow with layout=`wrap`, zoom=`140`, crop=`right bottom`, width=`75`, toolbar visible, and 8 handles after dragging. Screenshot: `_workspace/direct-inline-image-edit-final-immediate-drag.png`.

## Outcome
- Result: PASS
- Required action: none

---

# UI Review - Rich Image Editor Direct Click Fix

## Reviewed Change
- Feature: Make the image toolbar `편집` action open the full image editor reliably in the real free-board write modal.
- Governing spec: `docs/superpowers/specs/2026-06-27-news-rich-editor-v2-design.md`
- Implementation plan: `docs/superpowers/plans/2026-06-27-news-rich-editor-v2.md`
- Files or pages reviewed: `src/components/news/rich-text-editor-v2.tsx`, `src/__tests__/news-rich-content-links.test.tsx`, `/news?tab=free` create modal.

## Boundary Review
- Finding: PASS
- Evidence: The change is limited to the existing rich editor image object toolbar and existing image editor dialog. It does not change public navigation, permissions, routes, APIs, storage schema, or posting rules.

## Truthful Presentation Review
- Finding: PASS
- Evidence: The `편집` control now opens the already supported `이미지 편집` dialog directly. No new unsupported bitmap export, document access, voting, notification, or private data capability is presented.

## Design And Accessibility Review
- Finding: PASS
- Evidence: The image editor remains a named modal dialog with `role="dialog"` and `aria-modal="true"`. Direct Chrome CDP testing clicked `새 게시글 작성`, uploaded an image, clicked the inserted image, clicked the toolbar `편집` button, and confirmed the image editor covered the viewport with `z-index: 220`, black background, and `topInsideDialog=true`. Screenshot: `_workspace/direct-click-live-after-edit.png`.

## Outcome
- Result: PASS
- Required action: none

---

# UI Review - Rich Image Activation Follow-up

## Reviewed Change
- Feature: make Tiptap image objects and their quick toolbar controls activate reliably even when ProseMirror node selection is not visually retained.
- Governing spec: `docs/superpowers/specs/2026-06-27-news-rich-editor-v2-design.md`
- Implementation plan: `docs/superpowers/plans/2026-06-27-news-rich-editor-v2.md`
- Files or pages reviewed: `src/components/news/rich-text-editor-v2.tsx`, `src/__tests__/news-rich-content-links.test.tsx`

## Boundary Review
- Finding: PASS
- Evidence: The change stays inside the existing rich editor image NodeView and component tests. It does not add routes, schema fields, permissions, upload APIs, or public navigation.

## Truthful Presentation Review
- Finding: PASS
- Evidence: Image controls still edit authored image presentation only. The active object frame, resize handle, quick toolbar, and `이미지 편집` dialog do not imply bitmap export or destructive image processing.

## Design And Accessibility Review
- Finding: PASS
- Evidence: Image objects now use a local active state in addition to ProseMirror `NodeSelection`, capture pointer/mouse/click activation before the editor body handles it, expose the existing `이미지 객체` group and `이미지 빠른 도구`, dispatch the detailed image editor request to the editor root so the modal survives NodeView remounts, show a visible `편집` label on the edit control, keep resize handle dragging functional, and clear the object mode when the user clicks outside the image.

## Outcome
- Result: PASS
- Required action: none

---
# UI Review

## Reviewed Change
- Feature: Rich editor image edit dialog layer fix.
- Governing spec: `docs/superpowers/specs/2026-06-27-news-rich-editor-v2-design.md`
- Implementation plan: `docs/superpowers/plans/2026-06-27-news-rich-editor-v2.md`
- Files or pages reviewed: `src/components/news/rich-text-editor-v2.tsx`, `src/__tests__/news-rich-content-links.test.tsx`.

## Boundary Review
- Finding: PASS
- Evidence: The change only raises the existing rich editor image/link dialog portal layer above the free-board create/edit overlays. No public navigation, permissions, APIs, saved content schema, document access, private data, or posting workflow changed.

## Truthful Presentation Review
- Finding: PASS
- Evidence: Existing labels and image edit controls remain unchanged. The fix makes the already available image editor visible above the writing modal instead of introducing or claiming a new capability.

## Design And Accessibility Review
- Finding: PASS
- Evidence: The image editor remains a named `role="dialog"` with `aria-modal="true"` and now uses `z-[220]`, which is above the free-board write/edit overlays at `z-[120]` and `z-[130]`. Regression tests verify the dialog opens from the toolbar edit button and carries the higher layer class.

## Outcome
- Result: PASS
- Required action: none

---

## Reviewed Change
- Feature: Emoji reactions for comments and replies.
- Governing spec: `docs/superpowers/plans/2026-06-25-comment-emoji-reactions.md`
- Implementation plan: `docs/superpowers/plans/2026-06-25-comment-emoji-reactions.md`
- Files or pages reviewed: `src/components/news/comment-reaction-bar.tsx`, `src/components/news/free-board.tsx`, `src/components/news/news-client.tsx`, `src/components/news/development-log.tsx`, `/news`

## Boundary Review
- Finding: PASS
- Evidence: The change is limited to existing comment and reply surfaces. It does not expose new public navigation, private document access, approval actions, or notification delivery.

## Truthful Presentation Review
- Finding: PASS
- Evidence: Reactions show user-generated emoji counts and the current user's selected state only. They do not fabricate operational results or imply voting/approval authority.

## Design And Accessibility Review
- Finding: PASS
- Evidence: The reaction bar uses small rounded controls below existing comment text, includes accessible button labels, and the picker dialog has search, close, recent, and basic emoji sections without changing surrounding comment layout.

## Outcome
- Result: PASS
- Required action: none

---

# UI Review - Rich Image Object Editor

## Reviewed Change
- Feature: Naver-mail-style image object selection and separate image editor modal in the V2 rich editor.
- Governing spec: `docs/superpowers/specs/2026-06-27-news-rich-editor-v2-design.md`
- Implementation plan: `docs/superpowers/plans/2026-06-27-news-rich-editor-v2.md`
- Files or pages reviewed: `src/components/news/rich-text-editor-v2.tsx`, `src/components/news/notice-rich-editor.tsx`, `src/__tests__/news-rich-content-links.test.tsx`, `src/__tests__/news-admin-controls.test.tsx`, `/news`

## Boundary Review
- Finding: PASS
- Evidence: The change stays inside the existing rich body editor, sanitizer/rendering contract, and tests. It does not add routes, schema fields, permission changes, public navigation, or new upload APIs.

## Truthful Presentation Review
- Finding: PASS
- Evidence: The new image controls only adjust authored image presentation. The editor no longer presents the old dense selected-image settings bar; detailed crop, rotation, and pixel-size controls are moved into a clearly labeled `이미지 편집` dialog.

## Design And Accessibility Review
- Finding: PASS WITH NOTE
- Evidence: Selected images now expose `role="group"` with `이미지 객체`, a compact `이미지 빠른 도구` toolbar, and a direct resize handle. The detailed editor is an accessible modal dialog with width/height inputs, zoom, crop presets, rotation, fit controls, cancel, and apply actions. Focused tests cover the absence of the old slider/crop preset bar, object toolbar behavior, resize dragging, modal editing, and normal text editing after image selection.
- Note: The rich editor is login/admin gated in the live app, so the editor behavior is verified by component and admin-flow tests. Public `/news` desktop/mobile screenshots were captured with local Chrome headless as `_workspace/news-image-object-editor-desktop.png` and `_workspace/news-image-object-editor-mobile.png`.

## Outcome
- Result: PASS
- Required action: none

---

# UI Review - Professional Rich Editor V2

## Reviewed Change
- Feature: Tiptap-based professional rich editor for notice/free-board body editing.
- Governing spec: `docs/superpowers/specs/2026-06-27-news-rich-editor-v2-design.md`
- Implementation plan: `docs/superpowers/plans/2026-06-27-news-rich-editor-v2.md`
- Files or pages reviewed: `src/components/news/rich-text-editor-v2.tsx`, `src/components/news/notice-rich-editor.tsx`, `src/__tests__/news-rich-content-links.test.tsx`, `src/__tests__/news-admin-controls.test.tsx`, `/news`

## Boundary Review
- Finding: PASS
- Evidence: The change replaces the existing rich body editor UI and sanitized body HTML behavior only. It does not add routes, schema fields, public navigation, or permission changes.

## Truthful Presentation Review
- Finding: PASS
- Evidence: Formatting controls alter authored text/image presentation only. The editor does not imply unsupported approval, voting, document access, messaging, or private data visibility.

## Design And Accessibility Review
- Finding: PASS
- Evidence: The toolbar now exposes font family, font size, line height, text marks, color/highlight, alignment, list, link, and image/gallery controls in a compact editor bar. Image insertion defaults to normal body images, `2열` and `대표+2열` remain image-only templates, and selected images expose labeled size, fit, crop, and rotation controls with direct handles.

## Outcome
- Result: PASS
- Required action: none

---

# UI Review - Rich Image Gallery Text Column Fix

## Reviewed Change
- Feature: keep body text outside two-column image gallery blocks.
- Governing spec: `docs/superpowers/specs/2026-06-27-news-rich-image-gallery-design.md`
- Implementation plan: `docs/superpowers/plans/2026-06-27-news-rich-image-gallery.md`
- Files or pages reviewed: `src/components/news/notice-rich-editor.tsx`, `src/__tests__/news-rich-content-links.test.tsx`, `/news?tab=free`

## Boundary Review
- Finding: PASS
- Evidence: The change stays inside the existing rich editor HTML behavior and does not add routes, schema fields, public navigation, or permission changes.

## Truthful Presentation Review
- Finding: PASS
- Evidence: `2열` remains an image layout option only. The editor no longer implies that normal body text is part of a two-column writing mode.

## Design And Accessibility Review
- Finding: PASS
- Evidence: Gallery blocks are marked non-editable inside the editor so typed text returns to normal one-column body paragraphs. Focused tests cover text after a two-column gallery staying outside the gallery block. Chrome checks on `/news?tab=free` showed `overflowX=false` for desktop and mobile.

## Outcome
- Result: PASS
- Required action: none

---

# UI Review - Rich Editor Image NodeView Follow-up

## Reviewed Change
- Feature: replace the legacy selected-image toolbar with Tiptap image NodeView controls.
- Governing spec: `docs/superpowers/specs/2026-06-27-news-rich-editor-v2-design.md`
- Implementation plan: `docs/superpowers/plans/2026-06-27-news-rich-editor-v2.md`
- Files or pages reviewed: `src/components/news/rich-text-editor-v2.tsx`, `src/__tests__/news-rich-content-links.test.tsx`, `src/__tests__/news-admin-controls.test.tsx`, `/news`

## Boundary Review
- Finding: PASS
- Evidence: The change stays inside the rich body editor component, editor tests, and feature planning docs. It does not add routes, schema fields, public navigation, or permission changes.

## Truthful Presentation Review
- Finding: PASS
- Evidence: Image controls are now shown only when the actual image node is selected. The removed full-width selected-image bar no longer implies a separate image editing mode outside the document.

## Design And Accessibility Review
- Finding: PASS WITH NOTE
- Evidence: The selected image node exposes `role="group"` with the label `이미지 편집 노드`, a labeled size slider, node-local fit/crop/alignment/rotation/delete controls, and direct resize/rotation handles. Focused tests cover node-attached controls, removal of the old `이미지 크기` toolbar text, dragging, image node deselection, and writable text editing after image selection.
- Note: Codex in-app browser and node_repl browser automation were unavailable in this session due MCP sandbox metadata errors, so visual checks used local Chrome headless screenshots instead. Public `/news` desktop and mobile screenshots were saved to `_workspace/news-image-nodeview-desktop.png` and `_workspace/news-image-nodeview-mobile.png`; the rich editor itself remains login/admin gated and is covered by component/admin tests.

## Outcome
- Result: PASS
- Required action: none

---

# UI Review - Rich Image Gallery Editing Follow-up

## Reviewed Change
- Feature: rich body image fit, crop focus, rotation, inline insertion mode, and direct selected-image handles.
- Governing spec: `docs/superpowers/specs/2026-06-27-news-rich-image-gallery-design.md`
- Implementation plan: `docs/superpowers/plans/2026-06-27-news-rich-image-gallery.md`
- Files or pages reviewed: `src/components/news/notice-rich-editor.tsx`, `src/__tests__/news-rich-content-links.test.tsx`, `/news?tab=free`

## Boundary Review
- Finding: PASS
- Evidence: The follow-up remains inside the existing rich editor and sanitized body HTML. It does not add routes, schema fields, public navigation, or permission changes.

## Truthful Presentation Review
- Finding: PASS
- Evidence: Controls only adjust authored image presentation. No unsupported live service, private data, voting, notification, or document access claim is introduced.

## Design And Accessibility Review
- Finding: PASS
- Evidence: The toolbar now exposes `본문 이미지`, `2열`, and `대표+2열` as small `aria-pressed` mode buttons. Selected image controls include a labeled size slider, explicit fit/crop/rotation buttons, and accessible node handles named `이미지 노드 크기 조절` and `이미지 노드 회전`. Focused tests cover default inline insertion, uncropped gallery defaults, sanitizer metadata, selected image control updates, and handle dragging. Chrome checks on `/news?tab=free` showed `overflowX=false` for desktop and mobile.

## Outcome
- Result: PASS
- Required action: none

---

# UI Review - Rich Image Gallery

## Reviewed Change
- Feature: rich body editor multi-image gallery insertion.
- Governing spec: `docs/superpowers/specs/2026-06-27-news-rich-image-gallery-design.md`
- Implementation plan: `docs/superpowers/plans/2026-06-27-news-rich-image-gallery.md`
- Files or pages reviewed: `src/components/news/notice-rich-editor.tsx`, `src/__tests__/news-rich-content-links.test.tsx`, `/news?tab=free`

## Boundary Review
- Finding: PASS
- Evidence: The change stays inside existing rich editor body HTML rendering and upload callbacks. It does not add public navigation, new API endpoints, schema fields, or access-policy changes.

## Truthful Presentation Review
- Finding: PASS
- Evidence: The editor adds template controls for body image layout only. No static private data, fabricated operational status, or unsupported live service claim is introduced.

## Design And Accessibility Review
- Finding: PASS
- Evidence: Toolbar controls remain small pill buttons with visible focus styles. Gallery template buttons expose `aria-pressed`, the hidden file input keeps the existing accessible label, focused tests cover sanitizer and editor behavior, and Chrome checks on `/news?tab=free` showed `overflowX=false` for desktop and mobile.

## Outcome
- Result: PASS
- Required action: none
# UI Review

## Reviewed Change
- Feature: Free-board wide create/edit editor modal.
- Governing spec: `docs/superpowers/specs/2026-06-28-free-board-wide-editor-design.md`
- Implementation plan: `docs/superpowers/plans/2026-06-28-free-board-wide-editor.md`
- Files or pages reviewed: `src/components/news/free-board.tsx`, `src/__tests__/news-admin-controls.test.tsx`, `/news?tab=free` desktop/mobile screenshots.

## Boundary Review
- Finding: PASS
- Evidence: The change only affects the authenticated free-board create/edit overlay layout. It does not expose new public navigation, private data, document access, accounting, voting, notification, or permission behavior.

## Truthful Presentation Review
- Finding: PASS
- Evidence: Existing labels remain create/edit labels. No new claims imply autosave, preview, public sharing, or additional working services. Existing save button behavior and API payload tests remain covered.

## Design And Accessibility Review
- Finding: PASS
- Evidence: The editing surface is now a named `role="dialog"` with `aria-modal="true"`, uses warm canvas and stone borders, keeps pill action buttons, and splits desktop editing into `게시글 설정` and `게시글 본문 편집 영역`. Component tests verify the wide `max-w-[1180px]` workspace, section labels, rich editor presence, and unchanged PATCH/attachment behavior. Public `/news?tab=free` desktop and mobile screenshots were captured; the edit modal itself is login-gated and verified by component tests.

## Outcome
- Result: PASS
- Required action: none

---
# UI Review

## Reviewed Change
- Feature: Rich editor image edit dialog isolation fix.
- Governing spec: `docs/superpowers/specs/2026-06-27-news-rich-editor-v2-design.md`
- Implementation plan: `docs/superpowers/plans/2026-06-27-news-rich-editor-v2.md`
- Files or pages reviewed: `src/components/news/rich-text-editor-v2.tsx`, `src/__tests__/news-rich-content-links.test.tsx`.

## Boundary Review
- Finding: PASS
- Evidence: The change only moves the existing image edit dialog out of the ProseMirror document DOM using a React portal. No public navigation, permissions, APIs, document access, private data, or posting rules changed.

## Truthful Presentation Review
- Finding: PASS
- Evidence: Existing image edit controls and labels remain the same. No new capability is claimed; the fix prevents editor chrome from being saved as post body content.

## Design And Accessibility Review
- Finding: PASS
- Evidence: The image editor remains a named modal dialog with `role="dialog"` and `aria-modal="true"`, but it is now rendered under `document.body` instead of inside the editable document node. Regression tests verify the editor body no longer contains the image editor dialog or its visible labels while editing.

## Outcome
- Result: PASS
- Required action: none

---
