# News Rich Image Gallery Design

## Summary

Add a compact multi-image layout option to the existing rich body editor used by notices, free-board posts, and related news surfaces. Authors can select or paste several images and insert them as one visual gallery instead of a long one-image-per-line stack.

## Scope

- Support multiple image selection through the existing body image control.
- Preserve the current single-image upload behavior for one selected image.
- Add an insertion mode selector with `본문 이미지`, `2열`, and `대표+2열` templates.
- Keep `본문 이미지` as the default so authors can place images at the current cursor position like normal body content.
- Keep gallery images uncropped by default with original aspect ratio preservation.
- Let authors select an inserted image and adjust size, fit/crop, crop focus, and rotation from an inline editing panel or direct image handles.
- Store galleries inside the existing rich HTML body; do not add a database field.
- Sanitize and render stored gallery HTML through `NoticeRichContent`.
- Keep upload permissions, file validation, and public/private access rules unchanged.

## Excluded Scope

- Freeform drag-and-drop image reordering.
- Per-image captions.
- Facebook-style overlay counts for hidden images.
- Image compression or server-side collage generation.
- New APIs or schema changes.

## UI Behavior

The editor toolbar shows a small insertion mode control near the image insertion button. `본문 이미지` inserts each selected image at the current cursor position as normal body content. `2열` uploads selected files and inserts them as one two-column gallery block. `대표+2열` makes the first image full width and places the remaining images in two columns.

Gallery images use `object-fit: contain` and natural aspect-ratio preservation by default so portrait or landscape photos are not cropped. When an author clicks any inserted image, the editor shows an image editing panel with size, fit (`원본비율` or `채우기`), crop focus, and rotation controls. The selected image also gets visible resize and rotation handles so authors can drag the image itself for direct manipulation. These controls are persisted as `data-width`, `data-fit`, `data-crop-x`, `data-crop-y`, and `data-rotate` attributes and sanitized before rendering.

## Testing

Focused tests cover gallery sanitization/rendering, multi-file insertion modes, single-file backwards compatibility, image metadata sanitization, selected image editing controls, and direct resize/rotation handles.
