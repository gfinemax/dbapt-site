"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

type PdfViewerModalProps = {
  documentId: string;
  documentTitle: string;
  fileName?: string;
  onClose: () => void;
  documentDate?: string;
  publishedAt?: string;
  createdAt?: string;
  fileSize?: number;
  category?: string;
  subCategory?: string | null;
  description?: string | null;
  attachments?: { id: string; fileName: string; fileSize: number }[];
  relatedDocument?: {
    id: string;
    title: string;
    fileName?: string;
    documentDate?: string;
    publishedAt?: string | null;
    createdAt?: string;
    fileSize?: number;
    description?: string | null;
    attachments?: { id: string; fileName: string; fileSize: number }[];
  } | null;
  relatedDocumentLabel?: string;
};

function isPdfFile(fileName: string) {
  return fileName.trim().toLowerCase().endsWith(".pdf");
}

export function PdfViewerModal({ 
  documentId, 
  documentTitle, 
  fileName,
  onClose,
  documentDate,
  publishedAt,
  createdAt,
  fileSize,
  description,
  attachments,
  relatedDocument,
  relatedDocumentLabel
}: PdfViewerModalProps) {
  const [relatedViewState, setRelatedViewState] = useState({
    sourceDocumentId: documentId,
    isShowingRelatedDocument: false,
  });
  const isShowingRelatedDocument =
    relatedViewState.sourceDocumentId === documentId && relatedViewState.isShowingRelatedDocument;
  const activeDocument = isShowingRelatedDocument && relatedDocument
    ? relatedDocument
    : {
        id: documentId,
        title: documentTitle,
        fileName,
        documentDate,
        publishedAt,
        createdAt,
        fileSize,
        description,
        attachments,
      };
  const previewFileName = activeDocument.fileName || activeDocument.title;
  const canPreviewInline = isPdfFile(previewFileName);
  const pdfAttachments = (activeDocument.attachments || []).filter((attachment) => isPdfFile(attachment.fileName));
  const shouldUseMergedPreview = canPreviewInline && pdfAttachments.length > 0;
  const previewUrl = canPreviewInline
    ? shouldUseMergedPreview
      ? `/api/documents/${activeDocument.id}/merged-view`
      : `/api/documents/${activeDocument.id}/view`
    : null;
  const previewKey = canPreviewInline
    ? `${activeDocument.id}:${previewFileName}:${pdfAttachments.map((attachment) => attachment.id).join(",")}`
    : null;
  const [loadedPreviewKey, setLoadedPreviewKey] = useState<string | null>(null);
  const isLoading = canPreviewInline && loadedPreviewKey !== previewKey;
  const [isFullScreen, setIsFullScreen] = useState(true);

  // ESC 키 클릭 시 자동으로 모달 닫기
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // 뒷배경 스크롤 방지
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const handleDownload = async () => {
    try {
      const res = await fetch(`/api/documents/${activeDocument.id}/download`);
      if (!res.ok) {
        alert("파일 다운로드 권한이 없거나 파일을 찾을 수 없습니다.");
        return;
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = activeDocument.fileName || activeDocument.title;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert("다운로드 중 문제가 발생했습니다.");
    }
  };

  const handleAttachmentDownload = async (attachmentId: string, fileName: string) => {
    try {
      const res = await fetch(`/api/documents/attachments/${attachmentId}`);
      if (!res.ok) {
        alert("첨부파일 다운로드 권한이 없거나 파일을 찾을 수 없습니다.");
        return;
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert("첨부파일 다운로드 중 문제가 발생했습니다.");
    }
  };


  const formatSize = (bytes?: number) => {
    if (bytes === undefined) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(
      d.getDate()
    ).padStart(2, "0")}`;
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 backdrop-blur-xs p-2 sm:p-6 transition-all duration-300 animate-in fade-in">
      {/* 바깥쪽 클릭 시 닫기 */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* 모달 창 본체 (DESIGN.md 가이드라인인 warm-canvas 백그라운드 및 recessed card 느낌 준용) */}
      <div
        data-testid="pdf-viewer-panel"
        className={`relative bg-warm-canvas border border-stone-surface shadow-2xl rounded-2xl flex flex-col transition-all duration-300 overflow-hidden max-sm:h-[92svh] max-sm:w-[calc(100vw-16px)] max-sm:max-w-none ${
          isFullScreen ? "h-[95vh] w-[95vw] max-w-none" : "h-[85vh] w-full max-w-5xl"
        }`}
      >
        {/* 상단 헤더 영역 */}
        <div
          data-testid="pdf-viewer-header"
          className="flex flex-col gap-3 border-b border-stone-surface bg-white px-4 py-3 shrink-0 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-4"
        >
          <div className="flex w-full min-w-0 items-start gap-3 sm:flex-1 sm:items-center">
            <span className="mt-0.5 flex size-8 items-center justify-center rounded-full bg-midnight text-xs font-semibold text-white shrink-0 select-none sm:mt-0 sm:size-7">
              📄
            </span>
            <div className="min-w-0 flex-1 relative">
              <div className="min-w-0">
                <h3
                  data-testid="pdf-viewer-title"
                  className="text-[15px] font-bold leading-6 text-charcoal-primary whitespace-normal break-keep [overflow-wrap:anywhere] sm:truncate sm:text-sm sm:leading-snug"
                  title={activeDocument.title}
                >
                  {activeDocument.title}
                </h3>
              </div>
              {activeDocument.description && (
                <p className="mt-1 max-w-3xl text-xs leading-5 text-graphite">
                  <span className="mr-1 font-semibold text-charcoal-primary">문서 설명</span>
                  {activeDocument.description}
                </p>
              )}
              
              <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] font-medium tracking-tight text-ash">
                <span className="rounded-full bg-parchment-card px-2 py-0.5 text-charcoal-primary shadow-[inset_0_0_0_1px_var(--stone-surface)]">
                  보안 열람 세션
                </span>
                {activeDocument.documentDate && (
                  <>
                    <span className="hidden text-stone-surface select-none sm:inline">|</span>
                    <span className="text-graphite font-semibold">발생일: {formatDate(activeDocument.documentDate)}</span>
                  </>
                )}
                {(activeDocument.publishedAt || activeDocument.createdAt) && (
                  <>
                    <span className="hidden text-stone-surface select-none sm:inline">|</span>
                    <span className="text-graphite">등록일: {formatDate(activeDocument.publishedAt || activeDocument.createdAt)}</span>
                  </>
                )}
                {activeDocument.fileSize !== undefined && (
                  <>
                    <span className="hidden text-stone-surface select-none sm:inline">|</span>
                    <span className="text-graphite/80 font-mono text-[9px]">{formatSize(activeDocument.fileSize)}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div data-testid="pdf-viewer-actions" className="grid w-full grid-cols-3 gap-2 sm:ml-4 sm:flex sm:w-auto sm:items-center sm:gap-2 sm:shrink-0">
            {relatedDocument && (
              <Button
                onClick={() =>
                  setRelatedViewState((current) => ({
                    sourceDocumentId: documentId,
                    isShowingRelatedDocument:
                      current.sourceDocumentId === documentId ? !current.isShowingRelatedDocument : true,
                  }))
                }
                variant="outline"
                size="sm"
                className="col-span-3 rounded-full h-9 px-3 text-[11px] font-bold border-ember-orange/30 bg-ember-orange/5 text-ember-orange hover:bg-ember-orange/10 cursor-pointer sm:col-span-1 sm:h-8"
              >
                {isShowingRelatedDocument ? "원 문서 보기" : relatedDocumentLabel || "관련 문서 보기"}
              </Button>
            )}
            {/* 전체화면 토글 */}
            <Button
              onClick={() => setIsFullScreen(!isFullScreen)}
              variant="outline"
              size="sm"
              className="rounded-full h-9 px-2 text-[11px] font-bold border-stone-surface text-graphite hover:bg-stone-surface cursor-pointer sm:h-8 sm:px-3"
            >
              {isFullScreen ? "화면 축소" : "전체 화면"}
            </Button>
            {/* 다운로드 */}
            <Button
              onClick={handleDownload}
              variant="outline"
              size="sm"
              className="rounded-full h-9 px-2 text-[11px] font-bold border-stone-surface text-graphite hover:bg-stone-surface cursor-pointer sm:h-8 sm:px-3"
            >
              다운로드
            </Button>
            {/* 닫기 */}
            <button
              onClick={onClose}
              className="flex h-9 items-center justify-center gap-1.5 rounded-full border border-stone-surface bg-[#f8f7f4] px-2 text-[11px] font-bold text-graphite hover:bg-stone-surface active:bg-[#e8e6e1] transition duration-200 cursor-pointer sm:h-8 sm:px-3 sm:text-xs"
            >
              <svg className="w-3.5 h-3.5 text-ash" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
              닫기
            </button>
          </div>
        </div>

        {/* 추가 첨부파일 목록 패널 (다중 첨부파일 존재 시 표출) */}
        {activeDocument.attachments && activeDocument.attachments.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 px-5 py-2.5 bg-[#f8f7f4] border-b border-stone-surface shrink-0 select-none">
            <span className="text-[11px] font-bold text-charcoal-primary flex items-center gap-1 select-none shrink-0">
              📎 추가 첨부파일 ({activeDocument.attachments.length}개):
            </span>
            <div className="flex flex-wrap gap-1.5 overflow-x-auto max-w-full scrollbar-none py-0.5">
              {activeDocument.attachments.map((att) => (
                <button
                  key={att.id}
                  onClick={() => handleAttachmentDownload(att.id, att.fileName)}
                  className="inline-flex items-center gap-1 rounded-full bg-white border border-[#f2f0ed] px-2.5 py-1 text-[10px] font-semibold text-graphite hover:border-ember-orange hover:text-ember-orange hover:bg-ember-orange/5 active:scale-95 transition-all duration-150 cursor-pointer"
                  title={`${att.fileName} (${formatSize(att.fileSize)})`}
                >
                  <span className="truncate max-w-[150px]">{att.fileName}</span>
                  <span className="text-[9px] text-ash font-mono shrink-0">({formatSize(att.fileSize)})</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 본문 PDF 뷰어 영역 */}
        <div data-testid="pdf-preview-scroll-area" className="min-h-0 flex-1 overflow-y-auto bg-[#f0ede9] p-1 sm:p-2">
          <div className="space-y-2">
            <section className="overflow-hidden rounded-2xl border border-stone-surface bg-white shadow-sm">
              <div className="flex flex-col gap-2 border-b border-stone-surface bg-[#f8f7f4] px-3 py-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:py-1.5">
                <div className="min-w-0">
                  <p className="text-[11px] font-bold text-charcoal-primary">
                    {shouldUseMergedPreview ? "통합 PDF 문서" : "본문 문서"}
                  </p>
                  <p className="mt-0.5 break-keep text-[10px] leading-4 text-ash [overflow-wrap:anywhere]">
                    {shouldUseMergedPreview ? `본문 및 추가 첨부 PDF ${pdfAttachments.length}개` : previewFileName}
                  </p>
                </div>
                <Button
                  onClick={handleDownload}
                  variant="outline"
                  size="sm"
                  className="w-full rounded-full border-stone-surface text-[10px] font-bold text-graphite hover:bg-stone-surface sm:w-auto"
                >
                  본문 다운로드
                </Button>
              </div>

              {canPreviewInline && previewUrl ? (
                <div data-testid="pdf-preview-frame-area" className="relative h-[76vh] min-h-[560px] bg-[#f0ede9]">
                  <iframe
                    src={previewUrl}
                    className="relative z-10 block h-full w-full border-none bg-[#f0ede9]"
                    onLoad={() => setLoadedPreviewKey(previewKey)}
                    title="문서 온라인 열람 뷰어"
                  />

                  {isLoading && (
                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 bg-parchment-card">
                      <div className="h-10 w-10 rounded-full border-4 border-midnight border-t-transparent animate-spin" />
                      <div className="space-y-1.5 text-center">
                        <p className="text-xs font-bold text-charcoal-primary">보안 문서를 안전하게 로드하는 중입니다</p>
                        <p className="text-[10px] font-medium text-ash">조합원님의 세션 권한 및 실시간 감사 로그가 바인딩되고 있습니다.</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex min-h-[360px] flex-col items-center justify-center gap-4 bg-parchment-card px-6 py-10">
                  <div className="flex size-14 items-center justify-center rounded-2xl border border-stone-surface bg-white text-[11px] font-black uppercase text-charcoal-primary">
                    file
                  </div>
                  <div className="max-w-md space-y-2 text-center">
                    <p className="text-sm font-bold text-charcoal-primary">이 문서는 PDF 미리보기를 지원하지 않습니다.</p>
                    <p className="text-xs leading-5 text-graphite">
                      {previewFileName} 파일은 다운로드 후 Word 또는 한글 프로그램에서 확인해 주세요.
                    </p>
                  </div>
                  <Button
                    onClick={handleDownload}
                    className="rounded-full bg-midnight px-5 text-xs font-bold text-white hover:bg-midnight/90"
                  >
                    문서 다운로드
                  </Button>
                </div>
              )}
            </section>

            {!shouldUseMergedPreview && pdfAttachments.map((attachment, index) => (
              <section
                key={attachment.id}
                className="overflow-hidden rounded-2xl border border-stone-surface bg-white shadow-sm"
              >
                <div className="flex items-center justify-between gap-3 border-b border-stone-surface bg-[#f8f7f4] px-3 py-1.5">
                  <div>
                    <p className="text-[11px] font-bold text-charcoal-primary">추가 첨부 PDF {index + 1}</p>
                    <p className="mt-0.5 text-[10px] text-ash">{attachment.fileName}</p>
                  </div>
                  <Button
                    onClick={() => handleAttachmentDownload(attachment.id, attachment.fileName)}
                    variant="outline"
                    size="sm"
                    className="rounded-full border-stone-surface text-[10px] font-bold text-graphite hover:bg-stone-surface"
                  >
                    첨부 다운로드
                  </Button>
                </div>
                <div className="h-[76vh] min-h-[560px] bg-[#f0ede9] max-sm:min-h-[420px]">
                  <iframe
                    src={`/api/documents/attachments/${attachment.id}/view`}
                    className="block h-full w-full border-none bg-[#f0ede9]"
                    title={`추가 첨부 PDF 열람 뷰어 ${index + 1}`}
                  />
                </div>
              </section>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
