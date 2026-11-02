"use client";

import { useEffect, useRef, useState } from "react";
import { loadNaverMapSdk } from "@/lib/naver-map-sdk";

type NaverMapCardProps = {
  url?: string | null;
  title?: string | null;
  placeId?: string | null;
  lat?: number | null;
  lng?: number | null;
};

export function NaverMapCard({ url, title, placeId, lat, lng }: NaverMapCardProps) {
  const mapElementRef = useRef<HTMLDivElement>(null);
  const [mapError, setMapError] = useState("");
  const hasMap = Boolean(url && title && placeId && typeof lat === "number" && typeof lng === "number");

  useEffect(() => {
    if (!hasMap || !mapElementRef.current || lat === null || lat === undefined || lng === null || lng === undefined) return;
    let cancelled = false;
    let marker: { setMap: (map: null) => void } | null = null;
    setMapError("");

    void loadNaverMapSdk()
      .then((naver) => {
        if (cancelled || !mapElementRef.current) return;
        const position = new naver.maps.LatLng(lat, lng);
        const map = new naver.maps.Map(mapElementRef.current, {
          center: position,
          zoom: 17,
          minZoom: 7,
          scaleControl: false,
          mapDataControl: false,
          zoomControl: true,
          zoomControlOptions: { position: naver.maps.Position.TOP_RIGHT },
        });
        marker = new naver.maps.Marker({ position, map, title: title || "게시글 목적지" });
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setMapError(error instanceof Error ? error.message : "네이버 지도를 불러오지 못했습니다.");
        }
      });

    return () => {
      cancelled = true;
      marker?.setMap(null);
    };
  }, [hasMap, lat, lng, title]);

  if (!hasMap) return null;

  return (
    <section className="my-5 overflow-hidden rounded-2xl bg-white shadow-[inset_0_0_0_1px_#f2f0ed]" aria-label={`${title} 네이버 지도`}>
      <div className="space-y-1 px-4 py-3 sm:px-5">
        <p className="text-sm font-extrabold text-charcoal-primary">📍 {title}</p>
        <p className="text-[10px] font-mono text-ash">네이버 장소 ID {placeId}</p>
      </div>
      <div className="relative h-64 bg-parchment-card sm:h-80">
        <div ref={mapElementRef} className="h-full w-full" data-testid="news-naver-map" aria-label={`${title} 지도`} />
        {mapError && (
          <div className="absolute inset-0 flex items-center justify-center bg-parchment-card/95 px-5 text-center">
            <p className="text-xs font-bold leading-5 text-graphite">{mapError}</p>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <p className="text-[11px] leading-5 text-ash">표시된 위치를 확인하고 네이버 지도에서 자동차 길찾기를 이어갈 수 있어.</p>
        <a
          href={url || undefined}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex shrink-0 items-center justify-center rounded-full bg-[#03C75A] px-4 py-2 text-xs font-bold text-white outline-none transition hover:bg-[#02b351] focus-visible:ring-2 focus-visible:ring-[#03C75A]/40"
        >
          네이버 지도에서 길찾기
        </a>
      </div>
    </section>
  );
}
