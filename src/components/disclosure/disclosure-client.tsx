"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { MeetingsTable, type MeetingCategory } from "./meetings-table";

type DisclosureClientProps = {
  onOpenPortal?: (category?: string, search?: string) => void;
  session?: {
    id: string;
    loginId: string | null;
    name: string;
    role: string;
    email?: string;
  } | null;
};

type TabId = "rules" | "meetings" | "accounting" | "operations";

const tabs = [
  { id: "rules", label: "1. 규약 및 연명부" },
  { id: "meetings", label: "2. 회의 및 행정" },
  { id: "accounting", label: "3. 회계 및 감사" },
  { id: "operations", label: "4. 사업 및 감리" },
] as const;

// 각 카테고리별 자료 리스트 정의
const disclosureData = {
  rules: {
    title: "규약 및 연명부",
    subtitle: "조합의 헌법인 규약과 공인된 조합원 소속 명부, 시공 협약 문서입니다.",
    badge: "Regulations & Agreements",
    items: [
      { id: "rules-1", title: "대방동 지역주택조합 정관 및 조합규약", desc: "조합원의 의무와 권리, 총회·이사회 의결 절차 등 조합의 법적 운영 기준을 명세한 정관 문서입니다.", date: "2026.02" },
      { id: "rules-2", title: "대방동지역주택조합 정식 조합원 연명부", desc: "동작구청 설립인가 및 정식 등재 완료된 입주 예정 조합원 연명 목록입니다. (개인정보 비식별 조치)", date: "2025.12" },
      { id: "rules-3", title: "공동사업주체 시공예정사 간의 업무협약서", desc: "대한민국 1군 메이저 브랜드 건설사와 체결한 사업 공동 추진 실무 협약 및 브랜드 사용 계약서 원본입니다.", date: "2025.07" },
    ]
  },
  meetings: {
    title: "회의 및 행정",
    subtitle: "총회 및 이사회 의결록과 구청 유관부서 대내외 공식 수발신 행정 문서입니다.",
    badge: "Meetings & Administration",
    items: [
      { 
        id: "meetings-1", 
        title: "총회의사록 문서함", 
        desc: "창립총회 및 최근 임시총회 안건 의결 결과, 조합원 서명 날인 등이 기재된 정식 공증 의사록 문서 보존 문서함입니다.", 
        date: "최근 업데이트: 2026.01", 
        count: 12,
        searchKey: "총회",
        categoryKey: "DISCLOSURE",
        bbsCategory: "총회 의사록",
        preview: ["창립총회 의사록 (공증 완료)", "2025년 제1차 정기총회 의사록", "2025년 제2차 임시총회 의사록"]
      },
      { 
        id: "meetings-2", 
        title: "이사회 회의록 문서함", 
        desc: "사무국 예산 조율, 협력사 계약 심의 등 이사회 및 감사 정례 의결 회의록이 안전하게 일괄 보관되어 있습니다.", 
        date: "최근 업데이트: 2026.01", 
        count: 18,
        searchKey: "이사회",
        categoryKey: "DISCLOSURE",
        bbsCategory: "이사회 회의록",
        preview: ["제12차 정기 이사회 회의록", "2026년 신년 이사회 의결서", "제11차 임시 이사회 회의록"]
      },
      { 
        id: "meetings-3", 
        title: "대관 공문서 문서함", 
        desc: "동작구청, 서울시 등 관청 수발신 공식 행정공문서 및 행정 실태조사 결과 보고 등 대내외 공문이 보존되어 있습니다.", 
        date: "최근 업데이트: 2026.01", 
        count: 14,
        searchKey: "공문",
        categoryKey: "DISCLOSURE",
        bbsCategory: "수발신 공문",
        preview: ["동작구청 행정실태조사 수신공문", "시정요구 조치 결과보고 제출문", "서울특별시 지구단위계획 관련 수신"]
      },
      { 
        id: "meetings-4", 
        title: "사업계획 및 고시문 문서함", 
        desc: "대방동 11-103 일대 주택건설 사업계획서(안) 및 지구단위계획 결정 고시(서울시 고시 제2022-291호) 등 인허가 원본 문서입니다.", 
        date: "최근 업데이트: 2025.08", 
        count: 4,
        searchKey: "사업시행계획",
        categoryKey: "DISCLOSURE",
        bbsCategory: "사업시행계획",
        preview: ["주택건설 사업계획 승인 고시문", "지구단위계획 결정 고시 원본", "환경영향평가 협의 의견서"]
      },
    ]
  },
  accounting: {
    title: "회계 및 감사",
    subtitle: "자금관리 신탁사의 에스크로 입출금 내역과 외부감사인의 투명한 회계보고서입니다.",
    badge: "Accounting & Audit",
    items: [
      { id: "acc-1", title: "2025년도 정기 외부회계감사 정밀 보고서", desc: "주택법 제12조에 의거하여 독립된 공인회계법인으로부터 분담금 집행 일체를 정밀 감사받은 결과보고서입니다.", date: "2026.02" },
      { id: "acc-2", title: "조합 내부 감사진 정기 분기별 감사 보고서", desc: "입주예정 조합원 대표 감사진이 조합 사무국 예산 수립 및 계약 집행 적정성을 자체 감사한 감독 결과입니다.", date: "2026.01" },
      { id: "acc-3", title: "2026년도 연간 자금운용 계획 및 차입 예산서", desc: "2026년 한 해 동안 집행 예정인 부동산 매입, 용역비, 차입 금융 조달(LOI 확보) 관련 전체 운용 계획입니다.", date: "2026.01" },
      { id: "acc-4", title: "신영부동산신탁 수탁 에스크로 자금입출금명세서", desc: "조합원 분담금 임의 유출 방지를 위해 에스크로 안전 계좌로 관리된 월별 자금 입출금 세부 내역서입니다.", date: "2026.02" },
    ]
  },
  operations: {
    title: "사업, 계약 및 감리",
    subtitle: "조합이 체결한 정식 용역 계약 원본과 감리전문가의 월간 실적서입니다.",
    badge: "Operations, Contracts & Supervision",
    items: [
      { id: "ops-1", title: "설계·용역·부동산 대행사별 정식 계약서 원본 일람", desc: "하우드엔지니어링(설계), 솔롱고스(매입), 월드(법률) 등 조합이 정식 체결하고 공증한 일체의 계약서 모음입니다.", date: "2025.07" },
      { id: "ops-2", title: "대방동 현장 월별 공사진행 및 토지 매입 상황판", desc: "현장 토지 소유권 확보 소송 추진 현황과 토지매입 실무 핫라인 소통 기록, 매입 비율 현황 보고입니다.", date: "2026.02" },
      { id: "ops-3", title: "분기별 조합 마일스톤 추진실적 실무 보고서", desc: "지구단위계획 완수 이후 소방·설비 설계 용역사 발주 등 단계별 마일스톤 도달 실적에 대한 조합 공식 보고입니다.", date: "2025.09" },
      { id: "ops-4", title: "건축·소방 감리원 안전점검 및 월간 감리보고서", desc: "인허가 관련 정밀 안전 확보와 법령 준수를 위해 감리 기술자가 정밀 점검하고 관청에 제출한 공식 실적서입니다.", date: "2025.11" },
    ]
  }
};

