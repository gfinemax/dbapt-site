# News Rich Editor V2 Design

## Summary

Replace the current hand-rolled `contentEditable` news body editor with a Tiptap-based editor that behaves like a professional document editor. The editor should resemble the user's reference toolbar: font and size selectors first, then inline marks, text styling, alignment, lists, indentation, line-height, link, and image controls.

## Goals

- Provide a professional toolbar for authoring notices, free-board posts, and editable news body content.
- Keep the existing storage model: the editor receives and emits an HTML string.
- Preserve existing public rendering through `NoticeRichContent` and `sanitizeNoticeContentHtml`.
- Support font family, font size, text color, background color, line-height, alignment, lists, indentation, links, and basic marks.
- Treat images as document nodes that can be selected and adjusted like text-adjacent content.
- Keep `2열` and `대표+2열` as image-only gallery templates, never as a text column mode.

## Non-Goals

- No schema migration.
- No new API route.
- No collaborative editing.
- No document history or autosave.
- No full desktop publishing layout system.

## Architecture

Create a new `src/components/news/rich-text-editor-v2.tsx` component backed by Tiptap. The existing `NoticeRichEditor` export will become a compatibility wrapper that renders V2, so existing callers do not need to change. Shared HTML sanitizing and `NoticeRichContent` stay in `notice-rich-editor.tsx` for now, with sanitizer support expanded for safe V2 formatting attributes.

The V2 editor will use Tiptap extensions for common text editing, plus local extensions for font size, line-height, image metadata, and gallery blocks where needed. Image upload still uses the existing `onUploadImage(file)` callback.

## Toolbar

The main toolbar is a single compact band with:

- font family selector: `Pretendard`, `굴림`, `맑은 고딕`
- font size selector: `12px`, `14px`, `16px`, `18px`, `20px`, `24px`
- bold, italic, underline, strikethrough
- text color, background color
- left, center, right alignment
- bullet list, ordered list
- outdent, indent
- line-height selector: `1.2`, `1.5`, `1.8`, `2.0`
- link
- inline image, `2열`, `대표+2열`

Controls use compact icon buttons where possible and labeled selects where value selection matters. Buttons expose accessible labels and pressed state when active.

## Image Node Behavior

Inline images insert at the cursor as ordinary document content. Selecting an image must select the image node itself and show an object-style editing affordance modeled after a professional mail composer: a visible selection outline, a direct resize handle on the image frame, and a compact floating quick toolbar. The legacy full-width selected-image toolbar/sub-toolbar is not allowed. A dense node-local control bar with visible slider text and crop preset words is also not allowed because it makes the editor feel like the old image settings mode.

The selected image node exposes:

- direct resize handle on the image frame
- compact floating quick toolbar with icon buttons for inline/original style, fill style, edit, and delete
- quick alignment controls: left, center, right
- image edit entry point that opens a separate modal/editor surface

Follow-up selected image behavior:

- resize handles should be visually small and document-editor-like rather than bulky object buttons
- a top-center rotation dot may rotate the selected image by updating `data-rotate`
- the rotation dot should sit above the top-center resize handle, connected by a short line
- selected rotated images should show the current angle and a rotated object outline so the author can see the rotation state
- rotated images should remain visible outside the unrotated frame instead of being clipped by an `overflow:hidden` crop box
- when an image is rotated, the visible image, blue outline, resize handles, and top rotation handle should rotate together as one object
- the rotation angle label should sit beside the circular rotation handle and move with that handle as part of the selected object surface
- side and top/bottom middle handles should stretch or compress pixel dimensions without changing crop metadata
- corner handles should resize proportionally using pixel dimensions once the author starts direct node resizing
- pixel-sized images should not keep a `cover` aspect-ratio crop frame that clips the visible image unintentionally
- the default selected-image toolbar should read like a bottom document-object popup, with layout choices and a real `텍스트와 함께 이동` / placement dropdown
- the placement dropdown should support document-flow choices such as `글자처럼 처리`, `텍스트 감싸기`, and `위아래 배치`
- follow-up toolbar refinement should prefer the Google Docs reference shape: an icon-only rounded popup with layout icons, a separator, and a More/options button instead of a wide text dropdown
- default image movement remains document-flow based; absolute page-fixed positioning is out of scope

The detailed image options surface exposes:

- current image edit title and pixel-size summary
- width and height pixel fields with a ratio lock
- zoom control
- crop mode control
- rotation controls
- fit controls: original ratio and fill
- apply and cancel actions

This detailed options surface should prefer a right-side image options panel over a full-screen editor so basic authoring remains in the document context. A full-screen or modal editor is only a fallback for future advanced bitmap workflows.

All image changes update Tiptap node attributes, so the image behaves like document content rather than a separate canvas object.

Multi-image `2열` and `대표+2열` insert image-only gallery blocks. Gallery blocks are non-editable containers inside the editor, and a normal paragraph is created after the block so text continues in one column.

## HTML Contract

The editor emits sanitized-friendly HTML:

- paragraphs and lists remain normal HTML
- font family uses `data-font-family` plus a safe inline `font-family`
- font size uses `data-font-size` plus a safe inline `font-size`
- line-height uses `data-line-height` plus safe inline `line-height`
- text color and background use safe inline styles
- images preserve trusted `src`, `alt`, `data-width`, `data-fit`, `data-crop-x`, `data-crop-y`, `data-rotate`, and alignment metadata
- gallery blocks preserve `data-notice-gallery`

The sanitizer rejects scripts, event handlers, unsafe URLs, unsafe image sources, and unsupported style values.

## Testing

Focused tests must prove:

- toolbar controls render with professional font/size/line-height options
- text formatting emits safe HTML for font family, font size, alignment, and line-height
- links can still be inserted and edited
- inline images insert at the cursor and remain standalone unless gallery mode is selected
- gallery text remains outside the gallery block
- selecting an inline image shows an object-style selection frame, compact quick toolbar, and resize handle
- selected image handles are small, expose a top rotation handle, and can update `data-rotate` by dragging
- selected images display a current angle label and rotated outline when rotation is non-zero
- selected rotated images rotate the image, outline, resize handles, and rotation handle together as one object
- selected rotated images place the angle label next to the rotation handle inside the same rotated object surface
- rotated images are not clipped by the editor frame or converted back into an unintended crop frame
- selected image side/top/bottom middle handles update pixel width or height without mutating crop metadata
- direct pixel resizing does not leave a `cover` crop frame that clips the image unexpectedly
- selected images do not show the legacy top selected-image toolbar or the dense node-local slider/crop preset bar
- the bottom placement dropdown opens and updates image layout metadata
- the bottom toolbar can be represented as icon-only layout buttons and should still update image layout metadata
- quick image controls update alignment, fit, and deletion through image node attributes
- the right-side image options panel updates width, fit/crop, zoom, layout, and rotation through image node attributes
- sanitizer preserves safe V2 formatting and removes unsafe values
- existing `NoticeRichContent` rendering remains compatible

Full validation requires `pnpm lint`, `pnpm test`, `pnpm build`, and desktop/mobile browser checks of `/news?tab=free`.
