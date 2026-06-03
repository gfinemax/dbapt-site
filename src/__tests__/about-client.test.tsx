import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AboutClient } from "@/components/about/about-client";

describe("about client", () => {
  it("separates the cooperative organization chart from partner status cards", () => {
    const { container } = render(<AboutClient />);

    expect(screen.getByRole("heading", { name: "대방동 지역주택조합 조직도" })).toBeInTheDocument();
    expect(container.querySelector("[data-organization-chart]")).toBeInTheDocument();
    expect(screen.getByText("조합원 총회")).toBeInTheDocument();
    expect(screen.getByText("조합장")).toBeInTheDocument();
    expect(screen.getByText("이사회")).toBeInTheDocument();
    expect(screen.getByText("감사")).toBeInTheDocument();
    expect(screen.getByText("사무국")).toBeInTheDocument();
    expect(screen.getByText("전문 협력사")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "협력사 현황" })).toBeInTheDocument();
    expect(screen.getByText("자금관리 신탁사: 신영부동산신탁")).toBeInTheDocument();
    expect(screen.getByText("법무·회계 자문기관")).toBeInTheDocument();
  });
});
