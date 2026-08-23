# Member Service Full-Screen Navigation Plan

**Goal:** Make the logged-in personal service use the available viewport cleanly and make every sidebar shortcut truthful and usable.

## Tasks

- [x] Add regression coverage for the full-screen surface, role-aware label, home action, usable shortcuts, and removed customer-center card.
- [x] Make the shared personal-service navigation role/name aware while preserving internal role codes.
- [x] Expand the personal-service layer to the full viewport and remove redundant horizontal padding.
- [x] Keep document issuance, notices, and inquiries linked to their existing populated destinations.
- [x] Run focused tests, lint, full tests, build, and desktop/mobile UI review.

## Home Action Follow-up

- [x] Reproduce the same-route `/` no-op and add a regression test that clicking `홈으로` closes the full-screen service.
- [x] Dispatch the existing `close-portal` event from every desktop/mobile home action before navigation.
- [x] Re-run focused/full validation and verify the click in production.

## Precise Sidebar Navigation Follow-up

- [x] Separate in-service section navigation from external shortcuts so the sidebar explains where each action goes.
- [x] Make `내정보`, `납부내역`, and `개인자료` move to a dedicated focusable section and show only the selected item as active.
- [x] Add the missing personal curation shortcut for recommended, bookmarked, and saved content.
- [x] Close the full-screen service and explicitly route `서류발급`, `공지사항`, and `문의하기` to their populated pages.
- [x] Add interaction regression coverage, then run focused tests, lint, the full suite, build, and desktop/mobile browser verification.

## In-Service Interaction Containment Follow-up

- [x] Keep personal curation tabs, bookmark controls, cards, and load-more actions inside the open member-service layer without emitting a home/close action.
- [x] Raise every full-screen personal-service layer above the global mobile navigation so clicks cannot land on the underlying home tab.
- [x] Replace shortcut router/close races with deterministic full-page shortcut navigation.
- [x] Add integrated home and shared-host regression coverage for drawer persistence and shortcut behavior.
- [x] Run focused tests, lint, the full suite, build, UI review, and authenticated desktop/mobile browser verification.

## Payment Ledger Disclosure Follow-up

- [x] Open the full payment-ledger disclosure when the sidebar `납부내역` item is selected.
- [x] Close the disclosure when another in-service section is selected or the service is reopened at `내정보`.
- [x] Preserve native manual `전체 납부내역 보기` / `접기` interaction and existing contribution data contracts.
- [x] Add integrated regression coverage, then run focused tests, lint, the full suite, build, and authenticated desktop/mobile browser verification.
