"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { portalProfiles, portalRoleOrder, type PortalRole } from "@/content/portal";
import { cn } from "@/lib/utils";
import { logoutAction, approveUserAction, updateSignupNameAction } from "@/lib/auth";
import { DocumentTable, type Document } from "./document-table";
import { PersonalDocumentHub } from "./personal-document-hub";
import { PdfViewerModal } from "./pdf-viewer-modal";
import { ContributionDashboard } from "./contribution-dashboard";
import { DocumentUploadForm } from "./document-upload-form";
import { AuditLogsTable, type LogEntry } from "./audit-logs-table";
import { ContributionSummaryMini } from "./contribution-summary-mini";
import { PortalHamburger } from "./portal-hamburger";
import { buildContributionDashboardView } from "@/lib/contribution-dashboard";
import { getPdfRelatedDocument } from "@/lib/document-relations";
import type { ContributionDashboardView, ContributionSummaryView, PaymentNoticeView } from "@/lib/contribution-types";

// 헬퍼 함수 파일 레벨 최상단 배치 (ESLint 선언 순서 및 렌더링 낭비 방지)
const getRoleLabel = (r: string) => {
  switch (r) {
    case "ADMIN":
      return "관리자";
    case "MEMBER":
      return "정식 조합원";
    case "REFUND":
      return "환불 조합원";
    default:
      return r;
  }
};

const formatNumber = (num: number) => {
  return num.toLocaleString();
};

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
};

const getContributionStatusLabel = (status?: string | null) => {
  switch (status) {
    case "OVERDUE":
      return "연체 주의";
    case "UNPAID":
      return "미납 안내";
    default:
      return "납부 정상";
  }
};

const getContributionStatusClass = (status?: string | null) => {
  switch (status) {
    case "OVERDUE":
      return "bg-ember-orange/10 text-ember-orange";
    case "UNPAID":
      return "bg-sunburst-yellow/20 text-charcoal-primary";
    default:
      return "bg-meadow-green/10 text-midnight";
  }
};

type PortalShellProps = {
  role: PortalRole;
  session?: {
    id: string;
    loginId: string | null;
    name: string;
    role: string;
  } | null;
  documents?: Document[];
  logs?: LogEntry[];
  refundInfo?: {
    totalPaid: number;
    refundAmount: number;
    processedState: string;
    targetDate: string | null;
  } | null;
  contributionSummary?: ContributionSummaryView | null;
  contributionDashboard?: ContributionDashboardView | null;
  paymentNotices?: PaymentNoticeView[];
  pendingUsers?: {
    id: string;
    name: string;
    email: string;
    signupName?: string | null;
    signupPhone?: string | null;
    signupMemo?: string | null;
    createdAt: string;
  }[];
  approvedSocialUsers?: {
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
  }[];
  isDrawerMode?: boolean;
  initialCategory?: string;
  initialSearch?: string;
  onOpenDocument?: (doc: Document) => void;
};

