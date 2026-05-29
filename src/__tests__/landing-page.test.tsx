import { existsSync } from "node:fs";
import { join } from "node:path";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { HomeClient } from "@/components/landing/home-client";

vi.mock("next/navigation", () => ({
  useRouter() {
    return {
      push: vi.fn(),
      refresh: vi.fn(),
    };
  },
  useSearchParams() {
    return {
      get: vi.fn().mockReturnValue(null),
    };
  },
}));

describe("public landing page", () => {
  it("introduces the cooperative with member and business entry actions", () => {
    render(<HomeClient />);

    expect(
      screen.getByRole("heading", { name: /함께 만드는 새로운 보금자리/ }),
    ).toBeInTheDocument();
    expect(
      screen
        .getAllByRole("link", { name: "조합원 로그인" })
        .every((link) => link.getAttribute("href") === "/login"),
    ).toBe(true);
    expect(screen.getByRole("link", { name: "사업정보 보기" })).toHaveAttribute(
      "href",
      "#business",
    );
  });

  it("presents protected services as login-only access", () => {
    render(<HomeClient />);

    expect(screen.getByText("정보공개")).toBeInTheDocument();
    expect(screen.getByText("회계·실적보고")).toBeInTheDocument();
    expect(
      screen.getByText(/로그인 후 이용할 수 있습니다/),
    ).toBeInTheDocument();
  });

  it("keeps the hero upper space clear of floating decorations", () => {
    const { container } = render(<HomeClient />);

    expect(container.querySelector(".float-soft")).not.toBeInTheDocument();
    expect(container.querySelector(".sparkle")).not.toBeInTheDocument();
  });

  it("renders the desktop hero headline as two intended lines", () => {
    const { container } = render(<HomeClient />);
    const headlineLines = Array.from(container.querySelectorAll("[data-hero-line]")).map(
      (line) => line.textContent,
    );

    expect(headlineLines).toEqual([
      "함께 만드는 새로운 보금자리",
      "투명하게 소통하는 우리 조합"
    ]);
  });

  it("uses the compact hero spacing approved for the landing page", () => {
    const { container } = render(<HomeClient />);
    const heroSection = container.querySelector("main > section");
    const heroContent = container.querySelector("[data-hero-content]");

    expect(heroSection).toHaveClass("pt-3", "pb-8", "sm:pb-10");
    expect(heroContent).toHaveClass("-translate-y-10", "sm:-translate-y-20");
  });

  it("ships the validated transparent icon asset set", () => {
    const icons = [
      "business-info.png",
      "progress.png",
      "disclosure.png",
      "accounting.png",
      "notices.png",
      "issues.png",
      "payment.png",
      "library.png",
    ];

    for (const icon of icons) {
      expect(existsSync(join(process.cwd(), "public", "assets", "icons", icon))).toBe(true);
    }
  });
});
