# Daebang Housing Cooperative Landing Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the public-facing Next.js landing page and role-aware portal preview shell for the Daebang-dong Housing Cooperative using the approved Family-inspired design reference, selected hero illustration, and transparent feature icons.

**Architecture:** A new Next.js App Router application lives at the current repository root. The first delivery is intentionally UI-only: typed landing-page content drives reusable section components, while protected features appear as clear login-oriented preview cards rather than pretending authentication or backend workflows exist. Generated raster assets are copied into `public/assets` and normalized before being referenced from UI components.

**Tech Stack:** Next.js App Router, React, TypeScript, Tailwind CSS v4, shadcn/ui conventions, Pretendard web font, Vitest + Testing Library, CSS keyframe motion.

---

## Scope Boundary

This plan implements the first product slice defined in `docs/superpowers/specs/2026-05-25-daebang-housing-cooperative-portal-design.md`: public landing page plus login-portal preview shell. Authentication, document storage, accounting Excel import, message delivery integrations, and real role enforcement are follow-on plans because they require backend, legal, and operational decisions.

## File Map

| Path | Responsibility |
|---|---|
| `AGENTS.md` | Durable local rules for design source, typography, asset usage, test and validation commands |
| `DESIGN.md` | Project-local copy of the approved Family style reference supplied by the user |
| `package.json`, `next.config.ts`, `tsconfig.json`, `postcss.config.mjs`, `eslint.config.mjs` | Next.js/Tailwind/TypeScript toolchain |
| `vitest.config.ts`, `vitest.setup.ts` | Component-test runtime |
| `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css` | App entry, metadata, design tokens and global motion |
| `src/components/ui/button.tsx` | shadcn-style pill button primitive |
| `src/components/landing/site-header.tsx` | Public navigation and login CTA |
| `src/components/landing/hero-section.tsx` | Hero copy, selected illustration and decorative animation objects |
| `src/components/landing/feature-links.tsx` | Public shortcut card grid using transparent icon assets |
| `src/components/landing/notices-section.tsx` | Public notice and members-only information panels |
| `src/components/landing/portal-preview.tsx` | Login-gated service preview cards |
| `src/components/landing/site-footer.tsx` | Contact and policy links |
| `src/content/landing.ts` | Typed Korean copy, nav, feature and notice data |
| `src/__tests__/landing-page.test.tsx` | Public landing behavior and access-language tests |
| `public/assets/hero/community-hero-04.png` | Selected fourth hero concept |
| `public/assets/icons/*.png` | Eight transparent icon assets |

### Task 1: Establish Project Rules and Next.js Toolchain

**Files:**
- Create: `AGENTS.md`
- Create: `DESIGN.md`
- Create: `package.json`
- Create: `next.config.ts`
- Create: `tsconfig.json`
- Create: `postcss.config.mjs`
- Create: `eslint.config.mjs`
- Create: `src/app/layout.tsx`
- Create: `src/app/globals.css`

- [ ] **Step 1: Add durable repository rules**

Create `AGENTS.md` with rules requiring `DESIGN.md`, Pretendard only for site typography, the selected hero asset, transparent icons, no invented authenticated behavior, and the validation commands `pnpm lint`, `pnpm test`, and `pnpm build`.

- [ ] **Step 2: Preserve the supplied design reference**

Copy `C:\Users\finemax\Downloads\DESIGN.md` to project root as `DESIGN.md` so implementation and future edits do not depend on the Downloads location.

- [ ] **Step 3: Initialize the generated baseline**

Run:

```powershell
pnpm create next-app '.tmp\daebang-scaffold' --ts --tailwind --eslint --app --src-dir --use-pnpm --import-alias '@/*' --turbopack --disable-git --yes
```

Copy only generated toolchain files and `src/app` baseline into the repository root, keeping `docs/` and git history intact. The generated starter page is temporary scaffold output; replace it before feature validation.

- [ ] **Step 4: Install test dependencies and scripts**

Add `vitest`, `@vitejs/plugin-react`, `jsdom`, `@testing-library/react`, and `@testing-library/jest-dom`; add scripts:

```json
{
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "lint": "eslint .",
    "test": "vitest run"
  }
}
```

- [ ] **Step 5: Add approved tokens and Pretendard font**

Replace starter globals with `DESIGN.md`-derived tokens (`#fbfaf9`, `#f2f0ed`, `#343433`, `#474645`, `#121212`, `#ff3e00`, `#00ca48`, `#0090ff`, `#ffbb26`) and an imported Pretendard variable web font. Define pill, inset-card, focus-visible and reduced-motion utility classes.

- [ ] **Step 6: Verify baseline tooling**

Run:

```powershell
pnpm lint
pnpm build
```

Expected: both commands succeed before feature components are introduced.

### Task 2: Prepare Hero and Transparent Icon Assets

**Files:**
- Create: `public/assets/hero/community-hero-04.png`
- Create: `public/assets/icons/business-info.png`
- Create: `public/assets/icons/progress.png`
- Create: `public/assets/icons/disclosure.png`
- Create: `public/assets/icons/accounting.png`
- Create: `public/assets/icons/notices.png`
- Create: `public/assets/icons/issues.png`
- Create: `public/assets/icons/payment.png`
- Create: `public/assets/icons/library.png`

- [ ] **Step 1: Copy the selected hero artwork**

