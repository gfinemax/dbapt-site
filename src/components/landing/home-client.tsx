"use client";

import { useState, useEffect } from "react";
import { HeroSection } from "./hero-section";
import { FeatureLinks } from "./feature-links";
import { NoticesSection } from "./notices-section";
import { PortalPreview } from "./portal-preview";
import { SiteFooter } from "./site-footer";
import { PortalShell } from "@/components/portal/portal-shell";
import { type Document } from "@/components/portal/document-table";
import { type LogEntry } from "@/components/portal/audit-logs-table";
import { cn } from "@/lib/utils";

type HomeClientProps = {
  session?: {
    id: string;
    loginId: string | null;
    name: string;
    role: string;
    email?: string;
  } | null;
  documents?: Document[];
  logs?: LogEntry[];
  refundInfo?: {
    totalPaid: number;
    refundAmount: number;
    processedState: string;
    targetDate: string | null;
  } | null;
  pendingUsers?: {
    id: string;
    name: string;
    email: string;
    createdAt: string;
  }[];
  approvedSocialUsers?: {
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
  }[];
};

export function HomeClient({
  session,
  documents = [],
  logs = [],
  refundInfo,
  pendingUsers = [],
  approvedSocialUsers = [],
}: HomeClientProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showAnnouncePopup, setShowAnnouncePopup] = useState(false);
  const [isDoNotShowAnnounceToday, setIsDoNotShowAnnounceToday] = useState(false);

  // 드로어 또는 안내 팝업 활성화 시 본문 스크롤 차단 처리 (디테일한 UX 보장)
  useEffect(() => {
    if (isDrawerOpen || showAnnouncePopup) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isDrawerOpen, showAnnouncePopup]);

  // 커스텀 이벤트 리스너: 글로벌 헤더에서 포털 열기 요청 수신
  useEffect(() => {
    const handleOpenPortal = () => setIsDrawerOpen(true);
    window.addEventListener('open-portal', handleOpenPortal);
    return () => window.removeEventListener('open-portal', handleOpenPortal);
  }, []);

  // 로그인 성공 조합원을 위한 안내 팝업 자동 트리거 (오늘 하루 보지 않기 여부 체크)
  useEffect(() => {
    if (!session) return;
    if (session.role !== "MEMBER" && session.role !== "REFUND") return;

    const dismissedUntil = localStorage.getItem("dbapt_announce_popup_dismissed_until");
    const isDismissed = dismissedUntil && Date.now() < parseInt(dismissedUntil, 10);

    if (!isDismissed) {
      const timer = setTimeout(() => {
        setShowAnnouncePopup(true);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [session]);

  const handleCloseAnnouncePopup = () => {
    if (isDoNotShowAnnounceToday) {
      const midnight = new Date();
      midnight.setHours(23, 59, 59, 999);
      localStorage.setItem("dbapt_announce_popup_dismissed_until", midnight.getTime().toString());
    }
    setShowAnnouncePopup(false);
  };

  const handleOpenDrawerFromPopup = () => {
    handleCloseAnnouncePopup();
    setTimeout(() => {
      setIsDrawerOpen(true);
    }, 150);
  };

  // 대방동 조합원 포털의 실제 롤 매핑 (member, refund, admin)
  const getPortalRole = (roleStr: string) => {
    switch (roleStr) {
      case "ADMIN":
        return "admin";
      case "REFUND":
        return "refund";
      case "MEMBER":
      default:
        return "member";
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col bg-warm-canvas">
      {/* 1. 사이트 공통 헤더 (세션 정보와 포털 개방 핸들러 전달) - layout.tsx로 이동됨 */}

      {/* 2. 일반 랜딩 홈페이지 콘텐츠 */}
      <main className="flex-1 animate-page-in">
        <HeroSection />
        <FeatureLinks />
        <NoticesSection />
        <PortalPreview session={session} onOpenPortal={() => setIsDrawerOpen(true)} />
      </main>

      {/* 3. 사이트 공통 푸터 */}
      <SiteFooter />

      {/* ==========================================
          [대안 A] 우측 사이드 슬라이드 오버 (Drawer) 패널
          ========================================== */}
      {/* 백드롭 오버레이 (Dim & Blur) */}
      {isDrawerOpen && (
        <div
          onClick={() => setIsDrawerOpen(false)}
          className="fixed inset-0 z-40 bg-black/35 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
        />
      )}

      {/* 드로어 컨테이너 (DESIGN.md 규격: Stone surface border, Warm Canvas 배경, Drawer transition) */}
      <div
        className={cn(
          "fixed inset-y-0 right-0 z-50 w-full max-w-2xl bg-warm-canvas border-l border-stone-surface shadow-2xl p-6 sm:p-8 flex flex-col transition-transform duration-300 ease-in-out transform overflow-y-auto",
          isDrawerOpen ? "translate-x-0" : "translate-x-full"
        )}
        aria-label="조합원 전용 자료실 드로어"
      >
        {/* 드로어 상단 헤더 */}
        <div className="flex items-center justify-between pb-6 border-b border-stone-surface">
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-full bg-sky-blue text-xs font-semibold text-white">
              D
            </span>
            <h2 className="text-base font-bold text-charcoal-primary">
              조합원 전용 자료실
            </h2>
          </div>
          
          {/* 닫기 버튼 (DESIGN.md 규격: Pill Light 스타일 응용) */}
          <button
            onClick={() => setIsDrawerOpen(false)}
            className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full border border-stone-surface bg-[#f8f7f4] text-xs font-medium text-graphite hover:bg-stone-surface active:bg-[#e8e6e1] transition duration-200 cursor-pointer"
          >
            <svg className="w-3.5 h-3.5 text-ash" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
            닫기
          </button>
        </div>

        {/* 드로어 바디 (isDrawerMode={true}로 포털 셸 인라인 렌더링) */}
        <div className="flex-1 mt-6">
          {session ? (
            <PortalShell
              role={getPortalRole(session.role)}
              session={session}
              documents={documents}
              logs={logs}
              refundInfo={refundInfo}
              pendingUsers={pendingUsers}
              approvedSocialUsers={approvedSocialUsers}
              isDrawerMode={true}
            />
          ) : (
            <div className="py-20 text-center">
              <p className="text-xs text-graphite/70">
                인증 세션이 만료되었습니다. 다시 로그인해 주십시오.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ==========================================
          [NEW] 조합원 로그인 전용 자료실 알림 팝업 모달 (LG U+ 레퍼런스 스타일 완벽 재현)
          ========================================== */}
      {showAnnouncePopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-3xl bg-warm-canvas border border-stone-surface shadow-2xl p-6 sm:p-8 text-left animate-in zoom-in-95 duration-200 flex flex-col">
            
            {/* X 닫기 버튼 */}
            <button
              onClick={handleCloseAnnouncePopup}
              className="absolute top-6 right-6 text-ash hover:text-charcoal-primary transition duration-150 cursor-pointer"
              aria-label="닫기"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* 팝업 헤더 */}
            <div className="text-[11px] font-bold text-ash tracking-widest uppercase">
              안내
            </div>

            {/* 팝업 바디 */}
            <div className="mt-4 flex flex-col">
              {/* 오렌지 포인트 뱃지 */}
              <span className="self-start rounded-full bg-ember-orange/10 text-ember-orange font-bold text-[10px] tracking-wider px-3 py-1 uppercase">
                조합원 권익 및 기밀 유지
              </span>

              {/* 아주 굵고 정교한 헤드라인 */}
              <h3 className="text-xl sm:text-2xl font-bold text-charcoal-primary tracking-tight leading-tight mt-3">
                조합원 전용 자료실 등록 알림
              </h3>

              <p className="mt-3 text-xs leading-5 text-graphite/90 font-medium">
                조합원님의 투명한 권익 보호를 위한 정보공개 의무 문서 및 회계 자금 보고서가 정상 등록되었습니다. 조합 정보 보호를 위해 안전 수칙 하에 열람하실 수 있습니다.
              </p>

              {/* Recessed Parchment Card 형태의 상세 정보 리스트 */}
              <div className="mt-5 bg-parchment-card border border-stone-surface border-dashed p-4.5 rounded-2xl text-[11px] text-graphite space-y-3.5 shadow-inner">
                <div className="flex gap-2">
                  <span className="text-base text-ember-orange select-none shrink-0">📁</span>
                  <div>
                    <h4 className="font-bold text-charcoal-primary text-xs">최신 등록 문서 안내</h4>
                    <p className="text-graphite/85 mt-1 leading-relaxed">
                      • **의무 정보 공개**: 규약 개정 초안 외 1건 수록<br />
                      • **회계 및 자금 보고**: 2026년도 1분기 수입/지출 실적보고서
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 pt-3.5 border-t border-stone-surface/60 border-dashed">
                  <span className="text-base text-sky-blue select-none shrink-0">🔒</span>
                  <div>
                    <h4 className="font-bold text-charcoal-primary text-xs">보안 감사 및 이력 자동 기록</h4>
                    <p className="text-graphite/85 mt-1 leading-relaxed">
                      조합 정보 보호법에 근거하여 조합원 본인의 PDF 파일 열람 및 다운로드 이력(IP 주소, 일시)은 보안 감사 로그에 실시간 투명하게 자동 보존됩니다.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 메인 액션 버튼 영역 */}
            <div className="mt-6 flex gap-3">
              <button
                onClick={handleOpenDrawerFromPopup}
                className="flex-1 py-3 px-4 rounded-full text-xs font-bold bg-ember-orange text-white hover:bg-[#e03700] active:scale-97 transition-all duration-200 cursor-pointer shadow-md text-center"
              >
                자료실 열기 (자세히 보기)
              </button>
              
              <button
                onClick={handleCloseAnnouncePopup}
                className="flex-1 py-3 px-4 rounded-full text-xs font-bold bg-white text-graphite border border-stone-surface hover:bg-[#f8f7f4] active:scale-97 transition-all duration-200 cursor-pointer text-center"
              >
                확인
              </button>
            </div>

            {/* 오늘 하루 이 창 열지 않기 */}
            <div className="mt-5 pt-4 border-t border-stone-surface flex items-center justify-between">
              <div className="flex items-center gap-2">
                <input
                  id="doNotShowAnnounceToday"
                  type="checkbox"
                  checked={isDoNotShowAnnounceToday}
                  onChange={(e) => setIsDoNotShowAnnounceToday(e.target.checked)}
                  className="w-4 h-4 rounded border-stone-surface text-charcoal-primary focus:ring-0 focus:ring-offset-0 accent-[#121212] cursor-pointer"
                />
                <label
                  htmlFor="doNotShowAnnounceToday"
                  className="text-xs text-graphite font-semibold cursor-pointer select-none hover:text-charcoal-primary transition-colors"
                >
                  오늘 하루 이 창 열지 않기
                </label>
              </div>
              
              <span className="text-[9px] text-ash font-medium">대방동지역주택조합</span>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
