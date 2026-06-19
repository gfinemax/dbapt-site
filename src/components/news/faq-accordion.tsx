"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  buildFaqList,
  type FaqCategory,
  type FaqCategoryFilter,
} from "@/lib/news/faq-list";
import type { FAQView } from "@/lib/news/types";
import { cn } from "@/lib/utils";

type FAQProps = {
  isLoggedIn: boolean;
  isAdmin: boolean;
  faqs: FAQView[];
  onRefresh: () => Promise<void>;
};

export function FaqAccordion({
  isAdmin,
  faqs = [],
  onRefresh,
}: FAQProps) {
  const [activeCategory, setActiveCategory] = useState<FaqCategoryFilter>("ALL");
  const [activeFaqId, setActiveFaqId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showUploadModal, setShowUploadModal] = useState(false);

  // New FAQ Form State
  const [uploadQuestion, setUploadQuestion] = useState("");
  const [uploadAnswer, setUploadAnswer] = useState("");
  const [uploadCategory, setUploadCategory] = useState<FaqCategory>("ADMIN");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories: readonly { id: FaqCategoryFilter; label: string }[] = [
    { id: "ALL", label: "전체 보기" },
    { id: "LOAN", label: "금융/중도금대출" },
    { id: "TAX", label: "세무/지방세" },
    { id: "ADMIN", label: "조합행정/자격" },
  ] as const;

  const combinedData = useMemo(
    () => buildFaqList(faqs, activeCategory, searchQuery),
    [faqs, activeCategory, searchQuery],
  );

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadQuestion.trim() || !uploadAnswer.trim()) {
      alert("질문과 답변 내용을 모두 작성해 주십시오.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/news/faq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: uploadQuestion,
          answer: uploadAnswer,
          category: uploadCategory,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "FAQ 등록에 실패했습니다.");
        return;
      }

      setUploadQuestion("");
      setUploadAnswer("");
      setShowUploadModal(false);
      await onRefresh();
    } catch (err) {
      console.error(err);
      alert("FAQ 등록 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteFaq = async (id: string) => {
    if (!confirm("정말 이 FAQ 항목을 영구 삭제하시겠습니까?")) {
      return;
    }

    try {
      const res = await fetch(`/api/news/faq?id=${id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "FAQ 삭제에 실패했습니다.");
        return;
      }

      await onRefresh();
    } catch (err) {
      console.error(err);
      alert("FAQ 삭제 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="space-y-6">
      {/* 분류 탭 및 신규 추가 버튼 */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 select-none">
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setActiveCategory(cat.id);
                setActiveFaqId(null);
              }}
              className={cn(
                "rounded-full px-4 py-1.5 text-[11px] font-bold border transition-all duration-150 cursor-pointer",
                activeCategory === cat.id
                  ? "bg-[#f8f7f4] border-midnight text-midnight font-extrabold shadow-2xs"
                  : "bg-white border-stone-surface text-ash hover:text-graphite hover:border-ash"
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {isAdmin && (
          <Button
            onClick={() => setShowUploadModal(true)}
            className="rounded-full bg-midnight hover:bg-black text-white text-xs font-bold px-5 h-9.5 active:scale-95 transition-all duration-200 shrink-0 cursor-pointer"
          >
            + 신규 FAQ 추가
          </Button>
        )}
      </div>

      {/* 검색 입력창 */}
      <div className="relative max-w-sm">
        <svg className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ash" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="FAQ 질문/답변 검색…"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setActiveFaqId(null);
          }}
          className="w-full rounded-xl border border-stone-surface bg-white pl-10 pr-4 py-2.5 text-xs text-charcoal-primary placeholder:text-ash shadow-2xs focus:outline-none focus:ring-2 focus:ring-sky-blue/30 focus:border-sky-blue"
        />
      </div>

      {/* FAQ 아코디언 피드 */}
      <div className="space-y-3.5">
        {combinedData.length === 0 ? (
          <div className="stone-card bg-white border border-stone-surface rounded-2xl px-6 py-12 text-center text-xs text-graphite/70 font-normal">
            검색 결과에 맞는 FAQ 항목이 존재하지 않습니다.
          </div>
        ) : (
          combinedData.map((faq) => {
            const isOpened = activeFaqId === faq.id;
            return (
              <div
                key={faq.id}
                className={cn(
                  "stone-card bg-white rounded-2xl border transition-all duration-300 shadow-2xs overflow-hidden",
                  faq.isReal ? "border-stone-surface" : "border-stone-surface/60 bg-amber-50/[0.03] border-dashed",
                  isOpened && "ring-1 ring-sky-blue/20 bg-[#fdfdfc]"
                )}
              >
                {/* 질문 헤더 영역 */}
                <div
                  onClick={() => setActiveFaqId(isOpened ? null : faq.id)}
                  className="flex items-center justify-between p-5 cursor-pointer select-none group"
                >
                  <div className="flex items-center gap-3.5 pr-6">
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-sky-blue/10 text-[11px] font-black text-sky-blue font-mono border border-sky-blue/20 shadow-3xs">
                      Q
                    </span>
                    <h4 className="text-[13px] font-extrabold text-charcoal-primary leading-snug group-hover:text-sky-blue transition-colors">
                      {faq.question}
                    </h4>
                  </div>
                  
                  <div className="flex items-center gap-3 shrink-0">
                    {faq.isReal && isAdmin && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteFaq(faq.id);
                        }}
                        className="text-red-500 hover:bg-red-50 p-1.5 rounded-full active:scale-90 transition cursor-pointer"
                        title="FAQ 삭제"
                      >
                        🗑️
                      </button>
                    )}
                    <span className="text-ash font-mono text-xs transition-transform duration-300 group-hover:scale-110">
                      {isOpened ? "▲" : "▼"}
                    </span>
                  </div>
                </div>

                {/* 답변 콘텐츠 영역 (슬라이딩 모션 형태) */}
                {isOpened && (
                  <div className="p-5 bg-parchment-card border-t border-stone-surface/60 border-dashed animate-in slide-in-from-top duration-300 ease-out">
                    <div className="flex gap-3.5 items-start">
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-[11px] font-black text-amber-600 font-mono border border-amber-500/20 shadow-3xs">
                        A
                      </span>
                      <div className="flex-1 space-y-3">
                        <div className="text-[10px] font-bold text-ash font-mono select-none">
                          📂 카테고리: {faq.category === "LOAN" ? "금융 및 중도금대출" : faq.category === "TAX" ? "세무 및 지방세 감면" : "조합 설립인가 및 행정자격"} 
                          {faq.isReal && (
                            <span className="bg-sky-blue/10 border border-sky-blue/20 text-sky-blue text-[8px] font-black scale-90 rounded px-1.5 py-0.5 ml-1.5 select-none">실제자료</span>
                          )}
                        </div>
                        <p className="text-xs sm:text-[13px] text-graphite/90 font-normal leading-7 whitespace-pre-wrap">
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* 신규 FAQ 추가 모달 (관리자용) */}
      {showUploadModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/45 backdrop-blur-xs p-4 animate-in fade-in duration-300">
          <div className="absolute inset-0" onClick={() => setShowUploadModal(false)} />
          <div className="relative w-full max-w-lg rounded-2xl bg-warm-canvas border border-stone-surface shadow-2xl p-6.5 text-left animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-stone-surface mb-5">
              <h3 className="text-sm font-black text-charcoal-primary flex items-center gap-1.5">
                <span>❓</span> 신규 FAQ 항목 작성
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
                  질문 (Question) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="조합원들이 질문할 핵심 문장을 입력하십시오."
                  value={uploadQuestion}
                  onChange={(e) => setUploadQuestion(e.target.value)}
                  className="w-full rounded-xl border border-stone-surface bg-white px-4.5 py-2.5 text-xs outline-none transition focus:border-sky-blue focus:ring-1 focus:ring-sky-blue"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-charcoal-primary font-mono block">
                  답변 (Answer) *
                </label>
                <textarea
                  required
                  rows={6}
                  placeholder="질문에 대한 상세하고 정확한 공적 답변을 작성해 주십시오."
                  value={uploadAnswer}
                  onChange={(e) => setUploadAnswer(e.target.value)}
                  className="w-full rounded-xl border border-stone-surface bg-white px-4.5 py-2.5 text-xs outline-none transition focus:border-sky-blue focus:ring-1 focus:ring-sky-blue resize-none leading-relaxed"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-charcoal-primary font-mono block">
                  질문 분류 *
                </label>
                <div className="relative">
                  <select
                    value={uploadCategory}
                    onChange={(e) => setUploadCategory(e.target.value as FaqCategory)}
                    className="w-full rounded-xl border border-stone-surface bg-white px-4.5 py-2.5 text-xs font-semibold text-charcoal-primary shadow-xs outline-none transition focus:border-sky-blue focus:ring-1 focus:ring-sky-blue cursor-pointer appearance-none"
                  >
                    <option value="LOAN">금융 및 중도금대출</option>
                    <option value="TAX">세무 및 지방세 감면</option>
                    <option value="ADMIN">조합 설립인가 및 행정자격</option>
                  </select>
                  <svg className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-ash" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              <div className="pt-3 flex justify-end">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-full bg-midnight hover:bg-black text-white text-xs font-bold px-6 h-9.5 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? "등록 중…" : "FAQ 즉시 등록"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