Copy generated asset `ig_0643fa12f1c575e4016a1454a210148191878538eb5b756a0e.png` to `public/assets/hero/community-hero-04.png`.

- [ ] **Step 2: Produce icon assets with transparent backgrounds**

For the eight generated icon concepts, create clean PNG outputs with transparency. Prefer local removal when white-background extraction preserves the icon; where a white part of the icon would be lost or edges degrade, regenerate that icon on a flat removable chroma-key background and process it using the imagegen helper.

- [ ] **Step 3: Validate icon alpha**

Inspect each exported PNG and confirm transparent corners and intact light-colored icon details. Do not reference an icon from React code until this inspection passes.

### Task 3: Write Failing Landing Page Behavior Tests

**Files:**
- Create: `vitest.config.ts`
- Create: `vitest.setup.ts`
- Create: `src/__tests__/landing-page.test.tsx`
- Create: `src/content/landing.ts`

- [ ] **Step 1: Configure component tests**

Configure Vitest with `jsdom`, React plugin, `@/*` alias and `vitest.setup.ts` importing `@testing-library/jest-dom/vitest`.

- [ ] **Step 2: Define typed content contract**

Create typed content exports for public navigation, four public feature cards and public notices. The content must include:

```typescript
export const heroContent = {
  badge: "대방동 지역주택조합",
  title: ["함께 만드는 새로운 보금자리,", "투명하게 소통하는 우리 조합"],
  description:
    "사업 소식부터 공개자료와 조합원 참여까지, 필요한 정보를 한곳에서 확인하세요.",
  primaryAction: "조합원 로그인",
  secondaryAction: "사업정보 보기",
} as const;
```

- [ ] **Step 3: Write RED tests**

Write tests that render the page and require:

```typescript
expect(screen.getByRole("heading", { name: /함께 만드는 새로운 보금자리/ })).toBeInTheDocument();
expect(screen.getByRole("link", { name: "조합원 로그인" })).toHaveAttribute("href", "/login");
expect(screen.getByRole("link", { name: "사업정보 보기" })).toHaveAttribute("href", "#business");
expect(screen.getByText("정보공개")).toBeInTheDocument();
expect(screen.getByText("회계·실적보고")).toBeInTheDocument();
expect(screen.getByText(/로그인 후 이용할 수 있습니다/)).toBeInTheDocument();
```

- [ ] **Step 4: Run tests and observe expected failure**

Run:

```powershell
pnpm test
```

Expected: FAIL because landing components and required content have not yet been implemented.

### Task 4: Implement Public Landing Components

**Files:**
- Create: `src/components/ui/button.tsx`
- Create: `src/components/landing/site-header.tsx`
- Create: `src/components/landing/hero-section.tsx`
- Create: `src/components/landing/feature-links.tsx`
- Create: `src/components/landing/notices-section.tsx`
- Create: `src/components/landing/portal-preview.tsx`
- Create: `src/components/landing/site-footer.tsx`
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Implement shadcn-style pill buttons**

Create a small `Button`/`buttonVariants` primitive with dark primary and warm secondary pill variants, keyboard focus ring and disabled state.

- [ ] **Step 2: Implement the fixed public header**

Render logo text, `조합소개`, `사업정보`, `조합소식`, `자료실`, and login CTA. Keep authenticated-only menu labels out of the public nav.

- [ ] **Step 3: Implement the hero**

Use `next/image` to display `/assets/hero/community-hero-04.png` as the full hero illustration while keeping centered copy readable. Render badge, two-line centered title, description and both CTA pills. Add CSS-only decorative rocket and star elements using Family palette tokens and reduced-motion protection.

- [ ] **Step 4: Implement public cards and service preview**

Render four public shortcut cards using the transparent icon assets. Render a separate members-only preview panel listing `정보공개`, `회계·실적보고`, `내 분담금`, and `이슈의 장`, with explicit login-required wording.

- [ ] **Step 5: Assemble page and footer**

Compose the landing components in `src/app/page.tsx`, with business section anchors and contact/policy footer links.

- [ ] **Step 6: Run tests to verify green**

Run:

```powershell
pnpm test
```

Expected: PASS for landing page text, CTA targets and login-required scope.

### Task 5: Validate Presentation and Accessibility

**Files:**
- Modify if needed: `src/app/globals.css`
- Modify if needed: `src/components/landing/*.tsx`

- [ ] **Step 1: Run static checks**

Run:

```powershell
pnpm lint
pnpm test
pnpm build
```

Expected: all pass.

- [ ] **Step 2: Start local app and inspect in browser**

Run:

```powershell
pnpm dev
```

Open `http://localhost:3000` in the Codex in-app browser and verify desktop landing presentation: hero text stays centered and legible, illustrations stay peripheral, icon assets have transparent backgrounds, navigation and CTA keyboard focus are visible, and motion stops under reduced-motion emulation.

- [ ] **Step 3: Inspect mobile layout**

Verify at a phone-sized viewport that the title, buttons, shortcut cards, and members-only preview remain usable without horizontal overflow or hero-image collisions.

- [ ] **Step 4: Commit completed implementation**

Run:

```powershell
git add AGENTS.md DESIGN.md package.json pnpm-lock.yaml next.config.ts tsconfig.json postcss.config.mjs eslint.config.mjs vitest.config.ts vitest.setup.ts public src
git commit -m "feat: build daebang cooperative landing page"
```

Expected: a focused UI implementation commit with no unrelated files.

