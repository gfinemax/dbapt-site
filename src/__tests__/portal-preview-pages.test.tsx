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

vi.mock("next/headers", () => ({
  cookies() {
    return {
      get() {
        return undefined;
      },
      set() {},
    };
  },
}));

type PageComponent = () => ReactNode | Promise<ReactNode>;

const pageModules = import.meta.glob<{ default: PageComponent }>("../app/**/page.tsx", {
  eager: true,
});

function findPage(path: string) {
  const Page = pageModules[path]?.default;

  expect(Page).toBeDefined();
  return Page;
}

describe("role-specific portal preview pages", () => {
  it("renders a truthful member preview with member-facing services", async () => {
    const Page = findPage("../app/portal/member/page.tsx");
    if (!Page) return;

    render(await Page());

    expect(
      screen.getByRole("heading", { name: "정식 조합원 포털 미리보기" }),
    ).toBeInTheDocument();
    expect(screen.getByText("내 분담금")).toBeInTheDocument();
    expect(screen.getByText("새 정보공개")).toBeInTheDocument();
    expect(screen.getByText("이슈의 장")).toBeInTheDocument();
    expect(screen.getByText("투표·설문")).toBeInTheDocument();
    expect(screen.queryByText("문서 승인")).not.toBeInTheDocument();
    expect(
      screen.getByText(/실제 인증이나 개인 자료 제공 기능은 포함되지 않습니다/),
    ).toBeInTheDocument();
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

  it("renders only permitted refund-member preview services", async () => {
    const Page = findPage("../app/portal/refund/page.tsx");
    if (!Page) return;

    render(await Page());

    expect(
      screen.getByRole("heading", { name: "환불조합원 포털 미리보기" }),
    ).toBeInTheDocument();
    expect(screen.getByText("내 환불현황")).toBeInTheDocument();
    expect(screen.getByText("통지 알림")).toBeInTheDocument();
    expect(screen.queryByText("내 분담금")).not.toBeInTheDocument();
    expect(screen.queryByText("이슈의 장")).not.toBeInTheDocument();
    expect(screen.queryByText("투표·설문")).not.toBeInTheDocument();
  });

  it("renders administrator preparation cards without live actions", async () => {
    const Page = findPage("../app/portal/admin/page.tsx");
    if (!Page) return;

    render(await Page());

    expect(
      screen.getByRole("heading", { name: "관리자 포털 미리보기" }),
    ).toBeInTheDocument();
    expect(screen.getByText("문서 승인")).toBeInTheDocument();
    expect(screen.getByText("독촉 승인")).toBeInTheDocument();
    expect(screen.getByText("권한·감사로그")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /승인|발송|업로드/ })).not.toBeInTheDocument();
    expect(screen.getAllByText(/준비 중/).length).toBeGreaterThan(0);
  });

  it("offers clearly labelled preview navigation from the login preparation page", () => {
    const Page = findPage("../app/login/page.tsx");
    if (!Page) return;

    render(<Page />);

    expect(screen.getByText("데모 테스트 계정 정보")).toBeInTheDocument();
    expect(
      screen.getByText(/사전 발급된 테스트 계정으로 즉시 로그인/),
    ).toBeInTheDocument();
    expect(screen.getByText("member1 / member123")).toBeVisible();
    expect(screen.getByText("refund1 / refund123")).toBeVisible();
    expect(screen.getByText("admin / admin123")).toBeVisible();
    expect(screen.queryByRole("link", { name: /화면 보기/ })).not.toBeInTheDocument();
  });
});
