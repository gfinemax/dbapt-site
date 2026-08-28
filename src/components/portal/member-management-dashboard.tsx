"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronLeft, ChevronRight, RefreshCw, Search } from "lucide-react";
import {
  ApprovedMemberConversionPanel,
  type ApprovedMemberConversionUser,
} from "@/components/portal/approved-member-conversion-panel";
import type {
  MemberManagementActionRow,
  MemberManagementSnapshot,
  MemberMatchStatus,
} from "@/lib/admin/member-management";
import { getMemberTypeLabel, normalizeMemberType } from "@/lib/member-type";
import { cn } from "@/lib/utils";

type MemberManagementDashboardProps = {
  snapshot: MemberManagementSnapshot;
  syncError: string | null;
  isConfigured: boolean;
  approvedSocialUsers?: ApprovedMemberConversionUser[];
};

const statusLabels: Record<MemberMatchStatus, string> = {
  MATCHED: "가입 완료",
  PENDING: "가입 승인 대기",
  MISSING: "홈페이지 미가입",
  ROLE_MISMATCH: "자격 불일치",
};

const statusClasses: Record<MemberMatchStatus, string> = {
  MATCHED: "bg-meadow-green/10 text-meadow-green",
  PENDING: "bg-sunburst-yellow/15 text-charcoal-primary",
  MISSING: "bg-ember-orange/10 text-ember-orange",
  ROLE_MISMATCH: "bg-sky-blue/10 text-sky-blue",
};

const MEMBERS_PER_PAGE = 20;

function formatNumber(value: number) {
  return new Intl.NumberFormat("ko-KR").format(value);
}

function formatGeneratedAt(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const koreanTime = new Date(date.getTime() + 9 * 60 * 60 * 1000);
  const hour = koreanTime.getUTCHours();
  const minute = String(koreanTime.getUTCMinutes()).padStart(2, "0");
  const period = hour < 12 ? "오전" : "오후";
  const displayHour = hour % 12 || 12;
  return `${koreanTime.getUTCFullYear()}. ${koreanTime.getUTCMonth() + 1}. ${koreanTime.getUTCDate()}. ${period} ${displayHour}:${minute}`;
}

function expectedRoleLabel(role: "MEMBER" | "REFUND") {
  return role === "MEMBER" ? "정식 조합원(MEMBER)" : "환불 조합원(REFUND)";
}

function memberTypeBadgeClass(memberType: string) {
  switch (normalizeMemberType(memberType)) {
    case "PRELIMINARY":
      return "bg-sunburst-yellow/15 text-charcoal-primary";
    case "REFUND":
      return "bg-ember-orange/10 text-ember-orange";
    default:
      return "bg-meadow-green/10 text-meadow-green";
  }
}

function StatCard({ label, value, tone }: { label: string; value: number; tone?: "orange" | "green" | "blue" }) {
  return (
    <article className="stone-card bg-white p-5">
      <p
        className={cn(
          "text-xs font-semibold",
          tone === "orange" && "text-ember-orange",
          tone === "green" && "text-meadow-green",
          tone === "blue" && "text-sky-blue",
          !tone && "text-graphite",
        )}
      >
        {label}
      </p>
      <p className="mt-3 text-3xl font-semibold text-charcoal-primary">{formatNumber(value)}</p>
    </article>
  );
}

function StatusBadge({ status }: { status: MemberMatchStatus }) {
  return (
    <span className={cn("inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold", statusClasses[status])}>
      {statusLabels[status]}
    </span>
  );
}

function ActionRow({ row }: { row: MemberManagementActionRow }) {
  return (
    <tr className="align-top text-charcoal-primary">
      <td className="py-4 pr-4">
        <div className="font-semibold">{row.peopleOnName}</div>
        <div className="mt-1 font-mono text-[11px] text-graphite">{row.peopleOnPhone || "연락처 없음"}</div>
      </td>
      <td className="py-4 pr-4">
        <div className="text-xs font-medium">{row.peopleOnStatus}</div>
        <div className="mt-1 text-[11px] text-ash">기대 권한: {expectedRoleLabel(row.expectedRole)}</div>
      </td>
      <td className="py-4 pr-4">
        <span className={cn("inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold", memberTypeBadgeClass(row.expectedMemberType))}>
          {getMemberTypeLabel(row.expectedMemberType)}
        </span>
      </td>
      <td className="py-4 pr-4">
        <StatusBadge status={row.matchStatus} />
        {row.matchedUserName && (
          <div className="mt-2 text-[11px] leading-5 text-graphite">
            {row.matchedUserName}
            {row.matchedUserEmail ? ` / ${row.matchedUserEmail}` : ""}
            {row.matchedUserRole ? ` / 현재 ${row.matchedUserRole}` : ""}
          </div>
        )}
      </td>
      <td className="py-4 text-right text-[11px] leading-5 text-graphite">
        {row.matchStatus === "MISSING" && "홈페이지 가입 안내 또는 계정 생성 대상입니다."}
        {row.matchStatus === "PENDING" && "기존 관리자 포털에서 가입 승인 후 권한을 부여하세요."}
        {row.matchStatus === "ROLE_MISMATCH" && "기존 자격 변경 관리에서 권한을 전환하세요."}
      </td>
    </tr>
  );
}

