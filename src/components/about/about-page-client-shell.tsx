"use client";

import { useState, useEffect } from "react";
import { SiteFooter } from "@/components/landing/site-footer";
import { AboutClient } from "./about-client";
import { PortalShell } from "@/components/portal/portal-shell";
import { type Document } from "@/components/portal/document-table";
import { type LogEntry } from "@/components/portal/audit-logs-table";
import { cn } from "@/lib/utils";

type AboutPageClientShellProps = {
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

export function AboutPageClientShell({
  session,
  documents = [],
  logs = [],
  refundInfo,
  pendingUsers = [],
  approvedSocialUsers = [],
}: AboutPageClientShellProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // 드로어 활성화 시 본문 스크롤 차단 처리 (디테일한 UX 보장)
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isDrawerOpen]);

  // 커스텀 이벤트 리스너: 글로벌 헤더에서 포털 열기 요청 수신
  useEffect(() => {
    const handleOpenPortal = () => setIsDrawerOpen(true);
    window.addEventListener('open-portal', handleOpenPortal);
    return () => window.removeEventListener('open-portal', handleOpenPortal);
  }, []);

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

      {/* 2. 조합소개 페이지 콘텐츠 */}
      <main className="flex-1 animate-page-in">
        <AboutClient onOpenPortal={() => setIsDrawerOpen(true)} />
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
          
          {/* 닫기 버튼 */}
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

        {/* 드로어 바디 */}
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
    </div>
  );
}
