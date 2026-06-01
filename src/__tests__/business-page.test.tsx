import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { BusinessClient } from "@/components/business/business-client";

vi.mock("next/navigation", () => ({
  useSearchParams() {
    return {
      get: vi.fn().mockReturnValue(null),
    };
  },
}));

describe("business status page", () => {
  it("summarizes the attached briefing figures without unsupported claims", () => {
    render(<BusinessClient />);

    expect(screen.getByRole("heading", { name: /대방동 지역주택조합/ })).toBeInTheDocument();
    expect(screen.getByText("13,167.22㎡ (변경 계획안)")).toBeInTheDocument();
    expect(screen.getByText("41,602.59㎡ (지상 26,554.59㎡ / 지하 15,048.00㎡)")).toBeInTheDocument();
    expect(screen.getByText("270세대 (분양 252세대 / 공공 18세대)")).toBeInTheDocument();
    expect(screen.getByText("353대 (세대당 1.31대)")).toBeInTheDocument();
    expect(screen.queryByText(/450세대|메리츠증권|1군 브랜드/)).not.toBeInTheDocument();
  });

  it("renders the business content as one scroll page with section anchors", () => {
    const { container } = render(<BusinessClient />);

    const sectionNav = screen.getByRole("navigation", { name: "사업현황 세부 메뉴" });
    expect(sectionNav).toHaveClass("fixed", "top-[72px]");
    expect(container.querySelector("#overview")).toBeInTheDocument();
    expect(container.querySelector("#plan")).toBeInTheDocument();
    expect(container.querySelector("#unit")).toBeInTheDocument();
    expect(container.querySelector("#timeline")).toBeInTheDocument();
    expect(screen.getAllByText("48㎡ (19평형)").length).toBeGreaterThan(0);
    expect(screen.getAllByText("102세대").length).toBeGreaterThan(0);
    expect(screen.getByText("공공주택 평형별 계획")).toBeInTheDocument();
    expect(screen.getByText("지구단위계획 변경")).toBeInTheDocument();
    expect(screen.getByText("8필지 추가 계획")).toBeInTheDocument();
    expect(screen.getByText("사업계획승인")).toBeInTheDocument();
    expect(screen.getByText("청산")).toBeInTheDocument();
  });

  it("uses the briefing images from the attached PDF for the plan section", () => {
    render(<BusinessClient />);

    expect(screen.getByRole("heading", { name: "변경 설계(안) 조감도" })).toBeInTheDocument();
    expect(screen.getByAltText("2025년 설명회 자료 변경 설계안 조감도")).toBeInTheDocument();
    expect(screen.getByAltText("2025년 설명회 자료 당초 설계안 조감도")).toBeInTheDocument();
    expect(screen.getByAltText("2025년 설명회 자료 당초 설계안 배치도")).toBeInTheDocument();
    expect(screen.queryByAltText("대방동 지역주택조합 대표 사업 이미지")).not.toBeInTheDocument();
  });
});
