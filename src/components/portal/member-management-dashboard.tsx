import Link from "next/link";
import { ArrowLeft, ExternalLink, RefreshCw } from "lucide-react";
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

function formatNumber(value: number) {
  return new Intl.NumberFormat("ko-KR").format(value);
}

function formatGeneratedAt(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
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
            <Link
              href="#approved-member-conversion"
              className="inline-flex items-center gap-2 rounded-full bg-[#f8f7f4] px-4 py-2 text-xs font-semibold text-charcoal-primary shadow-[inset_0_0_0_1px_var(--stone-surface)] transition hover:bg-stone-surface"
            >
              자격 변경 관리
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
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

        <section className="stone-card mt-6 bg-white p-6">
          <div className="flex flex-col gap-2 border-b border-[#f2f0ed] pb-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold">확인 필요 조합원</h2>
              <p className="mt-2 text-xs leading-5 text-graphite">
                PeopleOn 기준 등기/환불 대상 중 홈페이지 계정 조치가 필요한 대상만 우선 표시합니다.
              </p>
            </div>
            <p className="text-[11px] font-medium text-ash">원장 기준 시각: {formatGeneratedAt(snapshot.generatedAt)}</p>
          </div>

          {snapshot.actionRows.length === 0 ? (
            <p className="py-10 text-center text-sm text-graphite/75">
              현재 미가입, 승인 대기, 자격 불일치로 확인되는 조합원이 없습니다.
            </p>
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
                  {snapshot.actionRows.map((row) => (
                    <ActionRow key={row.peopleOnId} row={row} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <ApprovedMemberConversionPanel approvedUsers={approvedSocialUsers} />
      </div>
    </main>
  );
}
