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

---

- Selected approved spec path: `docs/superpowers/specs/2026-05-25-daebang-housing-cooperative-portal-design.md`.
- Selected implementation plan: `docs/superpowers/plans/2026-06-02-daebang-library-index.md` with existing document API management behavior.
- Implementation boundary: Keep `/library` as a unified index and keep document mutation admin-only. The change may expose edit/delete controls only for authenticated admin sessions and only for DB-backed uploaded document entries.
- Request/spec conflicts: none. The request reuses existing administrator document mutation capability without exposing private files or creating a public management surface.
- Planning may continue: yes.

---

- Selected approved spec path: `DESIGN.md`.
- Selected implementation plan: Add a public about-page signature image asset and replace the chairman greeting sign-off text rendering.
- Implementation boundary: Keep the change limited to public `/about` greeting presentation. No access rules, document workflows, authenticated surfaces, or profile imagery change.
- Request/spec conflicts: none.
- Planning may continue: yes.

---

- Selected approved spec path: `DESIGN.md`.
- Selected implementation plan: Remove the signature image from the chairman greeting sign-off and keep only `대방동 지역주택조합 조합장`.
- Implementation boundary: Keep the change limited to public `/about` greeting presentation. Do not alter greeting copy, access rules, document workflows, authenticated surfaces, or profile imagery.
- Request/spec conflicts: none.
- Planning may continue: yes.

---

- Selected approved spec path: `DESIGN.md`.
- Selected implementation plan: Add the provided unchanged PNG asset and render it beside the chairman greeting sign-off.
- Implementation boundary: Keep the change limited to public `/about` greeting presentation. Preserve the provided image bytes and aspect ratio; do not alter greeting copy, access rules, document workflows, authenticated surfaces, or profile imagery.
- Request/spec conflicts: none.
- Planning may continue: yes.

---

- Selected approved spec path: `DESIGN.md`.
- Selected implementation plan: Convert the signature asset background to transparent and keep the existing sign-off rendering.
- Implementation boundary: Keep the change limited to `public/assets/about/chairman-signature.png` and the already-approved public `/about` greeting presentation. Do not alter the sign-off text, rendered size, layout, access rules, document workflows, authenticated surfaces, or profile imagery.
- Request/spec conflicts: none.
- Planning may continue: yes.
