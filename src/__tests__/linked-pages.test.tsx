import type { ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter() {
    return {
      push: vi.fn(),
      refresh: vi.fn(),
    };
  },
}));

type PageComponent = (props?: {
  searchParams?: Promise<{
    error?: string;
  }>;
}) => ReactNode | Promise<ReactNode>;

const pageModules = import.meta.glob<{ default: PageComponent }>("../app/**/page.tsx", {
  eager: true,
});

describe("linked informational pages", () => {
  const routes = [
    {
      path: "../app/login/page.tsx",
      heading: "조합원 로그인",
      message: "발급받은 계정으로 로그인하면 권한에 맞는 전용 화면으로 이동합니다.",
    },
    {
      path: "../app/terms/page.tsx",
      heading: "이용약관",
      message: "대방동 지역주택조합 홈페이지는 조합 소식, 공개자료, 자료실, 조합원 전용 서비스 안내를 제공합니다.",
    },
    {
      path: "../app/privacy/page.tsx",
      heading: "개인정보처리방침",
      message: "홈페이지는 회원 식별, 조합원 권한 확인, 문의 응대, 자료 열람 이력 관리에 필요한 범위에서 개인정보를 처리합니다.",
    },
  ] as const;

  it("provides pages for every link exposed on the landing page", () => {
    expect(Object.keys(pageModules)).toEqual(expect.arrayContaining(routes.map((route) => route.path)));
  });

  for (const route of routes) {
    it(`renders linked information on ${route.path}`, async () => {
      const Page = pageModules[route.path]?.default;

      expect(Page).toBeDefined();
      if (!Page) return;

      render(
        await Page(
          route.path === "../app/login/page.tsx"
            ? { searchParams: Promise.resolve({}) }
            : undefined,
        ),
      );
      expect(screen.getByRole("heading", { name: route.heading })).toBeInTheDocument();
      expect(screen.getByText(new RegExp(route.message))).toBeInTheDocument();
      expect(screen.getByRole("link", { name: "홈으로 돌아가기" })).toHaveAttribute("href", "/");
    });
  }
});
