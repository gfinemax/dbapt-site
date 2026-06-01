import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LibraryClient } from "@/components/library/library-client";

describe("library page", () => {
  it("presents a unified index of duplicated public and gated materials", () => {
    render(<LibraryClient />);

    expect(screen.getByRole("heading", { name: "자료실" })).toBeInTheDocument();
    expect(screen.getByText("전체 자료 통합 색인")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "계약·협약" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "회계·감사" })).toBeInTheDocument();

    for (const title of ["조합규약", "각종 계약서", "회의록", "회계감사보고서", "주택법 개정법령"]) {
      expect(screen.getAllByRole("heading", { name: title }).length).toBeGreaterThan(0);
    }

    const contractCard = screen.getAllByTestId("library-item-service-contracts")[0];
    expect(within(contractCard).getByText("조합원 전용")).toBeInTheDocument();
    expect(within(contractCard).getByText(/원본 위치: 공개자료/)).toBeInTheDocument();
    expect(within(contractCard).getByRole("link", { name: "로그인 후 확인" })).toHaveAttribute("href", "/login");

    const lawCard = screen.getByTestId("library-item-housing-law");
    expect(within(lawCard).getByText("공개")).toBeInTheDocument();
    expect(within(lawCard).getByRole("link", { name: "자료 위치 보기" })).toHaveAttribute("href", "/library#legal");
  });
});
