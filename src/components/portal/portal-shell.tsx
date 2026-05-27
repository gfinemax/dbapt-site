"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { portalProfiles, portalRoleOrder, type PortalRole } from "@/content/portal";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/lib/auth";
import { DocumentTable, type Document } from "./document-table";
import { DocumentUploadForm } from "./document-upload-form";
import { AuditLogsTable, type LogEntry } from "./audit-logs-table";

type PortalShellProps = {
  role: PortalRole;
  session?: {
    id: string;
    loginId: string;
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
};

export function PortalShell({
  role,
  session,
  documents = [],
  logs = [],
  refundInfo,
}: PortalShellProps) {
  const router = useRouter();
  const profile = portalProfiles[role];
  const isLoggedIn = !!session;

  const handleLogout = async () => {
    await logoutAction();
    router.push("/login");
    router.refresh();
  };

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

  return (
    <main className="min-h-screen bg-warm-canvas px-4 pb-14 pt-4 sm:px-6">
      <nav className="site-container stone-card flex flex-wrap items-center justify-between gap-4 px-5 py-4">
        <Link href="/" className="font-semibold text-charcoal-primary">
          대방동 지역주택조합
        </Link>
        <div className="flex items-center gap-4">
          {isLoggedIn ? (
            <div className="flex items-center gap-3">
              <span className="text-xs text-graphite font-medium">
                {session.name} ({getRoleLabel(session.role)})
              </span>
              <Button onClick={handleLogout} variant="ghost" size="sm" className="rounded-full hover:text-ember-orange text-xs h-8">
                로그아웃
              </Button>
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
        </div>
      </nav>

      <div className="site-container py-10 sm:py-14">
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
                <article className="stone-card p-6 bg-white">
                  <span className="inline-flex rounded-full bg-meadow-green/10 text-midnight px-3 py-1 text-xs font-semibold">
                    납부 정상
                  </span>
                  <h2 className="mt-4 text-xl font-semibold">내 분담금 현황</h2>
                  <p className="mt-2 text-sm text-graphite">조합원님의 현재 분담금 수납 상세 내역입니다.</p>
                  <div className="mt-4 grid grid-cols-2 gap-4 border-t border-[#f2f0ed] pt-4 text-sm">
                    <div>
                      <div className="text-xs text-graphite/70">총 납부 금액</div>
                      <div className="text-lg font-bold text-charcoal-primary mt-1">45,000,000 원</div>
                    </div>
                    <div>
                      <div className="text-xs text-graphite/70">미납 / 독촉 액수</div>
                      <div className="text-lg font-bold text-meadow-green mt-1">0 원 (정상)</div>
                    </div>
                  </div>
                </article>
              )}

              {role === "refund" && refundInfo && (
                <article className="stone-card p-6 bg-white">
                  <span className="inline-flex rounded-full bg-ember-orange/10 text-ember-orange px-3 py-1 text-xs font-semibold">
                    환불 수속 중
                  </span>
                  <h2 className="mt-4 text-xl font-semibold">내 환불/정산 현황</h2>
                  <p className="mt-2 text-sm text-graphite">환불조합원 탈퇴 의결 및 정산 예정 명세입니다.</p>
                  <div className="mt-4 grid grid-cols-2 gap-4 border-t border-[#f2f0ed] pt-4 text-sm">
                    <div>
                      <div className="text-xs text-graphite/70">납부 실적액</div>
                      <div className="text-base font-bold text-graphite mt-1">{formatNumber(refundInfo.totalPaid)} 원</div>
                    </div>
                    <div>
                      <div className="text-xs text-graphite/70">정산예정액 (실 환불액)</div>
                      <div className="text-base font-bold text-ember-orange mt-1">{formatNumber(refundInfo.refundAmount)} 원</div>
                    </div>
                    <div className="col-span-2 mt-1 border-t border-[#f2f0ed] pt-3 flex justify-between items-center text-xs">
                      <div>
                        <span className="text-graphite/70">지급 진행 단계:</span>
                        <strong className="ml-1 text-charcoal-primary">{refundInfo.processedState}</strong>
                      </div>
                      <div>
                        <span className="text-graphite/70">지급 예정일:</span>
                        <strong className="ml-1 text-charcoal-primary">{formatDate(refundInfo.targetDate)}</strong>
                      </div>
                    </div>
                  </div>
                </article>
              )}

              {role === "admin" && (
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
                      </ul>
                    </div>
                    <div>
                      <DocumentUploadForm onSuccess={() => {
                        router.refresh();
                      }} />
                    </div>
                  </div>
                </article>
              )}
            </section>

            {/* 2. Interactive Document Table */}
            {role !== "admin" && (
              <section className="soft-panel p-6 bg-white border border-[#f2f0ed] rounded-2xl">
                <h3 className="text-lg font-semibold text-charcoal-primary mb-2">공개 자료실</h3>
                <p className="text-xs text-graphite mb-6">검색 및 카테고리 필터를 활용하여 해당 문서의 원본 PDF 파일을 안전하게 조회/다운로드할 수 있습니다.</p>
                <DocumentTable documents={documents} role={role} />
              </section>
            )}

            {/* 3. Document list for Admin */}
            {role === "admin" && (
              <section className="soft-panel p-6 bg-white border border-[#f2f0ed] rounded-2xl">
                <h3 className="text-lg font-semibold text-charcoal-primary mb-2">전체 등록 문서 목록</h3>
                <p className="text-xs text-graphite mb-6">등록된 전체 문서들의 세부 정보 및 상태입니다.</p>
                <DocumentTable documents={documents} role={role} />
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
    </main>
  );
}
