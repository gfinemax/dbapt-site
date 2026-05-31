"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type FAQProps = {
  isLoggedIn: boolean;
  isAdmin: boolean;
  faqs: any[];
  onRefresh: () => Promise<void>;
};

const MOCK_FAQS = [
  {
    id: "mock-faq-1",
    question: "중도금 대출 보증서 발급 시 필요한 자격 요건은 무엇입니까?",
    answer: "조합 설립인가 및 토지 소유권 등기 단계가 지속됨에 따라, 시공예정사 계약 심의가 마무리되면 HUG 주택도시보증공사 혹은 HF 한국주택금융공사의 보증서 발급 절차가 가동됩니다.\n\n개별 세대 기준으로는 신용평가 요건(7등급 이내), 서울/경기 거주 요건, 그리고 세대주 전원의 무주택 혹은 1주택 소유(입주 후 기존 주택 처분 약정서 제출 조건) 요건을 빈틈없이 충족하셔야 정상 대출이 실행됩니다. 향후 대출 금융사가 확정되면 현장 전담 파견단이 조합 사무실에서 1:1 집중 심사를 제공합니다.",
    category: "LOAN",
  },
  {
    id: "mock-faq-2",
    question: "분담금 납부 시 발생하는 취득세 및 조합 지방세 감면 기준은 무엇인가요?",
    answer: "지역주택조합 사업 과정에서 조합원 개인 명의 신축 주택에 대한 원시 취득 등록 처리는 법령에 따라 단계적으로 집행됩니다.\n\n취득세(지방세법 제11조 및 지방세특례제한법 관련 감면 요건)는 개별 조합원의 분담금 실비 대조 및 동작구청 신고를 통해 계산되며, 자산의 이중 과세 방지 및 신탁 수탁 자산 매칭 감면 등 세부 조율이 진행됩니다. 조합원의 편리한 신고를 위해 조합 공식 법무대행법인(월드)이 인허가 승인 시 단체 대행 접수 프로세스를 전개할 예정입니다.",
    category: "TAX",
  },
  {
    id: "mock-faq-3",
    question: "설립인가 취득 이후 조합원 자격을 안전하게 유지하기 위한 필수 조건은 무엇인가요?",
    answer: "주택법령상 지역주택조합원 자격은 [최초 조합설립인가 신청일로부터 입주 가능일까지] 단 하루도 단절됨이 없이 자격 법적 조건을 완벽하게 유지하셔야 안전한 등기가 완수됩니다.\n\n1. 세대주 자격 유지: 세대주 요건을 계속 유지해야 하며, 부득이한 주민등록 이전 시 세대주 여부를 즉각 원대 복귀하셔야 합니다.\n2. 거주 자격: 서울/인천/경기 거주 기간 요건.\n3. 주택 소유 요건: 주민등록등본상 세대원 전원을 합산하여 전용면적 85㎡ 이하 1가구 소유 또는 무주택 요건을 입주 완료 시까지 유지해야 합니다. (도중 다른 일반 아파트 분양권 취득 시 즉각 자격이 박탈되므로 절대 유의바랍니다.)",
    category: "ADMIN",
  },
] as const;

export function FaqAccordion({
  isAdmin,
  faqs = [],
  onRefresh,
}: FAQProps) {
  const [activeCategory, setActiveCategory] = useState<string>("ALL");
  const [activeFaqId, setActiveFaqId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showUploadModal, setShowUploadModal] = useState(false);

  // New FAQ Form State
  const [uploadQuestion, setUploadQuestion] = useState("");
  const [uploadAnswer, setUploadAnswer] = useState("");
  const [uploadCategory, setUploadCategory] = useState("ADMIN");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    { id: "ALL", label: "전체 보기" },
    { id: "LOAN", label: "금융/중도금대출" },
    { id: "TAX", label: "세무/지방세" },
    { id: "ADMIN", label: "조합행정/자격" },
  ] as const;

  const combinedData = useMemo(() => {
    const realFaqs = faqs.map((f) => ({
      id: f.id,
      question: f.question,
      answer: f.answer,
      category: f.category,
      isReal: true,
    }));

    let filteredReal = realFaqs;
    let filteredMock = [...MOCK_FAQS].map((f) => ({ ...f, isReal: false }));

    // Category Filter
    if (activeCategory !== "ALL") {
      filteredReal = filteredReal.filter((f) => f.category === activeCategory);
      filteredMock = filteredMock.filter((f) => f.category === activeCategory);
    }

    // Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      filteredReal = filteredReal.filter((f) => f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q));
      filteredMock = filteredMock.filter((f) => f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q));
    }

    return [...filteredReal, ...filteredMock];
  }, [faqs, activeCategory, searchQuery]);

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
                    onChange={(e) => setUploadCategory(e.target.value)}
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
