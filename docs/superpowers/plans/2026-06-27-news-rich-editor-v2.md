# News Rich Editor V2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current hand-rolled news rich body editor with a Tiptap-based professional editor while preserving existing HTML storage and rendering.

**Architecture:** Add `RichTextEditorV2` as a new Tiptap-backed component and keep `NoticeRichEditor` as the public wrapper used by existing notice/free-board surfaces. Expand sanitizer support for safe V2 formatting without changing APIs or schema. Keep image and gallery semantics compatible with the existing `NoticeRichContent` renderer.

**Tech Stack:** Next.js App Router, React 19, TypeScript, Tiptap, Tailwind CSS, Vitest, Testing Library.

---

### Task 1: Dependencies And Sanitizer Contract

**Files:**
- Modify: `package.json`
- Modify: `pnpm-lock.yaml`
- Modify: `src/components/news/notice-rich-editor.tsx`
- Test: `src/__tests__/news-rich-content-links.test.tsx`

- [ ] Add Tiptap dependencies: `@tiptap/react`, `@tiptap/pm`, `@tiptap/starter-kit`, `@tiptap/extension-link`, `@tiptap/extension-image`, `@tiptap/extension-text-align`, `@tiptap/extension-underline`, `@tiptap/extension-text-style`, `@tiptap/extension-color`, `@tiptap/extension-highlight`, `@tiptap/extension-font-family`.
- [ ] Add failing sanitizer tests proving safe font family, font size, line-height, color, background, and alignment survive, while unsafe style values are removed.
- [ ] Run `pnpm exec vitest run src/__tests__/news-rich-content-links.test.tsx -t "sanitizes professional editor formatting"` and confirm it fails.
- [ ] Expand sanitizer placeholders and safe style handling for V2 formatting.
- [ ] Re-run the focused test and confirm it passes.

### Task 2: RichTextEditorV2 Text Toolbar

**Files:**
- Create: `src/components/news/rich-text-editor-v2.tsx`
- Modify: `src/components/news/notice-rich-editor.tsx`
- Test: `src/__tests__/news-rich-content-links.test.tsx`

- [ ] Add failing tests proving `NoticeRichEditor` renders font family, font size, line-height, mark, alignment, list, indent, link, and image controls.
- [ ] Run the focused test and confirm it fails.
- [ ] Create `RichTextEditorV2` with Tiptap `useEditor({ immediatelyRender: false })`.
- [ ] Configure StarterKit, Link, Underline, TextStyle, Color, Highlight, FontFamily, TextAlign, and local font-size/line-height extensions.
- [ ] Make `NoticeRichEditor` render V2 while keeping the same props.
- [ ] Re-run the focused test and confirm it passes.

### Task 3: Text Formatting Behavior

**Files:**
- Modify: `src/components/news/rich-text-editor-v2.tsx`
- Test: `src/__tests__/news-rich-content-links.test.tsx`

- [ ] Add failing tests proving toolbar interactions update emitted HTML for font family, font size, line-height, alignment, bold, underline, and lists.
- [ ] Run the focused test and confirm it fails.
- [ ] Wire toolbar controls to Tiptap commands and local extension commands.
- [ ] Ensure `onChange(editor.getHTML())` fires from Tiptap `onUpdate`.
- [ ] Re-run the focused test and confirm it passes.

### Task 4: Image NodeView And Gallery Behavior

**Files:**
- Modify: `src/components/news/rich-text-editor-v2.tsx`
- Modify: `src/components/news/notice-rich-editor.tsx`
- Test: `src/__tests__/news-rich-content-links.test.tsx`

- [ ] Add failing tests proving inline image insertion remains standalone by default.
- [ ] Add failing tests proving `2열` and `대표+2열` insert non-editable image-only gallery blocks with a normal paragraph after the gallery.
- [ ] Add failing tests proving selecting an inline image exposes an object-style selection frame, compact floating quick toolbar, and direct resize handle.
- [ ] Add failing tests proving the dense node-local slider/crop preset bar and the legacy full-width selected-image toolbar are not rendered.
- [ ] Add failing tests proving the separate image editing modal updates pixel size, fit/crop, and rotation metadata.
- [ ] Run the focused tests and confirm they fail.
- [ ] Implement upload handling through the existing `onUploadImage(file)` callback.
- [ ] Implement inline image HTML with safe image metadata.
- [ ] Implement gallery insertion as `data-notice-gallery` blocks.
- [ ] Implement a Tiptap React NodeView for inline images.
- [ ] Implement compact object-style quick controls for alignment, fit, edit entry, and delete.
- [ ] Implement a separate image editing modal for detailed size, crop, and rotation metadata updates.
- [ ] Remove the legacy parent-level selected image sub-toolbar.
- [ ] Re-run focused tests and confirm they pass.

### Task 5: Integration Review And Verification

**Files:**
- Modify: `_workspace/04_review/ui-review.md`
- Modify: `_workspace/final/verification.md`

