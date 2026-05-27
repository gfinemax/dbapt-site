# Daebang Role-Specific Portal Preview Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build three static role-specific portal preview pages and connect them from the login preparation page while preserving the public/login-gated boundary.

**Architecture:** Typed portal content in `src/content/portal.ts` drives a shared `PortalShell` and `PortalDashboard`, while three thin App Router pages select the appropriate role. `/login` remains a non-authenticating preparation screen and only adds explicitly labeled preview navigation. This implementation contains no live data, authentication, document access, or operational actions.

**Tech Stack:** Next.js App Router, React, TypeScript, Tailwind CSS v4, existing shadcn-style `Button`, Pretendard, Vitest + Testing Library, repository harness evidence files.

---

## Scope Boundary

Implement only the static UI described in `docs/superpowers/specs/2026-05-26-daebang-role-specific-portal-preview-design.md`.

Do not add authentication, sessions, permissions, data APIs, document actions, accounting/payment/refund values, notifications, voting, approvals, active administrator operations, or new public navigation entries for login-gated services.

## File Map

| Path | Responsibility |
|---|---|
| `src/content/portal.ts` | Typed role definitions, route paths, card copy, preparation states, and empty-state copy |
| `src/components/portal/portal-shell.tsx` | Shared preview header, navigation, disclaimer, role selector, and page composition |
| `src/components/portal/portal-dashboard.tsx` | Static service card grid and empty-state panel |
| `src/app/portal/member/page.tsx` | Static member route entry |
| `src/app/portal/refund/page.tsx` | Static refund-member route entry |
| `src/app/portal/admin/page.tsx` | Static administrator route entry |
| `src/app/login/page.tsx` | Existing preparation page plus role preview entry links |
| `src/components/landing/status-page.tsx` | Allow the login page to insert preview-navigation content while terms/privacy remain unchanged |
| `src/__tests__/portal-preview-pages.test.tsx` | Route behavior, role inclusion/exclusion, disclaimers, and navigation tests |
| `_workspace/04_review/ui-review.md` | Evidence-based UI scope review after visible implementation |
| `_workspace/final/verification.md` | Observed validation and browser-check record |

### Task 1: Write Failing Route Behavior Tests

**Files:**
- Create: `src/__tests__/portal-preview-pages.test.tsx`

- [ ] **Step 1: Add tests for the three static portal preview routes**

Create `src/__tests__/portal-preview-pages.test.tsx` with this exact content:

