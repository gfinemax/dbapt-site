# Spec Selection

- Selected approved spec path: `docs/superpowers/specs/2026-05-25-daebang-housing-cooperative-portal-design.md`.
- Selected implementation plan: Small presentation cleanup in `DisclosureClient`.
- Implementation boundary: Keep all protected document and upload behavior unchanged; remove only the visual guide panel inside public disclosure cards and tighten card spacing.
- Request/spec conflicts: none.
- Planning may continue: yes.

---

- Selected approved spec path: `DESIGN.md`.
- Selected implementation plan: Update the shared public `SiteFooter` address block to an inline wrapping row while preserving the existing text content.
- Implementation boundary: Keep the change limited to footer address/contact layout. Do not add new links, access changes, map integrations, document workflows, or authenticated functionality.
- Request/spec conflicts: none.
- Planning may continue: yes.

---

- Selected approved spec path: `DESIGN.md`.
- Selected implementation plan: Add a small developer credit to the shared public `SiteFooter` and extend the focused footer rendering test.
- Implementation boundary: Keep the change limited to footer credit presentation. Do not add developer contact actions, new navigation, access changes, map integrations, document workflows, or authenticated functionality.
- Request/spec conflicts: none.
- Planning may continue: yes.

---

- Selected approved spec path: `DESIGN.md`.
- Selected implementation plan: Update the shared public `SiteFooter` contact copy and add a focused footer rendering test.
- Implementation boundary: Keep the change limited to footer presentation. Do not add new public services, access changes, map integrations, document workflows, or authenticated functionality.
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

---

- Selected approved spec path: `DESIGN.md` and the existing `공개자료` document-list presentation under `docs/superpowers/specs/2026-05-25-daebang-housing-cooperative-portal-design.md`.
- Selected implementation plan: Extend `MeetingsTable` title badges for correspondence metadata.
- Implementation boundary: Keep the change limited to visual title badges in the `수발신 공문` folder. Real uploaded documents are inferred from title text and existing subcategory only; no schema, API, permission, upload, or document access behavior changes.
- Request/spec conflicts: none.
- Planning may continue: yes.

---

- Selected approved spec path: `DESIGN.md` and existing protected information-disclosure document workflow under `docs/superpowers/specs/2026-05-28-daebang-auth-and-document-disclosure-design.md`.
- Selected implementation plan: Add correspondence direction metadata to the existing document registration/editing path.
- Implementation boundary: Add only nullable `correspondenceType` metadata for `수발신 공문`. Keep uploads admin-only, preserve existing file access, and render the selector only when the selected folder is `수발신 공문`.
- Request/spec conflicts: none.
- Planning may continue: yes.

---

- Selected approved spec path: `DESIGN.md`.
- Selected implementation plan: Current chat-approved organization chart implementation plan.
- Implementation boundary: Keep the change limited to public `/about` organization chart presentation. Clarify existing organizational relationships using layout, badges, and solid/dashed connectors without adding working features, access changes, or new partner data.
- Request/spec conflicts: none.
- Planning may continue: yes.
