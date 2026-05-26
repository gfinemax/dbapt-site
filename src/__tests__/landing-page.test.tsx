import { existsSync } from "node:fs";
import { join } from "node:path";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Home from "@/app/page";

describe("public landing page", () => {
  it("introduces the cooperative with member and business entry actions", () => {
    render(<Home />);

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
    render(<Home />);

    expect(screen.getByText("정보공개")).toBeInTheDocument();
    expect(screen.getByText("회계·실적보고")).toBeInTheDocument();
    expect(
      screen.getByText(/로그인 후 이용할 수 있습니다/),
    ).toBeInTheDocument();
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
