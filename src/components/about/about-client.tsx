"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type AboutClientProps = {
  onOpenPortal?: () => void;
};

type TabId = "greetings" | "commitment" | "history" | "organization" | "location";

// [사업추진 전체 경과보고 일람 데이터 전문]
const fullHistoryData = [
  { date: "2001.02.04", content: "군부대의 법면보강, 우수관로 설치로 빗물(토사)피해 발생(3차례)", note: "군부대 부지" },
  { date: "2006.10.01", content: "공동주택건립을 위한 지구단위계획구역지정 및 계획수립을 위한 주민제안서 접수 (조합 → 동작구청)", note: "지구단위계획" },
  { date: "2006.10.18", content: "관련부서 협의(2006. 10. 18~27까지 / 재무과, 주택과, 환경녹지과, 교통행정과, 토목과, 치수과, 공군복지근무지원단 등 6개과) - 협의결과 : 군사시설 사업구역 편입불가", note: "지구단위계획" },
  { date: "2006.11.30", content: "공동주택건립을 위한 지구단위계획구역지정 및 계획수립을 위한 주민제안서 보완접수(조합 → 동작구청)", note: "지구단위계획" },
  { date: "2007.01.19", content: "공동주택건립을 위한 지구단위계획구역지정 및 계획수립을 위한 주민제안서 보완접수(조합 → 동작구청)", note: "지구단위계획" },
  { date: "2009.02.20", content: "창립총회 개최 (여의도 국민일보 빌딩)", note: "조합 설립" },
  { date: "2009.03", content: "공동주택건립을 위한 지구단위계획구역지정 및 계획수립을 위한 주민제안서 철회접수(조합 → 동작구청)", note: "지구단위계획" },
  { date: "2009.07.13", content: "대방동지역주택조합 설립인가 완료 (동작구청 → 조합)", note: "조합 설립" },
  { date: "2009.08", content: "국회 청원심사회 의회 민원 제출 - 군부대 토지 기부대양여 관련", note: "군부대 부지" },
  { date: "2010.03.31", content: "군부대 토지 기부대양여 관련 청원서 심의(국회국방위원회, 청원심사소위원회) - 군부대 토지 기부대양여에 대해 계속심사 예정", note: "군부대 부지" },
  { date: "2011.12.30", content: "군부대 토지 기부대양여 관련 일반민원 접수 (조합-> 국회 국방위원회)", note: "군부대 부지" },
  { date: "2012.02.03", content: "국방위원장식 간담회 개최(국방부, 공군, 지역구의원, 관계자 등) - 조건부 기부양여 결론 및 동작구 협조아래 \"군부대 토지 기부대양여\" 처리 촉구", note: "군부대 부지" },
  { date: "2012.02.13", content: "청와대, 감사원 민원 접수(약 1500명 서명)", note: "군부대 부지" },
  { date: "2012.07.13", content: "군부대 토지 기부대양여 관련 검토결과 회신(국방부 → 조합) - 공익사업시행 자격이 있는 자가 건의 할 경우 협의요청 가능", note: "군부대 부지" },
  { date: "2013.05.01", content: "대방동 지역주택조합 조합장 명의 변경 (안충환 → 안동연)", note: "조합 운영" },
  { date: "2015.09.18", content: "대방동아파트 11-103 일대 주택건설사업을 위한 지구단위계획수립 접수 (조합 → 동작구청)", note: "지구단위계획" },
  { date: "2015.10.16", content: "대방동아파트 11-103 일대 주택건설사업을 위한 지구단위계획수립 \"주민제안 반려\" (동작구청 → 조합)", note: "지구단위계획" },
  { date: "2016.02.22", content: "대방동아파트 11-103 일대 주택건설사업을 위한 지구단위계획수립 접수 (조합 → 동작구청)", note: "지구단위계획" },
  { date: "2016.03.14", content: "사전접수 후 검토 도서 제출 후 2주 검토 진행", note: "지구단위계획" },
  { date: "2016.03.30", content: "대방동아파트 11-103 일대 주택건설사업을 위한 지구단위계획수립 접수 (조합 → 동작구청)", note: "지구단위계획" },
  { date: "2016.04.07", content: "대방동아파트 11-103 일대 주택건설사업을 위한 지구단위계획수립 \"보완통보\" (동작구청 → 조합)", note: "지구단위계획" },
  { date: "2016.05.03", content: "대방동아파트 11-103 일대 주택건설사업을 위한 지구단위계획수립 \"보완접수\" (조합 → 동작구청)", note: "지구단위계획" },
  { date: "2016.08.17", content: "대방동 11-103번지 일대(군부대 점유지) 측량을 위한 협조 공문 (조합 → 동작구청)", note: "지구단위계획" },
  { date: "2016.10.20", content: "대방동아파트 11-103 일대 주택건설사업을 위한 지구단위계획수립 \"1차보완접수\"(조합 → 동작구청)", note: "지구단위계획" },
  { date: "2017.01.26", content: "대방동아파트 11-103 일대 주택건설사업을 위한 지구단위계획수립 \"보완접수(공군항공안전단)\"(조합 → 동작구청) - 공군항공안전단 부지경계 및 수송부대건축물 제외 측량 반영", note: "지구단위계획" },
  { date: "2017.03.29", content: "대방동아파트 11-103 일대 주택건설사업을 위한 지구단위계획수립 \"2차보완접수\"(조합 → 동작구청)", note: "지구단위계획" },
  { date: "2017.06.12", content: "공공기여계획 관련 서울시 관련부서 검토의견 통보(동작구청 → 조합) - 보훈단체 사무실 용도 '공공시설 등'으로 보기 어려움, 건축허가 시점 부지가액 최종 확인 오차 최소화, 기부채납 공공시설 등은 별도 부지로 조성 검토", note: "지구단위계획" },
  { date: "2017.07.17", content: "대방동아파트 11-103 일대 주택건설사업을 위한 지구단위계획수립 \"보완접수 (교육문화과 : 지역문화예술창작공간)\"(조합 → 동작구청)", note: "지구단위계획" },
  { date: "2017.08.29", content: "서울시 「주택법 지구단위계획 의제처리 개선방안 2017.08.29」 방침 후 서울시 상정예정", note: "지구단위계획" },
  { date: "2017.10.12", content: "시ㆍ구 합동회의 - 국토계획법 행정절차 이행 내지 법규 검토후 서울시 상정 필요", note: "지구단위계획" },
  { date: "2017.10.23", content: "주택법 사전자문제 폐지에 따른 행정절차 변경(국토계획법) 요청 (조합 → 동작구청)", note: "지구단위계획" },
  { date: "2018.01.03", content: "대방동 11-103번지 일대 주택건설사업을 위한 지구단위계획수립(안) 주민제안보완 도서 접수(조합 → 동작구청)", note: "지구단위계획" },
  { date: "2018.01.03", content: "지구단위계획 수립(안) 접수(동작구)", note: "지구단위계획" },
  { date: "2018.01.05", content: "지구단위계획(안) 주민의견청취 요청 공문 접수(조합 → 동작구청)", note: "지구단위계획" },
  { date: "2018.01.18", content: "주민공람공고(14일) 및 관련부서 협의(2018.01.18. ~ 2018.01.31)", note: "지구단위계획" },
  { date: "2018.07.26", content: "동작구 도시계획위원회 심의 (조건부 동의) - 주요의견: 조감도를 배치계획에 맞게 수정하고, 용마산 방향 통경축 확보를 통한 개방감 조성 필요", note: "지구단위계획" },
  { date: "2018.10.31", content: "대방동 11-103번지 일대 주택건설사업을 위한 지구단위계획수립(안) 주민제안보완 도서 접수(조합 → 동작구청)", note: "지구단위계획" },
  { date: "2018.11.02", content: "시·구 회의 - 평균층수 불가, 용도지역 상향 없는 제2종 7층 범위에서 계획 수립", note: "지구단위계획" },
  { date: "2018.11.22", content: "4차 관련부서 협의(국토계획법, 평균층수 적용 / 2018.11.22. ~ 2018.12.13. 관련부서 20개)", note: "지구단위계획" },
  { date: "2019.02.11", content: "대방동 11-103번지 일대 주택건설사업을 위한 지구단위계획수립(안) 주민제안보완 도서 접수(조합 → 동작구청)", note: "지구단위계획" },
  { date: "2019.02.21", content: "주민재공람공고(14일) 및 관련부서 협의(2019.02.21. ~ 2019.03.07)", note: "지구단위계획" },
  { date: "2019.04.01", content: "대방동 11-103번지 일대 주택건설사업을 위한 지구단위계획수립(안) 주민제안보완 도서 접수(조합 → 동작구청)", note: "지구단위계획" },
  { date: "2019.04.30", content: "지구단위계획 수립(안) 접수 및 서울시 최종 상정 (동작구 → 서울시)", note: "지구단위계획" },
  { date: "2019.05.13", content: "공군항공안전단 협의 및 현장 담당자 대면 설명 완료 (~2019.05.20)", note: "지구단위계획" },
  { date: "2019.06.03", content: "조치계획 항공안전단 공문서 제출 및 주택건설사업 동의 의결 확보", note: "지구단위계획" },
  { date: "2019.06.21", content: "서울시 도시건축공동소위원회 사전자문 (결과: 통경축 확보 및 도로 확폭 필요성 재검토)", note: "지구단위계획" },
  { date: "2019.08.30", content: "대방동 11-103번지 일대 주택건설사업을 위한 지구단위계획수립(안) 주민제안보완 도서 및 조치계획 접수(조합 → 동작구청)", note: "지구단위계획" },
  { date: "2019.10.11", content: "서울시 도시건축공동소위원회 사전자문 (결과: 개방감 확보 위한 건축배치 재검토 및 주민동의율 제시)", note: "지구단위계획" },
  { date: "2019.12.31", content: "소위원회 조치계획 지연공문 발송 및 서울시 의견에 따른 통경축 논리 확보 추진", note: "지구단위계획" },
  { date: "2020.02.28", content: "코로나19 확산 방지에 의한 서울시 도시건축공동위원회 심의 잠정 보류 통보 수령", note: "지구단위계획" },
  { date: "2020.05.13", content: "대방동지역주택조합 임시총회 소집 통지 공문서 발송 (조합 → 조합원)", note: "총회" },
  { date: "2020.06.05", content: "지구단위계획수립 및 건축심의 용역사 핀시어반이엔씨 용역계약 체결", note: "용역계약" },
  { date: "2020.10.27", content: "대방동지역주택조합 주택건설사업 공공기여(예정)시설에 대한 동작구 협의 진행", note: "지구단위계획" },
  { date: "2020.12.30", content: "사전자문 2차 조치계획 지연공문 발송 및 항공안전단 국유재산법 심의 대기", note: "지구단위계획" },
  { date: "2021.01.28", content: "지구단위계획수립(안) 서울시 도시건축공동위원회 소위원회자문(2차) 조치계획 접수(조합 → 동작구청)", note: "지구단위계획" },
  { date: "2021.02.26", content: "소위원회자문(2차) 조치계획 보완접수(조합 → 동작구청)", note: "지구단위계획" },
  { date: "2021.03.02", content: "지역주택조합 연간 자금운용 계획 및 자금 집행실적 정기 보고 제출", note: "조합 운영" },
  { date: "2021.03.03", content: "소위원회자문(2차) 조치계획 보완접수 완료 (조합 → 동작구청)", note: "지구단위계획" },
  { date: "2021.06.15", content: "지구단위계획수립(안) 서울시 도시건축공동위원회 소위원회자문(3차) 조치계획 접수 및 서울시 최종 상정", note: "지구단위계획" },
  { date: "2021.06.17", content: "서울시 도시건축공동소위원회 3차 사전자문 통과 (심의 상정 가결 - 용마산 통경축 및 스카이라인 개선 반영)", note: "지구단위계획" },
  { date: "2021.08.23", content: "대방동 11-103번지 일대 주택건설사업을 위한 지구단위계획수립(안) 서울시 도시건축공동위원회 심의 공식 접수", note: "지구단위계획" },
  { date: "2021.10.29", content: "서울특별시 지구단위계획(제2종 7층 등) 수립기준 개정에 따른 조합의견서 접수 (조합 → 동작구청)", note: "지구단위계획" },
  { date: "2021.11.24", content: "서울시 도시건축공동위원회 본 심의 (결과: 용적률 상향 통한 공공기여 추가 검토 및 출입로 동선 재검토 보류)", note: "지구단위계획" },
  { date: "2022.04.21", content: "서울시 도시건축공동위원회 수권소위원회 심의 (결과: 수정가결 완료)", note: "지구단위계획" },
  { date: "2022.06.02", content: "주민공람공고 실시 (14일간, 시정신문 및 동아일보 게재)", note: "지구단위계획" },
  { date: "2022.06.30", content: "대방동 일대 도시관리계획 결정 및 지형도면고시 완료 (서울특별시 고시 제2022-291호)", note: "지구단위계획" },
  { date: "2022.07.15", content: "지구단위계획수립 심의 통과 완수에 따른 용역비 최종 청구 (핀시어반이엔씨)", note: "용역계약" },
  { date: "2023.02.28", content: "세무법인 청솔과 세무 회계 용역 계약 체결", note: "용역계약" },
  { date: "2023.04.04", content: "영설계에프엔씨와 소방설비설계용역 계약 완료", note: "용역계약" },
  { date: "2023.07.01", content: "서울시 정비사업 투명 정보공개 플랫폼 '정보몽땅' 대방동지역주택조합 정식 정보공개 등록", note: "정보공개" },
  { date: "2023.09.07", content: "2023년 대방동지역주택조합 투명 운영 현장실태조사 수령", note: "실태조사" },
  { date: "2023.12.02", content: "대의원회의 소집 및 건축심의를 위한 동의서 징구 현황 최종 검토", note: "조합 운영" },
  { date: "2024.02.20", content: "회계법인 청솔과 정식 외부회계감사 집행 계약 체결", note: "용역계약" },
  { date: "2025.02.05", content: "2024년 지역주택조합 실태조사 결과 통지 및 행정지도 공문 수령", note: "실태조사" },
  { date: "2025.02.11", content: "조합원 투명 소통 및 정보 공유를 위한 입주조합원 공식 소통방 개설", note: "조합 운영" },
  { date: "2025.02.12", content: "솔롱고스산업개발과 부동산매입용역계약 정식 체결", note: "용역계약" },
  { date: "2025.03.27", content: "부동산 매입 및 소유권 원활 확보 관련 토지등소유자 대상 공식 공문 발송", note: "토지매입" },
  { date: "2025.04.22", content: "조합의 소유권 소송 및 정밀 법률 보호를 위해 법무법인 '월드' 정식 선임 완료", note: "용역계약" },
  { date: "2025.05.15", content: "메리츠증권 브릿지 금융조달 공식 금융참여의향서(LOI) 확보 완료", note: "자금조달" },
  { date: "2025.07.21", content: "기존 건축설계사무소(삼하건축사)와의 설계용역 계약 해지 절차 완료", note: "계약해지" },
  { date: "2025.07.24", content: "하우드엔지니어링 종합건축사사무소와 고품격 혁신 건축설계 정식 용역 계약 체결", note: "용역계약" },
  { date: "2025.09.01", content: "동작구청 주관 2025년 정기 주택조합 행정실태조사 완료 및 수령", note: "실태조사" },
  { date: "2025.09.27", content: "2025년 정기총회 소집 및 의결 진행 (절차적 시정 보완 예정)", note: "총회" },
  { date: "2025.11.11", content: "서울특별시 주관 추가 행정실태조사 수검 (~2025.11.14)", note: "실태조사" },
  { date: "2026.01.05", content: "한창훈 세무사사무소와 회계 세무 정밀 정비 및 실태조사 지적사항 시정 작업 의뢰", note: "용역계약" },
  { date: "2025.10 ~ 2026.02", content: "조합 업무관리 전산 시스템 개발 완료 (토지매입·수지분석·조합원관리·총회 온라인 시스템 안전 가동)", note: "조합 운영" }
];

