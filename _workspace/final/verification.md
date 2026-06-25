# Verification

## Implemented Feature

- Added `changePasswordAction` for logged-in password-based accounts.
- Added a compact `비밀번호 변경` form inside the portal profile dropdown.
- Supported administrators changing their own password through the same profile menu.
- Kept operator reset of other users on the documented CLI path.
- Documented the behavior in user and operations docs, and updated the auth/permission PRD.

## Changed Files

- `src/lib/auth.ts`
- `src/components/portal/portal-shell.tsx`
- `src/__tests__/phone-signup-auth.test.ts`
- `src/__tests__/portal-shell.test.tsx`
- `docs/operations/user-manual.md`
- `docs/operations/account-management.md`
- `docs/superpowers/specs/2026-05-28-daebang-auth-and-document-disclosure-design.md`
- `docs/superpowers/plans/2026-06-25-account-password-change.md`

## Checks

- `pnpm test -- src/__tests__/phone-signup-auth.test.ts -t "changes the current password"`: FAIL before implementation because `changePasswordAction` was missing.
- `pnpm test -- src/__tests__/phone-signup-auth.test.ts -t "password"`: PASS.
- `pnpm test -- src/__tests__/portal-shell.test.tsx -t "changes the logged-in user's password"`: FAIL before UI implementation because the form was missing.
- `pnpm test -- src/__tests__/portal-shell.test.tsx -t "changes the logged-in user's password"`: PASS.
- `pnpm lint`: PASS.
- `pnpm test`: PASS, 72 files and 426 tests.
- `pnpm build`: PASS.
- `node _workspace/password-change-cdp-verify.mjs`: PASS.

## Browser Checks

- Desktop portal profile menu: password form visible, wrong-current-password error visible, no horizontal overflow.
- Mobile portal profile menu at 390x844: password form visible, no horizontal overflow.

## Risks Or Follow-up

- none
