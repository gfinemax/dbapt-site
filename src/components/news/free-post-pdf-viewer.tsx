"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { PdfCanvasViewer } from "@/components/pdf/pdf-canvas-viewer";

type FreePostPdfViewerProps = {
  postId: string;
  title: string;
  fileName: string;
  fileSize: number | null;
};

function formatFileSize(size: number | null) {
  if (!size) return null;
  if (size < 1024 * 1024) return `${Math.max(1, Math.round(size / 1024)).toLocaleString("ko-KR")}KB`;
  return `${(size / (1024 * 1024)).toFixed(1)}MB`;
}

export function FreePostPdfViewer({ postId, title, fileName, fileSize }: FreePostPdfViewerProps) {
  const [isConfirmingDownload, setIsConfirmingDownload] = useState(false);
  const [areControlsVisible, setAreControlsVisible] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isImmersiveFallback, setIsImmersiveFallback] = useState(false);
  const viewerRef = useRef<HTMLElement>(null);
  const controlsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const viewUrl = `/api/news/free/${encodeURIComponent(postId)}/attachment/view`;
  const downloadUrl = `/api/news/free/${encodeURIComponent(postId)}/attachment/download`;
  const sizeLabel = formatFileSize(fileSize);

  const revealControls = useCallback(() => {
    setAreControlsVisible(true);
    if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
    controlsTimerRef.current = setTimeout(() => setAreControlsVisible(false), 1800);
  }, []);

  useEffect(() => {
    controlsTimerRef.current = setTimeout(() => setAreControlsVisible(false), 1800);
    const handleFullscreenChange = () => setIsFullscreen(document.fullscreenElement === viewerRef.current);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = async () => {
    revealControls();
    if (isImmersiveFallback) {
      setIsImmersiveFallback(false);
      return;
    }
    if (document.fullscreenElement) {
      try {
        await document.exitFullscreen?.();
      } catch {
        // 브라우저가 이미 전체화면을 종료한 경우 로컬 상태만 정리한다.
      }
      setIsImmersiveFallback(false);
      return;
    }
    try {
      if (!viewerRef.current?.requestFullscreen) throw new Error("Fullscreen API unavailable");
      await viewerRef.current.requestFullscreen();
      setIsImmersiveFallback(false);
    } catch {
      setIsImmersiveFallback((value) => !value);
    }
  };

  return (
    <main
      ref={viewerRef}
      data-testid="free-post-pdf-viewer"
      data-immersive={isFullscreen || isImmersiveFallback ? "true" : "false"}
      onPointerDown={revealControls}
      onFocus={revealControls}
      tabIndex={0}
      aria-label="PDF 전체 화면 열람"
      className={`fixed inset-0 z-[100] flex h-[100svh] flex-col overflow-hidden bg-warm-canvas text-charcoal-primary ${isImmersiveFallback ? "z-[9999]" : ""}`}
    >
      <header
        data-testid="free-post-pdf-header"
        aria-hidden={!areControlsVisible}
        inert={!areControlsVisible}
        className={`absolute inset-x-2 top-2 z-30 rounded-2xl border border-stone-surface bg-warm-canvas/95 px-3 py-3 shadow-lg backdrop-blur transition duration-200 motion-reduce:transition-none sm:inset-x-4 sm:px-6 ${
          areControlsVisible ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-3 opacity-0"
        }`}
        onPointerDown={(event) => event.stopPropagation()}
      >
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-black">{title}</p>
            <p className="mt-0.5 truncate text-[11px] font-medium text-ash">
              {fileName}{sizeLabel ? ` · ${sizeLabel}` : ""}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => void toggleFullscreen()}
              aria-label={isFullscreen || isImmersiveFallback ? "전체화면 종료" : "전체화면"}
              className="inline-flex size-10 items-center justify-center rounded-full border border-stone-surface bg-white text-lg font-bold text-graphite transition hover:bg-stone-surface focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-sky-blue/30"
            >
              {isFullscreen || isImmersiveFallback ? "↙" : "⛶"}
            </button>
            <button
              type="button"
              onClick={() => setIsConfirmingDownload(true)}
              className="inline-flex min-h-10 items-center justify-center rounded-full border border-stone-surface bg-white px-3 text-[11px] font-bold text-graphite transition hover:bg-stone-surface focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-sky-blue/30 sm:px-4 sm:text-xs"
            >
              원본 다운로드
            </button>
          </div>
        </div>
      </header>

      <section aria-label="PDF 온라인 열람" className="min-h-0 w-full flex-1 p-0 sm:p-2 landscape:p-0">
        <PdfCanvasViewer
          sourceUrl={viewUrl}
          fileName={fileName}
          controlsTopOffset={areControlsVisible ? 88 : 8}
          className="h-full border-stone-surface sm:rounded-2xl sm:border landscape:rounded-none landscape:border-0"
        />
      </section>

      {isConfirmingDownload ? (
        <div role="dialog" aria-modal="true" aria-labelledby="free-post-download-title" className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-3xl border border-stone-surface bg-white p-5 shadow-2xl">
            <h2 id="free-post-download-title" className="text-base font-bold">이 파일을 다운로드할까?</h2>
            <p className="mt-2 break-all text-sm font-semibold text-graphite">{fileName}</p>
            {sizeLabel ? <p className="mt-1 text-xs text-ash">파일 크기 {sizeLabel}</p> : null}
            <p className="mt-4 rounded-2xl bg-parchment-card px-4 py-3 text-xs leading-5 text-graphite">
              모바일 데이터 이용 중이면 파일 크기만큼 데이터가 사용될 수 있어.
            </p>
            <div className="mt-5 grid grid-cols-2 gap-2">
              <button type="button" onClick={() => setIsConfirmingDownload(false)} className="min-h-11 rounded-full border border-stone-surface text-sm font-bold">
                취소
              </button>
              <a href={downloadUrl} onClick={() => setIsConfirmingDownload(false)} className="inline-flex min-h-11 items-center justify-center rounded-full bg-midnight text-sm font-bold text-white">
                다운로드
              </a>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
