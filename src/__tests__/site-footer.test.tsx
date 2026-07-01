import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SiteFooter } from "@/components/landing/site-footer";

describe("site footer", () => {
  it("shows the cooperative office address and contact number", () => {
    render(<SiteFooter />);

    expect(screen.getByText("대방동 지역주택조합")).toBeInTheDocument();
    expect(screen.getByText("(06947) 서울시 동작구 여의대방로 36길 102-11")).toBeInTheDocument();
    expect(screen.getByText("1층 대방동지역주택조합사무실")).toBeInTheDocument();
    expect(screen.getByText("연락처 02-822-1508")).toBeInTheDocument();
    expect(screen.getByText("Website created & maintained by 오학동 · 2026.6.17")).toBeInTheDocument();
    expect(screen.queryByText(/홈페이지 제작/)).not.toBeInTheDocument();
    expect(screen.queryByText(/태훈아빠/)).not.toBeInTheDocument();
    expect(screen.queryByText(/개통 전 확정/)).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "이용약관" })).toHaveAttribute("href", "/terms");
    expect(screen.getByRole("link", { name: "개인정보처리방침" })).toHaveAttribute("href", "/privacy");
    expect(screen.getByRole("link", { name: "찾아오시는 길" })).toHaveAttribute(
      "href",
      "/about#section-location",
    );
  });
});
