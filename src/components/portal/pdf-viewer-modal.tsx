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
  attachments
}: PdfViewerModalProps) {
  const previewFileName = fileName || documentTitle;
  const canPreviewInline = isPdfFile(previewFileName);
  const previewKey = canPreviewInline ? `${documentId}:${previewFileName}` : null;
  const [loadedPreviewKey, setLoadedPreviewKey] = useState<string | null>(null);
  const isLoading = canPreviewInline && loadedPreviewKey !== previewKey;
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

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
      const res = await fetch(`/api/documents/${documentId}/download`);
      if (!res.ok) {
        alert("파일 다운로드 권한이 없거나 파일을 찾을 수 없습니다.");
        return;
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName || documentTitle;
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 backdrop-blur-xs p-4 sm:p-6 transition-all duration-300 animate-in fade-in">
      {/* 바깥쪽 클릭 시 닫기 */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* 모달 창 본체 (DESIGN.md 가이드라인인 warm-canvas 백그라운드 및 recessed card 느낌 준용) */}
      <div
        className={`relative bg-warm-canvas border border-stone-surface shadow-2xl rounded-2xl flex flex-col transition-all duration-300 overflow-hidden w-full max-w-5xl ${
          isFullScreen ? "h-[95vh] max-w-[95vw]" : "h-[85vh]"
        }`}
      >
        {/* 상단 헤더 영역 */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-surface bg-white shrink-0">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <span className="flex size-7 items-center justify-center rounded-full bg-midnight text-xs font-semibold text-white shrink-0 select-none">
              📄
            </span>
            <div className="min-w-0 relative">
              <div className="flex items-center gap-1.5 min-w-0">
                <h3 className="text-sm font-bold text-charcoal-primary truncate leading-snug" title={documentTitle}>
                  {documentTitle}
                </h3>
                {description && (
                  <div className="relative shrink-0 flex items-center">
                    <span 
                      onMouseEnter={() => setShowTooltip(true)}
                      onMouseLeave={() => setShowTooltip(false)}
                      className="inline-flex size-4.5 items-center justify-center rounded-full border border-stone-surface bg-[#f8f7f4] text-[10px] font-black text-ash hover:text-charcoal-primary hover:border-ash cursor-help transition duration-150 select-none"
                    >
                      i
                    </span>
                    {showTooltip && (
                      <div className="absolute left-6 top-1/2 -translate-y-1/2 w-64 bg-midnight text-white text-[11px] rounded-xl p-3.5 shadow-2xl z-[120] animate-in fade-in zoom-in-95 duration-150 leading-relaxed font-normal">
                        <span className="block font-bold text-amber-orange mb-1 font-mono text-[9px] uppercase tracking-wider">Document Note</span>
                        {description}
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-2 text-[10px] text-ash font-medium tracking-tight mt-0.5 whitespace-nowrap overflow-x-auto scrollbar-none">
                <span>대방동 지역주택조합 실시간 보안 감사 열람 세션 가동 중</span>
                {documentDate && (
                  <>
                    <span className="text-stone-surface select-none">|</span>
                    <span className="text-graphite font-semibold">발생일: {formatDate(documentDate)}</span>
                  </>
                )}
                {(publishedAt || createdAt) && (
                  <>
                    <span className="text-stone-surface select-none">|</span>
                    <span className="text-graphite">등록일: {formatDate(publishedAt || createdAt)}</span>
                  </>
                )}
                {fileSize !== undefined && (
                  <>
                    <span className="text-stone-surface select-none">|</span>
                    <span className="text-graphite/80 font-mono text-[9px]">{formatSize(fileSize)}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 ml-4">
            {/* 전체화면 토글 */}
            <Button
              onClick={() => setIsFullScreen(!isFullScreen)}
              variant="outline"
              size="sm"
              className="rounded-full h-8 px-3 text-[11px] font-bold border-stone-surface text-graphite hover:bg-stone-surface cursor-pointer"
            >
              {isFullScreen ? "화면 축소" : "전체 화면"}
            </Button>
            {/* 다운로드 */}
            <Button
              onClick={handleDownload}
              variant="outline"
              size="sm"
              className="rounded-full h-8 px-3 text-[11px] font-bold border-stone-surface text-graphite hover:bg-stone-surface cursor-pointer"
            >
              다운로드
            </Button>
            {/* 닫기 */}
            <button
              onClick={onClose}
              className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full border border-stone-surface bg-[#f8f7f4] text-xs font-bold text-graphite hover:bg-stone-surface active:bg-[#e8e6e1] transition duration-200 cursor-pointer"
            >
              <svg className="w-3.5 h-3.5 text-ash" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
              닫기
            </button>
          </div>
        </div>

        {/* 추가 첨부파일 목록 패널 (다중 첨부파일 존재 시 표출) */}
        {attachments && attachments.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 px-5 py-2.5 bg-[#f8f7f4] border-b border-stone-surface shrink-0 select-none">
            <span className="text-[11px] font-bold text-charcoal-primary flex items-center gap-1 select-none shrink-0">
              📎 추가 첨부파일 ({attachments.length}개):
            </span>
            <div className="flex flex-wrap gap-1.5 overflow-x-auto max-w-full scrollbar-none py-0.5">
              {attachments.map((att) => (
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
        <div className="flex-1 bg-[#f0ede9] relative min-h-0">
          {canPreviewInline ? (
            <>
              {/* iframe을 통한 브라우저 보안 렌더링 스트림 */}
              <iframe
                src={`/api/documents/${documentId}/view`}
                className="w-full h-full border-none z-10 relative bg-[#f0ede9]"
                onLoad={() => setLoadedPreviewKey(previewKey)}
                title="문서 온라인 열람 뷰어"
              />

              {/* 로딩 스켈레톤 상태 */}
              {isLoading && (
                <div className="absolute inset-0 bg-parchment-card flex flex-col items-center justify-center z-20 gap-4">
                  <div className="w-10 h-10 border-4 border-midnight border-t-transparent rounded-full animate-spin" />
                  <div className="text-center space-y-1.5">
                    <p className="text-xs font-bold text-charcoal-primary">보안 문서를 안전하게 로드하는 중입니다</p>
                    <p className="text-[10px] text-ash font-medium">조합원님의 세션 권한 및 실시간 감사 로그가 바인딩되고 있습니다.</p>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="absolute inset-0 bg-parchment-card flex flex-col items-center justify-center z-20 gap-4">
              <div className="flex size-14 items-center justify-center rounded-2xl border border-stone-surface bg-white text-[11px] font-black uppercase text-charcoal-primary">
                file
              </div>
              <div className="max-w-md text-center space-y-2 px-6">
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
        </div>
      </div>
    </div>
  );
}
