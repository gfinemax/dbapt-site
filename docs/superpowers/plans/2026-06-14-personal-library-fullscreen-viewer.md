# Personal Library Fullscreen Viewer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make documents opened from the right-side personal library drawer render in a full-screen viewer layer instead of being constrained by the drawer width.

**Architecture:** `DocumentTable` keeps the default self-managed modal for normal portal pages, but accepts an optional `onOpenDocument` callback. `PortalShell` forwards that callback, and `PersonalLibraryDrawerHost` owns the active document state so it can render `PdfViewerModal` outside the transformed drawer container. Related-document resolution stays in `DocumentTable`/shared helper semantics and is reused by the host.

**Tech Stack:** Next.js App Router, React client components, TypeScript, Tailwind CSS, Vitest + Testing Library.

---

### Task 1: Add External Document Open Hook

**Files:**
- Modify: `src/components/portal/document-table.tsx`
- Modify: `src/components/portal/portal-shell.tsx`
- Test: `src/__tests__/personal-library-drawer-host.test.tsx`

- [x] **Step 1: Write the failing test**

Add a test that opens the personal library drawer, clicks a document `열람` button, and expects the `PdfViewerModal` panel to be rendered outside the drawer element.

- [x] **Step 2: Run test to verify it fails**

Run: `pnpm test -- src/__tests__/personal-library-drawer-host.test.tsx -t "opens drawer documents in a fullscreen viewer layer"`

Expected: FAIL because `PdfViewerModal` is currently rendered inside `DocumentTable`, which is inside the drawer.

- [x] **Step 3: Implement minimal callback plumbing**

Add `onOpenDocument?: (doc: Document) => void` to `DocumentTableProps` and `PortalShellProps`. In `DocumentTable.openViewDoc`, call the external callback when present; otherwise keep the existing local modal behavior.

- [x] **Step 4: Run focused tests**

Run: `pnpm test -- src/__tests__/personal-library-drawer-host.test.tsx src/__tests__/pdf-viewer-modal.test.tsx`

Expected: PASS.

### Task 2: Render Drawer Viewer At Host Level

**Files:**
- Modify: `src/components/portal/personal-library-drawer-host.tsx`
- Test: `src/__tests__/personal-library-drawer-host.test.tsx`

- [x] **Step 1: Implement active document state in host**

Keep `activeViewDoc` in `PersonalLibraryDrawerHost`, pass `onOpenDocument={setActiveViewDoc}` into `PortalShell`, and render `PdfViewerModal` as a sibling of the drawer overlay.

- [x] **Step 2: Resolve related documents in host**

Use `getPdfRelatedDocument(activeViewDoc, documents)` so reply/received document toggles keep working when the modal is hoisted.

- [x] **Step 3: Run focused tests**

Run: `pnpm test -- src/__tests__/personal-library-drawer-host.test.tsx`

Expected: PASS.

### Task 3: Validate And Review

**Files:**
- Modify: `_workspace/00_input/request-summary.md`
- Modify: `_workspace/01_scope/spec-selection.md`
- Modify: `_workspace/04_review/ui-review.md`

- [x] **Step 1: Run full validation**

Run: `pnpm lint`, `pnpm test`, `pnpm build`.

- [x] **Step 2: Complete UI review**

Update `_workspace/04_review/ui-review.md` with the full-screen personal library viewer outcome and any browser verification limits.

## Implementation Status

Completed and validated on 2026-06-25.

- Personal library drawer documents open in the host-level full-screen PDF viewer.
- Related-document resolution is preserved outside the drawer.
- All PDF viewer instances include a `PDF만 크게` mode for focusing on the document body only.
