# Spec Selection

- Selected approved spec path: `docs/superpowers/specs/2026-05-25-daebang-housing-cooperative-portal-design.md`.
- Selected implementation plan: Small presentation cleanup in `DisclosureClient`.
- Implementation boundary: Keep all protected document and upload behavior unchanged; remove only the visual guide panel inside public disclosure cards and tighten card spacing.
- Request/spec conflicts: none.
- Planning may continue: yes.

---

- Selected approved spec path: `docs/superpowers/specs/2026-05-25-daebang-housing-cooperative-portal-design.md`.
- Selected implementation plan: Reuse the existing protected document drawer/table and `DocumentUploadForm`.
- Implementation boundary: Keep `/disclosure` as a public informational preview page, keep upload mutation inside the authenticated admin document workflow, and expose the same folder-table registration surface only to logged-in admin sessions.
- Request/spec conflicts: none. The request extends the already-approved `공개자료` document-room presentation without changing access rules.
- Planning may continue: yes.

---

- Selected approved spec path: `docs/superpowers/specs/2026-05-25-daebang-housing-cooperative-portal-design.md`.
- Selected implementation plan: Existing public disclosure category presentation plus existing admin document upload form/API.
- Implementation boundary: Keep `/disclosure` as a public informational preview page and keep uploads inside the existing authenticated admin document workflow. The current change adds regulation card categories, matching upload subcategories, and logged-in document previews without changing public access permissions.
- Request/spec conflicts: none. The request fits the approved public `공개자료` informational scope.
- Planning may continue: yes.
