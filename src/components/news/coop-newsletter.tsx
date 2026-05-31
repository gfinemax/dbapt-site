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

const MOCK_NEWSLETTERS = [
  {
    id: "mock-nl-1",
    title: "대방동 2026년 5월 조합 월간 소식지 (제24호)",
    content: "존경하는 대방동 지역주택조합원 동지 여러분, 5월 한 달간의 주요 사업 추진 실적 보고를 전해드립니다.\n\n당 조합은 지구단위계획 결정 고시 완수 이후 가장 핵심 이정표인 [사업시행계획 승인 본신청 서류]를 구청 유관과에 정식 접수하였으며, 현재 실무 유관 부서 회신 및 조율 프로세스가 매끄럽게 가동 중입니다.\n\n또한, 신영부동산신탁과의 정기 공조 하에 월별 에스크로 분담금 수납 현황 및 금융 차입 예산 조율 안을 투명하게 수립하였습니다. 조합원님의 든든한 신뢰에 힘입어 하반기 사업시행인가 골인을 목표로 전 사력을 다하겠습니다.",
    author: { name: "사무국" },
    createdAt: "2026.05.30",
    imagePath: null,
    isStarred: true,
  },
  {
    id: "mock-nl-2",
    title: "대방동 5월 3주차 주간 실무 브리핑 (제98호)",
    content: "이번 5월 3주차 주간 주요 진척 사항을 신속하게 안내해 드립니다.\n\n1. [시공예정사 설계 공조]: 메이저 시공예정사 브랜드 설계 전담팀과 3차 도면 최적화 회의를 완수하였습니다. 지하 주차 공간 구획을 추가 확보하고 주민 공동 커뮤니티 면적의 미학적 동선을 세련되게 업그레이드했습니다.\n\n2. [현장 실무 핫라인]: 현장 부지 토지 매입 소송 및 매입 소유권 신속 등기를 위한 법률 전담법인(월드)과의 주간 전략 실무 협의를 완수하고 향후 스케줄러를 확정하였습니다.",
    author: { name: "사무국" },
    createdAt: "2026.05.21",
    imagePath: null,
    isStarred: false,
  },
  {
    id: "mock-nl-3",
    title: "대방동 2026년 4월 조합 월간 소식지 (제23호)",
    content: "4월 한 달간의 월간 주요 진행 내역을 보고드립니다.\n\n당 조합은 동작구청이 실시한 [2026년 정기 행정실태점검] 결과에 대하여, 단 한 건의 크리티컬한 적발이나 시정명령 없이 개선 권고 조치 사항들에 대해 완벽하게 이행을 보고하고 동작구청으로부터 수신 완료 통보를 수령하였습니다. 이는 밀실 의사결정 없는 투명한 조합 행정력이 검증된 쾌거입니다.\n\n아울러, 다가오는 소방·설비 건축 설계 2차 계약 발주를 앞두고 예산 심의를 마쳤습니다. 앞으로도 한 푼의 조합비도 헛되이 낭비하지 않는 투명한 조합을 이어가겠습니다.",
    author: { name: "사무국" },
    createdAt: "2026.04.30",
    imagePath: null,
    isStarred: false,
  },
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
  newsList = [],
  onRefresh,
}: CoopNewsletterProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [activeViewNews, setActiveViewNews] = useState<any | null>(null);

  // Upload Form State
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadContent, setUploadContent] = useState("");
  const [uploadImagePath, setUploadImagePath] = useState("");
  const [uploadIsStarred, setUploadIsStarred] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Combine real database data with simulated demonstration mocks
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
      isReal: true,
    }));

    let filteredReal = realNews;
    let filteredMock = [...MOCK_NEWSLETTERS].map((n) => ({ ...n, isReal: false }));

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      filteredReal = filteredReal.filter((n) => n.title.toLowerCase().includes(q));
      filteredMock = filteredMock.filter((n) => n.title.toLowerCase().includes(q));
    }

    return [...filteredReal, ...filteredMock];
  }, [newsList, searchQuery]);

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadTitle.trim() || !uploadContent.trim()) {
      alert("조합뉴스 제목과 본문 내용을 모두 입력해 주세요.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: uploadTitle,
          content: uploadContent,
          category: "WEEKLY_MONTHLY",
          imagePath: uploadImagePath || null,
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
      setUploadImagePath("");
      setUploadIsStarred(false);
      setShowUploadModal(false);
      await onRefresh();
    } catch (err) {
      console.error(err);
      alert("조합뉴스 등록 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
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

        {isLoggedIn && (
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
                  </div>

                  {/* 하단 메타 영역 */}
                  <div className="flex items-center justify-between text-[10px] font-bold text-ash font-mono border-t border-stone-surface/40 pt-3">
                    <span>작성자: {news.author.name}</span>
                    <span>{news.createdAt}</span>
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
                {activeViewNews.content}
              </div>
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
                  className="w-full rounded-xl border border-stone-surface bg-white px-4.5 py-2.5 text-xs outline-none transition focus:border-sky-blue focus:ring-1 focus:ring-sky-blue resize-none leading-relaxed"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-charcoal-primary font-mono block">
                  카드 썸네일 이미지 URL (선택)
                </label>
                <input
                  type="text"
                  placeholder="https://example.com/image.png (미입력 시 우아한 그라데이션 자동 배정)"
                  value={uploadImagePath}
                  onChange={(e) => setUploadImagePath(e.target.value)}
                  className="w-full rounded-xl border border-stone-surface bg-white px-4.5 py-2.5 text-xs outline-none transition focus:border-sky-blue focus:ring-1 focus:ring-sky-blue"
                />
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
