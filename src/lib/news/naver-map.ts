export type NaverMapDraft = {
  url: string;
  lat: number | null;
  lng: number | null;
};

export type ParsedNaverMapLink = {
  url: string;
  title: string;
  placeId: string;
  mode: "car";
};

export type NaverMapPersistence = {
  naverMapUrl: string | null;
  naverMapTitle: string | null;
  naverMapPlaceId: string | null;
  naverMapLat: number | null;
  naverMapLng: number | null;
};

export type ParsedNaverMapInput =
  | { ok: true; value: NaverMapPersistence }
  | { ok: false; error: string };

export const EMPTY_NAVER_MAP_DRAFT: NaverMapDraft = {
  url: "",
  lat: null,
  lng: null,
};

export const DEFAULT_NAVER_MAP_CENTER = {
  lat: 37.5081729325679,
  lng: 126.931781205943,
};

export function parseNaverDirectionsUrl(value: unknown): ParsedNaverMapLink | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== "https:" || parsed.hostname !== "map.naver.com") return null;
    if (parsed.username || parsed.password || parsed.port) return null;

    const segments = parsed.pathname.split("/").filter(Boolean);
    const directionsIndex = segments.indexOf("directions");
    if (directionsIndex < 0 || segments[directionsIndex - 1] !== "p") return null;

    const destinationSegment = segments[directionsIndex + 2];
    const mode = segments[directionsIndex + 4];
    if (!destinationSegment || mode !== "car") return null;

    const destinationParts = decodeURIComponent(destinationSegment).split(",");
    if (destinationParts.length < 5) return null;

    const placeType = destinationParts.at(-1);
    const placeId = destinationParts.at(-2)?.trim() || "";
    const title = destinationParts.slice(2, -2).join(",").trim();
    if (placeType !== "PLACE_POI" || !/^\d+$/.test(placeId) || !title) return null;

    return {
      url: trimmed,
      title,
      placeId,
      mode: "car",
    };
  } catch {
    return null;
  }
}

function parseCoordinate(value: unknown) {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

export function parseNaverMapInput(value: unknown): ParsedNaverMapInput {
  if (value === undefined || value === null || value === "") {
    return {
      ok: true,
      value: {
        naverMapUrl: null,
        naverMapTitle: null,
        naverMapPlaceId: null,
        naverMapLat: null,
        naverMapLng: null,
      },
    };
  }

  if (typeof value !== "object" || Array.isArray(value)) {
    return { ok: false, error: "네이버 지도 입력 형식이 올바르지 않습니다." };
  }

  const input = value as Record<string, unknown>;
  const rawUrl = typeof input.url === "string" ? input.url.trim() : "";
  if (!rawUrl) {
    return parseNaverMapInput(null);
  }

  const link = parseNaverDirectionsUrl(rawUrl);
  if (!link) {
    return { ok: false, error: "네이버 지도의 자동차 길찾기 주소를 입력해 주세요." };
  }

  const lat = parseCoordinate(input.lat);
  const lng = parseCoordinate(input.lng);
  if (lat === null || lng === null) {
    return { ok: false, error: "지도에서 목적지 위치를 확인해 주세요." };
  }
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return { ok: false, error: "확인한 지도 좌표가 올바르지 않습니다." };
  }

  return {
    ok: true,
    value: {
      naverMapUrl: link.url,
      naverMapTitle: link.title,
      naverMapPlaceId: link.placeId,
      naverMapLat: lat,
      naverMapLng: lng,
    },
  };
}

export function buildNaverMapDraft(value: {
  naverMapUrl?: string | null;
  naverMapLat?: number | null;
  naverMapLng?: number | null;
}): NaverMapDraft {
  return {
    url: value.naverMapUrl || "",
    lat: value.naverMapLat ?? null,
    lng: value.naverMapLng ?? null,
  };
}
