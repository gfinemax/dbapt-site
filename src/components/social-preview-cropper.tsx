"use client";

/* eslint-disable react-hooks/set-state-in-effect, @next/next/no-img-element */

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  clampSocialPreviewCrop,
  createCenteredSocialPreviewCrop,
  createSocialPreviewFile,
  moveSocialPreviewCrop,
  resizeSocialPreviewCrop,
  type SocialPreviewCropRect,
  type SocialPreviewImageBounds,
} from "@/lib/social-preview-crop";

type SocialPreviewCropperProps = {
  file: File | null;
  open: boolean;
  title?: string;
  onCancel: () => void;
  onConfirm: (file: File) => void;
};

type DragState = {
  pointerId: number;
  startX: number;
  startY: number;
  crop: SocialPreviewCropRect;
};

export function SocialPreviewCropper({
  file,
  open,
  title = "카톡 미리보기 이미지 자르기",
  onCancel,
  onConfirm,
}: SocialPreviewCropperProps) {
  const imageRef = useRef<HTMLImageElement | null>(null);
  const dragStateRef = useRef<DragState | null>(null);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [imageBounds, setImageBounds] = useState<SocialPreviewImageBounds | null>(null);
  const [crop, setCrop] = useState<SocialPreviewCropRect | null>(null);
  const [cropSizePercent, setCropSizePercent] = useState(100);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!file || !open) {
      setObjectUrl(null);
      setImageBounds(null);
      setCrop(null);
      setCropSizePercent(100);
      setError("");
      return;
    }

    const nextUrl = URL.createObjectURL(file);
    setObjectUrl(nextUrl);
    setImageBounds(null);
    setCrop(null);
    setCropSizePercent(100);
    setError("");

    return () => {
      URL.revokeObjectURL(nextUrl);
    };
  }, [file, open]);

  if (!open || !file || !objectUrl) return null;

  const handleImageLoad = () => {
    const image = imageRef.current;
    if (!image) return;

    const nextBounds = {
      width: image.naturalWidth,
      height: image.naturalHeight,
    };
    setImageBounds(nextBounds);
    setCrop(createCenteredSocialPreviewCrop(nextBounds));
    setCropSizePercent(100);
  };

  const getRenderedScale = () => {
    const image = imageRef.current;
    if (!image || !imageBounds) return null;

    return {
      x: imageBounds.width / image.clientWidth,
      y: imageBounds.height / image.clientHeight,
    };
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (!crop) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragStateRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      crop,
    };
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLButtonElement>) => {
    const dragState = dragStateRef.current;
    const scale = getRenderedScale();
    if (!dragState || !imageBounds || !scale || dragState.pointerId !== event.pointerId) return;
    event.preventDefault();

    const nextCrop = moveSocialPreviewCrop(
      dragState.crop,
      imageBounds,
      {
        x: (event.clientX - dragState.startX) * scale.x,
        y: (event.clientY - dragState.startY) * scale.y,
      },
    );
    setCrop(nextCrop);
  };

  const handlePointerEnd = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (dragStateRef.current?.pointerId === event.pointerId) {
      dragStateRef.current = null;
    }
  };

  const updateCropPercent = (axis: "x" | "y", value: string) => {
    if (!crop || !imageBounds) return;
    const percent = Number(value) / 100;
    const maxOffset = axis === "x"
      ? Math.max(0, imageBounds.width - crop.width)
      : Math.max(0, imageBounds.height - crop.height);

    setCrop(clampSocialPreviewCrop(
      {
        ...crop,
        [axis]: maxOffset * percent,
      },
      imageBounds,
    ));
  };

  const updateCropSize = (value: string) => {
    if (!crop || !imageBounds) return;
    const nextSizePercent = Number(value);
    setCropSizePercent(nextSizePercent);
    setCrop(resizeSocialPreviewCrop(crop, imageBounds, nextSizePercent));
  };

  const handleConfirm = async () => {
    const image = imageRef.current;
    if (!image || !crop) return;

    setIsProcessing(true);
    setError("");
    try {
      const croppedFile = await createSocialPreviewFile(image, crop);
      onConfirm(croppedFile);
    } catch (err) {
      setError(err instanceof Error ? err.message : "이미지 자르기에 실패했습니다.");
    } finally {
      setIsProcessing(false);
    }
  };

  const cropStyle = crop && imageBounds
    ? {
        left: `${(crop.x / imageBounds.width) * 100}%`,
        top: `${(crop.y / imageBounds.height) * 100}%`,
        width: `${(crop.width / imageBounds.width) * 100}%`,
        height: `${(crop.height / imageBounds.height) * 100}%`,
      }
    : undefined;
  const horizontalMax = crop && imageBounds ? Math.max(0, imageBounds.width - crop.width) : 0;
  const verticalMax = crop && imageBounds ? Math.max(0, imageBounds.height - crop.height) : 0;
  const horizontalValue = crop && horizontalMax > 0 ? Math.round((crop.x / horizontalMax) * 100) : 0;
  const verticalValue = crop && verticalMax > 0 ? Math.round((crop.y / verticalMax) * 100) : 0;

  return (
    <div className="fixed inset-0 z-[220] flex items-center justify-center bg-black/55 px-4 py-6">
      <div className="w-full max-w-3xl rounded-2xl border border-stone-surface bg-warm-canvas p-4 shadow-2xl sm:p-5">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-black text-charcoal-primary">{title}</h2>
            <p className="mt-1 text-[11px] font-medium text-graphite">
              1.91:1 박스를 드래그해서 카톡에 보일 영역을 맞춰줘.
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-stone-surface bg-white px-3 py-1.5 text-[11px] font-bold text-graphite"
          >
            닫기
          </button>
        </div>

        <div className="overflow-hidden rounded-xl border border-stone-surface bg-black">
          <div className="flex max-h-[62vh] w-full justify-center bg-black">
            <div className="relative max-h-[62vh] max-w-full select-none">
              <img
                ref={imageRef}
                src={objectUrl}
                alt=""
                onLoad={handleImageLoad}
                className="block max-h-[62vh] max-w-full object-contain"
              />
              {cropStyle ? (
                <button
                  type="button"
                  aria-label="카톡 미리보기 크롭 영역 드래그"
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerEnd}
                  onPointerCancel={handlePointerEnd}
                  className="absolute inset-0 cursor-move touch-none bg-black/35 p-0"
                >
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute border-2 border-white bg-transparent p-0 shadow-[0_0_0_9999px_rgba(0,0,0,0.35)] outline outline-1 outline-black/30"
                    style={cropStyle}
                  >
                    <span className="absolute left-2 top-2 rounded-full bg-black/65 px-2 py-0.5 text-[10px] font-bold text-white">
                      1.91:1
                    </span>
                  </div>
                </button>
              ) : null}
                </div>
          </div>
        </div>

        {crop && imageBounds ? (
          <div className="mt-4 grid gap-3 rounded-xl border border-stone-surface bg-white px-3 py-3 sm:grid-cols-3">
            <label className="text-[11px] font-bold text-charcoal-primary">
              크롭 크기
              <input
                type="range"
                min="35"
                max="100"
                value={cropSizePercent}
                onChange={(event) => updateCropSize(event.target.value)}
                className="mt-2 block w-full accent-midnight"
              />
            </label>
            <label className="text-[11px] font-bold text-charcoal-primary">
              가로 위치
              <input
                type="range"
                min="0"
                max="100"
                value={horizontalValue}
                disabled={horizontalMax === 0}
                onChange={(event) => updateCropPercent("x", event.target.value)}
                className="mt-2 block w-full accent-midnight disabled:opacity-35"
              />
            </label>
            <label className="text-[11px] font-bold text-charcoal-primary">
              세로 위치
              <input
                type="range"
                min="0"
                max="100"
                value={verticalValue}
                disabled={verticalMax === 0}
                onChange={(event) => updateCropPercent("y", event.target.value)}
                className="mt-2 block w-full accent-midnight disabled:opacity-35"
              />
            </label>
          </div>
        ) : null}

        {error ? (
          <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-[11px] font-bold text-red-600">{error}</p>
        ) : null}

        <div className="mt-4 flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isProcessing}
            className="rounded-full"
          >
            취소
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={isProcessing || !crop}
            className="rounded-full bg-midnight text-white hover:bg-black"
          >
            {isProcessing ? "처리 중..." : "대표 이미지 적용"}
          </Button>
        </div>
      </div>
    </div>
  );
}
