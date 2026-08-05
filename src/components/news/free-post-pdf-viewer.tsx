"use client";

import { useEffect, useRef, useState } from "react";
import type { PDFDocumentProxy, PDFPageProxy, RenderTask } from "pdfjs-dist";

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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [document, setDocument] = useState<PDFDocumentProxy | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [loadPercent, setLoadPercent] = useState<number | null>(null);
  const [isRendering, setIsRendering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const viewUrl = `/api/news/free/${encodeURIComponent(postId)}/attachment/view`;
  const downloadUrl = `/api/news/free/${encodeURIComponent(postId)}/attachment/download`;

  useEffect(() => {
    let active = true;
    let loadedDocument: PDFDocumentProxy | null = null;

    async function loadPdf() {
      setError(null);
      setLoadPercent(null);
      setDocument(null);
      setPageNumber(1);

      try {
        const pdfjs = await import("pdfjs-dist/webpack.mjs");
        const loadingTask = pdfjs.getDocument({ url: viewUrl, withCredentials: true });
        loadingTask.onProgress = ({ loaded, total }: { loaded: number; total: number }) => {
          if (active && total > 0) setLoadPercent(Math.min(100, Math.round((loaded / total) * 100)));
        };
        const pdfDocument = await loadingTask.promise;
        loadedDocument = pdfDocument;
        if (active) {
          setDocument(pdfDocument);
          setLoadPercent(100);
        } else {
          await pdfDocument.destroy();
        }
      } catch (loadError) {
        console.error("Free-post PDF load error:", loadError);
        if (active) setError("PDF를 불러오지 못했어. 네트워크를 확인하고 다시 시도해 줘.");
      }
    }

    void loadPdf();
    return () => {
      active = false;
      if (loadedDocument) void loadedDocument.destroy();
    };
  }, [reloadKey, viewUrl]);

  useEffect(() => {
    if (!document || !canvasRef.current) return;

    let active = true;
    let page: PDFPageProxy | null = null;
    let renderTask: RenderTask | null = null;

    async function renderPage() {
      setIsRendering(true);
      try {
        page = await document!.getPage(pageNumber);
        const baseViewport = page.getViewport({ scale: 1 });
        const availableWidth = Math.max(280, Math.min(window.innerWidth - 48, 960));
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
        console.error("Free-post PDF render error:", renderError);
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
  }, [document, pageNumber, zoom]);

  const sizeLabel = formatFileSize(fileSize);

  return (
    <main className="fixed inset-0 z-[100] min-h-dvh overflow-y-auto bg-warm-canvas text-charcoal-primary">
      <header className="sticky top-0 z-20 border-b border-stone-surface bg-warm-canvas/95 px-3 py-3 backdrop-blur sm:px-6">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-black">{title}</p>
            <p className="mt-0.5 truncate text-[11px] font-medium text-ash">
              {fileName}{sizeLabel ? ` · ${sizeLabel}` : ""}
            </p>
          </div>
          <a
            href={downloadUrl}
            className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-full border border-stone-surface bg-white px-4 text-xs font-bold text-graphite transition hover:bg-stone-surface focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-sky-blue/30"
          >
            원본 다운로드
          </a>
        </div>
      </header>

      <section aria-label="PDF 온라인 열람" className="mx-auto flex max-w-5xl flex-col items-center px-3 py-4 sm:px-6">
        {error ? (
          <div role="alert" className="mt-12 w-full max-w-md rounded-2xl border border-stone-surface bg-white p-6 text-center shadow-sm">
            <p className="text-sm font-bold">{error}</p>
            <div className="mt-4 flex flex-col justify-center gap-2 sm:flex-row">
              <button
                type="button"
                onClick={() => setReloadKey((value) => value + 1)}
                className="min-h-11 rounded-full bg-midnight px-5 text-xs font-bold text-white"
              >
                다시 시도
              </button>
              <a href={downloadUrl} className="inline-flex min-h-11 items-center justify-center rounded-full bg-stone-surface px-5 text-xs font-bold">
                원본 다운로드
              </a>
            </div>
          </div>
        ) : !document ? (
          <div role="status" aria-live="polite" className="mt-16 flex flex-col items-center gap-4 text-center">
            <div className="size-11 animate-spin rounded-full border-4 border-midnight border-t-transparent" />
            <div>
              <p className="text-sm font-bold">PDF를 불러오는 중이야</p>
              <p className="mt-1 text-xs text-ash">
                {loadPercent === null ? "파일 크기에 따라 잠시 걸릴 수 있어." : `${loadPercent}% 내려받았어.`}
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-3 flex w-full flex-col items-center justify-center gap-2 rounded-2xl border border-stone-surface bg-white p-2 shadow-sm sm:flex-row">
              <div className="flex w-full items-center justify-center gap-2 sm:w-auto">
                <button
                  type="button"
                  disabled={pageNumber <= 1}
                  onClick={() => setPageNumber((value) => Math.max(1, value - 1))}
                  className="min-h-10 rounded-full bg-stone-surface px-4 text-xs font-bold disabled:opacity-40"
                >
                  이전
                </button>
                <span aria-live="polite" className="min-w-24 text-center text-xs font-black">
                  {pageNumber} / {document.numPages}쪽
                </span>
                <button
                  type="button"
                  disabled={pageNumber >= document.numPages}
                  onClick={() => setPageNumber((value) => Math.min(document.numPages, value + 1))}
                  className="min-h-10 rounded-full bg-stone-surface px-4 text-xs font-bold disabled:opacity-40"
                >
                  다음
                </button>
              </div>
              <span className="hidden h-6 w-px bg-stone-surface sm:block" aria-hidden="true" />
              <div className="flex w-full items-center justify-center gap-2 sm:w-auto">
                <button
                  type="button"
                  disabled={zoom <= 0.75}
                  onClick={() => setZoom((value) => Math.max(0.75, Number((value - 0.25).toFixed(2))))}
                  aria-label="축소"
                  className="size-10 rounded-full bg-stone-surface text-lg font-bold disabled:opacity-40"
                >
                  −
                </button>
                <span className="w-12 text-center text-[11px] font-bold">{Math.round(zoom * 100)}%</span>
                <button
                  type="button"
                  disabled={zoom >= 2}
                  onClick={() => setZoom((value) => Math.min(2, Number((value + 0.25).toFixed(2))))}
                  aria-label="확대"
                  className="size-10 rounded-full bg-stone-surface text-lg font-bold disabled:opacity-40"
                >
                  +
                </button>
              </div>
            </div>

            <div className="relative w-full overflow-auto rounded-2xl border border-stone-surface bg-[#e8e5df] p-2 sm:p-4">
              {isRendering ? (
                <div role="status" className="absolute inset-x-0 top-4 z-10 mx-auto w-fit rounded-full bg-midnight/85 px-3 py-1.5 text-[10px] font-bold text-white">
                  {pageNumber}쪽 표시 중…
                </div>
              ) : null}
              <canvas ref={canvasRef} className="mx-auto block max-w-none bg-white shadow-sm" aria-label={`${pageNumber}쪽`} />
            </div>
          </>
        )}
      </section>
    </main>
  );
}
