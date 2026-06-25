# Account Password Change Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let any logged-in password-based account, including administrators, change its own site password from the portal profile menu.

**Architecture:** Add a server action in `src/lib/auth.ts` that verifies the current session, existing password hash, current password, confirmation, and approved password rules before updating only the current user's `passwordHash`. Add a compact password-change form component inside the logged-in portal profile dropdown. Keep administrator reset of other accounts on the existing CLI path for now.

**Tech Stack:** Next.js App Router, React client components, TypeScript, Prisma, bcryptjs, Vitest + Testing Library.

---

### Task 1: Server Action

**Files:**
- Modify: `src/lib/auth.ts`
- Test: `src/__tests__/phone-signup-auth.test.ts`

- [x] **Step 1: Write failing tests**

Add tests proving `changePasswordAction`:

- rejects unauthenticated requests
- rejects Google-only or passwordless accounts
- rejects the wrong current password
- rejects weak or mismatched new passwords
- updates only the current user's hash when the current password is correct

- [x] **Step 2: Run focused tests to verify failure**

Run: `pnpm test -- src/__tests__/phone-signup-auth.test.ts -t "changes the current password"`

Expected: FAIL because `changePasswordAction` is not exported.

- [x] **Step 3: Implement minimal server action**

Add `changePasswordAction(prevState, formData)` in `src/lib/auth.ts`. It should read `currentPassword`, `newPassword`, and `newPasswordConfirm`; load the current user by session id; require an existing `passwordHash`; compare current password; validate the new password using `validateSignupPassword(newPassword, user.loginId || user.phone || "")`; hash with bcrypt; and update `passwordHash`.

- [x] **Step 4: Run focused tests to verify pass**

Run: `pnpm test -- src/__tests__/phone-signup-auth.test.ts -t "password"`

Expected: PASS.

### Task 2: Portal Profile UI

**Files:**
- Modify: `src/components/portal/portal-shell.tsx`
- Test: `src/__tests__/portal-shell.test.tsx`

- [x] **Step 1: Write failing UI test**

Add a test that opens the profile dropdown, fills current password, new password, and confirmation, submits, and expects `changePasswordAction` to be called and a success message to render.

- [x] **Step 2: Run focused UI test to verify failure**

Run: `pnpm test -- src/__tests__/portal-shell.test.tsx -t "changes the logged-in user's password"`

Expected: FAIL because the profile dropdown has no password form.

- [x] **Step 3: Implement minimal UI**

Import `changePasswordAction`, add local form status state, and render a compact `비밀번호 변경` form in the profile dropdown for logged-in users. On success, clear the password fields and show a success message. On error, show the returned error.

- [x] **Step 4: Run focused UI test to verify pass**

Run: `pnpm test -- src/__tests__/portal-shell.test.tsx -t "changes the logged-in user's password"`

Expected: PASS.

### Task 3: Documentation And Review

**Files:**
- Modify: `docs/operations/user-manual.md`
- Modify: `docs/operations/account-management.md`
- Modify: `_workspace/04_review/ui-review.md`
- Modify: `_workspace/final/verification.md`

- [x] **Step 1: Update docs**

Document that users and administrators can change their own password from the profile menu. Keep CLI reset guidance for operator-managed password resets.

- [x] **Step 2: Run full validation**

Run: `pnpm lint`, `pnpm test`, and `pnpm build`.

- [x] **Step 3: Complete UI review**

Record a PASS review for the login-gated profile menu change in `_workspace/04_review/ui-review.md`.

- [x] **Step 4: Commit and push**

Commit the feature and push `main` to `origin/main`.
