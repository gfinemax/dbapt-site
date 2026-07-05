import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import nextConfig from "../../next.config";
import { ShareRedirectPage } from "@/components/share/share-redirect-page";

describe("Kakao share preview compatibility", () => {
  it("serves blocking metadata for Kakao share scrapers", () => {
    expect(nextConfig.htmlLimitedBots).toBeInstanceOf(RegExp);
    expect(nextConfig.htmlLimitedBots?.test("Mozilla/5.0 (compatible; Kakaotalk-scrap/1.0; +https://devtalk.kakao.com/)")).toBe(true);
    expect(nextConfig.htmlLimitedBots?.test("facebookexternalhit/1.1")).toBe(true);
  });

  it("renders an immediate script redirect before client hydration", () => {
    const { container } = render(
      <ShareRedirectPage
        title="자유게시판으로 이동 중입니다"
        description="잠시 후 게시글 화면으로 이동합니다."
        destination="/news?tab=free&post=post-1"
      />,
    );

    expect(screen.getByRole("link", { name: "바로 이동" })).toHaveAttribute("href", "/news?tab=free&post=post-1");
    const script = container.querySelector('script[data-share-redirect="true"]');
    expect(script?.textContent).toContain("window.location.replace");
    expect(script?.textContent).toContain("/news?tab=free&post=post-1");
    expect(container.innerHTML).toContain("<noscript>");
    expect(container.innerHTML).toContain("0;url=/news?tab=free&post=post-1");
  });
});
