# Verification

## Implemented Fixes

- Loaded approved uploaded documents for logged-in `/library` users and opened real uploaded material entries through the existing PDF viewer.
- Restyled the logged-in right-side badge to use the vertical orange treatment instead of lime.
- Renamed the badge and drawer title to `조합원 개인 자료실`.
- Reduced the side badge width to `w-10` (about 40px), roughly one quarter narrower than the previous rendered 56px badge.
- Brightened the orange background to `#ff5a1f`, kept white text, 12px left-side radius, left chevron icon, no explicit border, and removed the side shadow.
- Kept the existing click behavior: the badge opens the same member-only portal drawer.
- Hid the side badge on mobile, where the bottom 자료실 tab already exists.

## Changed Files

- `src/components/landing/site-header.tsx`
- `src/app/library/page.tsx`
- `src/components/library/library-client.tsx`
- `src/components/landing/home-client.tsx`
- `src/components/about/about-page-client-shell.tsx`
- `src/components/disclosure/disclosure-page-client-shell.tsx`
- `src/components/disclosure/meetings-table.tsx`
- `prisma/seed.ts`
- `src/__tests__/library-page.test.tsx`
- `src/__tests__/site-header.test.tsx`
- `_workspace/00_input/request-summary.md`
- `_workspace/01_scope/spec-selection.md`
- `_workspace/04_review/ui-review.md`
- `_workspace/final/verification.md`

## Checks Run

- Focused test: `pnpm test src/__tests__/site-header.test.tsx` passed, 1 test.
- Library focused test: `pnpm test src/__tests__/library-page.test.tsx` passed in earlier verification for the uploaded material viewer behavior.
- `pnpm lint`: pass with one existing warning in `src/components/portal/document-table.tsx`.
- `pnpm build`: pass.
- Browser verification: connected Chrome found one fixed right-side badge, confirmed width about 40px, `rgb(255, 90, 31)` background, `rgb(255, 255, 255)` text, zero-width borders, 12px corner radius, vertical text, and box-shadow layers all at `rgba(0,0,0,0)`.
- Desktop browser viewport: 1040px wide, side badge visible.
- `pnpm test`: failed in pre-existing DB seed verification because the current database has 2 documents and `src/__tests__/portal-auth-flow.test.tsx:71` expects at least 3.

## Browser Checks

- Dev server: `http://localhost:3000`
- Desktop logged-in check: connected Chrome opened `/` after login and verified the new visual metrics.
- Mobile behavior: the side badge remains `hidden md:inline-flex` in implementation so mobile continues to use the existing bottom navigation and sitemap action instead of duplicating the side badge.

## Unresolved Risks Or Follow-Up Specs

- Full `pnpm test` remains blocked by the current seeded document count mismatch described above.
