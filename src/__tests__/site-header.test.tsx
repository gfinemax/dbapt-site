import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SiteHeader } from "@/components/landing/site-header";

const navigationState = vi.hoisted(() => ({
  pathname: "/",
  push: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname() {
    return navigationState.pathname;
  },
  useRouter() {
    return {
      push: navigationState.push,
      refresh: vi.fn(),
    };
  },
}));

vi.mock("@/lib/auth", () => ({
  logoutAction: vi.fn(),
}));

describe("site header", () => {
  afterEach(() => {
    navigationState.pathname = "/";
    navigationState.push.mockClear();
  });

  it("keeps auth badges out of the public header for logged-out users", () => {
    render(<SiteHeader />);

    expect(screen.queryByRole("link", { name: "가입 신청" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "조합원 로그인" })).not.toBeInTheDocument();
  });

  it("keeps the login action inside the sitemap drawer for logged-out users", () => {
    render(<SiteHeader />);

    fireEvent.click(screen.getByRole("button", { name: "모바일 메뉴" }));

    expect(screen.getByText("전체 메뉴 (사이트맵)")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "조합원 로그인" })).toHaveAttribute("href", "/login");
  });

  it("renders the member library action as a fixed right-side vertical badge", () => {
    const onOpenPortal = vi.fn();

    render(
      <SiteHeader
        session={{
          id: "user-1",
          loginId: "member1",
          name: "이조합",
          role: "MEMBER",
        }}
        onOpenPortal={onOpenPortal}
      />,
    );

    const badge = screen.getByRole("button", { name: "이조합 개인 자료실 열기" });

    expect(badge).toHaveClass("fixed", "right-0", "top-1/2", "w-10", "rounded-l-[12px]", "border-0", "bg-ember-orange", "text-white", "shadow-none");
    expect(screen.getByText("이조합 개인 자료실")).toHaveClass("[writing-mode:vertical-rl]");

    fireEvent.click(badge);

    expect(onOpenPortal).toHaveBeenCalledTimes(1);
  });

  it("does not repeat the logged-in personal library action in the sitemap drawer", () => {
    render(
      <SiteHeader
        session={{
          id: "admin-1",
          loginId: "admin",
          name: "운영자",
          role: "ADMIN",
        }}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "모바일 메뉴" }));

    expect(screen.getByText("전체 메뉴 (사이트맵)")).toBeInTheDocument();
    expect(screen.queryByText("운영자 개인 자료실 열기")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "운영 문서 관리실 열기" })).toBeInTheDocument();
  });

  it("uses a compact rounded active indicator directly under the active desktop nav label", () => {
    navigationState.pathname = "/about";

    const { container } = render(<SiteHeader />);
    const aboutLink = container.querySelector('nav a[href="/about"]');
    const indicator = container.querySelector("[data-active-nav-indicator]");

    expect(aboutLink).not.toBeNull();
    expect(aboutLink).toHaveClass("text-ember-orange", "font-bold");
    expect(indicator).toHaveClass(
      "bottom-[18px]",
      "left-1/2",
      "h-[3px]",
      "w-[72%]",
      "-translate-x-1/2",
      "rounded-full",
      "bg-ember-orange",
    );
  });

  it("opens the global search panel and submits to the full search page", () => {
    render(<SiteHeader />);

    fireEvent.click(screen.getByRole("button", { name: "전체 찾기" }));

    expect(screen.getByRole("dialog", { name: "전체 찾기" })).toBeInTheDocument();
    expect(screen.getByText("조합 홈페이지 전체에서 찾습니다.")).toBeInTheDocument();

    fireEvent.change(screen.getByRole("searchbox", { name: "전체 검색어" }), {
      target: { value: "결정고시" },
    });
    fireEvent.click(screen.getByRole("button", { name: "찾기" }));

    expect(navigationState.push).toHaveBeenCalledWith("/search?q=%EA%B2%B0%EC%A0%95%EA%B3%A0%EC%8B%9C");
  });

  it("shows an admin member-management shortcut in the profile dropdown", () => {
    render(
      <SiteHeader
        session={{
          id: "admin-1",
          loginId: "admin",
          name: "운영자",
          role: "ADMIN",
        }}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /운영자님관리자/ }));

    expect(screen.getByRole("link", { name: "조합원 관리" })).toHaveAttribute(
      "href",
      "/portal/admin/members",
    );
  });
});
