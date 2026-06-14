import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import IssuesPage from "@/app/issues/page";

describe("issue dashboard page", () => {
  it("shows related public materials and topic context for a selected category", async () => {
    render(
      await IssuesPage({
        searchParams: Promise.resolve({ category: "accounting" }),
      }),
    );

    expect(screen.getByRole("heading", { name: "이슈 대시보드" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "회계·실적보고" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "관련 공개자료" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "논의 주제" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "회계·감사 자료 보기" })).toHaveAttribute(
      "href",
      "/library#accounting",
    );
    expect(screen.getByText("개별 납부액과 고지 내역은 로그인 후 개인자료실에서만 확인합니다.")).toBeInTheDocument();
  });

  it("falls back to the participation category when the category is unknown", async () => {
    render(
      await IssuesPage({
        searchParams: Promise.resolve({ category: "unknown" }),
      }),
    );

    expect(screen.getByRole("heading", { name: "이슈의 장" })).toBeInTheDocument();
    expect(screen.getByText("특별한 사안과 주제별 의견을 공개자료와 함께 정리합니다.")).toBeInTheDocument();
  });
});