```tsx
import type { ComponentType } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

const pageModules = import.meta.glob<{ default: ComponentType }>("../app/**/page.tsx", {
  eager: true,
});

function findPage(path: string) {
  const Page = pageModules[path]?.default;

  expect(Page).toBeDefined();
  return Page;
}

describe("role-specific portal preview pages", () => {
  it("renders a truthful member preview with member-facing services", () => {
    const Page = findPage("../app/portal/member/page.tsx");
    if (!Page) return;

    render(<Page />);

    expect(
      screen.getByRole("heading", { name: "정식 조합원 포털 미리보기" }),
    ).toBeInTheDocument();
    expect(screen.getByText("내 분담금")).toBeInTheDocument();
    expect(screen.getByText("새 정보공개")).toBeInTheDocument();
    expect(screen.getByText("이슈의 장")).toBeInTheDocument();
    expect(screen.getByText("투표·설문")).toBeInTheDocument();
    expect(screen.queryByText("문서 승인")).not.toBeInTheDocument();
    expect(screen.getByText(/실제 인증이나 개인 자료 제공 기능은 포함되지 않습니다/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "홈으로" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "로그인 안내" })).toHaveAttribute("href", "/login");
    expect(screen.getByRole("link", { name: "환불조합원 화면" })).toHaveAttribute(
      "href",
      "/portal/refund",
    );
    expect(screen.getByRole("link", { name: "관리자 화면" })).toHaveAttribute(
      "href",
      "/portal/admin",
    );
  });

  it("renders only permitted refund-member preview services", () => {
    const Page = findPage("../app/portal/refund/page.tsx");
    if (!Page) return;

    render(<Page />);

    expect(
      screen.getByRole("heading", { name: "환불조합원 포털 미리보기" }),
    ).toBeInTheDocument();
    expect(screen.getByText("내 환불현황")).toBeInTheDocument();
    expect(screen.getByText("통지 알림")).toBeInTheDocument();
    expect(screen.queryByText("내 분담금")).not.toBeInTheDocument();
    expect(screen.queryByText("이슈의 장")).not.toBeInTheDocument();
    expect(screen.queryByText("투표·설문")).not.toBeInTheDocument();
  });

  it("renders administrator preparation cards without live actions", () => {
    const Page = findPage("../app/portal/admin/page.tsx");
    if (!Page) return;

    render(<Page />);

    expect(
      screen.getByRole("heading", { name: "관리자 포털 미리보기" }),
    ).toBeInTheDocument();
    expect(screen.getByText("문서 승인")).toBeInTheDocument();
    expect(screen.getByText("독촉 승인")).toBeInTheDocument();
    expect(screen.getByText("권한·감사로그")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /승인|발송|업로드/ })).not.toBeInTheDocument();
    expect(screen.getAllByText(/준비 중/).length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Run the new test to verify RED state**

Run:

```powershell
pnpm test -- src/__tests__/portal-preview-pages.test.tsx
```

Expected: FAIL because `../app/portal/member/page.tsx`, `../app/portal/refund/page.tsx`, and `../app/portal/admin/page.tsx` do not exist yet.

### Task 2: Implement Typed Portal Content and Shared Preview Pages

**Files:**
- Create: `src/content/portal.ts`
- Create: `src/components/portal/portal-dashboard.tsx`
- Create: `src/components/portal/portal-shell.tsx`
- Create: `src/app/portal/member/page.tsx`
- Create: `src/app/portal/refund/page.tsx`
- Create: `src/app/portal/admin/page.tsx`
- Test: `src/__tests__/portal-preview-pages.test.tsx`

- [ ] **Step 1: Create the typed static role content contract**

Create `src/content/portal.ts` with this exact content:

```ts
export type PortalRole = "member" | "refund" | "admin";
export type PortalAccent = "orange" | "green" | "blue" | "yellow";

export type PortalCard = {
  title: string;
  description: string;
  status: string;
  accent: PortalAccent;
};

export type PortalProfile = {
  role: PortalRole;
  navLabel: string;
  href: string;
  title: string;
  description: string;
  cards: PortalCard[];
  emptyTitle: string;
  emptyDescription: string;
};

export const portalRoleOrder: PortalRole[] = ["member", "refund", "admin"];

