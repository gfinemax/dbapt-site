# Daebang Housing Cooperative Website Guide

## Working Rules

- Read `DESIGN.md` before editing UI, layout, color, motion, or imagery.
- Build the site with Next.js App Router, TypeScript, Tailwind CSS, and shadcn/ui-style source components.
- Use `Pretendard` for Korean and UI typography. Do not use italic, serif, or display substitute fonts.
- Use the selected hero artwork from `public/assets/hero/community-hero-04.png`.
- Use only validated transparent-background PNGs from `public/assets/icons/` in feature cards.
- Keep the first implementation slice truthful: it is a public landing page and login-gated service preview, not working authentication, document disclosure, accounting, payment reminder, voting, or messaging integration.
- Use warm canvas `#fbfaf9`, inset stone card outlines, dark pill primary CTA, and restrained colorful accents as defined in `DESIGN.md`.
- Decorative motion must not interfere with content and must stop under `prefers-reduced-motion: reduce`.

## Validation

Run these commands before reporting UI work ready:

```powershell
pnpm lint
pnpm test
pnpm build
```

For visible changes, open the running page in the Codex browser and check desktop and mobile layouts.
