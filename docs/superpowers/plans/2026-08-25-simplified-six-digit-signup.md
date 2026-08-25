# Simplified Six-Digit Signup Implementation Plan

**Goal:** Reduce the visual length and instructional burden of the new-signup screen while keeping the working approval flow and using a numeric six-digit password.

**Architecture:** Keep `LoginClient`, the existing server action, and independent password visibility controls. Consolidate signup guidance into one compact notice, reduce form spacing, and keep validation centralized in `validateSignupPassword`.

## Task 1: Align the password contract

- Keep signup and password-change validation at exactly six numeric digits.
- Keep tests for valid and invalid values.
- Update user-facing operational documentation to match.

## Task 2: Simplify the signup surface

- Replace the long three-step procedure and separate password-rule card with one compact approval notice.
- Reduce panel width, padding, gaps, and memo height without removing fields.
- Keep submit, return-to-login, error/success feedback, and show/hide controls intact.

## Task 3: Review and verify

- Run focused signup tests, lint, full tests, and build.
- Review desktop and mobile layouts in the browser.
- Record a PASS UI review and final verification evidence.
