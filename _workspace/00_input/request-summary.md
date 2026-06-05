# Request Summary

- Requested feature slice: Remove the visible `읽기 가이드` inner boxes from disclosure cards and reduce unnecessary vertical whitespace inside each card.
- Explicitly included scope: Remove only the guide panel/chips inside each disclosure card; reduce the title/description-to-document area gap and compact the uploaded/empty document inner boxes while preserving card title, description, upload status, uploaded document previews, and `자료실 열기` actions.
- Explicitly excluded scope: Do not change document upload categories, permissions, document drawer behavior, or card ordering.
- Candidate governing specification: `docs/superpowers/specs/2026-05-25-daebang-housing-cooperative-portal-design.md`, public `공개자료` scope.
- Candidate implementation plan: Small presentation cleanup in `DisclosureClient`.
- Unanswered decision: none.

---

- Requested feature slice: Make public disclosure document registration available from the same folder-table experience shown for `이사회 회의록`, including `+ 신규 문서 등록` inside the opened document drawer.
- Explicitly included scope: Let non-meeting disclosure cards such as `운영관리규정`, `회계관리규정`, `선거관리규정`, `조합원 연명부`, and business/supervision cards open the shared document drawer; default the upload form's subcategory to the opened folder.
- Explicitly excluded scope: Do not create public unauthenticated upload, do not change document upload API permissions, do not expose private files to logged-out users, and do not add a separate CMS/editor.
- Candidate governing specification: `docs/superpowers/specs/2026-05-25-daebang-housing-cooperative-portal-design.md`, public `공개자료` scope.
- Candidate implementation plan: Reuse the existing protected document drawer/table and `DocumentUploadForm`.
- Unanswered decision: none.

---

- Requested feature slice: Expand public `1. 규약 및 연명부` with regulation cards and make each regulation type upload/read friendly through existing protected document infrastructure.
- Explicitly included scope: Add `운영관리규정`, `회계관리규정`, `선거관리규정`, and `기타 내부 운영규정` cards/submenus; add matching admin upload subcategories; show logged-in users uploaded document previews and direct `문서 보기` actions per regulation card.
- Explicitly excluded scope: Do not change login requirements, expose private files publicly, create a new unauthenticated upload surface, alter payment/accounting workflows, or change unrelated disclosure categories.
- Candidate governing specification: `docs/superpowers/specs/2026-05-25-daebang-housing-cooperative-portal-design.md`, public `공개자료` scope.
- Candidate implementation plan: Existing public disclosure category presentation plus existing admin document upload form/API.
- Unanswered decision: none.

---

- Requested feature slice: Let administrators edit and delete related uploaded documents directly from the `/library` material drawer.
- Explicitly included scope: Show admin-only `수정` and `삭제` controls for `실제 업로드` material entries inside the library panel; update document title, description, category, subcategory, dates, and important flag through the existing document metadata API; remove deleted entries from the local material list.
- Explicitly excluded scope: Do not make static `자료실 색인` fallback entries CMS-managed, do not replace uploaded files, do not expose management controls to non-admin users, and do not change document access rules.
- Candidate governing specification: `docs/superpowers/specs/2026-05-25-daebang-housing-cooperative-portal-design.md`, authenticated document management and public 자료실 boundaries.
- Candidate implementation plan: `docs/superpowers/plans/2026-06-02-daebang-library-index.md` plus existing `PATCH`/`DELETE /api/documents/[id]` document-management API.
- Unanswered decision: none.

---

- Requested feature slice: Replace the `안동연(인)` chairman greeting sign-off text with the provided black signature mark and remove the white image background.
- Explicitly included scope: Add a transparent-background black signature asset and render it next to `대방동 지역주택조합 조합장` in the public `/about` greeting section.
- Explicitly excluded scope: Do not change about-page content, routes, access permissions, chairman profile photo, document workflows, or any authenticated feature.
- Candidate governing specification: `DESIGN.md`, public `조합소개` presentation scope.
- Candidate implementation plan: Add a public about-page signature image asset and replace the sign-off text rendering.
- Unanswered decision: none.

---

- Requested feature slice: Remove the signature image shown to the right of the chairman greeting sign-off.
- Explicitly included scope: Delete the rendered `안동연 조합장 서명` image and remove the signature asset from public about assets.
- Explicitly excluded scope: Do not restore `안동연(인)`, change greeting body copy, routes, permissions, chairman profile photo, or authenticated workflows.
- Candidate governing specification: `DESIGN.md`, public `조합소개` presentation scope.
- Candidate implementation plan: Remove the signature image from the sign-off and keep only `대방동 지역주택조합 조합장`.
- Unanswered decision: none.

---

- Requested feature slice: Restore the provided first-image signature to the right of the chairman greeting sign-off without transforming the image.
- Explicitly included scope: Copy the provided PNG bytes unchanged into public about assets and render that asset next to `대방동 지역주택조합 조합장` in the public `/about` greeting section.
- Explicitly excluded scope: Do not crop, background-remove, redraw, recolor, or otherwise process the provided image; do not change about-page copy, routes, permissions, chairman profile photo, document workflows, or authenticated features.
- Candidate governing specification: `DESIGN.md`, public `조합소개` presentation scope.
- Candidate implementation plan: Add the provided public about-page signature image asset and render it beside the chairman sign-off with preserved aspect ratio.
- Unanswered decision: none.

---

- Requested feature slice: Make the signature background transparent for the image shown to the right of `대방동 지역주택조합 조합장`.
- Explicitly included scope: Process `public/assets/about/chairman-signature.png` so the opaque checkerboard/light background becomes transparent while the black signature stroke remains visible.
- Explicitly excluded scope: Do not change the sign-off text, displayed size, layout, about-page copy, routes, permissions, chairman profile photo, document workflows, or authenticated features.
- Candidate governing specification: `DESIGN.md`, public `조합소개` presentation scope.
- Candidate implementation plan: Update only the public signature PNG alpha channel and re-verify the existing about greeting rendering.
- Unanswered decision: none.
