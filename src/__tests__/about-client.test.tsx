import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AboutClient } from "@/components/about/about-client";

describe("about client", () => {
  it("renders the chairman signature image without replacing the sign-off text", () => {
    render(<AboutClient />);

    const signature = screen.getByRole("img", { name: "안동연 조합장 서명" });

    expect(signature).toHaveAttribute("src", "/assets/about/chairman-signature.png");
    expect(signature).toHaveClass("h-14", "w-auto", "object-contain");
    expect(screen.getByText("대방동 지역주택조합 조합장")).toBeInTheDocument();
    expect(screen.queryByText("안동연(인)")).not.toBeInTheDocument();
  });

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

    const governanceLine = screen.getByTestId("organization-governance-line");
    expect(Array.from(governanceLine.querySelectorAll("h4")).map((heading) => heading.textContent)).toEqual([
      "이사회",
      "조합장",
    ]);

    const auditNode = screen.getByTestId("organization-audit-node");
    expect(auditNode).toHaveTextContent("감사");
    expect(auditNode).toHaveTextContent("독립 감사");

    const executionStack = screen.getByTestId("organization-execution-stack");
    expect(Array.from(executionStack.querySelectorAll("h4")).map((heading) => heading.textContent)).toEqual(["사무국"]);

    const advisoryNode = screen.getByTestId("organization-advisory-node");
    expect(advisoryNode).toHaveTextContent("전문 협력사");
    expect(advisoryNode).toHaveTextContent("자문·협력");
    expect(executionStack).not.toHaveTextContent("전문 협력사");

    expect(screen.getByRole("heading", { name: "협력사 현황" })).toBeInTheDocument();
    expect(screen.getByText("자금관리 신탁사")).toBeInTheDocument();
    expect(screen.queryByText(/신영부동산신탁|신영부동산식탁/)).not.toBeInTheDocument();
    expect(screen.getByText("법무·회계 자문기관")).toBeInTheDocument();
  });

  it("frames the history section as renewed transparent leadership", () => {
    render(<AboutClient />);

    expect(screen.getByRole("heading", { name: "신뢰 회복을 향해 새롭게 거듭나는 조합" })).toBeInTheDocument();
    expect(
      screen.getByText("조합원 여러분의 우려와 불신을 무겁게 받아들이고, 앞으로의 사업 추진은 조합이 주도적으로 확인하고 투명하게 공유하겠습니다."),
    ).toBeInTheDocument();
    expect(screen.queryByText("투명하게 내디뎌 온 신뢰의 역사")).not.toBeInTheDocument();
  });

  it("highlights the 2026 regular general meeting and removes the 2013 leader-change milestone", () => {
    render(<AboutClient />);

    expect(screen.getByText("2026.04.18")).toBeInTheDocument();
    expect(screen.getByText("2026년 정기총회 정식 개최")).toBeInTheDocument();
    expect(
      screen.getByText("창립총회 이후 진행된 정식 정기총회로, 조합의 주요 안건을 조합원에게 보고하고 투명한 의결 절차를 진행했습니다."),
    ).toBeInTheDocument();
    expect(screen.queryByText("2013.05.01")).not.toBeInTheDocument();
    expect(screen.queryByText(/대표자 명의 변경|제2대 안동연 조합장/)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /사업추진 전체 경과보고 일람 보기/ }));

    expect(screen.getAllByText("2026.04.18").length).toBeGreaterThan(1);
    expect(screen.queryByText("2013.05.01")).not.toBeInTheDocument();
    expect(screen.queryByText(/대표자 명의 변경|제2대 안동연 조합장/)).not.toBeInTheDocument();
  });

  it("links the 2022 district plan notice milestone to the library search", () => {
    const openPortal = vi.fn();
    render(<AboutClient onOpenPortal={openPortal} />);

    const noticeLink = screen.getByRole("link", { name: "결정고시 자료 찾기" });

    expect(screen.getByText("2022.06.30")).toBeInTheDocument();
    expect(screen.getByText("서울특별시 고시 제2022-291호")).toBeInTheDocument();
    expect(noticeLink).toHaveTextContent("인허가·고시자료");
    expect(noticeLink).toHaveAttribute(
      "href",
      "/library?category=permits&q=%EC%84%9C%EC%9A%B8%ED%8A%B9%EB%B3%84%EC%8B%9C%20%EA%B3%A0%EC%8B%9C%20%EC%A0%9C2022-291%ED%98%B8",
    );

    expect(openPortal).not.toHaveBeenCalled();
  });

  it("shows a Naver map surface without using the redirect-prone Naver search iframe", () => {
    process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID = "test-naver-client-id";
    const { container } = render(<AboutClient />);

    expect(
      screen.getByRole("heading", { name: "조합 사무실 찾아오시는 길" }),
    ).toBeInTheDocument();
    expect(container.querySelector('iframe[src*="map.naver.com"]')).not.toBeInTheDocument();
    expect(container.querySelector('iframe[src*="google.com/maps"]')).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "원위치" })).not.toBeInTheDocument();
    expect(screen.getByTestId("naver-map-canvas")).toHaveAttribute(
      "aria-label",
      "대방동지역주택조합 사무실 네이버 지도",
    );
    expect(screen.getByTestId("naver-map-canvas")).toHaveAttribute("data-lat", "37.5081729325679");
    expect(screen.getByTestId("naver-map-canvas")).toHaveAttribute("data-lng", "126.931781205943");

    const naverMapLink = screen.getByRole("link", { name: "네이버 지도에서 보기" });
    expect(naverMapLink).toHaveAttribute("href", expect.stringContaining("map.naver.com"));
    expect(naverMapLink).toHaveAttribute("target", "_blank");
    expect(screen.getAllByText(/서울시 동작구 여의대방로 36길 102-11/).length).toBeGreaterThan(0);
  });

  it("does not load the geocoder module because the office marker uses a fixed coordinate", () => {
    process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID = "test-naver-client-id";

    render(<AboutClient />);

    const script = document.getElementById("naver-map-sdk");
    expect(script).toHaveAttribute("src", expect.stringContaining("oapi.map.naver.com/openapi/v3/maps.js"));
    expect(script).toHaveAttribute("src", expect.not.stringContaining("submodules=geocoder"));
  });

  it("shows the detailed office route guide only after selecting it", () => {
    render(<AboutClient />);

    expect(screen.queryByText("상담시간")).not.toBeInTheDocument();
    expect(screen.queryByText("주차")).not.toBeInTheDocument();
    expect(screen.queryByText(/사무실 건물 내 주차 가능/)).not.toBeInTheDocument();
    expect(screen.queryByText(/직접구운족발/)).not.toBeInTheDocument();

    const guideToggle = screen.getByRole("button", {
      name: "대방동 지역주택조합 사무실 찾아오시는 길안내",
    });
    expect(guideToggle).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByText("+ 자세히보기")).toHaveClass("animate-pulse", "motion-reduce:animate-none");

    fireEvent.click(guideToggle);

    expect(guideToggle).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText(/본 조합 사무실은 대방역, 노량진역, 장승배기역/)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "대방역(1호선·신림선)에서 오실 때" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "노량진역(1호선·9호선)에서 오실 때" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "장승배기역(7호선)에서 오실 때" })).toBeInTheDocument();
    expect(screen.getByText("3번 출구 앞 정류장에서 [동작05번] 또는 [동작12번] 마을버스 탑승 → '남부교회' 정류장 하차 (약 5분 소요)")).toBeInTheDocument();
    expect(screen.getByText("6번 출구 앞 정류장에서 [동작03번] 마을버스 탑승 → '남부교회' 정류장 하차 (약 5분 소요)")).toBeInTheDocument();
    expect(screen.getByText("4번 출구 앞 정류장에서 [동작12번] 마을버스 탑승 → '남부교회' 정류장 하차 (약 5분 소요)")).toBeInTheDocument();
    expect(screen.queryByText(/2번 출구 앞 정류장에서 \[동작02번\] 또는 \[동작11번\]/)).not.toBeInTheDocument();
    expect(screen.queryByText(/대방현대아파트/)).not.toBeInTheDocument();
    expect(screen.getByText(/직접구운족발.*바로 옆 골목길/)).toBeInTheDocument();
    expect(screen.getByText(/남부루터교회 삼거리에서 숭의여고 방향으로 50m 위/)).toBeInTheDocument();
  });
});
