# Mobile-First Login And Signup Layout Plan

**Goal:** Put login/signup choice and form inputs above secondary guidance on mobile, while preserving the existing desktop hierarchy and all authentication behavior.

## Task 1: Compact the status shell on mobile

- Add an opt-in compact mobile presentation to `StatusPage`.
- Reduce nested panel padding, headline size, and introductory spacing only below the `sm` breakpoint.
- Preserve the existing desktop shell and home action.

## Task 2: Make authentication mode switching immediate

- Add an accessible two-option `로그인` / `신규 가입` segmented control above both forms.
- Keep the account-rights explanation desktop-only and remove the redundant signup promotion card.
- Keep Google OAuth and embedded-browser guidance unchanged.

## Task 3: Reduce signup effort

- Use 16px mobile inputs with 48px touch height to prevent mobile zoom and improve tapping.
- Use a two-column field layout on desktop while retaining a single natural mobile column.
- Make the optional memo visually secondary and keep the primary submit action full width on mobile.

## Task 4: Verify

- Update focused interaction assertions.
- Run focused tests, lint, full tests, and production build.
- Verify login and signup at desktop and mobile viewports, then complete design QA and UI review.
