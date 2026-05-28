# Verification

## Implemented Feature

Added operational guardrails before external sharing:

- destructive Prisma seed reset now requires `CONFIRM_SEED_RESET=true`
- demo login credentials are hidden by default on `/login`
- demo credentials can still be shown intentionally with `NEXT_PUBLIC_SHOW_DEMO_CREDENTIALS=true`

## Changed Files

- `prisma/seed.ts`: blocks destructive seed reset unless the explicit confirmation env var is set.
- `src/app/login/page.tsx`: hides demo credential card by default and switches login copy to issued-account language.
- `src/__tests__/linked-pages.test.tsx`: updates the expected login page message.
- `src/__tests__/portal-preview-pages.test.tsx`: verifies demo credentials are hidden by default.
- `_workspace/04_review/ui-review.md`: records the visible-change review result.

## Checks Run

- `pnpm exec prisma db seed` without `CONFIRM_SEED_RESET=true`: expected failure, guard confirmed.
- `pnpm lint`: pass.
- `pnpm test`: pass, 4 files and 20 tests.
- `pnpm build`: pass.
- Vercel env check: `NEXT_PUBLIC_SHOW_DEMO_CREDENTIALS` absent.

## Browser Checks

- Local built server `/login`: reviewed at 1440px desktop and 390px mobile viewports with Chrome/CDP fallback.
- Default `/login` page did not show demo credential heading or `member1 / member123`.
- Mobile viewport had no horizontal overflow.

## Unresolved Risks

- None for this hardening slice.