- [ ] Run `pnpm exec vitest run src/__tests__/news-rich-content-links.test.tsx`.
- [ ] Run `pnpm lint`.
- [ ] Run `pnpm test`.
- [ ] Run `pnpm build`.
- [ ] Start or reuse local dev server.
- [ ] Browser-check `/news?tab=free` desktop and mobile for no horizontal overflow and visible layout stability.
- [ ] Record UI review PASS evidence.
- [ ] Record verification evidence and any residual risks.

---

### Follow-up Task: Google Docs Style Image Handles And Rotation

**Goal:** Refine selected image controls so they feel closer to Google Docs: smaller resize nodes, a top rotation dot, and a compact bottom document-object popup menu.

**Files:**
- Modify: `src/components/news/rich-text-editor-v2.tsx`
- Modify: `src/components/news/notice-rich-editor.tsx`
- Test: `src/__tests__/news-rich-content-links.test.tsx`

- [x] **Step 1: Add failing coverage**

Add focused tests proving selected images expose 8 smaller `size-2` resize handles, a top `이미지 회전 핸들`, a `텍스트와 함께 이동` bottom-toolbar action, and rotation drag updates `data-rotate`.

- [x] **Step 2: Implement NodeView UI refinement**

Reduce resize handle styling, add the top-center rotation dot and connector line, calculate drag rotation from the selected image frame center, and keep the compact bottom toolbar tied to the existing document-flow layout modes.

- [x] **Step 3: Verify**

Run focused rich editor tests and required repository checks. Browser verification is attempted when a local Chrome/Edge automation path is available.

---

### Follow-up Task: Middle Handles And Top Rotation Placement

**Goal:** Match Google Docs image object behavior more closely by placing the rotation dot above the object and making middle handles stretch/compress dimensions instead of cropping.

**Files:**
- Modify: `src/components/news/rich-text-editor-v2.tsx`
- Modify: `src/components/news/notice-rich-editor.tsx`
- Test: `src/__tests__/news-rich-content-links.test.tsx`
- Test: `src/__tests__/news-admin-controls.test.tsx`

- [x] **Step 1: Add failing coverage**

Add focused tests proving the rotation handle is above the selected image, side handles write `data-pixel-width`, top/bottom handles write `data-pixel-height`, and pixel resizing no longer preserves an unintended `cover` crop frame.

- [x] **Step 2: Implement handle behavior**

Use the selected image frame as the drag baseline, store direct resize output as pixel dimensions, keep crop metadata unchanged, and render pixel-sized images with `object-fit: fill` so direct stretch/compress handles do not clip the visible image.

- [x] **Step 3: Verify**

Run the rich editor and adjacent news admin tests, then run repository validation commands and record the results in the UI review and verification notes.

---

### Follow-up Task: Non-Clipping Rotation Feedback

**Goal:** Make image rotation feel like the Google Docs reference by showing the current angle and rotated object outline while preventing the rotated image from being clipped by the frame.

**Files:**
- Modify: `src/components/news/rich-text-editor-v2.tsx`
- Modify: `src/components/news/notice-rich-editor.tsx`
- Test: `src/__tests__/news-rich-content-links.test.tsx`

- [x] **Step 1: Add failing coverage**

Add focused tests proving selected rotated images show an angle label, expose a rotated outline, and use a visible overflow frame so rotated content is not clipped.

- [x] **Step 2: Implement rotation feedback**

Render a small angle label near the rotation handle, add a rotated blue outline overlay for non-zero rotation, and disable the selected image frame crop when rotation is applied.

- [x] **Step 3: Keep saved rendering compatible**

Ensure sanitized/public rotated `cover` images do not reintroduce an aspect-ratio crop frame and render the whole rotated image by switching the display object fit to `contain` when no explicit pixel stretch is active.

- [x] **Step 4: Verify**

Run focused rich editor tests, adjacent news admin tests, and repository validation commands. Record UI review and verification evidence.

---

### Follow-up Task: Rotated Object Selection And Image Options Panel

**Goal:** Make rotated selected images behave like one Google Docs-style object and replace dead/default controls with real document placement and right-side image options.

**Files:**
- Modify: `src/components/news/rich-text-editor-v2.tsx`
- Test: `src/__tests__/news-rich-content-links.test.tsx`

- [x] **Step 1: Add failing coverage**

Add focused tests proving a rotated selected image rotates the image, outline, resize handles, and rotation handle together, the bottom placement menu opens and applies `글자처럼 처리`, and detailed settings open as a right-side options panel.

- [x] **Step 2: Implement selected-object rotation alignment**

Move the selection outline, resize handles, and rotation handle into the same rotatable surface as the image while keeping the bottom toolbar and angle label upright.

- [x] **Step 3: Implement real placement and options controls**

Convert the bottom placement button into an accessible menu backed by existing `data-layout` metadata, and reshape detailed image editing into a right-side options panel for size, rotation, zoom, fit, crop focus, and layout.

- [x] **Step 4: Verify**

Run focused rich editor tests, repository checks where available, and record UI review plus verification evidence.

---

### Follow-up Task: Google Docs Icon Toolbar Clone

**Goal:** Match the user's Google Docs reference more closely by attaching the angle label to the rotation handle and replacing the remaining text/dropdown image toolbar with an icon-only popup.

