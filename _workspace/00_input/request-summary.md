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
