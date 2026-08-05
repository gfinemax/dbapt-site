"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { TouchEvent } from "react";
import type { PDFDocumentProxy, PDFPageProxy, RenderTask } from "pdfjs-dist";

type PdfCanvasViewerProps = {
  sourceUrl: string;
  fileName: string;
  className?: string;
};

type PdfContinuousPageProps = {
  pdfDocument: PDFDocumentProxy;
  fileName: string;
  pageNumber: number;
  availableWidth: number;
  renderZoom: number;
  scrollRoot: HTMLDivElement | null;
  onVisibilityChange: (pageNumber: number, ratio: number) => void;
};

const MIN_ZOOM = 0.75;
const MAX_RENDER_ZOOM = 3;

function clampZoom(value: number) {
  return Math.max(MIN_ZOOM, value);
}

function PdfContinuousPage({
  pdfDocument,
  fileName,
  pageNumber,
  availableWidth,
  renderZoom,
  scrollRoot,
  onVisibilityChange,
}: PdfContinuousPageProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRefs = useRef<[HTMLCanvasElement | null, HTMLCanvasElement | null]>([null, null]);
  const activeCanvasIndexRef = useRef(0);
  const hasVisibleCanvasRef = useRef(false);
  const [isNearViewport, setIsNearViewport] = useState(
    () => pageNumber <= 2 || typeof IntersectionObserver === "undefined",
  );
  const [pageSize, setPageSize] = useState({ width: 0, height: 560 });
  const [isRendering, setIsRendering] = useState(false);

  useEffect(() => {
    if (!isNearViewport) {
      activeCanvasIndexRef.current = 0;
      hasVisibleCanvasRef.current = false;
    }
  }, [isNearViewport]);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper || !scrollRoot) return;
    if (typeof IntersectionObserver === "undefined") return;

    const preloadObserver = new IntersectionObserver(
      ([entry]) => {
        setIsNearViewport(entry.isIntersecting);
      },
      { root: scrollRoot, rootMargin: "900px 0px" },
    );
    const visibilityObserver = new IntersectionObserver(
      ([entry]) => onVisibilityChange(pageNumber, entry.intersectionRatio),
      { root: scrollRoot, threshold: [0, 0.15, 0.4, 0.7] },
    );
    preloadObserver.observe(wrapper);
    visibilityObserver.observe(wrapper);
    return () => {
      preloadObserver.disconnect();
      visibilityObserver.disconnect();
      onVisibilityChange(pageNumber, 0);
    };
  }, [onVisibilityChange, pageNumber, scrollRoot]);

  useEffect(() => {
    if (!isNearViewport || !canvasRefs.current[0] || !canvasRefs.current[1] || availableWidth <= 0) return;

    let active = true;
    let page: PDFPageProxy | null = null;
    let renderTask: RenderTask | null = null;

    async function renderPage() {
      setIsRendering(true);
      try {
        page = await pdfDocument.getPage(pageNumber);
        const baseViewport = page.getViewport({ scale: 1 });
        const fitScale = Math.min(1.75, Math.max(0.35, availableWidth / baseViewport.width));
        const displayViewport = page.getViewport({ scale: fitScale });
        const renderViewport = page.getViewport({ scale: fitScale * Math.min(renderZoom, MAX_RENDER_ZOOM) });
        const previousCanvasIndex = activeCanvasIndexRef.current;
        const nextCanvasIndex = hasVisibleCanvasRef.current ? 1 - previousCanvasIndex : previousCanvasIndex;
        const previousCanvas = canvasRefs.current[previousCanvasIndex];
        const canvas = canvasRefs.current[nextCanvasIndex]!;
        const outputScale = Math.min(window.devicePixelRatio || 1, 2);

        setPageSize({ width: Math.floor(displayViewport.width), height: Math.floor(displayViewport.height) });
        canvas.style.opacity = "0";
        canvas.width = Math.floor(renderViewport.width * outputScale);
        canvas.height = Math.floor(renderViewport.height * outputScale);
        canvas.style.width = `${Math.floor(displayViewport.width)}px`;
        canvas.style.height = `${Math.floor(displayViewport.height)}px`;
        renderTask = page.render({
          canvas,
          viewport: renderViewport,
          transform: outputScale === 1 ? undefined : [outputScale, 0, 0, outputScale, 0, 0],
        });
        await renderTask.promise;
        if (!active) return;

        canvas.style.transition = hasVisibleCanvasRef.current ? "opacity 180ms ease-out" : "none";
        canvas.style.opacity = "1";
        if (hasVisibleCanvasRef.current && previousCanvas && previousCanvas !== canvas) {
          previousCanvas.style.transition = "opacity 180ms ease-out";
          previousCanvas.style.opacity = "0";
        }
        activeCanvasIndexRef.current = nextCanvasIndex;
        hasVisibleCanvasRef.current = true;
      } catch (renderError) {
        if (renderError instanceof Error && renderError.name === "RenderingCancelledException") return;
        console.error(`PDF page ${pageNumber} render error:`, renderError);
      } finally {
        if (active) setIsRendering(false);
        page?.cleanup();
      }
    }

    void renderPage();
    return () => {
      active = false;
      renderTask?.cancel();
      page?.cleanup();
    };
  }, [availableWidth, isNearViewport, pageNumber, pdfDocument, renderZoom]);

  return (
    <div
      ref={wrapperRef}
      data-pdf-page={pageNumber}
      role="img"
      aria-label={`${fileName} ${pageNumber}쪽`}
      className="relative mx-auto flex shrink-0 items-start justify-center"
      style={{ width: `${Math.max(pageSize.width, Math.min(availableWidth, 320))}px`, minHeight: `${pageSize.height}px` }}
    >
      {isNearViewport ? (
        <>
          {[0, 1].map((canvasIndex) => (
            <canvas
              key={canvasIndex}
              ref={(canvas) => { canvasRefs.current[canvasIndex as 0 | 1] = canvas; }}
              aria-hidden="true"
              className="absolute left-0 top-0 block max-w-none bg-white opacity-0 shadow-[0_1px_8px_rgba(0,0,0,0.16)]"
            />
          ))}
        </>
      ) : (
        <div aria-hidden="true" className="h-full w-full bg-white/65 shadow-sm" />
      )}
      {isRendering ? (
        <span className="absolute top-3 rounded-full bg-midnight/80 px-3 py-1 text-[10px] font-bold text-white">
          {pageNumber}쪽 표시 중…
        </span>
      ) : null}
      <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] font-semibold text-ash">
        {pageNumber}
      </span>
    </div>
  );
}

