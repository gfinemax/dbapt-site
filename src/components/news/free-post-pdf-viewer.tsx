"use client";

import { useState } from "react";
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
  const viewUrl = `/api/news/free/${encodeURIComponent(postId)}/attachment/view`;
  const downloadUrl = `/api/news/free/${encodeURIComponent(postId)}/attachment/download`;
  const sizeLabel = formatFileSize(fileSize);

  return (
    <main className="fixed inset-0 z-[100] flex min-h-dvh flex-col overflow-hidden bg-warm-canvas text-charcoal-primary">
      <header className="z-20 shrink-0 border-b border-stone-surface bg-warm-canvas/95 px-3 py-3 backdrop-blur sm:px-6">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-black">{title}</p>
            <p className="mt-0.5 truncate text-[11px] font-medium text-ash">
              {fileName}{sizeLabel ? ` · ${sizeLabel}` : ""}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsConfirmingDownload(true)}
            className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-full border border-stone-surface bg-white px-4 text-xs font-bold text-graphite transition hover:bg-stone-surface focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-sky-blue/30"
          >
            원본 다운로드
          </button>
        </div>
      </header>

      <section aria-label="PDF 온라인 열람" className="mx-auto min-h-0 w-full max-w-5xl flex-1 p-2 sm:p-4">
        <PdfCanvasViewer sourceUrl={viewUrl} fileName={fileName} className="h-full rounded-2xl border border-stone-surface" />
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
