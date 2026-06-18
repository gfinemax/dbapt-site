"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type CoopNewsletterProps = {
  isLoggedIn: boolean;
  isAdmin: boolean;
  newsList: any[];
  onRefresh: () => Promise<void>;
};

const UPCOMING_NEWSLETTER_PREVIEW = {
  id: "upcoming-newsletter-2026-07-issue-1",
  title: "대방동 지주택 2026년 7월 조합 월간 소식지 (제1호) 오픈 예정",
  content:
    "대방동 지역주택조합은 2026년 7월부터 조합 월간 소식지 제1호를 준비해 조합원께 정기적으로 안내드릴 예정입니다.\n\n제1호에서는 조합 운영 일정, 공개자료 등록 현황, 인허가 진행 기준, 조합비와 계약 관리 원칙, 조합원 주요 질의응답, 다음 달 확인 예정 사항을 한눈에 볼 수 있도록 구성하겠습니다.\n\n확정되지 않은 사안은 확정 표현 없이 현재 확인 가능한 기준과 향후 확인 절차로 구분해 전달하고, 조합원께 필요한 자료 위치와 열람 방법도 함께 안내하겠습니다.",
  author: { name: "사무국" },
  createdAt: "2026.07 예정",
  imagePath: null,
  attachmentPath: null,
  attachmentName: null,
  attachmentSize: null,
  isStarred: false,
  isPreview: true,
} as const;

const UPCOMING_NEWSLETTER_PREVIEWS = [
  UPCOMING_NEWSLETTER_PREVIEW,
] as const;

// Dynamic harmony premium HSL gradients for cards if thumbnail image is empty
const PREMIUM_GRADIENTS = [
  "from-sky-blue/30 via-violet-500/10 to-stone-surface/30",
  "from-violet-500/20 via-sky-blue/10 to-stone-surface/30",
  "from-emerald-500/20 via-meadow-green/10 to-stone-surface/30",
  "from-amber-500/20 via-sunburst-yellow/10 to-stone-surface/30",
];

