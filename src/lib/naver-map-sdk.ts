export type NaverLatLngInstance = {
  lat: () => number;
  lng: () => number;
};

export type NaverMapInstance = {
  setCenter: (position: NaverLatLngInstance) => void;
};

export type NaverMarkerInstance = {
  setPosition: (position: NaverLatLngInstance) => void;
  setMap: (map: NaverMapInstance | null) => void;
};

export type NaverMapClickEvent = {
  coord: NaverLatLngInstance;
};

export type NaverMapsNamespace = {
  maps: {
    LatLng: new (lat: number, lng: number) => NaverLatLngInstance;
    Map: new (element: HTMLElement, options: Record<string, unknown>) => NaverMapInstance;
    Marker: new (options: {
      position: NaverLatLngInstance;
      map: NaverMapInstance;
      title?: string;
    }) => NaverMarkerInstance;
    InfoWindow: new (options: { content: string }) => {
      open: (map: NaverMapInstance, marker: NaverMarkerInstance) => void;
    };
    Event: {
      addListener: (
        target: NaverMapInstance,
        eventName: "click",
        handler: (event: NaverMapClickEvent) => void,
      ) => unknown;
      removeListener: (listener: unknown) => void;
    };
    Position: {
      TOP_RIGHT: unknown;
    };
  };
};

declare global {
  interface Window {
    naver?: NaverMapsNamespace;
  }
}

const sdkScriptId = "naver-map-sdk";
let sdkPromise: Promise<NaverMapsNamespace> | null = null;

export function loadNaverMapSdk(): Promise<NaverMapsNamespace> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("네이버 지도는 브라우저에서만 불러올 수 있습니다."));
  }
  if (window.naver?.maps) return Promise.resolve(window.naver);
  if (sdkPromise) return sdkPromise;

  const clientId = process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID;
  if (!clientId) {
    return Promise.reject(new Error("네이버 지도 API 키 설정이 필요합니다."));
  }

  sdkPromise = new Promise((resolve, reject) => {
    const existingScript = document.getElementById(sdkScriptId) as HTMLScriptElement | null;
    const script = existingScript ?? document.createElement("script");

    const finish = () => {
      if (window.naver?.maps) {
        resolve(window.naver);
      } else {
        sdkPromise = null;
        reject(new Error("네이버 지도 SDK를 불러오지 못했습니다."));
      }
    };
    const fail = () => {
      sdkPromise = null;
      reject(new Error("네이버 지도 SDK를 불러오지 못했습니다."));
    };

    script.addEventListener("load", finish, { once: true });
    script.addEventListener("error", fail, { once: true });

    if (!existingScript) {
      script.id = sdkScriptId;
      script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${encodeURIComponent(clientId)}`;
      script.async = true;
      document.head.appendChild(script);
    }
  });

  return sdkPromise;
}
