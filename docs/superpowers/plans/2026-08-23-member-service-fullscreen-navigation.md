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
