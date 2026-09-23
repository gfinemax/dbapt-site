# Account Recovery With Manual SMS Implementation Plan

**Goal:** Let members request account-ID help or a password reset, then let an administrator manually deliver a friendly message from either an office mobile phone or a personal mobile phone without an external messaging contract.

**Governing spec:** `docs/superpowers/specs/2026-09-24-account-recovery-manual-sms-design.md`

**Approval:** The user approved the delivery choice and requested implementation on 2026-09-24.

## Task 1: Persistence and security foundation

- [x] Add `authVersion` to `User` and add an `AccountRecoveryRequest` model with request type, lifecycle state, token hash and expiry, handler, delivery type, and audit timestamps.
- [x] Add a PostgreSQL migration and regenerate Prisma Client.
- [x] Add focused domain tests for token hashing, expiry, single use, message construction, masking, and duplicate-request handling.

## Task 2: Public recovery requests

- [x] Add server actions that accept name and registered phone, use exact normalized matching, return a generic response, and create only one active request per account and type.
- [x] Add a public `/account-recovery` page with `아이디 찾기` and `비밀번호 재설정` modes and friendly Korean guidance.
- [x] Add login-page links to the recovery page without changing signup or Google-login behavior.
- [x] Add focused interaction tests.

## Task 3: Administrator processing

- [x] Add an ADMIN-only `/portal/admin/account-recovery` page and navigation entry.
- [x] Show pending/recent requests with minimal account data and status.
- [x] For ID help, prepare an ID guidance SMS message.
- [x] For password reset, generate a random 12-hour single-use token, revoke previous active tokens, and prepare a reset-link SMS message.
- [x] Let the administrator choose `사무국 전용폰` or `관리자 개인폰`, open the device SMS app, copy the message, mark delivery, or cancel the request.
- [x] Never persist the administrator's personal phone number or the raw reset token.
- [x] Add authorization and interaction tests.

## Task 4: Password reset and session revocation

- [x] Add `/reset-password/[token]` with valid, expired, used, and cancelled states.
- [x] Validate and hash the new password, consume the token atomically, complete the request, increment `authVersion`, and clear the current session cookie.
- [x] Include `authVersion` in new JWTs and reject sessions whose version no longer matches the active user.
- [x] Add focused reset and session-revocation tests.

## Task 5: Documentation, UI review, and verification

- [x] Update the user and account-management manuals.
- [x] Run focused tests, `pnpm lint`, `pnpm test`, and `pnpm build`.
- [x] Run the required UI review and verify desktop and mobile layouts in the browser.
- [x] Write `_workspace/final/verification.md` with observed evidence and remaining external boundaries.
- [x] Commit and push only the scoped implementation after all required checks pass.