export function PortalShell({
  role,
  session,
  documents = [],
  logs = [],
  refundInfo,
  contributionSummary,
  contributionDashboard,
  paymentNotices = [],
  pendingUsers = [],
  approvedSocialUsers = [],
  isDrawerMode = false,
  initialCategory = "all",
  initialSearch = "",
  onOpenDocument,
}: PortalShellProps) {
  const router = useRouter();
  const profile = portalProfiles[role];
  const isLoggedIn = !!session;
  const resolvedContributionDashboard =
    contributionDashboard ??
    buildContributionDashboardView({
      summary: contributionSummary ?? null,
      profile: null,
      stages: [],
      ledgerEntries: [],
    });

  // 문서 목록을 로컬 상태로 관리하여 삭제/별표 변경 시 즉각 반영
  const [managedDocs, setManagedDocs] = useState<Document[]>(documents);
  const [activeViewDoc, setActiveViewDoc] = useState<Document | null>(null);
  const activeViewDocRelation = activeViewDoc ? getPdfRelatedDocument(activeViewDoc, managedDocs) : null;
  const handleOpenDocument = onOpenDocument ?? setActiveViewDoc;

  const handleDocumentDeleted = (id: string) => {
    setManagedDocs(prev => prev.filter(d => d.id !== id));
  };

  const handleDocumentStarToggled = (id: string, isStarred: boolean) => {
    setManagedDocs(prev => prev.map(d => d.id === id ? { ...d, isStarred } : d));
  };

  // 알림 아키텍처 상태 정의
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [showAnnouncePopup, setShowAnnouncePopup] = useState(false);
  const [isDoNotShowToday, setIsDoNotShowToday] = useState(false);
  const [isDoNotShowAnnounceToday, setIsDoNotShowAnnounceToday] = useState(false);
  const [welcomeModalConfig, setWelcomeModalConfig] = useState({ title: "", description: "", isUpgrade: true });
  const [showToast, setShowToast] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 토스트 트리거 함수 (선언 순서 준수를 위해 이펙트 위 배치)
  const triggerLoginToast = () => {
    setShowToast(true);
    sessionStorage.setItem("dbapt_login_welcomed", "true");
    const timer = setTimeout(() => {
      setShowToast(false);
    }, 4000);
    return () => clearTimeout(timer);
  };

  // 드롭다운 외부 클릭 감지 클로저
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isLoggedIn || !session || isDrawerMode) return;
    if (!["MEMBER", "REFUND", "ADMIN"].includes(session.role)) return;

    const dismissedUntil = localStorage.getItem("dbapt_announce_popup_dismissed_until");
    const isDismissed = dismissedUntil && Date.now() < parseInt(dismissedUntil, 10);

    if (isDismissed) return;

    const timer = setTimeout(() => {
      setShowAnnouncePopup(true);
    }, 400);
    return () => clearTimeout(timer);
  }, [isLoggedIn, session, isDrawerMode]);

  useEffect(() => {
    if (showWelcomeModal || showAnnouncePopup) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [showWelcomeModal, showAnnouncePopup]);

  // 3단계 및 2단계 감지 감시 장치 (마운트 시)
  useEffect(() => {
    if (!isLoggedIn || !session) return;

    const currentRole = session.role;
    const lastSeenRole = localStorage.getItem("dbapt_last_seen_role");

    // 최초 역할 정보 기록용
    if (!lastSeenRole) {
      localStorage.setItem("dbapt_last_seen_role", currentRole);
      
      // 최초 가입 진입 시에도 환영 토스트 활성화
      setTimeout(() => {
        triggerLoginToast();
      }, 0);
      return;
    }

    // [3단계] 자격 권한 상태 변동 감지 트리거
    if (lastSeenRole !== currentRole) {
      localStorage.setItem("dbapt_last_seen_role", currentRole);

      // 오늘 하루 이 창 열지 않기(로컬스토리지 차단) 체크 여부 확인
      const dismissedUntil = localStorage.getItem("dbapt_welcome_modal_dismissed_until");
      const isDismissed = dismissedUntil && Date.now() < parseInt(dismissedUntil, 10);

      if (!isDismissed) {
        // 모달 문구 동적 매칭 (cascading renders 방지를 위해 setTimeout으로 감싸 실행)
        setTimeout(() => {
          if (lastSeenRole === "PENDING" && (currentRole === "MEMBER" || currentRole === "REFUND")) {
            setWelcomeModalConfig({
              title: "조합원 승인 완료 축하드립니다!",
              description: `가입 신청하신 소셜 계정이 명부 대조를 마치고 정식으로 승인되었습니다. 이제 조합의 ${
                currentRole === "MEMBER" ? "정식 조합원 문서실" : "환불 수속 관리 대시보드"
              }을 안전하게 이용하실 수 있습니다.`,
              isUpgrade: true,
            });
            setShowWelcomeModal(true);
          } else {
            // 자격 상호 변동 (MEMBER <=> REFUND)
            setWelcomeModalConfig({
              title: "조합 자격 상태가 변동되었습니다",
              description: `사무국의 권한 재설정에 의해 조합원님의 가입 권한이 [${getRoleLabel(lastSeenRole)}]에서 [${getRoleLabel(currentRole)}] 권한으로 조율 및 재조정되었습니다. 바뀐 권한에 최적화된 포털 셸로 리다이렉트합니다.`,
              isUpgrade: false,
            });
            setShowWelcomeModal(true);
          }
        }, 0);
      }
    } else {
      // [2단계] 일반 로그인 웰컴 토스트 트리거 (세션 당 1회만)
      const hasWelcomedThisSession = sessionStorage.getItem("dbapt_login_welcomed");
      if (!hasWelcomedThisSession) {
        setTimeout(() => {
          triggerLoginToast();
        }, 0);
      }
    }
  }, [isLoggedIn, session]);

  const handleConfirmWelcomeModal = () => {
    if (isDoNotShowToday) {
      const midnight = new Date();
      midnight.setHours(23, 59, 59, 999);
      localStorage.setItem("dbapt_welcome_modal_dismissed_until", midnight.getTime().toString());
    }
    setShowWelcomeModal(false);
  };

  const handleCloseAnnouncePopup = () => {
    if (isDoNotShowAnnounceToday) {
      const midnight = new Date();
      midnight.setHours(23, 59, 59, 999);
      localStorage.setItem("dbapt_announce_popup_dismissed_until", midnight.getTime().toString());
    }
    setShowAnnouncePopup(false);
  };

  const handleOpenDocumentsFromPopup = () => {
    handleCloseAnnouncePopup();
    setTimeout(() => {
      document.getElementById("portal-documents-section")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 150);
  };

  const handleLogout = async () => {
    // 로그아웃 시 세션 웰컴 여부 클리어하여 재진입 시 토스트가 또 뜨게 함
    sessionStorage.removeItem("dbapt_login_welcomed");
    await logoutAction();
    router.push("/login");
    router.refresh();
  };

  return (
    <main className={cn(isDrawerMode ? "bg-transparent p-0" : "min-h-screen bg-warm-canvas px-4 pb-14 pt-4 sm:px-6")}>
      {!isDrawerMode && (
        <nav className="site-container stone-card flex flex-wrap items-center justify-between gap-4 px-5 py-4 bg-white">
          <Link href="/" className="font-semibold text-charcoal-primary">
            대방동 지역주택조합
          </Link>
          <div className="flex items-center gap-4">
            {isLoggedIn ? (
              <div className="relative" ref={dropdownRef}>
                {/* 위젯 활성 뱃지 버튼 */}
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-white hover:bg-stone-surface border border-stone-surface shadow-sm text-xs text-graphite font-semibold transition cursor-pointer"
                >
                  <span>{session.name}님</span>
                  <span className={cn(
                    "inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-bold tracking-wider",
                    session.role === "MEMBER"
                      ? "bg-meadow-green/10 text-meadow-green"
                      : session.role === "REFUND"
                      ? "bg-ember-orange/10 text-ember-orange"
                      : session.role === "ADMIN"
                      ? "bg-purple-100 text-purple-700"
                      : "bg-sunburst-yellow/20 text-charcoal-primary"
                  )}>
                    {getRoleLabel(session.role)}
                  </span>
                  <svg className={cn("w-3 h-3 text-ash transition-transform duration-200", isDropdownOpen && "rotate-180")} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* 드롭다운 메뉴 (DESIGN.md 규격: White Card + Recessed panel 느낌) */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2.5 w-64 rounded-2xl bg-white border border-stone-surface shadow-lg z-50 p-4 transition-all duration-200">
                    <h4 className="text-xs font-bold text-charcoal-primary mb-2">조합원 프로필 정보</h4>
                    
                    {/* Recessed Panel 내역 명세 */}
                    <div className="bg-parchment-card p-3 rounded-xl border border-dashed border-stone-surface text-[11px] text-graphite space-y-2">
                      <div className="flex justify-between">
                        <span className="font-medium text-ash">인증 이메일</span>
                        <span className="text-charcoal-primary font-mono font-medium">{(session as { email?: string }).email || "소셜 미연동 (일반)"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-ash">조합원 번호</span>
                        <span className="text-charcoal-primary font-mono font-medium">{session.loginId || "임시 미승인"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-ash">현재 소속권한</span>
                        <strong className="text-midnight">{getRoleLabel(session.role)}</strong>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-stone-surface flex items-center justify-between">
                      <span className="text-[10px] text-ash font-medium">안전한 세션 가동 중</span>
                      <Button onClick={handleLogout} variant="ghost" size="sm" className="rounded-full h-8 text-[11px] px-2 text-ember-orange hover:bg-ember-orange/5 cursor-pointer">
                        로그아웃
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button asChild variant="ghost" size="sm">
                  <Link href="/">홈으로</Link>
                </Button>
                <Button asChild variant="secondary" size="sm">
                  <Link href="/login">로그인 안내</Link>
                </Button>
              </div>
            )}
            <PortalHamburger />
          </div>
        </nav>
      )}

      <div className={cn(isDrawerMode ? "w-full py-2" : "site-container py-10 sm:py-14")}>
        {/* Top Badge */}
        <p className="inline-flex rounded-full bg-parchment-card px-4 py-2 text-sm font-medium text-ember-orange">
          {isLoggedIn ? "조합원 전용 서비스" : "포털 화면 미리보기"}
        </p>

        <h1 className="mt-6 max-w-3xl text-4xl leading-tight sm:text-[3rem]">
          {isLoggedIn ? `${session.name}님 환영합니다` : profile.title}
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-8 text-graphite">
          {isLoggedIn
            ? `현재 ${getRoleLabel(session.role)} 권한으로 로그인 중입니다. 아래에서 본인 계정 정보 및 조합의 정보공개 문서를 안전하게 확인해 보실 수 있습니다.`
            : profile.description}
        </p>

        {/* Informational Panel */}
        <section className="soft-panel mt-9 p-5 sm:p-6" aria-label="이용 안내">
          {isLoggedIn ? (
            <>
              <p className="font-semibold text-midnight">
                인증 세션이 활성화된 상태입니다.
              </p>
              <p className="mt-2 text-[15px] leading-7 text-graphite">
                조합 정보 보호 및 법률 요건에 의거해 조합원 본인의 열람/다운로드 이력(IP 주소, 일시)이 보안 감사 로그로 실시간 기록되고 있습니다.
              </p>
            </>
          ) : (
            <>
              <p className="font-semibold text-charcoal-primary">
                이 화면은 향후 서비스 구조를 보여주는 준비 화면입니다.
              </p>
              <p className="mt-2 text-[15px] leading-7 text-graphite">
                실제 인증이나 개인 자료 제공 기능은 포함되지 않습니다. 각 항목은 운영 준비 상태만 안내합니다.
              </p>
            </>
          )}
        </section>

        {/* Role Previews switcher (only visible when NOT logged in) */}
        {!isLoggedIn && (
          <nav className="mt-8 flex flex-wrap gap-2" aria-label="역할별 미리보기 전환">
            {portalRoleOrder.map((item) => {
              const target = portalProfiles[item];
              const current = item === role;

              return (
                <Link
                  key={item}
                  href={target.href}
                  aria-current={current ? "page" : undefined}
                  className={cn(
                    "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                    current
                      ? "bg-midnight text-white"
                      : "bg-white text-graphite shadow-[inset_0_0_0_1px_var(--stone-surface)] hover:bg-parchment-card",
                  )}
                >
                  {target.navLabel} 화면
                </Link>
              );
            })}
          </nav>
        )}

        {/* Logged-In Specific Dynamic Content Areas */}
        {isLoggedIn ? (
          <div className="mt-10 flex flex-col gap-10">
            {/* 1. Account Specific Status Cards */}
            <section className="grid gap-6 md:grid-cols-2">
              {role === "member" && (
                <div className="md:col-span-2">
                  <ContributionDashboard dashboard={resolvedContributionDashboard} paymentNotices={paymentNotices} />
                </div>
              )}

              {role === "refund" && (refundInfo || contributionSummary) && (
                <article className="stone-card p-6 bg-white md:col-span-2">
                  <span className={cn("inline-flex rounded-full px-3 py-1 text-xs font-semibold", getContributionStatusClass(contributionSummary?.status))}>
                    {getContributionStatusLabel(contributionSummary?.status)}
                  </span>
                  <h2 className="mt-4 text-xl font-semibold">내 환불/정산 및 납부 현황</h2>
                  <p className="mt-2 text-sm text-graphite">환불조합원 탈퇴 의결, 납부 실적, 미납 및 연체 반영 내역입니다.</p>
                  <div className="mt-4 rounded-2xl bg-parchment-card p-4 text-xs leading-5 text-graphite ring-1 ring-inset ring-stone-surface">
                    환불조합원 환불/정산 및 납부 현황은 ERP 프로그램과 연동되면 본인 화면에 순차적으로 반영하겠습니다.
                  </div>
                  <div className="mt-4 grid gap-4 border-t border-[#f2f0ed] pt-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
                    <div>
                      <div className="text-xs text-graphite/70">납부 실적액</div>
                      <div className="text-base font-bold text-graphite mt-1">{formatNumber(contributionSummary?.totalPaid ?? refundInfo?.totalPaid ?? 0)} 원</div>
                    </div>
                    <div>
                      <div className="text-xs text-graphite/70">정산예정액 (실 환불액)</div>
                      <div className="text-base font-bold text-ember-orange mt-1">{formatNumber(refundInfo?.refundAmount || 0)} 원</div>
                    </div>
                    <div>
                      <div className="text-xs text-graphite/70">미납액</div>
                      <div className={cn("text-base font-bold mt-1", contributionSummary?.unpaidAmount ? "text-ember-orange" : "text-meadow-green")}>
                        {formatNumber(contributionSummary?.unpaidAmount || 0)} 원
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-graphite/70">연체 미납 / 연체료</div>
                      <div className={cn("text-base font-bold mt-1", contributionSummary?.overdueAmount ? "text-ember-orange" : "text-meadow-green")}>
                        {formatNumber(contributionSummary?.overdueAmount || 0)} 원 / {formatNumber(contributionSummary?.lateFee || 0)} 원
                      </div>
                    </div>
                    {refundInfo && (
                      <div className="mt-1 flex items-center justify-between border-t border-[#f2f0ed] pt-3 text-xs sm:col-span-2 lg:col-span-4">
                        <div>
                          <span className="text-graphite/70">지급 진행 단계:</span>
                          <strong className="ml-1 text-charcoal-primary">{refundInfo.processedState}</strong>
                        </div>
                        <div>
                          <span className="text-graphite/70">지급 예정일:</span>
                          <strong className="ml-1 text-charcoal-primary">{formatDate(refundInfo.targetDate)}</strong>
                        </div>
                      </div>
                    )}
                    {paymentNotices.length > 0 && (
                      <div className="rounded-2xl border border-dashed border-stone-surface bg-parchment-card p-4 text-xs text-graphite sm:col-span-2 lg:col-span-4">
                        <div className="font-bold text-charcoal-primary">{paymentNotices[0].title}</div>
                        <p className="mt-1 leading-relaxed">{paymentNotices[0].message}</p>
                        <p className="mt-2 text-[10px] text-ash">상태: {paymentNotices[0].status} · 관리자 승인 전 발송되지 않습니다.</p>
                      </div>
                    )}
                  </div>
                </article>
              )}

              {role === "refund" && !refundInfo && !contributionSummary && (
                <article className="stone-card p-6 bg-white md:col-span-2">
                  <span className="inline-flex rounded-full bg-sunburst-yellow/20 text-charcoal-primary px-3 py-1 text-xs font-semibold">
                    정산 자료 대기
                  </span>
                  <h2 className="mt-4 text-xl font-semibold">내 환불/정산 현황</h2>
                  <p className="mt-2 text-sm text-graphite">승인된 환불 또는 납부자료가 반영되면 본인 화면에만 표시됩니다.</p>
                  <div className="mt-4 rounded-2xl bg-parchment-card p-4 text-xs leading-5 text-graphite ring-1 ring-inset ring-stone-surface">
                    환불조합원 환불/정산 및 납부 현황은 ERP 프로그램과 연동되면 본인 화면에 순차적으로 반영하겠습니다.
                  </div>
                </article>
              )}

              {role === "admin" && (
                <>
                  <article className="stone-card p-6 bg-white md:col-span-2">
                    <span className="inline-flex rounded-full bg-sunburst-yellow/20 text-charcoal-primary px-3 py-1 text-xs font-semibold">
                      운영 및 승인 관리
                    </span>
                    <div className="mt-4 grid gap-6 md:grid-cols-2">
                      <div>
                        <h2 className="text-xl font-semibold">관리자 대시보드 요약</h2>
                        <p className="mt-2 text-sm text-graphite">총 정보공개 문서와 감사 로그 상태 요약입니다.</p>
                        <ul className="mt-4 text-xs space-y-2 leading-5 text-graphite">
                          <li>• 등록된 문서 건수: <strong className="text-charcoal-primary font-semibold">{documents.length}건</strong> (의무공개 {documents.filter(d=>d.category==='DISCLOSURE').length}건 / 회계보고 {documents.filter(d=>d.category==='ACCOUNTING').length}건)</li>
                          <li>• 총 보안 다운로드 수: <strong className="text-charcoal-primary font-semibold">{logs.length}회</strong></li>
                          <li>• 승인 대기 중 소셜 회원: <strong className="text-ember-orange font-semibold">{pendingUsers.length}명</strong></li>
                        </ul>
                      </div>
                      <div>
                        <DocumentUploadForm onSuccess={() => {
                          router.refresh();
                        }} />
                      </div>
                    </div>
                  </article>

                  {/* 소셜 가입 승인 대기 관리 섹션 */}
                  <article className="stone-card p-6 bg-white md:col-span-2">
                    <h2 className="text-xl font-semibold text-charcoal-primary">소셜 가입 대기 회원 승인 관리</h2>
                    <p className="mt-2 text-xs text-graphite">
                      Google OAuth를 통해 신규 가입한 사용자의 본명 및 이메일을 검토하고 알맞은 조합 권한을 부여합니다.
                    </p>

                    <div className="mt-6 border-t border-[#f2f0ed] pt-4">
                      {pendingUsers.length === 0 ? (
                        <p className="py-6 text-center text-xs text-graphite/70">
                          가입 승인 대기 중인 소셜 계정이 없습니다.
                        </p>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs border-collapse">
                            <thead>
                              <tr className="border-b border-[#f2f0ed] text-graphite/80 font-medium">
                                <th className="pb-3 pr-4">신청인 명의</th>
                                <th className="pb-3 pr-4">이메일</th>
                                <th className="pb-3 pr-4">가입 신청일</th>
                                <th className="pb-3 text-right">권한 부여 액션</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[#f8f7f4]">
                              {pendingUsers.map((user) => (
                                <tr key={user.id} className="text-charcoal-primary">
                                  <td className="py-3.5 pr-4">
                                    <form
                                      className="flex min-w-[180px] flex-col gap-2"
                                      onSubmit={async (event) => {
                                        event.preventDefault();
                                        const formData = new FormData(event.currentTarget);
                                        const nextSignupName = String(formData.get("signupName") || "");
                                        const res = await updateSignupNameAction(user.id, nextSignupName);
                                        if (res.success) {
                                          alert(`${user.name}님의 신청 이름이 수정되었습니다.`);
                                          router.refresh();
                                        } else if (res.error) {
                                          alert(res.error);
                                        }
                                      }}
                                    >
                                      <label className="sr-only" htmlFor={`signup-name-${user.id}`}>
                                        {user.name} 신청 이름
                                      </label>
                                      <input
                                        id={`signup-name-${user.id}`}
                                        name="signupName"
                                        defaultValue={user.signupName || user.name}
                                        className="w-full rounded-lg border border-[#f2f0ed] bg-white px-2.5 py-2 text-xs font-semibold text-charcoal-primary outline-none transition focus:border-ember-orange focus:ring-1 focus:ring-ember-orange"
                                      />
                                      <button
                                        type="submit"
                                        className="self-start rounded-full bg-[#f8f7f4] px-3 py-1 text-[10px] font-semibold text-graphite shadow-[inset_0_0_0_1px_var(--stone-surface)] transition hover:bg-stone-surface"
                                      >
                                        신청 이름 저장
                                      </button>
                                    </form>
                                    {user.signupName && user.signupName !== user.name && (
                                      <div className="mt-2 text-[10px] font-medium text-ash">
                                        Google 이름: {user.name}
                                      </div>
                                    )}
                                    {user.signupMemo && (
                                      <div className="mt-1 max-w-[220px] text-[10px] leading-4 text-ash">
                                        {user.signupMemo}
                                      </div>
                                    )}
                                  </td>
                                  <td className="py-3.5 pr-4">
                                    <div className="font-mono">{user.email}</div>
                                    {user.signupPhone && (
                                      <div className="mt-1 text-[10px] font-medium text-graphite">
                                        {user.signupPhone}
                                      </div>
                                    )}
                                  </td>
                                  <td className="py-3.5 pr-4">{formatDate(user.createdAt)}</td>
                                  <td className="py-3.5 text-right flex justify-end gap-2">
                                    <Button
                                      size="sm"
                                      variant="default"
                                      className="rounded-full h-8 px-3 text-[11px] font-semibold cursor-pointer"
                                      onClick={async () => {
                                        const res = await approveUserAction(user.id, "MEMBER");
                                        if (res.success) {
                                          alert(`${user.name}님이 정식 조합원(MEMBER)으로 승인되었습니다.`);
                                          router.refresh();
                                        }
                                      }}
                                    >
                                      정식 조합원(MEMBER) 승인
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="secondary"
                                      className="rounded-full h-8 px-3 text-[11px] font-semibold cursor-pointer"
                                      onClick={async () => {
                                        const res = await approveUserAction(user.id, "REFUND");
                                        if (res.success) {
                                          alert(`${user.name}님이 환불 조합원(REFUND)으로 승인되었습니다.`);
                                          router.refresh();
                                        }
                                      }}
                                    >
                                      환불 조합원(REFUND) 승인
                                    </Button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </article>

                  {/* 소셜 가입 완료 회원 권한 관리 섹션 */}
                  <article className="stone-card p-6 bg-white md:col-span-2">
                    <h2 className="text-xl font-semibold text-charcoal-primary">소셜 가입 회원 자격 변경 관리</h2>
                    <p className="mt-2 text-xs text-graphite">
                      이미 가입이 승인된 구글 로그인 회원의 권한을 정식 조합원(MEMBER)과 환불 조합원(REFUND) 간에 자유롭게 전환할 수 있습니다.
                    </p>

                    <div className="mt-6 border-t border-[#f2f0ed] pt-4">
                      {approvedSocialUsers.length === 0 ? (
                        <p className="py-6 text-center text-xs text-graphite/70">
                          권한 변경이 가능한 소셜 회원이 존재하지 않습니다. (최초 구글 로그인 가입 승인 후 표시됩니다.)
                        </p>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs border-collapse">
                            <thead>
                              <tr className="border-b border-[#f2f0ed] text-graphite/80 font-medium">
                                <th className="pb-3 pr-4">소셜 회원 명의</th>
                                <th className="pb-3 pr-4">이메일</th>
                                <th className="pb-3 pr-4">현재 권한 상태</th>
                                <th className="pb-3 text-right">자격 강제 전환 액션</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[#f8f7f4]">
                              {approvedSocialUsers.map((user) => (
                                <tr key={user.id} className="text-charcoal-primary">
                                  <td className="py-3.5 pr-4 font-semibold">{user.name}</td>
                                  <td className="py-3.5 pr-4 font-mono">{user.email}</td>
                                  <td className="py-3.5 pr-4">
                                    <span className={cn(
                                      "inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold",
                                      user.role === "MEMBER"
                                        ? "bg-meadow-green/10 text-meadow-green"
                                        : "bg-ember-orange/10 text-ember-orange"
                                    )}>
                                      {user.role === "MEMBER" ? "정식 조합원 (MEMBER)" : "환불 조합원 (REFUND)"}
                                    </span>
                                  </td>
                                  <td className="py-3.5 text-right flex justify-end gap-2">
                                    {user.role === "MEMBER" ? (
                                      <Button
                                        size="sm"
                                        variant="secondary"
                                        className="rounded-full h-8 px-3 text-[11px] font-semibold text-ember-orange hover:bg-ember-orange/5 cursor-pointer"
                                        onClick={async () => {
                                          const res = await approveUserAction(user.id, "REFUND");
                                          if (res.success) {
                                            alert(`${user.name}님의 자격을 환불 조합원(REFUND)으로 강제 전환했습니다.`);
                                            router.refresh();
                                          }
                                        }}
                                      >
                                        환불 조합원(REFUND) 자격으로 강제 변경
                                      </Button>
                                    ) : (
                                      <Button
                                        size="sm"
                                        variant="default"
                                        className="rounded-full h-8 px-3 text-[11px] font-semibold cursor-pointer"
                                        onClick={async () => {
                                          const res = await approveUserAction(user.id, "MEMBER");
                                          if (res.success) {
                                            alert(`${user.name}님의 자격을 정식 조합원(MEMBER)으로 강제 전환했습니다.`);
                                            router.refresh();
                                          }
                                        }}
                                      >
                                        정식 조합원(MEMBER) 자격으로 강제 변경
                                      </Button>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </article>
                </>
              )}
            </section>

            {/* 2. Interactive Document Table */}
            {role !== "admin" && (
              <PersonalDocumentHub
                documents={managedDocs}
                role={role}
                isDrawerMode={isDrawerMode}
                onOpenDocument={handleOpenDocument}
              />
            )}

            {/* 3. Document list for Admin */}
            {role === "admin" && (
              <section id="portal-documents-section" className="soft-panel p-6 bg-white border border-[#f2f0ed] rounded-2xl">
                <h3 className="text-lg font-semibold text-charcoal-primary mb-2">전체 등록 문서 목록</h3>
                <p className="text-xs text-graphite mb-6">등록된 전체 문서들의 세부 정보 및 상태입니다.</p>
                <DocumentTable 
                  documents={managedDocs} 
                  role={role} 
                  isDrawerMode={isDrawerMode} 
                  initialCategory={initialCategory}
                  initialSearch={initialSearch}
                  onDocumentDeleted={handleDocumentDeleted}
                  onDocumentStarToggled={handleDocumentStarToggled}
                  onOpenDocument={handleOpenDocument}
                />
              </section>
            )}

            {/* 4. Audit Log Table for Admin only */}
            {role === "admin" && (
              <section className="soft-panel p-6 bg-white border border-[#f2f0ed] rounded-2xl">
                <AuditLogsTable logs={logs} />
              </section>
            )}
          </div>
        ) : (
          /* Render static preview profiles cards (fallback when not logged in) */
          <>
            <section className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {profile.cards.map((card) => (
                <article key={card.title} className="stone-card p-6">
                  <span
                    className={cn(
                      "inline-flex rounded-full px-3 py-1 text-xs font-medium",
                      card.accent === "orange"
                        ? "bg-ember-orange/10 text-ember-orange"
                        : card.accent === "green"
                        ? "bg-meadow-green/10 text-graphite"
                        : card.accent === "blue"
                        ? "bg-sky-blue/10 text-sky-blue"
                        : "bg-sunburst-yellow/15 text-charcoal-primary"
                    )}
                  >
                    {card.status}
                  </span>
                  <h2 className="mt-6 text-xl">{card.title}</h2>
                  <p className="mt-3 text-[15px] leading-7 text-graphite">{card.description}</p>
                </article>
              ))}
            </section>

            <section className="soft-panel mt-8 px-6 py-8 sm:px-8">
              <p className="text-sm font-medium text-ember-orange">빈 상태 안내</p>
              <h2 className="mt-3 text-2xl">{profile.emptyTitle}</h2>
              <p className="mt-3 max-w-2xl text-[15px] leading-7 text-graphite">
                {profile.emptyDescription}
              </p>
            </section>
          </>
        )}
      </div>

      {showAnnouncePopup && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative flex w-full max-w-lg flex-col rounded-3xl border border-stone-surface bg-warm-canvas p-6 text-left shadow-2xl animate-in zoom-in-95 duration-200 sm:p-8">
            <button
              type="button"
              onClick={handleCloseAnnouncePopup}
              className="absolute right-6 top-6 text-ash transition duration-150 hover:text-charcoal-primary cursor-pointer"
              aria-label="닫기"
            >
              <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="text-[11px] font-bold uppercase tracking-widest text-ash">
              안내
            </div>

            <div className="mt-4 flex flex-col">
              <span className="self-start rounded-full bg-ember-orange/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-ember-orange">
                조합원 권익 및 기밀 유지
              </span>

              <h3 className="mt-3 text-xl font-bold leading-tight tracking-tight text-charcoal-primary sm:text-2xl">
                조합원 개인 자료실 등록 알림
              </h3>

              <p className="mt-3 text-xs font-medium leading-5 text-graphite/90">
                조합원님의 투명한 권익 보호를 위한 정보공개 의무 문서 및 회계 자금 보고서가 정상 등록되었습니다. 조합 정보 보호를 위해 안전 수칙 하에 열람하실 수 있습니다.
              </p>

              <div className="mt-5 space-y-3.5 rounded-2xl border border-dashed border-stone-surface bg-parchment-card p-4 text-[11px] text-graphite shadow-inner">
                <div className="flex gap-2">
                  <span className="shrink-0 select-none text-base text-ember-orange">📁</span>
                  <div>
                    <h4 className="text-xs font-bold text-charcoal-primary">최신 등록 문서 안내</h4>
                    <p className="mt-1 leading-relaxed text-graphite/85">
                      정보공개 자료와 회계 및 자금 보고 문서를 로그인 세션 안에서 확인할 수 있습니다.
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 border-t border-dashed border-stone-surface/60 pt-3.5">
                  <span className="shrink-0 select-none text-base text-sky-blue">🔒</span>
                  <div>
                    <h4 className="text-xs font-bold text-charcoal-primary">보안 감사 및 이력 자동 기록</h4>
                    <p className="mt-1 leading-relaxed text-graphite/85">
                      PDF 파일 열람 및 다운로드 이력은 보안 감사 로그에 실시간으로 자동 보존됩니다.
                    </p>
                  </div>
                </div>

                <ContributionSummaryMini
                  contributionSummary={contributionSummary}
                  paymentNotices={paymentNotices}
                />
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={handleOpenDocumentsFromPopup}
                className="flex-1 rounded-full bg-ember-orange px-4 py-3 text-center text-xs font-bold text-white shadow-md transition-all duration-200 hover:bg-[#e03700] active:scale-97 cursor-pointer"
              >
                자료실 열기 (자세히 보기)
              </button>

              <button
                type="button"
                onClick={handleCloseAnnouncePopup}
                className="flex-1 rounded-full border border-stone-surface bg-white px-4 py-3 text-center text-xs font-bold text-graphite transition-all duration-200 hover:bg-[#f8f7f4] active:scale-97 cursor-pointer"
              >
                확인
              </button>
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-stone-surface pt-4">
              <div className="flex items-center gap-2">
                <input
                  id="portalDoNotShowAnnounceToday"
                  type="checkbox"
                  checked={isDoNotShowAnnounceToday}
                  onChange={(e) => setIsDoNotShowAnnounceToday(e.target.checked)}
                  className="size-4 rounded border-stone-surface text-charcoal-primary accent-[#121212] focus:ring-0 focus:ring-offset-0 cursor-pointer"
                />
                <label
                  htmlFor="portalDoNotShowAnnounceToday"
                  className="cursor-pointer select-none text-xs font-semibold text-graphite transition-colors hover:text-charcoal-primary"
                >
                  오늘 하루 이 창 열지 않기
                </label>
              </div>

              <span className="text-[9px] font-medium text-ash">대방동지역주택조합</span>
            </div>
          </div>
        </div>
      )}

      {/* 2단계: 로그인 성공 토스트 알림 (DESIGN.md 규격에 맞춘 옅은 돌색 테두리 + Meadow Green 성공 하이라이트) */}
      {showToast && (
        <div className="fixed top-[88px] right-6 sm:right-8 z-50 flex items-center gap-3 bg-white border border-[#f2f0ed] shadow-lg rounded-full px-5 py-3.5 animate-in fade-in slide-in-from-top-4 duration-300">
          <span className="flex-shrink-0 w-2.5 h-2.5 rounded-full bg-meadow-green animate-pulse" />
          <span className="text-xs text-graphite font-semibold">
            {session?.name}님, **{getRoleLabel(session?.role || "")}** 권한으로 반갑게 연결되었습니다.
          </span>
        </div>
      )}

      {/* 3단계: 권한 변경 감지 최초 1회 환영 모달 */}
      {showWelcomeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-2xl bg-white border border-[#f2f0ed] shadow-lg p-6 text-left animate-in zoom-in-95 duration-200">
            {/* 상단 포인트 뱃지 (Ember Orange 포인트) */}
            <span className={cn(
              "inline-flex rounded-full px-3 py-1 text-xs font-semibold mb-4",
              welcomeModalConfig.isUpgrade ? "bg-meadow-green/10 text-meadow-green" : "bg-ember-orange/10 text-ember-orange"
            )}>
              조합 자격 변동 알림
            </span>

            <h3 className="text-xl font-bold text-charcoal-primary leading-tight">
              {welcomeModalConfig.title}
            </h3>
            
            {/* 정보 알림 수집 Recessed Panel */}
            <div className="mt-4 bg-[#f8f7f4] border border-stone-surface p-4 rounded-xl text-xs text-graphite leading-6">
              {welcomeModalConfig.description}
            </div>

            {/* 오늘 하루 이 창 열지 않기 체크박스 */}
            <div className="mt-5 pt-4 border-t border-[#f2f0ed] flex items-center gap-2">
              <input
                id="doNotShowToday"
                type="checkbox"
                checked={isDoNotShowToday}
                onChange={(e) => setIsDoNotShowToday(e.target.checked)}
                className="w-4 h-4 rounded border-[#f2f0ed] text-[#121212] focus:ring-0 focus:ring-offset-0 accent-[#121212] cursor-pointer"
              />
              <label
                htmlFor="doNotShowToday"
                className="text-xs text-graphite font-medium cursor-pointer select-none hover:text-charcoal-primary transition-colors"
              >
                오늘 하루 이 창 열지 않기
              </label>
            </div>

            <p className="mt-4 text-[11px] text-[#848281]">
              ※ 본 안내창은 권한 변경 후 최초 1회만 표시되며, 확인을 누르면 다음 로그인 시점에는 평소와 같이 신속하게 대시보드로 통과됩니다.
            </p>

            <div className="mt-5 flex justify-end">
              <Button
                onClick={handleConfirmWelcomeModal}
                className="w-full py-5 rounded-full text-xs font-bold bg-[#121212] text-white hover:bg-[#343433] cursor-pointer"
              >
                조합원 대시보드 활성화 (확인)
              </Button>
            </div>
          </div>
        </div>
      )}

      {activeViewDoc && !onOpenDocument && (
        <PdfViewerModal
          documentId={activeViewDoc.id}
          documentTitle={activeViewDoc.title}
          fileName={activeViewDoc.fileName}
          onClose={() => setActiveViewDoc(null)}
          documentDate={activeViewDoc.documentDate || activeViewDoc.publishedAt || activeViewDoc.createdAt || undefined}
          createdAt={activeViewDoc.createdAt}
          publishedAt={activeViewDoc.publishedAt || undefined}
          fileSize={activeViewDoc.fileSize}
          category={activeViewDoc.category}
          subCategory={activeViewDoc.subCategory}
          description={activeViewDoc.description}
          attachments={activeViewDoc.attachments}
          relatedDocument={activeViewDocRelation?.document}
          relatedDocumentLabel={activeViewDocRelation?.label}
        />
      )}
    </main>
  );
}