const tabs = [
  { id: "greetings", label: "조합장 인사말" },
  { id: "commitment", label: "조합의 3대 약속" },
  { id: "history", label: "조합 연혁" },
  { id: "organization", label: "조직 및 협력사" },
  { id: "location", label: "찾아오시는 길" },
] as const;

export function AboutClient({ onOpenPortal }: AboutClientProps) {
  const [activeTab, setActiveTab] = useState<TabId>("greetings");
  const [showFullHistory, setShowFullHistory] = useState(false);
  const [mapKey, setMapKey] = useState(0);
  const isScrollingRef = useRef(false);

  // 스크롤 감지 및 현재 보고 있는 섹션 활성화 (Scroll Spy)
  useEffect(() => {
    const handleScroll = () => {
      if (isScrollingRef.current) return;

      const scrollPosition = window.scrollY + 220; // 스티키 탭 바 너비 및 마진 감안한 보정값

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
    // 초기 로드 시 한 번 실행
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 탭 클릭 시 스무스 스크롤 이동
  const handleTabClick = (tabId: TabId) => {
    setActiveTab(tabId);
    const element = document.getElementById(`section-${tabId}`);
    if (!element) return;

    isScrollingRef.current = true;
    const offsetTop = element.offsetTop - 140; // 스티키 바 및 헤더 높이 보정

    window.scrollTo({
      top: offsetTop,
      behavior: "smooth",
    });

    // 스무스 스크롤 종료 시점 감지용 타이머
    setTimeout(() => {
      isScrollingRef.current = false;
    }, 850);
  };

  return (
    <div className="w-full">
      {/* 1. 조합소개 대형 배너 (Hero Section) */}
      <section className="bg-gradient-to-br from-warm-canvas via-parchment-card to-stone-surface/30 pt-16 pb-20 border-b border-stone-surface text-center">
        <div className="site-container max-w-4xl px-4">
          <span className="inline-flex rounded-full bg-ember-orange/10 px-4 py-1.5 text-xs font-bold text-ember-orange uppercase tracking-wider">
            About Us
          </span>
          <h1 className="mt-6 text-4xl sm:text-5xl font-black text-charcoal-primary leading-tight tracking-tight">
            신뢰와 소통으로 짓는<br />
            <span className="text-ember-orange">대방동의 든든한 내일</span>
          </h1>
          <p className="mt-6 text-base sm:text-lg text-graphite/90 max-w-2xl mx-auto leading-relaxed">
            대방동 지역주택조합은 투명한 의사 결정과 공정한 자금 집행을 최우선의 가치로 삼고, 조합원 한 분 한 분의 소중한 꿈을 실현하기 위해 투명하게 앞장섭니다.
          </p>
        </div>
      </section>

      {/* 2. 스티키 서브 내비게이션 탭 바 (Sticky Sub Nav) */}
      <nav className="sticky top-18 z-10 bg-warm-canvas/90 backdrop-blur border-b border-stone-surface shadow-xs transition-all duration-200 py-1">
        <div className="site-container max-w-4xl px-4">
          <div className="flex justify-start md:justify-center items-center gap-1 sm:gap-4 overflow-x-auto whitespace-nowrap scrollbar-none py-2 text-sm font-semibold">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  className={cn(
                    "px-4 py-2 rounded-full text-xs sm:text-sm transition-all duration-200 cursor-pointer",
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
      </nav>

      {/* 3. 본문 통합 내용 영역 (Sections) */}
      <div className="site-container max-w-4xl px-4 py-16 sm:py-24 space-y-24 sm:space-y-36">
        
        {/* Section A: 조합장 인사말 */}
        <section id="section-greetings" className="scroll-mt-36">
          <div className="grid md:grid-cols-12 gap-8 sm:gap-12 items-start">
            <div className="md:col-span-4 flex flex-col items-center">
              {/* 세로가 긴 3:4 비율의 최적화 프로필 규격으로 리사이징 (잘림 완벽 예방) */}
              <div 
                className="w-52 sm:w-60 h-72 sm:h-80 rounded-3xl bg-stone-surface border border-stone-surface shadow-sm overflow-hidden flex items-center justify-center relative bg-parchment-card"
                suppressHydrationWarning
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/assets/about/chairman.jpg"
                  alt="대방동 지역주택조합 안동연 조합장"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="mt-4 text-center">
                <h3 className="text-base font-bold text-charcoal-primary">조합장 안동연</h3>
                <p className="text-xs text-ash mt-1">대방동 지역주택조합</p>
              </div>
            </div>

            <div className="md:col-span-8 space-y-5">
              <p className="text-xs font-bold text-ember-orange tracking-widest uppercase">GREETINGS</p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-charcoal-primary tracking-tight leading-tight">
                &quot;조합원의 든든한 동반자가 되어<br />최고의 주거 복지를 약속합니다&quot;
              </h2>
              <div className="text-sm text-graphite/90 leading-7 space-y-4 font-normal">
                <p>
                  안녕하십니까? 대방동 지역주택조합 조합 홈페이지 방문을 진심으로 환영합니다.
                </p>
                <p>
                  내 집 마련이라는 공통의 꿈을 안고 뜻을 모아주신 조합원 동지 여러분, 당 조합은 대방동의 뛰어난 지리적 가치와 쾌적한 주거 인프라를 바탕으로 가장 품격 있고 단단한 보금자리를 마련하기 위해 모든 역량을 경주하고 있습니다.
                </p>
                <p>
                  많은 주택조합 사업이 자금 소통과 불투명성으로 어려움을 겪는 현실을 거울삼아, 저희 대방동 지역주택조합은 **모든 자금 집행을 1금융권 신탁사 대리사무로 통제**하고 **의무 정보공개 자료실을 온·오프라인으로 100% 개방**하는 청렴한 투명 운영을 준수합니다.
                </p>
                <p>
                  조합원 여러분의 귀중한 재산과 신뢰를 끝까지 보호할 것을 다짐하며, 언제나 귀를 열고 조합원 한 분 한 분의 제안을 경청하겠습니다. 속도감 있는 사업 추진과 탁월한 주거 가치 구현으로 보답하겠습니다.
                </p>
                <p className="pt-4 font-bold text-charcoal-primary text-right">
                  대방동 지역주택조합 조합장  <span className="font-mono text-base ml-2 text-charcoal-primary">안동연(인)</span>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section D: 조합의 3대 약속 */}
        <section id="section-commitment" className="scroll-mt-36">
          <div className="text-center max-w-xl mx-auto mb-12 sm:mb-16">
            <p className="text-xs font-bold text-ember-orange tracking-widest uppercase">OUR COMMITMENT</p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-charcoal-primary tracking-tight leading-tight mt-3">
              오직 조합원만을 바라보는 3대 핵심 서약
            </h2>
            <p className="text-xs sm:text-sm text-graphite mt-3">
              그 어떤 유혹과 난관 속에서도 흔들리지 않고 준수할 당 조합의 청렴 원칙입니다.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {/* 약속 1 */}
            <div className="stone-card bg-white p-6 rounded-2xl border border-stone-surface flex flex-col justify-between text-center relative overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-1 bg-ember-orange" />
              <span className="text-3xl mx-auto select-none mt-2">🛡️</span>
              <h3 className="text-base font-bold text-charcoal-primary mt-4">100% 투명성 원칙</h3>
              <p className="text-xs text-graphite mt-3 leading-5">
                당 조합은 법률 규정을 넘어 분기별 자금 흐름과 시공 및 설계 일체의 계약 원본을 보안 자료실에 남김없이 공유하여 모든 불합리한 밀실 담합 의구심을 원천적으로 불식시킵니다.
              </p>
              {onOpenPortal && (
                <Button 
                  onClick={onOpenPortal} 
                  variant="outline" 
                  size="sm" 
                  className="mt-3 mx-auto rounded-full text-[10px] font-bold border-ember-orange text-ember-orange hover:bg-ember-orange/5 cursor-pointer h-7 px-3 shrink-0"
                >
                  보안 자료실 열기
                </Button>
              )}
              <div className="mt-5 text-[10px] text-ash font-medium">자금 공개 준수 서약</div>
            </div>

            {/* 약속 2 */}
            <div className="stone-card bg-white p-6 rounded-2xl border border-stone-surface flex flex-col justify-between text-center relative overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-1 bg-midnight" />
              <span className="text-3xl mx-auto select-none mt-2">⚡</span>
              <h3 className="text-base font-bold text-charcoal-primary mt-4">안정적 신속 추진</h3>
              <p className="text-xs text-graphite mt-3 leading-5">
                토지 소유자 동의 확보 및 인허가 유관 부서와의 실시간 핫라인 소통 행정을 실현하여, 사업 지연에 따른 조합원님들의 추가 분담금 가중 피로를 사전에 예방하고 빠르게 전진합니다.
              </p>
              <div className="mt-5 text-[10px] text-ash font-medium">사업 마일스톤 준수</div>
            </div>

            {/* 약속 3 */}
            <div className="stone-card bg-white p-6 rounded-2xl border border-stone-surface flex flex-col justify-between text-center relative overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-1 bg-sky-blue" />
              <span className="text-3xl mx-auto select-none mt-2">💬</span>
              <h3 className="text-base font-bold text-charcoal-primary mt-4">민주적인 양방향 소통</h3>
              <p className="text-xs text-graphite mt-3 leading-5">
                형식적인 공청회에 머무르지 않고 모바일 건의 창구 및 조합원 정기 소통 서면/투표 서비스를 안전 가동하여 조합원님들의 뜻을 100% 실시간 집행부 행정에 전폭 반영하겠습니다.
              </p>
              <div className="mt-5 text-[10px] text-ash font-medium">열린 소통 창구 개방</div>
            </div>
          </div>
        </section>

        {/* Section B: 조합 연혁 */}
        <section id="section-history" className="scroll-mt-36">
          <div className="text-center max-w-xl mx-auto mb-12 sm:mb-16">
            <p className="text-xs font-bold text-ember-orange tracking-widest uppercase">HISTORY</p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-charcoal-primary tracking-tight leading-tight mt-3">
              투명하게 내디뎌 온 신뢰의 역사
            </h2>
            <p className="text-xs sm:text-sm text-graphite mt-3">
              추진위 출범부터 서울시 심의 통과, 스마트 업무 전산망 안착까지의 중대 마일스톤입니다.
            </p>
          </div>

          {/* 1) 핵심 이정표 6대 마일스톤 타임라인 렌더링 */}
          <div className="relative border-l border-stone-surface pl-6 sm:pl-8 ml-4 sm:ml-8 space-y-10 mb-12">
            {/* Milestone 1 */}
            <div className="relative">
              <span className="absolute -left-[31px] sm:-left-[39px] top-1.5 flex size-4 sm:size-5 items-center justify-center rounded-full bg-white border-2 border-ember-orange">
                <span className="size-1.5 sm:size-2 rounded-full bg-ember-orange" />
              </span>
              <div className="stone-card bg-white p-5 rounded-2xl border border-stone-surface shadow-xs hover:shadow-sm transition duration-200">
                <div className="flex items-center justify-between text-xs font-bold text-ember-orange font-mono">
                  <span>2025.10 ~ 2026.02</span>
                  <span className="bg-ember-orange/10 px-2 py-0.5 rounded-full">조합 운영</span>
                </div>
                <h3 className="text-base font-bold text-charcoal-primary mt-1.5">조합 업무관리 전산 시스템 및 정보공개 전용 자료실 정식 가동</h3>
                <p className="text-xs text-graphite mt-2 leading-5">
                  조합 행정의 디지털 투명성 강화를 위해 토지매입·수지분석·조합원관리 및 소셜 회원 전용 임시 승인 대기 게이트웨이 보안 시스템을 전격 배포하고 정보공개 자료실 운영을 개시했습니다.
                </p>
              </div>
            </div>

            {/* Milestone 2 */}
            <div className="relative">
              <span className="absolute -left-[31px] sm:-left-[39px] top-1.5 flex size-4 sm:size-5 items-center justify-center rounded-full bg-white border-2 border-midnight">
                <span className="size-1.5 sm:size-2 rounded-full bg-midnight" />
              </span>
              <div className="stone-card bg-white p-5 rounded-2xl border border-stone-surface shadow-xs hover:shadow-sm transition duration-200">
                <div className="flex items-center justify-between text-xs font-bold text-charcoal-primary font-mono">
                  <span>2025.07.24</span>
                  <span className="bg-midnight/10 px-2 py-0.5 rounded-full">용역계약</span>
                </div>
                <h3 className="text-base font-bold text-charcoal-primary mt-1.5">신규 우수 건축설계 용역 계약 체결 (하우드엔지니어링)</h3>
                <p className="text-xs text-graphite mt-2 leading-5">
                  대방동의 탁월한 지지적 조건에 부합하는 명품 랜드마크 4-Bay 아파트 평면 특화 설계를 위해, 우수한 실적을 보유한 하우드엔지니어링 종합건축사사무소와 설계 계약을 맺고 고품격 설계에 착수했습니다.
                </p>
              </div>
            </div>

            {/* Milestone 3 */}
            <div className="relative">
              <span className="absolute -left-[31px] sm:-left-[39px] top-1.5 flex size-4 sm:size-5 items-center justify-center rounded-full bg-white border-2 border-stone-surface">
                <span className="size-1.5 sm:size-2 rounded-full bg-ash" />
              </span>
              <div className="stone-card bg-white p-5 rounded-2xl border border-stone-surface shadow-xs hover:shadow-sm transition duration-200">
                <div className="flex items-center justify-between text-xs font-bold text-graphite font-mono">
                  <span>2022.06.30</span>
                  <span className="bg-stone-surface px-2 py-0.5 rounded-full text-graphite">지구단위계획</span>
                </div>
                <h3 className="text-base font-bold text-charcoal-primary mt-1.5">대방동 11-103번지 일대 지구단위계획 결정 및 지형도면 최종 고시</h3>
                <p className="text-xs text-graphite mt-2 leading-5">
                  서울시 도시건축공동위원회 심의 의결(수정가결)을 반영하여 정식 주민공람을 마치고, **서울특별시 고시 제2022-291호**로 사업 부지의 지구단위계획 결정 및 고시를 전격 완수했습니다.
                </p>
              </div>
            </div>

            {/* Milestone 4 */}
            <div className="relative">
              <span className="absolute -left-[31px] sm:-left-[39px] top-1.5 flex size-4 sm:size-5 items-center justify-center rounded-full bg-white border-2 border-stone-surface">
                <span className="size-1.5 sm:size-2 rounded-full bg-ash" />
              </span>
              <div className="stone-card bg-white p-5 rounded-2xl border border-stone-surface shadow-xs hover:shadow-sm transition duration-200">
                <div className="flex items-center justify-between text-xs font-bold text-graphite font-mono">
                  <span>2013.05.01</span>
                  <span className="bg-stone-surface px-2 py-0.5 rounded-full text-graphite">조합 운영</span>
                </div>
                <h3 className="text-base font-bold text-charcoal-primary mt-1.5">대방동 지역주택조합 대표자 명의 변경 및 제2대 안동연 조합장 취임</h3>
                <p className="text-xs text-graphite mt-2 leading-5">
                  조합 사무국의 행정 정상화 및 투명성 회복을 기틀로 하여 제2대 안동연 조합장이 대표자로 취임하며 투명하고 신뢰감 높은 조합원 중심 운영 기조를 확립했습니다.
                </p>
              </div>
            </div>

            {/* Milestone 5 */}
            <div className="relative">
              <span className="absolute -left-[31px] sm:-left-[39px] top-1.5 flex size-4 sm:size-5 items-center justify-center rounded-full bg-white border-2 border-stone-surface">
                <span className="size-1.5 sm:size-2 rounded-full bg-ash" />
              </span>
              <div className="stone-card bg-white p-5 rounded-2xl border border-stone-surface shadow-xs hover:shadow-sm transition duration-200">
                <div className="flex items-center justify-between text-xs font-bold text-graphite font-mono">
                  <span>2009.07.13</span>
                  <span className="bg-stone-surface px-2 py-0.5 rounded-full text-graphite">조합 설립</span>
                </div>
                <h3 className="text-base font-bold text-charcoal-primary mt-1.5">동작구청으로부터 대방동지역주택조합 정식 설립인가 완료</h3>
                <p className="text-xs text-graphite mt-2 leading-5">
                  주민제안서 제출 및 유관 기구 협의 등의 적법 절차를 완수하여 동작구청으로부터 대방동 지역주택조합의 정식 설립인가를 취득하여 공인 법적 지위를 확보했습니다.
                </p>
              </div>
            </div>

            {/* Milestone 6 */}
            <div className="relative">
              <span className="absolute -left-[31px] sm:-left-[39px] top-1.5 flex size-4 sm:size-5 items-center justify-center rounded-full bg-white border-2 border-stone-surface">
                <span className="size-1.5 sm:size-2 rounded-full bg-ash" />
              </span>
              <div className="stone-card bg-white p-5 rounded-2xl border border-stone-surface shadow-xs hover:shadow-sm transition duration-200">
                <div className="flex items-center justify-between text-xs font-bold text-graphite font-mono">
                  <span>2009.02.20</span>
                  <span className="bg-stone-surface px-2 py-0.5 rounded-full text-graphite">조합 설립</span>
                </div>
                <h3 className="text-base font-bold text-charcoal-primary mt-1.5">대방동지역주택조합 창립총회 정식 개최</h3>
                <p className="text-xs text-graphite mt-2 leading-5">
                  여의도 국민일보 빌딩에서 조합원들과 입주 예정 주민들이 총집결하여 조합 창립을 위한 창립총회를 성공적으로 개최하고 정식 정관 및 규약을 수립했습니다.
                </p>
              </div>
            </div>
          </div>

          {/* 2) 아코디언식 스르륵 펼쳐지는 전체 경과보고 일람 표 영역 */}
          <div className="flex flex-col items-center">
            <button
              onClick={() => setShowFullHistory(!showFullHistory)}
              className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-full border border-[#f2f0ed] bg-[#f8f7f4] text-xs sm:text-sm font-bold text-graphite hover:bg-stone-surface hover:text-charcoal-primary active:scale-95 transition-all duration-200 cursor-pointer shadow-xs"
            >
              <span>{showFullHistory ? "사업추진 전체 경과보고 접기" : "사업추진 전체 경과보고 일람 보기 (총 80여건)"}</span>
              <svg
                className={cn("w-4 h-4 text-ash transition-transform duration-200", showFullHistory && "rotate-180")}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Collapsible Section */}
            {showFullHistory && (
              <div className="w-full mt-8 animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="soft-panel p-5 bg-white border border-[#f2f0ed] rounded-2xl">
                  <h3 className="text-base font-bold text-charcoal-primary mb-1">사업추진 전체 경과보고 및 추진일정</h3>
                  <p className="text-[11px] text-graphite mb-5">
                    추진위 발족 이전의 군부대 부지 연계 협의 역사부터 최근의 전산 업무망 가동까지의 전체 상세 기록입니다.
                  </p>

                  {/* A. 데스크톱 뷰 표 (hidden md:block) */}
                  <div className="hidden md:block overflow-x-auto rounded-xl border border-[#f2f0ed] bg-white">
                    <table className="w-full border-collapse text-left text-xs">
                      <thead>
                        <tr className="border-b border-[#f2f0ed] bg-[#f8f7f4] text-[11px] font-bold text-charcoal-primary uppercase tracking-wider">
                          <th className="px-4 py-3.5 w-28 shrink-0">일 자</th>
                          <th className="px-4 py-3.5">사업추진 내용</th>
                          <th className="px-4 py-3.5 w-28 text-center shrink-0">비 고</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#f2f0ed] text-graphite font-normal leading-relaxed">
                        {fullHistoryData.map((item, idx) => (
                          <tr key={idx} className="hover:bg-[#fbfaf9] transition-colors">
                            <td className="whitespace-nowrap px-4 py-3 font-mono font-medium text-charcoal-primary">{item.date}</td>
                            <td className="px-4 py-3 text-[11px]">{item.content}</td>
                            <td className="px-4 py-3 text-center whitespace-nowrap">
                              <span className={cn(
                                "inline-flex rounded-full px-2.5 py-0.5 text-[9px] font-bold",
                                item.note === "지구단위계획"
                                  ? "bg-sky-blue/10 text-sky-blue"
                                  : item.note === "군부대 부지"
                                  ? "bg-purple-100 text-purple-700"
                                  : item.note === "조합 설립" || item.note === "총회"
                                  ? "bg-meadow-green/10 text-midnight"
                                  : item.note === "용역계약" || item.note === "계약해지"
                                  ? "bg-ember-orange/10 text-ember-orange"
                                  : "bg-sunburst-yellow/15 text-charcoal-primary"
                              )}>
                                {item.note}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* B. 모바일/태블릿 뷰 컴팩트 카드 리스트 (block md:hidden) - 가로 찌부 예방 */}
                  <div className="block md:hidden space-y-3 max-h-[500px] overflow-y-auto pr-1">
                    {fullHistoryData.map((item, idx) => (
                      <div
                        key={idx}
                        className="bg-white p-3.5 rounded-xl border border-[#f2f0ed] hover:border-ember-orange/30 transition flex flex-col gap-2"
                      >
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="font-mono font-bold text-charcoal-primary">{item.date}</span>
                          <span className={cn(
                            "inline-flex rounded-full px-2 py-0.5 text-[8px] font-bold",
                            item.note === "지구단위계획"
                              ? "bg-sky-blue/10 text-sky-blue"
                              : item.note === "군부대 부지"
                              ? "bg-purple-100 text-purple-700"
                              : item.note === "조합 설립" || item.note === "총회"
                              ? "bg-meadow-green/10 text-midnight"
                              : item.note === "용역계약" || item.note === "계약해지"
                              ? "bg-ember-orange/10 text-ember-orange"
                              : "bg-sunburst-yellow/15 text-charcoal-primary"
                          )}>
                            {item.note}
                          </span>
                        </div>
                        <p className="text-[11px] text-graphite font-normal leading-relaxed break-all">
                          {item.content}
                        </p>
                      </div>
                    ))}
                  </div>

                </div>
              </div>
            )}
          </div>
        </section>

        {/* Section C: 조직 및 협력사 */}
        <section id="section-organization" className="scroll-mt-36">
          <div className="text-center max-w-xl mx-auto mb-12 sm:mb-16">
            <p className="text-xs font-bold text-ember-orange tracking-widest uppercase">ORGANIZATION & PARTNERS</p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-charcoal-primary tracking-tight leading-tight mt-3">
              사업의 견고함을 뒷받침하는 조직 및 협력사
            </h2>
            <p className="text-xs sm:text-sm text-graphite mt-3">
              최고의 전문가 조직과 투명한 공정 대행 기관이 만나 주거 신화를 완수해 나갑니다.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* 파트너 카드 1 */}
            <div className="stone-card bg-white p-6 rounded-2xl border border-stone-surface flex items-start gap-4">
              <span className="text-2xl select-none bg-sky-blue/10 text-sky-blue p-2.5 rounded-2xl shrink-0">🏛️</span>
              <div>
                <h3 className="text-base font-bold text-charcoal-primary">자금관리 신탁사: 신영부동산신탁</h3>
                <p className="text-xs text-graphite mt-2 leading-5">
                  조합원님들이 납부하시는 일체의 분담금은 조합 통장이 아닌, 신뢰할 수 있는 신영부동산신탁 명의의 에스크로 대리계좌로 안전하게 수납 및 예치되며 행정 통제 절차 없이는 단 1원도 유출될 수 없도록 완벽 장치했습니다.
                </p>
              </div>
            </div>

            {/* 파트너 카드 2 */}
            <div className="stone-card bg-white p-6 rounded-2xl border border-stone-surface flex items-start gap-4">
              <span className="text-2xl select-none bg-meadow-green/10 text-midnight p-2.5 rounded-2xl shrink-0">🏢</span>
              <div>
                <h3 className="text-base font-bold text-charcoal-primary">공동사업주체: 시공예정사</h3>
                <p className="text-xs text-graphite mt-2 leading-5">
                  품질 우선주의를 준수하며 친환경 마감재 및 명품 조경 브랜드를 보유한 대한민국 최우수 1군 메이저 브랜드 건설사와 정기적 실무 LOI 회람을 진행하여 입지 가치에 걸맞은 랜드마크 명품 아파트를 예정하고 있습니다.
                </p>
              </div>
            </div>

            {/* 파트너 카드 3 */}
            <div className="stone-card bg-white p-6 rounded-2xl border border-stone-surface flex items-start gap-4">
              <span className="text-2xl select-none bg-ember-orange/10 text-ember-orange p-2.5 rounded-2xl shrink-0">🤝</span>
              <div>
                <h3 className="text-base font-bold text-charcoal-primary">조합 행정기구 및 이사회</h3>
                <p className="text-xs text-graphite mt-2 leading-5">
                  조합 사무국과의 긴밀한 소통으로 조합 내부 규약에 의해 선출된 입주 예정 조합원 대표 감사진과 이사회 의결 기구가 상시 가동되어, 모든 예산 조율과 계약 사항을 민주적이고 투명하게 의결합니다.
                </p>
              </div>
            </div>

            {/* 파트너 카드 4 */}
            <div className="stone-card bg-white p-6 rounded-2xl border border-stone-surface flex items-start gap-4">
              <span className="text-2xl select-none bg-sunburst-yellow/15 text-charcoal-primary p-2.5 rounded-2xl shrink-0">📐</span>
              <div>
                <h3 className="text-base font-bold text-charcoal-primary">종합 건축설계사무소</h3>
                <p className="text-xs text-graphite mt-2 leading-5">
                  대방동의 우수한 남향형 일조 가치 및 통풍성 극대화를 위해 4-Bay 판상형 및 혁신적인 수납 강화 특화 설계를 입체적으로 조율하여, 일반 재건축에 필적하는 명품 평면 레이아웃 도면 작성을 완수하고 있습니다.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section E: 찾아오시는 길 */}
        <section id="section-location" className="scroll-mt-36">
          <div className="text-center max-w-xl mx-auto mb-12 sm:mb-16">
            <p className="text-xs font-bold text-ember-orange tracking-widest uppercase">LOCATION</p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-charcoal-primary tracking-tight leading-tight mt-3">
              조합 사무실 찾아오시는 길
            </h2>
            <p className="text-xs sm:text-sm text-graphite mt-3">
              조합원 상담 및 방문 서류 제출을 위해 정성을 다해 환대하겠습니다.
            </p>
          </div>

          <div className="stone-card bg-white p-6 sm:p-8 rounded-2xl border border-stone-surface shadow-xs space-y-6">
            {/* 네이버 지도 임베드 (좌측 검색 패널 완전 숨김 + 홈 버튼) */}
            <div className="w-full h-64 sm:h-80 rounded-2xl overflow-hidden border border-stone-surface/80 relative">
              {/* iframe을 왼쪽으로 크게 밀어서 네이버 좌측 검색결과 패널(~450px)을 완전히 잘라냄 */}
              <iframe
                key={mapKey}
                src="https://map.naver.com/p/search/%EC%84%9C%EC%9A%B8%EC%8B%9C%20%EB%8F%99%EC%9E%91%EA%B5%AC%20%EC%97%AC%EC%9D%98%EB%8C%80%EB%B0%A9%EB%A1%9C36%EA%B8%B8%20102-11"
                title="대방동지역주택조합 사무실 네이버 지도"
                className="absolute top-0 h-full border-0"
                style={{ left: "-460px", width: "calc(100% + 460px)" }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
              {/* 홈 버튼: 지도 원위치 복귀 */}
              <button
                onClick={() => setMapKey((k) => k + 1)}
                className="absolute top-3 left-3 z-10 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/95 backdrop-blur border border-stone-surface shadow-md text-xs font-bold text-charcoal-primary hover:bg-white hover:shadow-lg active:scale-95 transition-all duration-200 cursor-pointer"
                title="지도 원위치로 돌아가기"
              >
                <svg className="w-4 h-4 text-ember-orange" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1" />
                </svg>
                원위치
              </button>
            </div>

            {/* 네이버 지도에서 보기 CTA 버튼 */}
            <div className="flex justify-center">
              <a
                href="https://map.naver.com/p/search/%EC%84%9C%EC%9A%B8%EC%8B%9C%20%EB%8F%99%EC%9E%91%EA%B5%AC%20%EC%97%AC%EC%9D%98%EB%8C%80%EB%B0%A9%EB%A1%9C36%EA%B8%B8%20102-11"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#03C75A] text-white text-xs font-bold shadow-md hover:bg-[#02b351] active:scale-95 transition-all duration-200"
              >
                <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13.545 2.907a13.227 13.227 0 0 0-3.257-1.011.05.05 0 0 0-.052.025c-.141.25-.297.577-.406.833a12.19 12.19 0 0 0-3.658 0 8.258 8.258 0 0 0-.412-.833.051.051 0 0 0-.052-.025c-1.125.194-2.22.534-3.257 1.011a.041.041 0 0 0-.021.018C.356 6.024-.213 9.047.066 12.032c.001.014.01.028.021.037a13.276 13.276 0 0 0 3.995 2.02.05.05 0 0 0 .056-.019c.308-.42.582-.863.818-1.329a.05.05 0 0 0-.01-.059.051.051 0 0 0-.018-.011 8.875 8.875 0 0 1-1.248-.595.05.05 0 0 1-.02-.066.051.051 0 0 1 .015-.019c.084-.063.168-.129.248-.195a.05.05 0 0 1 .051-.007c2.619 1.196 5.454 1.196 8.041 0a.052.052 0 0 1 .053.007c.08.066.164.132.248.195a.051.051 0 0 1-.004.085 8.254 8.254 0 0 1-1.249.594.05.05 0 0 0-.03.03.052.052 0 0 0 .003.041c.24.465.515.909.817 1.329a.05.05 0 0 0 .056.019 13.235 13.235 0 0 0 4.001-2.02.049.049 0 0 0 .021-.037c.334-3.451-.559-6.449-2.366-9.106a.034.034 0 0 0-.02-.019Z" />
                </svg>
                네이버 지도에서 보기
              </a>
            </div>

            <div className="grid md:grid-cols-2 gap-6 text-xs text-graphite leading-6 pt-4 border-t border-stone-surface">
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-charcoal-primary flex items-center gap-1.5">📍 조합 사무실 정보</h4>
                <div className="space-y-1.5">
                  <p className="flex items-start gap-2">
                    <span className="text-ash font-medium shrink-0 w-14">주소</span>
                    <span className="text-charcoal-primary font-medium">(06947) 서울시 동작구 여의대방로 36길 102-11<br />1층 대방동지역주택조합사무실</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="text-ash font-medium shrink-0 w-14">연락처</span>
                    <a href="tel:02-822-1508" className="text-charcoal-primary font-bold font-mono hover:text-ember-orange transition-colors">02-822-1508</a>
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="text-ash font-medium shrink-0 w-14">상담시간</span>
                    <span className="text-charcoal-primary">평일 09:00 ~ 18:00 (토·일·공휴일 휴무)</span>
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-charcoal-primary flex items-center gap-1.5">🚇 대중교통 안내</h4>
                <div className="space-y-1.5">
                  <p className="flex items-start gap-2">
                    <span className="inline-flex items-center justify-center rounded-full bg-sky-blue/15 text-sky-blue text-[9px] font-black px-1.5 py-0.5 shrink-0">1호선</span>
                    <span><strong className="text-charcoal-primary">대방역</strong> 3번 출구 도보 약 7분</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="inline-flex items-center justify-center rounded-full bg-[#54640d]/15 text-[#54640d] text-[9px] font-black px-1.5 py-0.5 shrink-0">7호선</span>
                    <span><strong className="text-charcoal-primary">신대방삼거리역</strong> 4번 출구 도보 약 10분</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="inline-flex items-center justify-center rounded-full bg-ember-orange/10 text-ember-orange text-[9px] font-black px-1.5 py-0.5 shrink-0">버스</span>
                    <span>마을버스 12번 · 대방동주민센터 · 대방현대아파트 정류장 하차</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="inline-flex items-center justify-center rounded-full bg-stone-surface text-graphite text-[9px] font-black px-1.5 py-0.5 shrink-0">주차</span>
                    <span>사무실 건물 내 주차 가능 (방문 시 안내)</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
