"use client";

import { useEffect, useRef, useState } from "react";
import type { PDFDocumentProxy, PDFPageProxy, RenderTask } from "pdfjs-dist";

type PdfCanvasViewerProps = {
  sourceUrl: string;
  fileName: string;
  className?: string;
};

export function PdfCanvasViewer({ sourceUrl, fileName, className = "" }: PdfCanvasViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [pdfDocument, setPdfDocument] = useState<PDFDocumentProxy | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [loadPercent, setLoadPercent] = useState<number | null>(null);
  const [isRendering, setIsRendering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);

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
      setPageNumber(1);
      setZoom(1);

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

  useEffect(() => {
    if (!pdfDocument || !canvasRef.current || containerWidth <= 0) return;

    let active = true;
    let page: PDFPageProxy | null = null;
    let renderTask: RenderTask | null = null;

    async function renderPage() {
      setIsRendering(true);
      try {
        page = await pdfDocument!.getPage(pageNumber);
        const baseViewport = page.getViewport({ scale: 1 });
        const availableWidth = Math.max(280, containerWidth - 32);
        const responsiveScale = Math.min(1.6, availableWidth / baseViewport.width);
        const viewport = page.getViewport({ scale: responsiveScale * zoom });
        const canvas = canvasRef.current!;
        const outputScale = Math.min(window.devicePixelRatio || 1, 2);

        canvas.width = Math.floor(viewport.width * outputScale);
        canvas.height = Math.floor(viewport.height * outputScale);
        canvas.style.width = `${Math.floor(viewport.width)}px`;
        canvas.style.height = `${Math.floor(viewport.height)}px`;
        renderTask = page.render({
          canvas,
          viewport,
          transform: outputScale === 1 ? undefined : [outputScale, 0, 0, outputScale, 0, 0],
        });
        await renderTask.promise;
      } catch (renderError) {
        if (renderError instanceof Error && renderError.name === "RenderingCancelledException") return;
        console.error("PDF render error:", renderError);
        if (active) setError("이 페이지를 표시하지 못했어. 다시 시도해 줘.");
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
  }, [containerWidth, pdfDocument, pageNumber, zoom]);

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
          <button
            type="button"
            onClick={() => setReloadKey((value) => value + 1)}
            className="mt-4 min-h-11 rounded-full bg-midnight px-5 text-xs font-bold text-white"
          >
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
          <div className="flex shrink-0 flex-wrap items-center justify-center gap-2 border-b border-stone-surface bg-white p-2">
            <button type="button" disabled={pageNumber <= 1} onClick={() => setPageNumber((value) => Math.max(1, value - 1))} className="min-h-9 rounded-full bg-stone-surface px-3 text-[11px] font-bold disabled:opacity-40">
              이전
            </button>
            <span aria-live="polite" className="min-w-20 text-center text-[11px] font-black text-charcoal-primary">
              {pageNumber} / {pdfDocument.numPages}쪽
            </span>
            <button type="button" disabled={pageNumber >= pdfDocument.numPages} onClick={() => setPageNumber((value) => Math.min(pdfDocument.numPages, value + 1))} className="min-h-9 rounded-full bg-stone-surface px-3 text-[11px] font-bold disabled:opacity-40">
              다음
            </button>
            <span className="mx-1 hidden h-5 w-px bg-stone-surface sm:block" aria-hidden="true" />
            <button type="button" disabled={zoom <= 0.75} onClick={() => setZoom((value) => Math.max(0.75, Number((value - 0.25).toFixed(2))))} aria-label="축소" className="size-9 rounded-full bg-stone-surface text-lg font-bold disabled:opacity-40">−</button>
            <span className="w-10 text-center text-[10px] font-bold text-graphite">{Math.round(zoom * 100)}%</span>
            <button type="button" disabled={zoom >= 2} onClick={() => setZoom((value) => Math.min(2, Number((value + 0.25).toFixed(2))))} aria-label="확대" className="size-9 rounded-full bg-stone-surface text-lg font-bold disabled:opacity-40">+</button>
          </div>
          <div className="relative min-h-0 flex-1 overflow-auto p-2 sm:p-4">
            {isRendering ? (
              <div role="status" className="sticky top-2 z-10 mx-auto mb-[-28px] w-fit rounded-full bg-midnight/85 px-3 py-1.5 text-[10px] font-bold text-white">
                {pageNumber}쪽 표시 중…
              </div>
            ) : null}
            <canvas ref={canvasRef} className="mx-auto block max-w-none bg-white shadow-sm" aria-label={`${fileName} ${pageNumber}쪽`} />
          </div>
        </>
      )}
    </div>
  );
}