**Files:**
- Modify: `src/components/news/rich-text-editor-v2.tsx`
- Test: `src/__tests__/news-rich-content-links.test.tsx`

- [x] **Step 1: Add failing coverage**

Add focused tests proving the rotation angle label lives inside the same rotatable surface as the rotation handle and the bottom toolbar exposes five icon layout controls without the text dropdown button.

- [x] **Step 2: Implement rotation label placement**

Move the angle label next to the circular rotation handle, keep it attached to the rotated object surface, and counter-rotate the text so the label remains readable.

- [x] **Step 3: Implement icon-only popup toolbar**

Replace the text dropdown with Google Docs-like icon layout buttons, a separator, and the More/options button while keeping layout actions backed by existing `data-layout` metadata.

- [x] **Step 4: Verify**

Run focused rich editor tests, lint, repository validation commands, and record review evidence.

---

### Follow-up Task: Edit Preview And Published Rich Content Consistency

**Goal:** Ensure rich editor image layout metadata renders consistently after a free-board post is saved and displayed through `NoticeRichContent`.

**Files:**
- Modify: `src/components/news/notice-rich-editor.tsx`
- Test: `src/__tests__/news-rich-content-links.test.tsx`
- Modify: `_workspace/04_review/ui-review.md`
- Modify: `_workspace/final/verification.md`

- [x] **Step 1: Add failing coverage**

Add focused tests proving saved `front`/`behind` image layer metadata renders through `NoticeRichContent` with a zero-flow wrapper and visible positioned image surface instead of becoming a normal inline image that changes text flow.

- [x] **Step 2: Implement display rendering parity**

Update rich-content image sanitization/rendering so trusted saved layer images preserve `data-layout`, offsets, pixel dimensions, and visible object style in the published view while leaving normal inline/block/wrap images unchanged.

- [x] **Step 3: Verify**

Run focused rich editor tests, required repository validation commands, and visible desktop/mobile checks for `/news?tab=free`; record UI review and verification evidence.

---

### Follow-up Task: Published Layer Image Comment Overlap

**Goal:** Prevent saved `front`/`behind` layer images from covering the comment section in published free-board/news rich content.

**Files:**
- Modify: `src/components/news/notice-rich-editor.tsx`
- Test: `src/__tests__/news-rich-content-links.test.tsx`
- Modify: `_workspace/04_review/ui-review.md`
- Modify: `_workspace/final/verification.md`

- [x] **Step 1: Add failing coverage**

Update focused rich-content coverage so saved layer images must reserve enough published content height for their visible image surface.

- [x] **Step 2: Implement layer height reservation**

Calculate a conservative published layer height from saved pixel height, estimated image height, vertical offset, zoom, and rotation. Apply that height to the layer wrapper while keeping the positioned image surface behavior unchanged.

- [x] **Step 3: Verify**

Run focused rich editor tests, full validation commands, and desktop/mobile browser checks for `/news?tab=free`; record review and verification evidence.

---

### Follow-up Task: Published Layer Image Text Flow Regression

**Goal:** Keep saved `front`/`behind` layer images from pushing following published body text below the image, while still reserving enough bottom space to keep comments below the image.

**Files:**
- Modify: `src/components/news/notice-rich-editor.tsx`
- Test: `src/__tests__/news-rich-content-links.test.tsx`
- Modify: `_workspace/04_review/ui-review.md`
- Modify: `_workspace/final/verification.md`

- [x] **Step 1: Add failing coverage**

Update focused rich-content coverage so a saved layer image keeps a zero-height layer wrapper and reserves root `.notice-rich-content` bottom space instead.

- [x] **Step 2: Move height reservation out of text flow**

Keep the image layer wrapper at `height:0px`, preserve the absolutely positioned image surface, and calculate a conservative root `padding-bottom` from saved pixel height, estimated image height, vertical offset, zoom, and rotation.

- [x] **Step 3: Verify**

Run focused rich editor tests, full validation commands, and desktop/mobile browser checks for `/news?tab=free`; record review and verification evidence.

---

### Follow-up Task: Free Board Gallery Blank Space

**Goal:** Remove duplicated blank space below rich-content galleries in the free-board focused post view while preserving comment overlap protection for true layer images.

**Files:**
- Modify: `src/components/news/notice-rich-editor.tsx`
- Test: `src/__tests__/news-rich-content-links.test.tsx`
- Modify: `_workspace/04_review/ui-review.md`
- Modify: `_workspace/final/verification.md`

- [x] **Step 1: Add failing coverage**

Add focused rich-content coverage proving gallery images that still carry old `front` layer metadata do not add root `padding-bottom`, because gallery images render in normal document flow.

- [x] **Step 2: Exclude galleries from layer reserve scanning**

Update `NoticeRichContent` layer reserve calculation to scan only images outside `data-notice-gallery` blocks, leaving standalone `front`/`behind` images unchanged.

- [x] **Step 3: Verify**

Run focused rich-content and free-board panel tests, required repository validation commands, and visible desktop/mobile checks for `/news?tab=free`; record review and verification evidence.