export const portalProfiles: Record<PortalRole, PortalProfile> = {
  member: {
    role: "member",
    navLabel: "정식 조합원",
    href: "/portal/member",
    title: "정식 조합원 포털 미리보기",
    description:
      "조합 운영 정보와 본인 확인 항목, 참여 서비스를 한곳에서 확인하게 될 화면입니다.",
    cards: [
      {
        title: "확인 필요 알림",
        description: "중요공지와 확인 요청이 표시될 영역입니다.",
        status: "알림 연동 준비 중",
        accent: "orange",
      },
      {
        title: "내 분담금",
        description: "본인의 납부·미납 현황이 표시될 영역입니다.",
        status: "개인별 자료 제공 예정",
        accent: "yellow",
      },
      {
        title: "새 정보공개",
        description: "권한이 있는 공개자료가 표시될 영역입니다.",
        status: "게시 기능 준비 중",
        accent: "blue",
      },
      {
        title: "회계·실적보고",
        description: "허용된 예산·결산 및 추진실적을 확인할 영역입니다.",
        status: "열람 기능 준비 중",
        accent: "green",
      },
      {
        title: "이슈의 장",
        description: "현안 토론과 공식답변이 표시될 영역입니다.",
        status: "참여 기능 준비 중",
        accent: "orange",
      },
      {
        title: "투표·설문",
        description: "의견수렴과 투표가 표시될 영역입니다.",
        status: "투표 기능 준비 중",
        accent: "blue",
      },
    ],
    emptyTitle: "표시할 조합원 자료가 아직 없습니다",
    emptyDescription:
      "실제 인증과 자료 공개 정책이 확정된 뒤 허용된 정보만 이 화면에서 제공됩니다.",
  },
  refund: {
    role: "refund",
    navLabel: "환불조합원",
    href: "/portal/refund",
    title: "환불조합원 포털 미리보기",
    description:
      "환불 완료 전 허용된 자료와 본인 처리현황을 확인하게 될 화면입니다.",
    cards: [
      {
        title: "공개자료",
        description: "환불조합원에게 허용된 자료가 표시될 영역입니다.",
        status: "권한 확인 후 제공 예정",
        accent: "blue",
      },
      {
        title: "회계·실적보고",
        description: "허용 범위의 회계·실적자료가 표시될 영역입니다.",
        status: "제공 범위 확정 예정",
        accent: "green",
      },
      {
        title: "내 환불현황",
        description: "본인의 정산 통지와 처리현황이 표시될 영역입니다.",
        status: "개인별 자료 제공 예정",
        accent: "yellow",
      },
      {
        title: "통지 알림",
        description: "본인 대상 통지와 확인 안내가 표시될 영역입니다.",
        status: "알림 연동 준비 중",
        accent: "orange",
      },
    ],
    emptyTitle: "표시할 환불 처리 자료가 아직 없습니다",
    emptyDescription:
      "향후 허용 범위가 확정되면 본인 대상 자료와 통지만 제공됩니다.",
  },
  admin: {
    role: "admin",
    navLabel: "관리자",
    href: "/portal/admin",
    title: "관리자 포털 미리보기",
    description:
      "공개와 알림 운영을 검토하게 될 관리자 준비 화면입니다.",
    cards: [
      {
        title: "공개기한",
        description: "정보공개 대상과 마감일을 점검할 영역입니다.",
        status: "관리 기능 준비 중",
        accent: "orange",
      },
      {
        title: "문서 승인",
        description: "공개 또는 회계자료의 검토 대기를 확인할 영역입니다.",
        status: "승인 절차 준비 중",
        accent: "blue",
      },
      {
        title: "납부자료 검증",
        description: "향후 업로드된 납부자료를 확인할 영역입니다.",
        status: "업로드 연동 준비 중",
        accent: "green",
      },
      {
        title: "독촉 승인",
        description: "발송 전 검토와 승인을 확인할 영역입니다.",
        status: "발송 연동 준비 중",
        accent: "yellow",
      },
      {
        title: "알림 결과",
        description: "발송 결과와 오류를 확인할 영역입니다.",
        status: "결과 조회 준비 중",
        accent: "blue",
      },
      {
        title: "권한·감사로그",
        description: "역할 변경과 기록을 확인할 영역입니다.",
        status: "감사 기능 준비 중",
        accent: "orange",
      },
    ],
    emptyTitle: "처리할 운영 작업이 아직 없습니다",
    emptyDescription:
      "실제 관리 기능이 연결되기 전에는 승인이나 발송 동작을 제공하지 않습니다.",
  },
};
```

- [ ] **Step 2: Implement the static dashboard cards and empty-state panel**

Create `src/components/portal/portal-dashboard.tsx` with this exact content:

```tsx
import { cn } from "@/lib/utils";
import type { PortalAccent, PortalProfile } from "@/content/portal";

const accentClasses: Record<PortalAccent, string> = {
  orange: "bg-ember-orange/10 text-ember-orange",
  green: "bg-meadow-green/10 text-graphite",
  blue: "bg-sky-blue/10 text-sky-blue",
  yellow: "bg-sunburst-yellow/15 text-charcoal-primary",
};

