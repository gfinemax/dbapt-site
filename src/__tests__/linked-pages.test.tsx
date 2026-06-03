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
      message: "이용약관은 개통 전 게시됩니다.",
    },
    {
      path: "../app/privacy/page.tsx",
      heading: "개인정보처리방침",
      message: "개인정보처리방침은 개통 전 게시됩니다.",
    },
  ] as const;

  it("provides pages for every link exposed on the landing page", () => {
    expect(Object.keys(pageModules)).toEqual(expect.arrayContaining(routes.map((route) => route.path)));
  });

  for (const route of routes) {
    it(`states the preparation status on ${route.path}`, async () => {
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