// 각 탭메뉴별 서브메뉴(세부 분류) 정의
const subMenus = {
  rules: [
    { label: "조합규약", id: "rules-1" },
    { label: "조합연명부", id: "rules-2" },
    { label: "시공자 협약서", id: "rules-3" },
  ],
  meetings: [
    { label: "총회 의사록", id: "meetings-1" },
    { label: "이사회 회의록", id: "meetings-2" },
    { label: "수발신 공문", id: "meetings-3" },
    { label: "사업시행계획", id: "meetings-4" },
  ],
  accounting: [
    { label: "외부회계감사", id: "acc-1" },
    { label: "내부감사", id: "acc-2" },
    { label: "자금운용계획", id: "acc-3" },
    { label: "에스크로 명세서", id: "acc-4" },
  ],
  operations: [
    { label: "용역 계약서", id: "ops-1" },
    { label: "공사진행/토지", id: "ops-2" },
    { label: "추진실적", id: "ops-3" },
    { label: "감리 보고서", id: "ops-4" },
  ],
} as const;

export function DisclosureClient({ onOpenPortal, session }: DisclosureClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isLoggedIn = !!session;
  
  const [activeTab, setActiveTab] = useState<TabId>("rules");
  const [activeSubTab, setActiveSubTab] = useState<string>("all");
  const [isLeftDrawerOpen, setIsLeftDrawerOpen] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<typeof disclosureData.meetings.items[number] | null>(null);
  const [mounted, setMounted] = useState(false);
  const isScrollingRef = useRef(false);
  const isSubTabClickRef = useRef(false);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setMounted(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  // 메인 탭 변경 시 서브 탭을 '전체 보기'("all")로 리셋
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setActiveSubTab("all");
  }, [activeTab]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // 좌측 문서함 드로어 활성화 시 본문 스크롤 차단 처리
  useEffect(() => {
    if (isLeftDrawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isLeftDrawerOpen]);

  // URL에서 탭 정보를 읽어와 초기 활성화 탭 설정
  useEffect(() => {
    const tabParam = searchParams.get("tab") as TabId;
    if (tabParam && ["rules", "meetings", "accounting", "operations"].includes(tabParam)) {
      // 탭 파라미터가 있을 경우 비동기 상태 업데이트 및 지연 스크롤
      const timer = setTimeout(() => {
        setActiveTab(tabParam);
        const element = document.getElementById(`section-${tabParam}`);
        if (element) {
          const offsetTop = element.offsetTop - 200;
          window.scrollTo({ top: offsetTop, behavior: "smooth" });
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  // 서브 탭 변경 완료 후, 레이아웃 변경이 반영된 시점에 정확한 위치로 스무스 스크롤 이동
  useEffect(() => {
    if (!isSubTabClickRef.current) return;
    isSubTabClickRef.current = false;

    const timer = setTimeout(() => {
      const element = document.getElementById(`section-${activeTab}`);
      if (!element) return;

      isScrollingRef.current = true;
      const offsetTop = element.offsetTop - 200;

      window.scrollTo({
        top: offsetTop,
        behavior: "smooth",
      });

      setTimeout(() => {
        isScrollingRef.current = false;
      }, 850);
    }, 100);

    return () => clearTimeout(timer);
  }, [activeSubTab, activeTab]);

  // 스크롤 감지 및 현재 보고 있는 섹션 활성화 (Scroll Spy)
  useEffect(() => {
    const handleScroll = () => {
      if (isScrollingRef.current) return;

      // 서브 탭 필터링이 활성화된 경우 스크롤 스파이에 의한 탭 자동 전환을 유예합니다.
      // (섹션 크기가 극도로 작아지면서 탭이 잘못 변경되어 레이아웃이 꼬이는 현상 완전 차단)
      if (activeSubTab !== "all") return;

      const scrollPosition = window.scrollY + 220; // 상단 보정

      for (const tab of tabs) {
        const element = document.getElementById(`section-${tab.id}`);
        if (!element) continue;

        const offsetTop = element.offsetTop;
        const offsetHeight = element.offsetHeight;

        if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
          setActiveTab(tab.id);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [activeSubTab]);

  // 탭 클릭 시 스무스 스크롤 이동
  const handleTabClick = (tabId: TabId) => {
    setActiveTab(tabId);
    const element = document.getElementById(`section-${tabId}`);
    if (!element) return;

    isScrollingRef.current = true;
    const offsetTop = element.offsetTop - 200;

    window.scrollTo({
      top: offsetTop,
      behavior: "smooth",
    });

    setTimeout(() => {
      isScrollingRef.current = false;
    }, 850);
  };

  return (
    <div className="w-full">
      {/* 1. 공개자료 대형 배너 (Hero Section) - 조합소개 감성 계승 */}
      <section className="bg-gradient-to-br from-warm-canvas via-parchment-card to-stone-surface/30 pt-16 pb-20 border-b border-stone-surface text-center">
        <div className="site-container max-w-4xl px-4">
          <span className="inline-flex rounded-full bg-sky-blue/10 px-4 py-1.5 text-xs font-bold text-sky-blue uppercase tracking-wider">
            Disclosures
          </span>
          <h1 className="mt-6 text-4xl sm:text-5xl font-black text-charcoal-primary leading-tight tracking-tight">
            투명하게 밝히는<br />
            <span className="text-sky-blue">대방동의 정직한 지표</span>
          </h1>
          <p className="mt-6 text-base sm:text-lg text-graphite/90 max-w-2xl mx-auto leading-relaxed">
            당 조합은 주택법령의 의무 정보공개 대상인 14개 핵심 자료 일체를 온·오프라인 보안망 내에 100% 개방하여, 어떠한 밀실 의사결정도 방지하고 조합원들의 자산 권익을 투명하게 수호합니다.
          </p>
        </div>
      </section>

      {/* 2. 스티키 서브 내비게이션 탭 바 (Sticky Sub Nav) */}
      <nav className="sticky top-18 z-10 bg-warm-canvas/90 backdrop-blur border-b border-stone-surface shadow-xs transition-all duration-200 py-2 space-y-2">
        <div className="site-container max-w-4xl px-4 relative">
          {/* 우측 페이드 아웃 그라데이션 오버레이 (모바일용 가로 스크롤 시각 유도) */}
          <div className="absolute right-4 top-0 bottom-0 w-12 bg-gradient-to-l from-warm-canvas via-warm-canvas/60 to-transparent pointer-events-none z-10 md:hidden animate-in fade-in" />
          
          <div className="flex justify-start md:justify-center items-center gap-1 sm:gap-4 overflow-x-auto whitespace-nowrap scrollbar-none py-1.5 text-sm font-semibold pr-12 md:pr-0">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    handleTabClick(tab.id);
                    setActiveSubTab("all");
                  }}
                  className={cn(
                    "px-4 py-2 rounded-full text-xs sm:text-sm transition-all duration-200 cursor-pointer font-bold",
                    isActive
                      ? "bg-midnight text-white shadow-sm"
                      : "text-graphite hover:text-charcoal-primary hover:bg-stone-surface/50"
                  )}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 서브메뉴 피처 라인 (Submenu Feature Row) */}
        <div className="site-container max-w-4xl px-4 border-t border-stone-surface/50 pt-2 relative">
          {/* 우측 페이드 아웃 그라데이션 오버레이 (모바일용 가로 스크롤 시각 유도) */}
          <div className="absolute right-4 top-2 bottom-0 w-12 bg-gradient-to-l from-warm-canvas via-warm-canvas/60 to-transparent pointer-events-none z-10 md:hidden animate-in fade-in" />
          
          <div className="flex justify-start md:justify-center items-center gap-1.5 sm:gap-2 overflow-x-auto whitespace-nowrap scrollbar-none py-1 text-xs pr-12 md:pr-0">
            {subMenus[activeTab].map((sub) => {
              const isActive = activeSubTab === sub.id;
              return (
                <button
                  key={sub.id}
                  onClick={() => {
                    isSubTabClickRef.current = true;
                    const nextSubTab = isActive ? "all" : sub.id;
                    setActiveSubTab(nextSubTab);
                  }}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-[11px] font-bold border transition-all duration-150 cursor-pointer",
                    isActive
                      ? "bg-[#f8f7f4] border-midnight text-midnight font-extrabold shadow-2xs"
                      : "bg-white border-stone-surface text-ash hover:text-graphite hover:border-ash"
                  )}
                >
                  {sub.label}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* 3. 본문 통합 내용 영역 (Sections) */}
      <div className="site-container max-w-4xl px-4 py-16 sm:py-24 space-y-24 sm:space-y-36">
        {Object.entries(disclosureData).map(([key, data]) => {
          const tabKey = key as TabId;
          return (
            <section key={tabKey} id={`section-${tabKey}`} className="scroll-mt-52 min-h-[480px]">
              <div className="max-w-xl mb-10">
                <span className="inline-flex rounded-full bg-ember-orange/10 px-3 py-1 text-[10px] font-bold text-ember-orange uppercase tracking-wider">
                  {data.badge}
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-charcoal-primary tracking-tight leading-tight mt-3">
                  {data.title}
                </h2>
                <p className="text-xs sm:text-sm text-graphite mt-2 leading-relaxed">
                  {data.subtitle}
                </p>
              </div>

              {/* 개별 자료 목록 */}
              {/* 개별 자료 목록 */}
              {tabKey === "meetings" ? (
                <div className="grid gap-6 md:grid-cols-2">
                  {data.items
                    .map((item) => {
                      const folderItem = item as {
                      id: string;
                      title: string;
                      desc: string;
                      date: string;
                      count: number;
                      searchKey: string;
                      categoryKey: string;
                      bbsCategory: string;
                      preview: string[];
                    };
                    const isSelected = activeSubTab === folderItem.id;
                    const isAnySelectedInThisSection = subMenus[tabKey].some((sub) => sub.id === activeSubTab);
                    
                    return (
                      <div 
                        key={folderItem.id}
                        className={cn(
                          "stone-card bg-white p-6 rounded-2xl border flex flex-col justify-between transition-all duration-500 relative group",
                          isAnySelectedInThisSection
                            ? isSelected
                              ? "border-sky-blue ring-1 ring-sky-blue/30 shadow-lg scale-[1.02] z-2 opacity-100 bg-[#fdfdfc]"
                              : "opacity-45 scale-[0.98] blur-[0.2px] border-stone-surface"
                            : "border-stone-surface hover:shadow-md hover:scale-[1.01] opacity-100"
                        )}
                      >
                        <div>
                          {/* Folder Top Meta */}
                          <div className="flex items-center justify-between text-[10px] font-bold text-ash font-mono">
                            <span className="flex items-center gap-1.5 text-sky-blue font-bold">
                              <span>📂</span> 문서 보존함
                            </span>
                            <span className="bg-stone-surface px-2.5 py-0.5 rounded-full text-[9px] font-bold text-charcoal-primary font-mono">
                              총 {folderItem.count}건 보관
                            </span>
                          </div>

                          <h3 className="text-[14.5px] font-bold text-charcoal-primary mt-3.5 leading-snug">
                            {folderItem.title}
                          </h3>
                          <p className="text-xs text-graphite mt-2 leading-5 font-normal">
                            {folderItem.desc}
                          </p>

                          {/* 문서함 미리보기 리스트 */}
                          <div className="mt-4 p-4 rounded-xl bg-parchment-card border border-stone-surface/60 border-dashed relative overflow-hidden">
                            <p className="text-[10px] font-bold text-ash uppercase tracking-wider mb-2 font-mono flex items-center gap-1.5 select-none">
                              <span className="size-1.5 rounded-full bg-sky-blue animate-pulse"></span>
                              문서함 내부 수납 목록
                            </p>
                            <ul className="space-y-1.5 text-[11px] text-graphite/90 font-medium">
                              {folderItem.preview.map((p, idx) => (
                                <li key={idx} className="flex items-center gap-1.5 truncate">
                                  <span className="text-[10px] text-sky-blue">•</span>
                                  <span className="truncate">{p}</span>
                                </li>
                              ))}
                            </ul>
                            
                            {/* 비로그인 시 블러 및 락 처리 */}
                            {!isLoggedIn && (
                              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-parchment-card/30 to-parchment-card backdrop-blur-[1.5px] flex items-center justify-center">
                                <span className="text-[10px] text-ember-orange font-bold bg-white/95 border border-stone-surface px-3 py-1.5 rounded-full shadow-xs flex items-center gap-1 select-none">
                                  <span>🔒</span> 로그인 후 {folderItem.count}건 전체 조회
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* 문서함 열기 클릭 시 좌측 드로어 열고 세부 데이터 세팅 */}
                        <div className="mt-6 pt-4 border-t border-stone-surface/60">
                          <div className="flex items-center justify-between">
                            <span className={cn(
                              "text-[10px] font-bold flex items-center gap-1",
                              isLoggedIn ? "text-meadow-green" : "text-ember-orange"
                            )}>
                              {isLoggedIn ? (
                                <><span>🔓</span> 자료실 연동 가동 중</>
                              ) : (
                                <><span>🔒</span> 기밀 보안 그룹</>
                              )}
                            </span>
                            <Button
                              onClick={() => {
                                setSelectedFolder(folderItem);
                                setIsLeftDrawerOpen(true);
                              }}
                              size="sm"
                              className="rounded-full text-[11px] font-bold bg-midnight hover:bg-midnight/90 text-white cursor-pointer h-8 px-4"
                            >
                              문서함 열기
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2">
                  {data.items
                    .map((item) => {
                      const isSelected = activeSubTab === item.id;
                      const isAnySelectedInThisSection = subMenus[tabKey].some((sub) => sub.id === activeSubTab);
                      
                      return (
                        <div 
                          key={item.id}
                          className={cn(
                            "stone-card bg-white p-6 rounded-2xl border flex flex-col justify-between transition-all duration-500 relative group",
                            isAnySelectedInThisSection
                              ? isSelected
                                ? "border-sky-blue ring-1 ring-sky-blue/30 shadow-lg scale-[1.02] z-2 opacity-100 bg-[#fdfdfc]"
                                : "opacity-45 scale-[0.98] blur-[0.2px] border-stone-surface"
                              : "border-stone-surface hover:shadow-md hover:scale-[1.01] opacity-100"
                          )}
                        >
                      <div>
                        <div className="flex items-center justify-between text-[10px] font-bold text-ash font-mono">
                          <span>기준일: {item.date}</span>
                          <span className={cn(
                            "rounded-full px-2 py-0.5 text-[9px] font-bold tracking-wider",
                            isLoggedIn ? "bg-meadow-green/10 text-meadow-green" : "bg-ember-orange/10 text-ember-orange"
                          )}>
                            {isLoggedIn ? "열람 가능" : "보안 잠금"}
                          </span>
                        </div>
                        <h3 className="text-[14.5px] font-bold text-charcoal-primary mt-3 leading-snug">
                          {item.title}
                        </h3>
                        <p className="text-xs text-graphite mt-2.5 leading-5 font-normal">
                          {item.desc}
                        </p>
                      </div>

                      {/* 로그인 유도 & 프리뷰 (비로그인 상태) vs 정식 자료실 액션 (로그인 상태) */}
                      <div className="mt-6 pt-4 border-t border-stone-surface/60">
                        {isLoggedIn ? (
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-meadow-green font-bold flex items-center gap-1">
                              <span>🔓</span> 정식 세션 내 보호 열람 중
                            </span>
                            <Button
                              onClick={() => {
                                if (onOpenPortal) onOpenPortal();
                                else window.dispatchEvent(new CustomEvent('open-portal'));
                              }}
                              size="sm"
                              className="rounded-full text-[11px] font-bold bg-sky-blue hover:bg-sky-blue/90 text-white cursor-pointer h-8"
                            >
                              자료실 열기
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {/* 고해상도 정보 보호용 리드미컬하고 세련된 디테일 블러 프레임 */}
                            <div className="bg-parchment-card border border-stone-surface border-dashed p-3.5 rounded-xl text-[10px] space-y-2 select-none pointer-events-none opacity-50 relative overflow-hidden">
                              {/* 그라데이션 오버레이로 감각적인 숨김 처리 */}
                              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-parchment-card/30 to-parchment-card backdrop-blur-[2.5px] z-1" />
                              <div className="flex justify-between font-mono">
                                <span className="font-bold text-ash">문서분류:</span>
                                <span className="text-charcoal-primary">DISCLOSURE-SECURE-RAW</span>
                              </div>
                              <div className="flex justify-between font-mono">
                                <span className="font-bold text-ash">해시코드:</span>
                                <span className="text-charcoal-primary">SHA256-8F2B...7D0A</span>
                              </div>
                              <div className="flex justify-between font-mono">
                                <span className="font-bold text-ash">파일형태:</span>
                                <span className="text-charcoal-primary">PUBLIC-SEALED-PDF</span>
                              </div>
                            </div>

                            <div className="flex items-center justify-between">
                              <span className="text-[10px] text-ember-orange font-bold flex items-center gap-1">
                                <span>🔒</span> 기밀 문서 보호 대상
                              </span>
                              <Button
                                onClick={() => {
                                  alert("이 문서는 대방동지역주택조합 정식 조합원 기밀 의무공개 자료입니다.\n자산 가치 보호를 위해 조합원 로그인 세션 내에서만 암호화 열람 및 영수증 매칭이 가능합니다.");
                                  router.push("/login");
                                }}
                                variant="outline"
                                size="sm"
                                className="rounded-full text-[11px] font-bold border-ember-orange text-ember-orange hover:bg-ember-orange/5 cursor-pointer h-8"
                              >
                                조합원 로그인
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>

                    </div>
                  );
                })}
                </div>
              )}
            </section>
          );
        })}
      </div>

      {/* 좌측 사이드 슬라이드 오버 (Drawer) 패널 - 문서함 열기 (React Portal로 body에 직접 마운트하여 stacking context 레이아웃 버그 완전 차단) */}
      {mounted && isLeftDrawerOpen && createPortal(
        <>
          <div
            onClick={() => setIsLeftDrawerOpen(false)}
            className="fixed inset-0 z-40 bg-black/35 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
          />

          <div
            className="fixed inset-y-0 left-0 z-50 w-full max-w-2xl bg-warm-canvas border-r border-stone-surface shadow-2xl p-6 sm:p-8 flex flex-col overflow-y-auto animate-in slide-in-from-left duration-300 ease-out"
            aria-label="문서함 열기 상세 드로어"
          >
            <div className="flex items-center justify-between pb-6 border-b border-stone-surface">
              <div className="flex items-center gap-2">
                <span className="flex size-7 items-center justify-center rounded-full bg-midnight text-xs font-semibold text-white">
                  📂
                </span>
                <div>
                  <h2 className="text-base font-bold text-charcoal-primary">
                    {selectedFolder?.title || "문서함"}
                  </h2>
                  <p className="text-[11px] text-ash mt-0.5 font-medium">
                    대방동 지역주택조합 공인 보존 문서 목록
                  </p>
                </div>
              </div>
              
              <button
                onClick={() => setIsLeftDrawerOpen(false)}
                className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full border border-stone-surface bg-[#f8f7f4] text-xs font-medium text-graphite hover:bg-stone-surface active:bg-[#e8e6e1] transition duration-200 cursor-pointer"
              >
                <svg className="w-3.5 h-3.5 text-ash" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
                닫기
              </button>
            </div>

            <div className="flex-1 mt-6">
              {selectedFolder && (
                <MeetingsTable
                  isLoggedIn={isLoggedIn}
                  onOpenPortal={onOpenPortal}
                  router={router}
                  initialFilterCat={selectedFolder.bbsCategory as MeetingCategory}
                  initialSearchQuery=""
                  onBackToFolders={() => setIsLeftDrawerOpen(false)}
                />
              )}
            </div>
          </div>
        </>,
        document.body
      )}
    </div>
  );
}