type PortalDashboardProps = {
  profile: PortalProfile;
};

export function PortalDashboard({ profile }: PortalDashboardProps) {
  return (
    <>
      <section className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {profile.cards.map((card) => (
          <article key={card.title} className="stone-card p-6">
            <span
              className={cn(
                "inline-flex rounded-full px-3 py-1 text-xs font-medium",
                accentClasses[card.accent],
              )}
            >
              {card.status}
            </span>
            <h2 className="mt-6 text-xl">{card.title}</h2>
            <p className="mt-3 text-[15px] leading-7 text-graphite">{card.description}</p>
          </article>
        ))}
      </section>

      <section className="soft-panel mt-8 px-6 py-8 sm:px-8">
        <p className="text-sm font-medium text-ember-orange">빈 상태 안내</p>
        <h2 className="mt-3 text-2xl">{profile.emptyTitle}</h2>
        <p className="mt-3 max-w-2xl text-[15px] leading-7 text-graphite">
          {profile.emptyDescription}
        </p>
      </section>
    </>
  );
}
```

- [ ] **Step 3: Implement the shared portal preview shell**

Create `src/components/portal/portal-shell.tsx` with this exact content:

```tsx
import Link from "next/link";
import { PortalDashboard } from "@/components/portal/portal-dashboard";
import { Button } from "@/components/ui/button";
import { portalProfiles, portalRoleOrder, type PortalRole } from "@/content/portal";
import { cn } from "@/lib/utils";

type PortalShellProps = {
  role: PortalRole;
};

export function PortalShell({ role }: PortalShellProps) {
  const profile = portalProfiles[role];

  return (
    <main className="min-h-screen bg-warm-canvas px-4 pb-14 pt-4 sm:px-6">
      <nav className="site-container stone-card flex flex-wrap items-center justify-between gap-4 px-5 py-4">
        <Link href="/" className="font-semibold text-charcoal-primary">
          대방동 지역주택조합
        </Link>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link href="/">홈으로</Link>
          </Button>
          <Button asChild variant="secondary" size="sm">
            <Link href="/login">로그인 안내</Link>
          </Button>
        </div>
      </nav>

      <div className="site-container py-10 sm:py-14">
        <p className="inline-flex rounded-full bg-parchment-card px-4 py-2 text-sm font-medium text-ember-orange">
          포털 화면 미리보기
        </p>
        <h1 className="mt-6 max-w-3xl text-4xl leading-tight sm:text-[3rem]">{profile.title}</h1>
        <p className="mt-5 max-w-2xl text-base leading-8 text-graphite">{profile.description}</p>

        <section className="soft-panel mt-9 p-5 sm:p-6" aria-label="미리보기 이용 안내">
          <p className="font-semibold text-charcoal-primary">
            이 화면은 향후 서비스 구조를 보여주는 준비 화면입니다.
          </p>
          <p className="mt-2 text-[15px] leading-7 text-graphite">
            실제 인증이나 개인 자료 제공 기능은 포함되지 않습니다. 각 항목은 운영 준비 상태만
            안내합니다.
          </p>
        </section>

        <nav className="mt-8 flex flex-wrap gap-2" aria-label="역할별 미리보기 전환">
          {portalRoleOrder.map((item) => {
            const target = portalProfiles[item];
            const current = item === role;

            return (
              <Link
                key={item}
                href={target.href}
                aria-current={current ? "page" : undefined}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                  current
                    ? "bg-midnight text-white"
                    : "bg-white text-graphite shadow-[inset_0_0_0_1px_var(--stone-surface)] hover:bg-parchment-card",
                )}
              >
                {target.navLabel} 화면
              </Link>
            );
          })}
        </nav>

        <PortalDashboard profile={profile} />
      </div>
    </main>
  );
}
```

- [ ] **Step 4: Add the three thin App Router route entries**

Create `src/app/portal/member/page.tsx`:

```tsx
import type { Metadata } from "next";
import { PortalShell } from "@/components/portal/portal-shell";

