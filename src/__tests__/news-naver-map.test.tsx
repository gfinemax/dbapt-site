import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { NaverMapCard } from "@/components/news/naver-map-card";
import { NaverMapField } from "@/components/news/naver-map-field";
import {
  EMPTY_NAVER_MAP_DRAFT,
  parseNaverDirectionsUrl,
  parseNaverMapInput,
  type NaverMapDraft,
} from "@/lib/news/naver-map";

const sampleUrl =
  "https://map.naver.com/p/directions/-/3zfsrx,2AJLcb,%ED%94%BC%EC%9E%90%ED%97%9B%20%EB%8C%80%EB%B0%A9%EC%A0%90,11625116,PLACE_POI/-/car?c=19.04,0,0,2,dh";

vi.mock("@/lib/naver-map-sdk", () => ({
  loadNaverMapSdk: vi.fn().mockRejectedValue(new Error("테스트 지도 로딩 제한")),
}));

function MapFieldHarness() {
  const [value, setValue] = useState<NaverMapDraft>({ ...EMPTY_NAVER_MAP_DRAFT });
  return <NaverMapField id="test-map" value={value} onChange={setValue} />;
}

describe("news Naver map links", () => {
  it("parses the approved Naver car-directions URL without trusting its compact coordinates", () => {
    expect(parseNaverDirectionsUrl(sampleUrl)).toEqual({
      url: sampleUrl,
      title: "피자헛 대방점",
      placeId: "11625116",
      mode: "car",
    });
    expect(parseNaverDirectionsUrl("https://example.com/p/directions/-/-/-/car")).toBeNull();
    expect(parseNaverDirectionsUrl(sampleUrl.replace("/car?", "/walk?"))).toBeNull();
  });

  it("requires a user-confirmed latitude and longitude before persistence", () => {
    expect(parseNaverMapInput({ url: sampleUrl, lat: null, lng: null })).toEqual({
      ok: false,
      error: "지도에서 목적지 위치를 확인해 주세요.",
    });
    expect(parseNaverMapInput({ url: sampleUrl, lat: 37.5082, lng: 126.9318 })).toEqual({
      ok: true,
      value: {
        naverMapUrl: sampleUrl,
        naverMapTitle: "피자헛 대방점",
        naverMapPlaceId: "11625116",
        naverMapLat: 37.5082,
        naverMapLng: 126.9318,
      },
    });
  });

  it("recognizes the destination and provides keyboard-accessible coordinate confirmation", async () => {
    render(<MapFieldHarness />);

    fireEvent.change(screen.getByLabelText("네이버 지도 자동차 길찾기 주소 (선택)"), {
      target: { value: sampleUrl },
    });

    expect(await screen.findByText("목적지: 피자헛 대방점")).toBeInTheDocument();
    expect(screen.getByText("네이버 장소 ID 11625116")).toBeInTheDocument();
    expect(screen.getByText("지도에서 목적지를 누르거나 아래 좌표를 입력해 줘.")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("위도"), { target: { value: "37.5082" } });
    fireEvent.change(screen.getByLabelText("경도"), { target: { value: "126.9318" } });

    expect(screen.getByText("목적지 위치를 확인했어.")).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText("테스트 지도 로딩 제한")).toBeInTheDocument());
  });

  it("keeps the original directions link available when the inline map cannot load", async () => {
    render(
      <NaverMapCard
        url={sampleUrl}
        title="피자헛 대방점"
        placeId="11625116"
        lat={37.5082}
        lng={126.9318}
      />,
    );

    expect(screen.getByRole("link", { name: "네이버 지도에서 길찾기" })).toHaveAttribute("href", sampleUrl);
    expect(screen.getByText("네이버 장소 ID 11625116")).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText("테스트 지도 로딩 제한")).toBeInTheDocument());
  });
});
