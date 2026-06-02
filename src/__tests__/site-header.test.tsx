import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SiteHeader } from "@/components/landing/site-header";

vi.mock("next/navigation", () => ({
  usePathname() {
    return "/";
  },
  useRouter() {
    return {
      push: vi.fn(),
      refresh: vi.fn(),
    };
  },
}));

vi.mock("@/lib/auth", () => ({
  logoutAction: vi.fn(),
}));

describe("site header", () => {
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

    const badge = screen.getByRole("button", { name: "조합원 개인 자료실 열기" });

    expect(badge).toHaveClass("fixed", "right-0", "top-1/2", "w-10", "rounded-l-[12px]", "border-0", "bg-ember-orange", "text-white", "shadow-none");
    expect(screen.getByText("조합원 개인 자료실")).toHaveClass("[writing-mode:vertical-rl]");

    fireEvent.click(badge);

    expect(onOpenPortal).toHaveBeenCalledTimes(1);
  });
});
