import { render, screen, within } from "@testing-library/react";
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
  it("summarizes the current district plan and future minor-change plan without obsolete figures", () => {
    render(<BusinessClient />);

    expect(screen.getByRole("heading", { name: /대방동 지역주택조합/ })).toBeInTheDocument();
    expect(screen.getByText("12,813.22㎡")).toBeInTheDocument();
    expect(screen.getByText("40,468.26㎡")).toBeInTheDocument();
    expect(screen.getAllByText("현재 지구단위계획 254세대").length).toBeGreaterThan(0);
    expect(screen.getByText("경미한 변경으로 270세대 예정")).toBeInTheDocument();
    expect(screen.getAllByText("343대").length).toBeGreaterThan(0);
    const excludedHouseholdText = `${260 + 2}세대`;
    expect(screen.queryByText(new RegExp(`${excludedHouseholdText}|353대|2025\\.09\\.06|450세대|메리츠증권|1군 브랜드`))).not.toBeInTheDocument();
  });

  it("renders the business content as one scroll page with section anchors", () => {
    const { container } = render(<BusinessClient />);

    const sectionNav = screen.getByRole("navigation", { name: "사업현황 세부 메뉴" });
    expect(sectionNav).toHaveClass("fixed", "top-[72px]");
    expect(
      Array.from(container.querySelectorAll("main > section")).map((section) => section.id),
    ).toEqual(["overview", "rendering", "plan", "unit", "mobility", "timeline"]);
    expect(container.querySelector("#traffic")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "조감도" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "광역교통" })).not.toBeInTheDocument();
    expect(screen.getAllByText("건축계획(안) 및 배치도").length).toBeGreaterThan(0);
    expect(screen.getByText("차량동선계획")).toBeInTheDocument();
    expect(screen.getByText("보행동선계획")).toBeInTheDocument();
    expect(screen.queryByText("교통처리계획(광역)")).not.toBeInTheDocument();
    expect(screen.getByText("건축심의 (2027.3 예정)")).toBeInTheDocument();
  });

  it("uses the 2025.10.30 business plan images for architecture diagrams, unit, circulation, and rendering sections", () => {
    render(<BusinessClient />);

    expect(screen.queryByAltText("2025년 10월 30일 건축개요 주요 수치")).not.toBeInTheDocument();
    expect(screen.getByAltText("2025년 10월 30일 사업계획서 건축계획안")).toBeInTheDocument();
    expect(screen.getByAltText("2025년 10월 30일 사업계획서 배치도")).toBeInTheDocument();
    expect(screen.getByAltText("48A 타입 단위세대 평면도")).toBeInTheDocument();
    expect(screen.getByAltText("59A 타입 단위세대 평면도")).toBeInTheDocument();
    expect(screen.getByAltText("59B 타입 단위세대 평면도")).toBeInTheDocument();
    expect(screen.getByAltText("84A 타입 단위세대 평면도")).toBeInTheDocument();
    expect(screen.getByAltText("84B 타입 단위세대 평면도")).toBeInTheDocument();
    expect(screen.getByAltText("차량동선계획 도면")).toBeInTheDocument();
    expect(screen.getByAltText("보행동선계획 도면")).toBeInTheDocument();
    expect(screen.getByAltText("대방동 지역주택조합 아파트 조감도")).toBeInTheDocument();
    expect(screen.queryByAltText("교통처리계획 광역 도면")).not.toBeInTheDocument();
    expect(screen.queryByAltText("대방동 지역주택조합 대표 사업 이미지")).not.toBeInTheDocument();
  });

  it("marks the completed timeline steps through district-unit-plan setup as active", () => {
    const { container } = render(<BusinessClient />);
    const timelineSection = container.querySelector("#timeline");

    expect(timelineSection).not.toBeNull();
    const timelineItems = within(timelineSection as HTMLElement).getAllByRole("listitem");

    expect(timelineItems).toHaveLength(10);
    for (const item of timelineItems.slice(0, 4)) {
      expect(item).toHaveClass("border-ember-orange/30", "bg-ember-orange/5");
    }
    for (const item of timelineItems.slice(4)) {
      expect(item).not.toHaveClass("border-ember-orange/30");
      expect(item).not.toHaveClass("bg-ember-orange/5");
    }
  });

  it("uses the uploaded circulation images for vehicle and pedestrian flow plans", () => {
    render(<BusinessClient />);

    expect(screen.getByAltText("차량동선계획 도면")).toHaveAttribute(
      "src",
      expect.stringContaining("vehicle-circulation-uploaded.png"),
    );
    expect(screen.getByAltText("보행동선계획 도면")).toHaveAttribute(
      "src",
      expect.stringContaining("pedestrian-circulation-uploaded.png"),
    );
  });

  it("renders circulation diagrams with explicit dimensions so image panels do not collapse", () => {
    render(<BusinessClient />);

    expect(screen.getAllByTestId("circulation-map-frame")).toHaveLength(2);

    for (const alt of ["차량동선계획 도면", "보행동선계획 도면"]) {
      const image = screen.getByAltText(alt);

      expect(image).toHaveAttribute("width", "1994");
      expect(image).toHaveAttribute("height", "1280");
      expect(image).toHaveClass("w-full", "h-auto");
    }
  });

  it("renders a unified architecture overview instead of a duplicated source image", () => {
    render(<BusinessClient />);

    expect(screen.getByRole("heading", { name: "통합 건축개요" })).toBeInTheDocument();
    expect(screen.getByText("사업 정보")).toBeInTheDocument();
    expect(screen.getByText("면적 계획")).toBeInTheDocument();
    expect(screen.getByText("규모·비율")).toBeInTheDocument();
    expect(screen.getByText("주차·기준")).toBeInTheDocument();
    expect(screen.getByText("대방동 지역주택조합 공동주택 신축공사")).toBeInTheDocument();
    expect(screen.getByText("서울특별시 동작구 대방동 11-103번지 일원")).toBeInTheDocument();
    expect(screen.getByText("14,628.80㎡")).toBeInTheDocument();
    expect(screen.getByText("지하 3층 ~ 지상 20층")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "향후 계획" })).toBeInTheDocument();
    expect(screen.getByText(/세대수는 조합의 향후 경미한 변경 예정 사항을 함께 반영했습니다/)).toBeInTheDocument();
    expect(screen.queryByText(/본 페이지는 2025년 10월 30일 사업계획서를 기준으로 하되/)).not.toBeInTheDocument();
    expect(screen.queryByText("사업계획서 건축개요 이미지")).not.toBeInTheDocument();
  });

  it("shows current 254-household and future 270-household plans by unit type", () => {
    render(<BusinessClient />);

    expect(screen.getByRole("heading", { name: "평형별 세대계획" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "현재 지구단위계획 254세대" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "향후 경미한 변경 270세대 예정" })).toBeInTheDocument();
    expect(screen.getByText("분양주택 236세대")).toBeInTheDocument();
    expect(screen.getAllByText("공공주택 18세대")).toHaveLength(2);
    expect(screen.getByText("분양주택 252세대")).toBeInTheDocument();
    expect(screen.getAllByText("48㎡ (19평형)").length).toBeGreaterThan(0);
    expect(screen.getAllByText("59㎡ (24평형)").length).toBeGreaterThan(0);
    expect(screen.getAllByText("74㎡ (30평형)").length).toBeGreaterThan(0);
    expect(screen.getAllByText("84㎡ (34평형)").length).toBeGreaterThan(0);
    expect(screen.getByText("236 + 18 = 254세대")).toBeInTheDocument();
    expect(screen.getByText("252 + 18 = 270세대 예정")).toBeInTheDocument();
    expect(screen.getByText("증 16세대")).toBeInTheDocument();
  });

  it("shows the social welfare plan as readable content instead of source table images", () => {
    render(<BusinessClient />);

    expect(screen.queryByText("건축계획(안) 주요 수치")).not.toBeInTheDocument();
    expect(screen.queryByAltText("2025년 10월 30일 사업계획서 건축계획안 주요 수치")).not.toBeInTheDocument();
    expect(screen.queryByAltText("2025년 10월 30일 사업계획서 사회복지시설 계획")).not.toBeInTheDocument();

    expect(screen.getByRole("heading", { name: "사회복지시설 계획" })).toBeInTheDocument();
    expect(screen.getByText("동작구 대방동 11-103번지 일원")).toBeInTheDocument();
    expect(screen.getByText("지상 2층")).toBeInTheDocument();
    expect(screen.getByText("742.0㎡")).toBeInTheDocument();

    const welfareTable = screen.getByRole("table", { name: "사회복지시설 층별 계획" });
    expect(within(welfareTable).getByText("상담실, 강당")).toBeInTheDocument();
    expect(within(welfareTable).getByText("작업장")).toBeInTheDocument();
    expect(within(welfareTable).getByText("558.55")).toBeInTheDocument();
    expect(within(welfareTable).getByText("183.45")).toBeInTheDocument();
  });

  it("renders every unit plan inside a visible image frame", () => {
    render(<BusinessClient />);

    expect(screen.getAllByTestId("unit-plan-image-frame")).toHaveLength(5);
  });

  it("does not duplicate unit plan metadata above the uploaded floor-plan images", () => {
    const { container } = render(<BusinessClient />);
    const unitSection = container.querySelector("#unit");

    expect(unitSection).not.toBeNull();
    expect(screen.queryByRole("heading", { name: "48A TYPE" })).not.toBeInTheDocument();
    expect(within(unitSection as HTMLElement).queryByText("전용 48.90㎡ / 공급 66.08㎡")).not.toBeInTheDocument();
    expect(within(unitSection as HTMLElement).queryByText("23세대")).not.toBeInTheDocument();
  });

  it("uses the uploaded unit-plan images in the requested order", () => {
    render(<BusinessClient />);

    const expectedUnitImages = [
      "unit-48a.png",
      "unit-59a.png",
      "unit-59b.png",
      "unit-84a.png",
      "unit-84b.png",
    ];
    const unitImages = screen.getAllByAltText(/타입 단위세대 평면도/);

    expect(unitImages.map((image) => image.getAttribute("src"))).toEqual(
      expectedUnitImages.map((fileName) => expect.stringContaining(fileName)),
    );
  });

  it("uses the dedicated clean aerial rendering image", () => {
    render(<BusinessClient />);

    expect(screen.getByAltText("대방동 지역주택조합 아파트 조감도")).toHaveAttribute(
      "src",
      expect.stringContaining("rendering-aerial-250801"),
    );
  });

  it("removes redundant plan, rendering, and timeline note copy", () => {
    render(<BusinessClient />);

    expect(screen.queryByText(/배치도 확인 사항/)).not.toBeInTheDocument();
    expect(screen.queryByText("Layout Notes")).not.toBeInTheDocument();
    expect(screen.queryByText("일정 표기 원칙")).not.toBeInTheDocument();
    expect(screen.queryByText("사업계획서에 수록된 조감도입니다.")).not.toBeInTheDocument();
    expect(
      screen.getByText("실제 색채, 외관, 조경, 시설 배치는 인허가와 실시설계 과정에서 변경될 수 있습니다."),
    ).toBeInTheDocument();
  });
});