export function MemberManagementDashboard({
  snapshot,
  syncError,
  isConfigured,
  approvedSocialUsers = [],
}: MemberManagementDashboardProps) {
  const stats = snapshot.stats;
  const [activeTab, setActiveTab] = useState<"confirmation" | "homepage">("confirmation");
  const [memberSearchQuery, setMemberSearchQuery] = useState("");
  const [memberPage, setMemberPage] = useState(1);

  useEffect(() => {
    const syncTabWithHash = () => {
      setActiveTab(window.location.hash === "#homepage-managed-members" ? "homepage" : "confirmation");
    };
    syncTabWithHash();
    window.addEventListener("hashchange", syncTabWithHash);
    return () => window.removeEventListener("hashchange", syncTabWithHash);
  }, []);

  const selectTab = (tab: "confirmation" | "homepage") => {
    setActiveTab(tab);
    const hash = tab === "homepage" ? "#homepage-managed-members" : "#confirmation-needed-members";
    window.history.replaceState(null, "", hash);
  };
  const normalizedMemberSearchQuery = memberSearchQuery.trim().toLocaleLowerCase("ko-KR");
  const normalizedMemberSearchDigits = normalizedMemberSearchQuery.replace(/\D/g, "");
  const filteredActionRows = useMemo(() => {
    if (!normalizedMemberSearchQuery) return snapshot.actionRows;

    return snapshot.actionRows.filter((row) => {
      const searchableText = [
        row.peopleOnName,
        row.peopleOnPhone,
        row.peopleOnStatus,
        expectedRoleLabel(row.expectedRole),
        getMemberTypeLabel(row.expectedMemberType),
        statusLabels[row.matchStatus],
        row.matchedUserName,
        row.matchedUserEmail,
        row.matchedUserRole,
      ].filter(Boolean).join(" ").toLocaleLowerCase("ko-KR");
      const searchableDigits = searchableText.replace(/\D/g, "");

      return searchableText.includes(normalizedMemberSearchQuery)
        || Boolean(normalizedMemberSearchDigits && searchableDigits.includes(normalizedMemberSearchDigits));
    });
  }, [normalizedMemberSearchDigits, normalizedMemberSearchQuery, snapshot.actionRows]);
  const memberPageCount = Math.max(1, Math.ceil(filteredActionRows.length / MEMBERS_PER_PAGE));
  const currentMemberPage = Math.min(memberPage, memberPageCount);
  const paginatedActionRows = filteredActionRows.slice(
    (currentMemberPage - 1) * MEMBERS_PER_PAGE,
    currentMemberPage * MEMBERS_PER_PAGE,
  );

  return (
    <main className="min-h-screen bg-warm-canvas px-4 py-8 text-charcoal-primary sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 border-b border-[#f2f0ed] pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Link
              href="/portal/admin"
              className="inline-flex items-center gap-2 rounded-full bg-[#f8f7f4] px-3 py-2 text-xs font-semibold text-graphite shadow-[inset_0_0_0_1px_var(--stone-surface)] transition hover:bg-stone-surface"
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
              관리자 포털
            </Link>
            <h1 className="mt-5 text-3xl font-semibold tracking-[-0.02em] text-charcoal-primary">조합원 관리</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-graphite">
              PeopleOn 원장과 홈페이지 계정을 비교해 미가입, 승인 대기, 자격 불일치 대상을 확인합니다.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/portal/admin/members"
              className="inline-flex items-center gap-2 rounded-full bg-midnight px-4 py-2 text-xs font-semibold text-white transition hover:bg-charcoal-primary"
            >
              <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
              원장 다시 확인
            </Link>
            <button
              type="button"
              onClick={() => selectTab("homepage")}
              className="inline-flex items-center gap-2 rounded-full bg-[#f8f7f4] px-4 py-2 text-xs font-semibold text-charcoal-primary shadow-[inset_0_0_0_1px_var(--stone-surface)] transition hover:bg-stone-surface"
            >
              홈페이지 관리 회원 명단
            </button>
          </div>
        </div>

        {syncError && (
          <section className="mt-6 rounded-2xl bg-[#f8f7f4] p-5 shadow-[inset_0_0_0_1px_var(--stone-surface)]">
            <p className="text-sm font-semibold text-ember-orange">
              {isConfigured ? "PeopleOn API 원장 확인에 실패했습니다." : "PeopleOn API 연결 설정이 필요합니다."}
            </p>
            <p className="mt-2 text-xs leading-5 text-graphite">{syncError}</p>
          </section>
        )}

        <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="조합원 통계">
          <StatCard label="등기 조합원" value={stats.registeredPeopleOnCount} tone="green" />
          <StatCard label="예비 조합원" value={stats.preliminaryPeopleOnCount} />
          <StatCard label="환불 조합원" value={stats.refundPeopleOnCount} tone="orange" />
          <StatCard label="홈페이지 가입 완료" value={stats.homepageApprovedCount} tone="blue" />
          <StatCard label="가입 승인 대기" value={stats.homepagePendingCount} />
          <StatCard label="PeopleOn 관리 대상" value={stats.trackedPeopleOnCount} />
          <StatCard label="홈페이지 미가입" value={stats.missingHomepageCount} tone="orange" />
          <StatCard label="자격 불일치" value={stats.roleMismatchCount} tone="blue" />
        </section>

        <div className="mt-6 flex gap-1 rounded-full bg-[#f2f0ed] p-1" role="tablist" aria-label="조합원 관리 명단">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "confirmation"}
            onClick={() => selectTab("confirmation")}
            className={cn("flex-1 rounded-full px-4 py-3 text-sm font-semibold transition", activeTab === "confirmation" ? "bg-midnight text-white" : "text-graphite hover:bg-white/70")}
          >
            확인 필요 조합원
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "homepage"}
            onClick={() => selectTab("homepage")}
            className={cn("flex-1 rounded-full px-4 py-3 text-sm font-semibold transition", activeTab === "homepage" ? "bg-midnight text-white" : "text-graphite hover:bg-white/70")}
          >
            홈페이지 관리 회원
          </button>
        </div>

        {activeTab === "confirmation" ? <section id="confirmation-needed-members" className="stone-card mt-4 scroll-mt-6 bg-white p-6" role="tabpanel">
          <div className="flex flex-col gap-2 border-b border-[#f2f0ed] pb-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold">확인 필요 조합원</h2>
              <p className="mt-2 text-xs leading-5 text-graphite">
                PeopleOn 기준 등기/환불 대상 중 홈페이지 계정 조치가 필요한 대상만 우선 표시합니다.
              </p>
            </div>
            <p className="text-[11px] font-medium text-ash">원장 기준 시각: {formatGeneratedAt(snapshot.generatedAt)}</p>
          </div>

          <div className="mt-5 flex flex-col gap-2 sm:max-w-md">
            <label className="relative block" htmlFor="peopleon-member-search">
              <span className="sr-only">확인 필요 조합원 검색</span>
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ash" aria-hidden="true" />
              <input
                id="peopleon-member-search"
                type="search"
                value={memberSearchQuery}
                onChange={(event) => {
                  setMemberSearchQuery(event.target.value);
                  setMemberPage(1);
                }}
                placeholder="이름, 연락처, 자격, 홈페이지 상태로 검색"
                className="h-11 w-full rounded-full border border-stone-surface bg-[#f8f7f4] pl-10 pr-4 text-sm text-charcoal-primary outline-none transition placeholder:text-ash focus:border-charcoal-primary focus:bg-white focus:ring-2 focus:ring-charcoal-primary/10"
              />
            </label>
            <p className="text-[11px] text-ash" aria-live="polite">
              전체 {snapshot.actionRows.length}명 중 {filteredActionRows.length}명 표시
            </p>
          </div>

          {snapshot.actionRows.length === 0 ? (
            <p className="py-10 text-center text-sm text-graphite/75">
              현재 미가입, 승인 대기, 자격 불일치로 확인되는 조합원이 없습니다.
            </p>
          ) : filteredActionRows.length === 0 ? (
            <p className="py-10 text-center text-sm text-graphite/75">검색 조건에 맞는 확인 필요 조합원이 없습니다.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="mt-2 w-full min-w-[760px] border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-[#f2f0ed] text-graphite/80">
                    <th className="py-3 pr-4 font-semibold">PeopleOn 조합원</th>
                    <th className="py-3 pr-4 font-semibold">원장 상태</th>
                    <th className="py-3 pr-4 font-semibold">자격 구분</th>
                    <th className="py-3 pr-4 font-semibold">홈페이지 상태</th>
                    <th className="py-3 text-right font-semibold">운영 메모</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f8f7f4]">
                  {paginatedActionRows.map((row) => (
                    <ActionRow key={row.peopleOnId} row={row} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {filteredActionRows.length > MEMBERS_PER_PAGE && (
            <nav className="mt-5 flex items-center justify-center gap-3 border-t border-[#f2f0ed] pt-5" aria-label="확인 필요 조합원 페이지">
              <button type="button" aria-label="이전 페이지" disabled={currentMemberPage === 1} onClick={() => setMemberPage((page) => Math.max(1, page - 1))} className="rounded-full bg-[#f8f7f4] p-2 text-graphite disabled:cursor-not-allowed disabled:opacity-35">
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              </button>
              <span className="text-xs font-semibold text-graphite">{currentMemberPage} / {memberPageCount} 페이지</span>
              <button type="button" aria-label="다음 페이지" disabled={currentMemberPage === memberPageCount} onClick={() => setMemberPage((page) => Math.min(memberPageCount, page + 1))} className="rounded-full bg-[#f8f7f4] p-2 text-graphite disabled:cursor-not-allowed disabled:opacity-35">
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </nav>
          )}
        </section> : <ApprovedMemberConversionPanel approvedUsers={approvedSocialUsers} />}
      </div>
    </main>
  );
}