export function PdfCanvasViewer({ sourceUrl, fileName, className = "" }: PdfCanvasViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const pagesRef = useRef<HTMLDivElement>(null);
  const visibleRatiosRef = useRef(new Map<number, number>());
  const pinchFrameRef = useRef<number | null>(null);
  const pinchRef = useRef<{
    distance: number;
    zoom: number;
    previewZoom: number;
    scrollLeft: number;
    scrollTop: number;
    midpointX: number;
    midpointY: number;
  } | null>(null);
  const [pdfDocument, setPdfDocument] = useState<PDFDocumentProxy | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageInput, setPageInput] = useState("1");
  const [zoom, setZoom] = useState(1);
  const [loadPercent, setLoadPercent] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const [scrollRoot, setScrollRoot] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    setScrollRoot(scrollRef.current);
  }, [pdfDocument]);

  useEffect(() => {
    pagesRef.current?.style.setProperty("zoom", String(zoom));
  }, [zoom]);

  useEffect(() => () => {
    if (pinchFrameRef.current !== null) cancelAnimationFrame(pinchFrameRef.current);
  }, []);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const updateWidth = () => setContainerWidth(element.clientWidth || window.innerWidth);
    updateWidth();
    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", updateWidth);
      return () => window.removeEventListener("resize", updateWidth);
    }
    const observer = new ResizeObserver(updateWidth);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let active = true;
    let loadedDocument: PDFDocumentProxy | null = null;

    async function loadPdf() {
      setError(null);
      setLoadPercent(null);
      setPdfDocument(null);
      setCurrentPage(1);
      setPageInput("1");
      setZoom(1);
      visibleRatiosRef.current.clear();

      try {
        const pdfjs = await import("pdfjs-dist/webpack.mjs");
        const loadingTask = pdfjs.getDocument({ url: sourceUrl, withCredentials: true });
        loadingTask.onProgress = ({ loaded, total }: { loaded: number; total: number }) => {
          if (active && total > 0) setLoadPercent(Math.min(100, Math.round((loaded / total) * 100)));
        };
        const nextDocument = await loadingTask.promise;
        loadedDocument = nextDocument;
        if (active) {
          setPdfDocument(nextDocument);
          setLoadPercent(100);
        } else {
          await nextDocument.destroy();
        }
      } catch (loadError) {
        console.error("PDF load error:", loadError);
        if (active) setError("PDF를 불러오지 못했어. 네트워크를 확인하고 다시 시도해 줘.");
      }
    }

    void loadPdf();
    return () => {
      active = false;
      if (loadedDocument) void loadedDocument.destroy();
    };
  }, [reloadKey, sourceUrl]);

  const handleVisibilityChange = useCallback((pageNumber: number, ratio: number) => {
    if (ratio > 0) visibleRatiosRef.current.set(pageNumber, ratio);
    else visibleRatiosRef.current.delete(pageNumber);

    let nextPage = pageNumber;
    let highestRatio = -1;
    for (const [visiblePage, visibleRatio] of visibleRatiosRef.current) {
      if (visibleRatio > highestRatio) {
        nextPage = visiblePage;
        highestRatio = visibleRatio;
      }
    }
    setCurrentPage(nextPage);
    setPageInput(String(nextPage));
  }, []);

  const pageNumbers = useMemo(
    () => (pdfDocument ? Array.from({ length: pdfDocument.numPages }, (_, index) => index + 1) : []),
    [pdfDocument],
  );

  const goToPage = useCallback(
    (requestedPage: number) => {
      if (!pdfDocument) return;
      const nextPage = Math.min(pdfDocument.numPages, Math.max(1, Math.round(requestedPage)));
      setCurrentPage(nextPage);
      setPageInput(String(nextPage));
      scrollRef.current?.querySelector<HTMLElement>(`[data-pdf-page="${nextPage}"]`)?.scrollIntoView({ block: "start" });
    },
    [pdfDocument],
  );

  const commitPageInput = () => {
    const parsed = Number(pageInput);
    if (Number.isFinite(parsed)) goToPage(parsed);
    else setPageInput(String(currentPage));
  };

  const touchDistance = (touches: TouchEvent<HTMLDivElement>["touches"]) => {
    const first = touches[0];
    const second = touches[1];
    if (!first || !second) return 0;
    return Math.hypot(second.clientX - first.clientX, second.clientY - first.clientY);
  };

  const touchMidpoint = (event: TouchEvent<HTMLDivElement>) => {
    const first = event.touches[0];
    const second = event.touches[1];
    const bounds = event.currentTarget.getBoundingClientRect();
    return {
      x: ((first?.clientX ?? 0) + (second?.clientX ?? 0)) / 2 - bounds.left,
      y: ((first?.clientY ?? 0) + (second?.clientY ?? 0)) / 2 - bounds.top,
    };
  };

  const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    if (event.touches.length !== 2) return;
    const midpoint = touchMidpoint(event);
    pinchRef.current = {
      distance: touchDistance(event.touches),
      zoom,
      previewZoom: zoom,
      scrollLeft: event.currentTarget.scrollLeft,
      scrollTop: event.currentTarget.scrollTop,
      midpointX: midpoint.x,
      midpointY: midpoint.y,
    };
  };

  const handleTouchMove = (event: TouchEvent<HTMLDivElement>) => {
    if (event.touches.length !== 2 || !pinchRef.current) return;
    event.preventDefault();
    const distance = touchDistance(event.touches);
    if (distance <= 0 || pinchRef.current.distance <= 0) return;
    const nextZoom = clampZoom(pinchRef.current.zoom * (distance / pinchRef.current.distance));
    pinchRef.current.previewZoom = Number(nextZoom.toFixed(3));

    if (pinchFrameRef.current !== null) cancelAnimationFrame(pinchFrameRef.current);
    const pinch = pinchRef.current;
    const scrollElement = event.currentTarget;
    pinchFrameRef.current = requestAnimationFrame(() => {
      const ratio = pinch.previewZoom / pinch.zoom;
      pagesRef.current?.style.setProperty("zoom", String(pinch.previewZoom));
      scrollElement.scrollLeft = (pinch.scrollLeft + pinch.midpointX) * ratio - pinch.midpointX;
      scrollElement.scrollTop = (pinch.scrollTop + pinch.midpointY) * ratio - pinch.midpointY;
      pinchFrameRef.current = null;
    });
  };

  const handleTouchEnd = () => {
    const nextZoom = pinchRef.current?.previewZoom;
    if (nextZoom !== undefined) setZoom(nextZoom);
    pinchRef.current = null;
  };

  const availableWidth = Math.max(280, containerWidth - 32);

  return (
    <div
      ref={containerRef}
      data-testid="pdf-canvas-viewer"
      data-source-url={sourceUrl}
      className={`flex min-h-0 w-full flex-col overflow-hidden bg-[#f0ede9] ${className}`}
    >
      {error ? (
        <div role="alert" className="m-auto w-[calc(100%-32px)] max-w-md rounded-2xl border border-stone-surface bg-white p-6 text-center shadow-sm">
          <p className="text-sm font-bold text-charcoal-primary">{error}</p>
          <button type="button" onClick={() => setReloadKey((value) => value + 1)} className="mt-4 min-h-11 rounded-full bg-midnight px-5 text-xs font-bold text-white">
            다시 시도
          </button>
        </div>
      ) : !pdfDocument ? (
        <div role="status" aria-live="polite" className="m-auto flex flex-col items-center gap-4 px-6 text-center">
          <div className="size-11 animate-spin rounded-full border-4 border-midnight border-t-transparent" />
          <div>
            <p className="text-sm font-bold text-charcoal-primary">PDF를 온라인으로 불러오는 중이야</p>
            <p className="mt-1 text-xs text-ash">
              {loadPercent === null ? "파일 크기에 따라 잠시 걸릴 수 있어." : `${loadPercent}% 불러왔어.`}
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="flex shrink-0 flex-wrap items-center justify-center gap-1.5 border-b border-stone-surface bg-white p-2 sm:gap-2">
            <button type="button" disabled={currentPage <= 1} onClick={() => goToPage(currentPage - 1)} className="min-h-9 rounded-full bg-stone-surface px-3 text-[11px] font-bold disabled:opacity-40">
              이전
            </button>
            <label className="flex min-h-9 items-center gap-1 rounded-full bg-parchment-card px-2 text-[11px] font-bold text-charcoal-primary">
              <span className="sr-only">이동할 페이지</span>
              <input
                type="number"
                inputMode="numeric"
                min={1}
                max={pdfDocument.numPages}
                value={pageInput}
                onChange={(event) => setPageInput(event.target.value)}
                onBlur={commitPageInput}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    commitPageInput();
                    event.currentTarget.blur();
                  }
                }}
                className="h-7 w-9 rounded-md border border-stone-surface bg-white text-center text-[11px] font-black outline-none focus:border-sky-blue"
              />
              <span>/ {pdfDocument.numPages}</span>
            </label>
            <button type="button" disabled={currentPage >= pdfDocument.numPages} onClick={() => goToPage(currentPage + 1)} className="min-h-9 rounded-full bg-stone-surface px-3 text-[11px] font-bold disabled:opacity-40">
              다음
            </button>
            <span className="mx-0.5 hidden h-5 w-px bg-stone-surface sm:block" aria-hidden="true" />
            <button type="button" disabled={zoom <= MIN_ZOOM} onClick={() => setZoom((value) => clampZoom(Number((value - 0.25).toFixed(2))))} aria-label="축소" className="size-9 rounded-full bg-stone-surface text-lg font-bold disabled:opacity-40">−</button>
            <button type="button" onClick={() => setZoom(1)} aria-label="화면 너비에 맞춤" className="min-h-9 rounded-full bg-parchment-card px-2.5 text-[10px] font-bold text-graphite">
              {Math.round(zoom * 100)}%
            </button>
            <button type="button" onClick={() => setZoom((value) => clampZoom(Number((value + 0.25).toFixed(2))))} aria-label="확대" className="size-9 rounded-full bg-stone-surface text-lg font-bold">+</button>
          </div>
          <div
            ref={scrollRef}
            data-testid="pdf-continuous-scroll"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={handleTouchEnd}
            className="relative min-h-0 flex-1 touch-pan-x touch-pan-y overflow-auto overscroll-contain px-2 py-4 sm:px-4"
          >
            <p className="sr-only" aria-live="polite">현재 {currentPage}쪽, 전체 {pdfDocument.numPages}쪽</p>
            <div ref={pagesRef} className="flex min-w-max flex-col items-center gap-9 pb-8 [transform-origin:top_left]">
              {pageNumbers.map((pageNumber) => (
                <PdfContinuousPage
                  key={pageNumber}
                  pdfDocument={pdfDocument}
                  fileName={fileName}
                  pageNumber={pageNumber}
                  availableWidth={availableWidth}
                  renderZoom={zoom}
                  scrollRoot={scrollRoot}
                  onVisibilityChange={handleVisibilityChange}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