export function CoopNewsletter({
  isLoggedIn,
  isAdmin,
  newsList = [],
  onRefresh,
}: CoopNewsletterProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [activeViewNews, setActiveViewNews] = useState<any | null>(null);

  // Upload Form State
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadContent, setUploadContent] = useState("");
  const [uploadImageFile, setUploadImageFile] = useState<File | null>(null);
  const [uploadAttachmentFile, setUploadAttachmentFile] = useState<File | null>(null);
  const [uploadIsStarred, setUploadIsStarred] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Combine real database data with the single upcoming issue preview.
  const combinedData = useMemo(() => {
    const realNews = newsList.map((item) => ({
      id: item.id,
      title: item.title,
      content: item.content,
      viewCount: item.viewCount,
      isStarred: item.isStarred,
      author: item.author,
      createdAt: item.createdAt.slice(0, 10).replace(/-/g, "."),
      imagePath: item.imagePath,
      attachmentPath: item.attachmentPath,
      attachmentName: item.attachmentName,
      attachmentSize: item.attachmentSize,
      isReal: true,
      isPreview: false,
    }));

    let filteredReal = realNews;
    let filteredPreview = [...UPCOMING_NEWSLETTER_PREVIEWS].map((n) => ({ ...n, isReal: false }));

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      filteredReal = filteredReal.filter((n) => n.title.toLowerCase().includes(q));
      filteredPreview = filteredPreview.filter((n) => n.title.toLowerCase().includes(q));
    }

    return [...filteredReal, ...filteredPreview];
  }, [newsList, searchQuery]);

  const uploadPublicFile = async (file: File, kind: "image" | "attachment") => {
    const formData = new FormData();
    formData.set("file", file);
    formData.set("kind", kind);
    const uploadRes = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const uploadData = await uploadRes.json();
    if (!uploadRes.ok) {
      throw new Error(uploadData.error || "파일 업로드에 실패했습니다.");
    }
    return uploadData as { url: string; name: string; size: number };
  };

  const handlePasteImage = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const imageFile = Array.from(e.clipboardData.files).find((file) => file.type.startsWith("image/"));
    if (!imageFile) return;

    e.preventDefault();
    setUploadImageFile(imageFile);
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadTitle.trim() || !uploadContent.trim()) {
      alert("조합뉴스 제목과 본문 내용을 모두 입력해 주세요.");
      return;
    }

    setIsSubmitting(true);
    try {
      let imagePath: string | null = null;
      let attachmentPath: string | null = null;
      let attachmentName: string | null = null;
      let attachmentSize: number | null = null;

      if (uploadImageFile) {
        const uploadData = await uploadPublicFile(uploadImageFile, "image");
        imagePath = uploadData.url;
      }
      if (uploadAttachmentFile) {
        const uploadData = await uploadPublicFile(uploadAttachmentFile, "attachment");
        attachmentPath = uploadData.url;
        attachmentName = uploadData.name;
        attachmentSize = uploadData.size;
      }

      const res = await fetch("/api/news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: uploadTitle,
          content: uploadContent,
          category: "WEEKLY_MONTHLY",
          imagePath,
          attachmentPath,
          attachmentName,
          attachmentSize,
          isStarred: uploadIsStarred,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        alert(errData.error || "조합뉴스 등록에 실패했습니다.");
        return;
      }

      setUploadTitle("");
      setUploadContent("");
      setUploadImageFile(null);
      setUploadAttachmentFile(null);
      setUploadIsStarred(false);
      setShowUploadModal(false);
      await onRefresh();
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "조합뉴스 등록 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteNews = async (news: any) => {
    if (!news.isReal) return;
    if (!confirm(`"${news.title}" 조합뉴스를 삭제하시겠습니까?`)) return;

    try {
      const res = await fetch(`/api/news?id=${encodeURIComponent(news.id)}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errData = await res.json();
        alert(errData.error || "조합뉴스 삭제에 실패했습니다.");
        return;
      }

      if (activeViewNews?.id === news.id) {
        setActiveViewNews(null);
      }
      await onRefresh();
    } catch (err) {
      console.error(err);
      alert("조합뉴스 삭제 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="space-y-6">
      {/* 검색 바 및 등록 버튼 */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <svg className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ash" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="주/월간 소식 제목 검색…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-stone-surface bg-white pl-10 pr-4 py-2.5 text-xs text-charcoal-primary placeholder:text-ash shadow-2xs focus:outline-none focus:ring-2 focus:ring-sky-blue/30 focus:border-sky-blue"
          />
        </div>

        {isLoggedIn && isAdmin && (
          <Button
            onClick={() => setShowUploadModal(true)}
            className="rounded-full bg-midnight hover:bg-black text-white text-xs font-bold px-5 h-9.5 active:scale-95 transition-all duration-200 cursor-pointer"
          >
            + 신규 주/월간소식 등록
          </Button>
        )}
      </div>

      {/* 카드 그리드 내역 */}
      {combinedData.length === 0 ? (
        <div className="stone-card bg-white border border-stone-surface rounded-2xl px-6 py-12 text-center text-xs text-graphite/70 font-normal">
          조건에 일치하는 조합뉴스가 없습니다.
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
          {combinedData.map((news, idx) => {
            const gradientClass = PREMIUM_GRADIENTS[idx % PREMIUM_GRADIENTS.length];
            return (
              <div
                key={news.id}
                onClick={() => setActiveViewNews(news)}
                className="stone-card bg-white rounded-2xl border border-stone-surface/80 flex flex-col justify-between overflow-hidden shadow-2xs hover:shadow-md hover:scale-[1.01] transition-all duration-300 cursor-pointer group relative"
              >
                {/* 상단 썸네일/그라데이션 영역 */}
                <div className={cn("h-32 bg-gradient-to-br flex items-center justify-center p-6 border-b border-stone-surface/40 select-none relative", gradientClass)}>
                  {news.imagePath ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={news.imagePath} alt="Thumbnail" className="absolute inset-0 size-full object-cover opacity-80 filter blur-[0.2px] hover:blur-none transition-all duration-300" />
                  ) : (
                    <span className="text-3xl leading-none filter drop-shadow-xs">
                      {news.title.includes("월간") ? "📅" : "⚡"}
                    </span>
                  )}
                  {news.isReal && (
                    <span className="absolute top-3 left-3 bg-sky-blue/15 border border-sky-blue/20 text-sky-blue text-[8px] font-black scale-90 rounded px-1.5 py-0.5 select-none shadow-3xs z-2">
                      실제자료
                    </span>
                  )}
                  {news.isPreview && (
                    <span className="absolute top-3 left-3 bg-sky-blue/15 border border-sky-blue/20 text-sky-blue text-[8px] font-black scale-90 rounded px-1.5 py-0.5 select-none shadow-3xs z-2">
                      오픈 예정
                    </span>
                  )}
                  {news.isStarred && (
                    <span className="absolute top-3 right-3 bg-amber-500/10 border border-amber-500/20 text-amber-600 text-[8px] font-extrabold scale-90 rounded px-1.5 py-0.5 select-none shadow-3xs z-2">
                      ★ 중요 브리핑
                    </span>
                  )}
                </div>

                {/* 중앙 텍스트 영역 */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h4 className="text-[13px] font-extrabold text-charcoal-primary leading-snug break-all group-hover:text-sky-blue transition-colors line-clamp-2">
                      {news.title}
                    </h4>
                    <p className="text-[11px] text-graphite/80 font-normal leading-relaxed line-clamp-3 break-all">
                      {news.content}
                    </p>
                    {news.attachmentPath && (
                      <span className="inline-flex rounded-full bg-stone-surface px-2 py-1 text-[9px] font-bold text-graphite">
                        첨부파일
                      </span>
                    )}
                  </div>

                  {/* 하단 메타 영역 */}
                  <div className="flex items-center justify-between text-[10px] font-bold text-ash font-mono border-t border-stone-surface/40 pt-3">
                    <span>작성자: {news.author.name}</span>
                    <div className="flex items-center gap-2">
                      <span>{news.createdAt}</span>
                      {isAdmin && news.isReal && (
                        <button
                          type="button"
                          aria-label="조합뉴스 삭제"
                          onClick={(event) => {
                            event.stopPropagation();
                            void handleDeleteNews(news);
                          }}
                          className="rounded-full border border-coral-red/20 bg-coral-red/10 px-2 py-0.5 text-[9px] font-bold text-coral-red hover:bg-coral-red/15"
                        >
                          삭제
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 1. 조합뉴스 상세 열람 모달 */}
      {activeViewNews && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/45 backdrop-blur-xs p-4 animate-in fade-in duration-300">
          <div className="absolute inset-0" onClick={() => setActiveViewNews(null)} />
          <div className="relative w-full max-w-xl rounded-3xl bg-warm-canvas border border-stone-surface shadow-2xl p-6.5 text-left animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between pb-4 border-b border-stone-surface mb-4">
              <span className="inline-flex rounded-full bg-sky-blue/10 px-3 py-1 text-[9px] font-bold text-sky-blue uppercase tracking-wider">
                Coop Newsletter
              </span>
              <button
                onClick={() => setActiveViewNews(null)}
                className="flex items-center justify-center gap-1 px-3 py-1.5 rounded-full border border-stone-surface bg-[#f8f7f4] text-[10px] font-bold text-graphite hover:bg-stone-surface active:bg-[#e8e6e1] transition duration-200 cursor-pointer"
              >
                닫기
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              <h3 className="text-base font-extrabold text-charcoal-primary leading-snug">
                {activeViewNews.title}
              </h3>
              
              <div className="flex items-center gap-3 text-[10.5px] font-bold text-ash font-mono border-y border-stone-surface/60 py-2">
                <span>📂 분류: 주/월간 조합소식지</span>
                <span>•</span>
                <span>작성자: {activeViewNews.author.name}</span>
                <span>•</span>
                <span>등록일: {activeViewNews.createdAt}</span>
              </div>

              <div className="text-xs sm:text-[13px] text-graphite/90 leading-7 font-normal whitespace-pre-wrap pt-2">
                {activeViewNews.imagePath && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={activeViewNews.imagePath}
                    alt=""
                    className="mb-4 max-h-72 w-full rounded-2xl object-cover border border-stone-surface"
                  />
                )}
                {activeViewNews.content}
              </div>
              {activeViewNews.attachmentPath && (
                <a
                  href={activeViewNews.attachmentPath}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between gap-3 rounded-2xl border border-stone-surface bg-white px-4 py-3 text-xs font-bold text-charcoal-primary hover:border-sky-blue"
                >
                  <span>첨부파일: {activeViewNews.attachmentName || "다운로드"}</span>
                  <span className="text-[10px] text-sky-blue">열기</span>
                </a>
              )}
              {isAdmin && activeViewNews.isReal && (
                <div className="pt-4 border-t border-stone-surface">
                  <button
                    type="button"
                    aria-label="조합뉴스 삭제"
                    onClick={() => void handleDeleteNews(activeViewNews)}
                    className="rounded-full border border-coral-red/20 bg-coral-red/10 px-3 py-1.5 text-[11px] font-bold text-coral-red hover:bg-coral-red/15"
                  >
                    조합뉴스 삭제
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. 신규 조합뉴스 등록 모달 (관리자용) */}
      {showUploadModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/45 backdrop-blur-xs p-4 animate-in fade-in duration-300">
          <div className="absolute inset-0" onClick={() => setShowUploadModal(false)} />
          <div className="relative w-full max-w-lg rounded-2xl bg-warm-canvas border border-stone-surface shadow-2xl p-6.5 text-left animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-stone-surface mb-5">
              <h3 className="text-sm font-black text-charcoal-primary flex items-center gap-1.5">
                <span>📅</span> 신규 주/월간소식 등록
              </h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="flex items-center justify-center gap-1 px-3 py-1.5 rounded-full border border-stone-surface bg-[#f8f7f4] text-[10px] font-bold text-graphite hover:bg-stone-surface active:bg-[#e8e6e1] transition duration-200 cursor-pointer"
              >
                닫기
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-charcoal-primary font-mono block">
                  소식지 제목 *
                </label>
                <input
                  type="text"
                  required
                  placeholder="예: 대방동 2026년 6월 조합 월간 소식지 (제25호)"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  className="w-full rounded-xl border border-stone-surface bg-white px-4.5 py-2.5 text-xs outline-none transition focus:border-sky-blue focus:ring-1 focus:ring-sky-blue"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-charcoal-primary font-mono block">
                  상세 본문 내용 *
                </label>
                <textarea
                  required
                  rows={6}
                  placeholder="주간/월간 소식의 상세 실적 보고 내용을 작성해 주십시오."
                  value={uploadContent}
                  onChange={(e) => setUploadContent(e.target.value)}
                  onPaste={handlePasteImage}
                  className="w-full rounded-xl border border-stone-surface bg-white px-4.5 py-2.5 text-xs outline-none transition focus:border-sky-blue focus:ring-1 focus:ring-sky-blue resize-none leading-relaxed"
                />
                <p className="text-[10px] font-medium text-ash">
                  본문 영역에 이미지를 복사한 뒤 Ctrl+V로 붙여넣으면 썸네일 이미지로 등록됩니다.
                </p>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="newsletter-image-file" className="text-[11px] font-bold text-charcoal-primary font-mono block">
                  카드 썸네일 이미지 파일 (선택)
                </label>
                <input
                  id="newsletter-image-file"
                  type="file"
                  accept="image/png,image/jpeg,image/gif,image/webp"
                  onChange={(e) => setUploadImageFile(e.target.files?.[0] || null)}
                  className="w-full rounded-xl border border-stone-surface bg-white px-4.5 py-2.5 text-xs file:mr-3 file:rounded-full file:border-0 file:bg-stone-surface file:px-3 file:py-1 file:text-[10px] file:font-bold file:text-graphite"
                />
                {uploadImageFile && (
                  <p className="text-[10px] font-bold text-sky-blue">
                    선택된 이미지: {uploadImageFile.name}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label htmlFor="newsletter-attachment-file" className="text-[11px] font-bold text-charcoal-primary font-mono block">
                  첨부파일 (선택)
                </label>
                <input
                  id="newsletter-attachment-file"
                  type="file"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.hwp,.hwpx,.zip"
                  onChange={(e) => setUploadAttachmentFile(e.target.files?.[0] || null)}
                  className="w-full rounded-xl border border-stone-surface bg-white px-4.5 py-2.5 text-xs file:mr-3 file:rounded-full file:border-0 file:bg-stone-surface file:px-3 file:py-1 file:text-[10px] file:font-bold file:text-graphite"
                />
                {uploadAttachmentFile && (
                  <p className="text-[10px] font-bold text-sky-blue">
                    선택된 첨부파일: {uploadAttachmentFile.name}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 py-1 select-none">
                <input
                  type="checkbox"
                  id="starred-checkbox"
                  checked={uploadIsStarred}
                  onChange={(e) => setUploadIsStarred(e.target.checked)}
                  className="size-4.5 border border-stone-surface rounded focus:ring-sky-blue text-midnight cursor-pointer"
                />
                <label htmlFor="starred-checkbox" className="text-[11.5px] font-extrabold text-graphite/90 cursor-pointer font-mono">
                  주요 브리핑(중요 배지)으로 표시
                </label>
              </div>

              <div className="pt-3 flex justify-end">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-full bg-midnight hover:bg-black text-white text-xs font-bold px-6 h-9.5 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? "등록 중…" : "조합뉴스 즉시 등록"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