export const metadata: Metadata = {
  title: "정식 조합원 포털 미리보기 | 대방동 지역주택조합",
};

export default function MemberPortalPage() {
  return <PortalShell role="member" />;
}
```

Create `src/app/portal/refund/page.tsx`:

```tsx
import type { Metadata } from "next";
import { PortalShell } from "@/components/portal/portal-shell";

export const metadata: Metadata = {
  title: "환불조합원 포털 미리보기 | 대방동 지역주택조합",
};

export default function RefundPortalPage() {
  return <PortalShell role="refund" />;
}
```

Create `src/app/portal/admin/page.tsx`:

```tsx
import type { Metadata } from "next";
import { PortalShell } from "@/components/portal/portal-shell";

export const metadata: Metadata = {
  title: "관리자 포털 미리보기 | 대방동 지역주택조합",
};

export default function AdminPortalPage() {
  return <PortalShell role="admin" />;
}
```

- [ ] **Step 5: Run the route test to verify GREEN state**

Run:

```powershell
pnpm test -- src/__tests__/portal-preview-pages.test.tsx
```

Expected: PASS for all three role preview pages.

- [ ] **Step 6: Commit the typed portal route implementation**

Run:

```powershell
git add -- 'src/__tests__/portal-preview-pages.test.tsx' 'src/content/portal.ts' 'src/components/portal/portal-dashboard.tsx' 'src/components/portal/portal-shell.tsx' 'src/app/portal/member/page.tsx' 'src/app/portal/refund/page.tsx' 'src/app/portal/admin/page.tsx'
git commit -m "feat: add role-specific portal preview pages"
```

Expected: one focused commit containing the new tests, typed content, shared UI, and three routes.

### Task 3: Add Truthful Preview Entry Links to the Login Page

**Files:**
- Modify: `src/__tests__/portal-preview-pages.test.tsx`
- Modify: `src/components/landing/status-page.tsx`
- Modify: `src/app/login/page.tsx`

- [ ] **Step 1: Add a failing login-entry navigation test**

Append the following test inside the existing `describe("role-specific portal preview pages", () => { ... })` block in `src/__tests__/portal-preview-pages.test.tsx`:

```tsx
  it("offers clearly labelled preview navigation from the login preparation page", () => {
    const Page = findPage("../app/login/page.tsx");
    if (!Page) return;

    render(<Page />);

    expect(screen.getByText("포털 화면 미리보기")).toBeInTheDocument();
    expect(screen.getByText(/실제 로그인이나 개인 자료 제공이 아닌 준비 화면입니다/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "정식 조합원 화면 보기" })).toHaveAttribute(
      "href",
      "/portal/member",
    );
    expect(screen.getByRole("link", { name: "환불조합원 화면 보기" })).toHaveAttribute(
      "href",
      "/portal/refund",
    );
    expect(screen.getByRole("link", { name: "관리자 화면 보기" })).toHaveAttribute(
      "href",
      "/portal/admin",
    );
  });
```

- [ ] **Step 2: Run the test to verify RED state**

Run:

```powershell
pnpm test -- src/__tests__/portal-preview-pages.test.tsx
```

Expected: FAIL because `/login` does not yet render the three preview navigation links or the explicit non-authentication notice.

- [ ] **Step 3: Allow status pages to render optional supplementary content**

Replace `src/components/landing/status-page.tsx` with this exact content:

```tsx
import type { ReactNode } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type StatusPageProps = {
  eyebrow: string;
  title: string;
  description: string;
  children?: ReactNode;
  wide?: boolean;
};

