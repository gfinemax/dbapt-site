"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  DEFAULT_NAVER_MAP_CENTER,
  parseNaverDirectionsUrl,
  type NaverMapDraft,
} from "@/lib/news/naver-map";
import {
  loadNaverMapSdk,
  type NaverMapInstance,
  type NaverMarkerInstance,
} from "@/lib/naver-map-sdk";

type NaverMapFieldProps = {
  id: string;
  value: NaverMapDraft;
  onChange: (value: NaverMapDraft) => void;
};

function coordinateValue(value: number | null) {
  return value === null ? "" : String(value);
}

function parseCoordinateInput(value: string) {
  if (!value.trim()) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function NaverMapField({ id, value, onChange }: NaverMapFieldProps) {
  const mapElementRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<NaverMapInstance | null>(null);
  const markerRef = useRef<NaverMarkerInstance | null>(null);
  const valueRef = useRef(value);
  const onChangeRef = useRef(onChange);
  const [mapError, setMapError] = useState("");
  const link = useMemo(() => parseNaverDirectionsUrl(value.url), [value.url]);
  const hasCoordinates = value.lat !== null && value.lng !== null;

  useEffect(() => {
    valueRef.current = value;
    onChangeRef.current = onChange;
  }, [onChange, value]);

  useEffect(() => {
    if (!link || !mapElementRef.current) return;

    let cancelled = false;
    let clickListener: unknown;
    setMapError("");

    void loadNaverMapSdk()
      .then((naver) => {
        if (cancelled || !mapElementRef.current) return;
        const current = valueRef.current;
        const center = new naver.maps.LatLng(
          current.lat ?? DEFAULT_NAVER_MAP_CENTER.lat,
          current.lng ?? DEFAULT_NAVER_MAP_CENTER.lng,
        );
        const map = new naver.maps.Map(mapElementRef.current, {
          center,
          zoom: current.lat !== null && current.lng !== null ? 17 : 15,
          minZoom: 7,
          scaleControl: false,
          mapDataControl: false,
          zoomControl: true,
          zoomControlOptions: { position: naver.maps.Position.TOP_RIGHT },
        });
        mapRef.current = map;

        if (current.lat !== null && current.lng !== null) {
          markerRef.current = new naver.maps.Marker({
            position: center,
            map,
            title: link.title,
          });
        }

        clickListener = naver.maps.Event.addListener(map, "click", (event) => {
          const nextPosition = event.coord;
          const currentValue = valueRef.current;
          onChangeRef.current({
            ...currentValue,
            lat: nextPosition.lat(),
            lng: nextPosition.lng(),
          });
        });
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setMapError(error instanceof Error ? error.message : "네이버 지도를 불러오지 못했습니다.");
        }
      });

    return () => {
      cancelled = true;
      markerRef.current?.setMap(null);
      markerRef.current = null;
      mapRef.current = null;
      if (clickListener && window.naver?.maps) {
        window.naver.maps.Event.removeListener(clickListener);
      }
    };
  }, [link]);

  useEffect(() => {
    if (!link || !mapRef.current || value.lat === null || value.lng === null || !window.naver?.maps) return;
    const position = new window.naver.maps.LatLng(value.lat, value.lng);
    mapRef.current.setCenter(position);
    if (markerRef.current) {
      markerRef.current.setPosition(position);
    } else {
      markerRef.current = new window.naver.maps.Marker({
        position,
        map: mapRef.current,
        title: link.title,
      });
    }
  }, [link, value.lat, value.lng]);

  return (
    <section className="space-y-3 rounded-2xl border border-stone-surface bg-parchment-card p-4" aria-label="네이버 지도 설정">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <label htmlFor={`${id}-url`} className="block text-[11px] font-bold text-charcoal-primary font-mono">
            네이버 지도 자동차 길찾기 주소 (선택)
          </label>
          <p className="mt-1 text-[10px] leading-4 text-ash">
            링크를 붙여넣은 뒤 지도에서 정확한 목적지를 한 번 선택해 줘.
          </p>
        </div>
        {value.url && (
          <button
            type="button"
            onClick={() => onChange({ url: "", lat: null, lng: null })}
            className="rounded-full border border-stone-surface bg-white px-3 py-1.5 text-[10px] font-bold text-graphite outline-none transition hover:bg-stone-surface focus-visible:ring-2 focus-visible:ring-sky-blue/40"
          >
            지도 제거
          </button>
        )}
      </div>

      <input
        id={`${id}-url`}
        type="url"
        inputMode="url"
        placeholder="https://map.naver.com/p/directions/..."
        value={value.url}
        onChange={(event) => onChange({ url: event.target.value, lat: null, lng: null })}
        className="w-full rounded-xl border border-stone-surface bg-white px-4 py-2.5 text-xs text-charcoal-primary outline-none transition focus:border-sky-blue focus:ring-1 focus:ring-sky-blue/30"
      />

      {value.url && !link && (
        <p role="alert" className="rounded-xl bg-red-50 px-3 py-2 text-[11px] font-bold text-coral-red">
          네이버 지도의 자동차 길찾기 주소를 입력해 줘.
        </p>
      )}

      {link && (
        <div className="space-y-3">
          <div className="rounded-xl bg-white px-3 py-2 shadow-[inset_0_0_0_1px_#f2f0ed]">
            <p className="text-xs font-extrabold text-charcoal-primary">목적지: {link.title}</p>
            <p className="mt-0.5 text-[10px] font-mono text-ash">네이버 장소 ID {link.placeId}</p>
          </div>

          <div className="relative h-64 overflow-hidden rounded-2xl border border-stone-surface bg-white sm:h-72">
            <div
              ref={mapElementRef}
              className="h-full w-full"
              aria-label={`${link.title} 위치 확인 지도`}
              data-testid={`${id}-picker-map`}
            />
            {mapError && (
              <div className="absolute inset-0 flex items-center justify-center bg-parchment-card/95 px-5 text-center">
                <p className="text-xs font-bold leading-5 text-graphite">{mapError}</p>
              </div>
            )}
          </div>

          <p className={`text-[11px] font-bold ${hasCoordinates ? "text-valid-green" : "text-deep-amber"}`}>
            {hasCoordinates ? "목적지 위치를 확인했어." : "지도에서 목적지를 누르거나 아래 좌표를 입력해 줘."}
          </p>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <label htmlFor={`${id}-lat`} className="block text-[10px] font-bold text-charcoal-primary">
                위도
              </label>
              <input
                id={`${id}-lat`}
                type="number"
                inputMode="decimal"
                step="any"
                value={coordinateValue(value.lat)}
                onChange={(event) => onChange({ ...value, lat: parseCoordinateInput(event.target.value) })}
                className="w-full rounded-xl border border-stone-surface bg-white px-3 py-2 text-xs outline-none focus:border-sky-blue focus:ring-1 focus:ring-sky-blue/30"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor={`${id}-lng`} className="block text-[10px] font-bold text-charcoal-primary">
                경도
              </label>
              <input
                id={`${id}-lng`}
                type="number"
                inputMode="decimal"
                step="any"
                value={coordinateValue(value.lng)}
                onChange={(event) => onChange({ ...value, lng: parseCoordinateInput(event.target.value) })}
                className="w-full rounded-xl border border-stone-surface bg-white px-3 py-2 text-xs outline-none focus:border-sky-blue focus:ring-1 focus:ring-sky-blue/30"
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
