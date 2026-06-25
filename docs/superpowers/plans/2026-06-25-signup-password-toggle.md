# Signup Password Toggle Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:test-driven-development when changing behavior. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add show/hide controls to the signup password and password confirmation fields.

**Architecture:** Reuse the existing login password `Eye` / `EyeOff` control pattern inside `LoginClient`. Keep the signup password and confirmation visibility states independent so each field can be toggled without changing the other.

**Tech Stack:** Next.js App Router, React client component state, lucide-react icons, Vitest + Testing Library.

---

### Task 1: Signup Password Field Toggles

**Files:**
- Modify: `src/app/login/login-client.tsx`
- Test: `src/__tests__/portal-preview-pages.test.tsx`

- [x] **Step 1: Write the failing test**

Add a test that switches to signup mode and verifies the signup password and confirmation fields can be shown and hidden independently.

- [x] **Step 2: Run the failing test**

Run: `pnpm test -- src/__tests__/portal-preview-pages.test.tsx -t "signup password fields"`

Expected: FAIL because signup password fields have no toggle controls.

- [x] **Step 3: Implement the toggles**

Add `showSignupPassword` and `showSignupPasswordConfirm` state, render `Eye` / `EyeOff` buttons inside each signup password field, and keep accessible labels distinct.

- [x] **Step 4: Verify**

Run related tests, lint, build, and desktop/mobile UI verification.