export function StatusPage({
  eyebrow,
  title,
  description,
  children,
  wide = false,
}: StatusPageProps) {
  return (
    <main className="flex min-h-screen items-center px-4 py-16">
      <section
        className={cn(
          "soft-panel mx-auto w-full p-6 sm:p-10",
          wide ? "max-w-3xl" : "max-w-xl",
        )}
      >
        <div className="stone-card px-6 py-12 text-center sm:px-10">
          <p className="mb-4 text-sm font-medium text-ember-orange">{eyebrow}</p>
          <h1 className="text-3xl leading-tight sm:text-[2.5rem]">{title}</h1>
          <p className="mx-auto mt-5 max-w-md text-[15px] leading-7 text-graphite">
            {description}
          </p>
          {children}
          <Button asChild size="lg" className="mt-9">
            <Link href="/">홈으로 돌아가기</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
```

- [ ] **Step 4: Add the non-authenticating preview navigation to `/login`**

Replace `src/app/login/page.tsx` with this exact content:

```tsx
import type { Metadata } from "next";
import Link from "next/link";
import { StatusPage } from "@/components/landing/status-page";
import { portalProfiles, portalRoleOrder } from "@/content/portal";

export const metadata: Metadata = {
  title: "조합원 로그인 | 대방동 지역주택조합",
};

export default function LoginPage() {
  return (
    <StatusPage
      eyebrow="조합원 전용 서비스"
      title="조합원 로그인"
      description="로그인 서비스는 개통 준비 중입니다. 인증과 권한 정책이 확정된 뒤 안전하게 제공하겠습니다."
      wide
    >
      <section className="soft-panel mx-auto mt-9 max-w-xl p-5 text-left" aria-label="포털 화면 미리보기">
        <p className="text-sm font-medium text-ember-orange">포털 화면 미리보기</p>
        <p className="mt-2 text-sm leading-6 text-graphite">
          실제 로그인이나 개인 자료 제공이 아닌 준비 화면입니다. 역할별 화면 구성을 먼저
          확인할 수 있습니다.
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {portalRoleOrder.map((role) => {
            const profile = portalProfiles[role];

            return (
              <Link
                key={role}
                href={profile.href}
                aria-label={`${profile.navLabel} 화면 보기`}
                className="stone-card px-4 py-4 text-center text-sm font-medium text-charcoal-primary hover:bg-parchment-card"
              >
                {profile.navLabel}
              </Link>
            );
          })}
        </div>
      </section>
    </StatusPage>
  );
}
```

- [ ] **Step 5: Run affected tests to verify GREEN state**

Run:

```powershell
pnpm test -- src/__tests__/portal-preview-pages.test.tsx src/__tests__/linked-pages.test.tsx
```

Expected: PASS for the role pages, login preview links, and unchanged terms/privacy preparation pages.

- [ ] **Step 6: Commit the login preview entry implementation**

Run:

```powershell
git add -- 'src/__tests__/portal-preview-pages.test.tsx' 'src/components/landing/status-page.tsx' 'src/app/login/page.tsx'
git commit -m "feat: link login page to portal previews"
```

Expected: one focused commit containing only the login entry change and its test.

### Task 4: Run UI Scope Review and Full Validation

**Files:**
- Create: `_workspace/04_review/ui-review.md`
- Create: `_workspace/final/verification.md`

- [ ] **Step 1: Load the UI review skill and review the changed surfaces**

Read:

```powershell
Get-Content -Raw '.agents\skills\dbapt-site-ui-review\SKILL.md'
Get-Content -Raw '_workspace\00_input\request-summary.md'
Get-Content -Raw '_workspace\01_scope\spec-selection.md'
Get-Content -Raw 'docs\superpowers\specs\2026-05-26-daebang-role-specific-portal-preview-design.md'
```

Review these pages and files:

```text
/login
/portal/member
/portal/refund
/portal/admin
src/app/login/page.tsx
src/content/portal.ts
src/components/portal/portal-shell.tsx
src/components/portal/portal-dashboard.tsx
```

Expected review criteria:

- Public landing navigation is unchanged.
- Each preview page is clearly described as a preparation/preview screen.
- No card provides a live action or fabricated private value.
- Refund-member pages omit member participation and administrator cards.
- Visual implementation follows the existing warm-canvas/card/button system and Pretendard typography.

- [ ] **Step 2: Run repository checks**

Run:

```powershell
pnpm lint
pnpm test
pnpm build
```

Expected: all commands exit with code `0`.

- [ ] **Step 3: Check visible pages in the Codex browser**

Start the local app:

```powershell
pnpm dev
```

Use the Browser plugin to open the running local URL and inspect:

```text
/login
/portal/member
/portal/refund
/portal/admin
```

Check:

- desktop navigation, notice panel, cards, empty state, and return links
- mobile one-column card flow with no horizontal overflow
- keyboard-visible interactive links
- reduced-motion behavior remains non-disruptive

Expected: all four pages present the static preview honestly at desktop and mobile widths without overflow or visible console errors.

- [ ] **Step 4: Write the UI review evidence only after observed checks pass**

If the reviewed implementation meets the approved scope and the browser observations match Step 3, create `_workspace/04_review/ui-review.md` with this content:

```markdown
# UI Review

## Reviewed Change
- Feature: role-specific portal preview pages and login preview entry navigation
- Governing spec: `docs/superpowers/specs/2026-05-26-daebang-role-specific-portal-preview-design.md`
- Implementation plan: `docs/superpowers/plans/2026-05-27-daebang-role-specific-portal-preview.md`
- Files or pages reviewed: `/login`, `/portal/member`, `/portal/refund`, `/portal/admin`, portal content and shared portal components

## Boundary Review
- Finding: The implementation keeps role-only services inside login-oriented preview routes and does not add them to public navigation.
- Evidence: The three new routes are reached from the login preparation page; their content remains static preparation UI.

## Truthful Presentation Review
- Finding: The pages identify themselves as previews and do not imply live authentication, document access, personal balances, approvals, or delivery actions.
- Evidence: Cards expose text-only preparation statuses and empty states; no operational action controls or fabricated data are rendered.

## Design And Accessibility Review
- Finding: The new screens use the existing warm-canvas, stone-card, pill-link and Pretendard UI conventions with usable responsive navigation.
- Evidence: Desktop and mobile browser checks showed readable card flow, available return links, and no horizontal overflow; interaction styling remains compatible with reduced motion.

## Outcome
- Result: PASS
- Required action: none
```

If any review item fails, write the actual finding with result `FIX` or `ESCALATE` instead and do not claim completion.

- [ ] **Step 5: Write completion verification evidence only from successful observed commands**

If Steps 2 and 3 passed, create `_workspace/final/verification.md` with this content:

```markdown
# Verification

## Implemented Feature
- Added static role-specific preview pages for member, refund-member, and administrator routes.
- Added explicit non-authenticating role preview entry navigation from `/login`.
- Added typed static portal content, shared layout/cards, and behavior tests.

## Automated Checks
- `pnpm lint`: PASS
- `pnpm test`: PASS
- `pnpm build`: PASS

## Browser Checks
- Desktop: PASS for `/login`, `/portal/member`, `/portal/refund`, and `/portal/admin`.
- Mobile: PASS for role navigation, single-column card flow, and absence of horizontal overflow.
- Interaction and motion: PASS for visible link focus behavior and non-disruptive reduced-motion presentation on the changed surfaces.

## Residual Risk
- No real authentication, private data, document access, operational approvals, delivery, or voting behavior is implemented in this slice.
```

- [ ] **Step 6: Commit evidence records**

Run:

```powershell
git add -- '_workspace/04_review/ui-review.md' '_workspace/final/verification.md'
git commit -m "docs: verify role-specific portal previews"
```

Expected: one focused commit containing observed review and validation evidence only.
