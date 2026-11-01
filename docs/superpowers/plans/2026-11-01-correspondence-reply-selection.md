# Correspondence Reply Selection Implementation Plan

**Goal:** Make reply correspondence a direct type choice and automatically reflect the no-further-reply state in the administrator forms.

**Governing spec:** `docs/superpowers/specs/2026-11-01-correspondence-reply-selection-design.md`

## Tasks

1. Update the document upload form to include `회신`, remove the redundant reply checkbox, preserve reply-target selection, and auto-select `회신 불필요` for replies.
2. Apply the same behavior to the disclosure document edit form.
3. Update focused component tests for option visibility, automatic selection, reply-target visibility, and received-document behavior.
4. Run focused tests, `pnpm lint`, `pnpm test`, and `pnpm build`.
5. Inspect the changed administrator form at desktop and mobile widths, then complete the UI review gate.
