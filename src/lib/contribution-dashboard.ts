import type {
  ContributionDashboardView,
  ContributionDataStatus,
  ContributionLedgerEntryView,
  ContributionStageStatus,
  ContributionStageView,
  ContributionSummaryView,
  MemberContributionProfileView,
} from "./contribution-types";

type BuildContributionDashboardInput = {
  summary: ContributionSummaryView | null;
  profile: MemberContributionProfileView | null;
  stages: ContributionStageView[];
  ledgerEntries: ContributionLedgerEntryView[];
};

const getSummaryStatusLabel = (status: ContributionSummaryView["status"] | null) => {
  switch (status) {
    case "OVERDUE":
      return "연체 주의";
    case "UNPAID":
      return "미납 안내";
    case "NORMAL":
      return "납부 정상";
    default:
      return "자료 대기";
  }
};

const getStageStatusLabel = (status: ContributionStageStatus) => {
  switch (status) {
    case "PAID":
      return "납부 완료";
    case "PARTIAL":
      return "일부 납부";
    case "UNPAID":
      return "미납";
    case "OVERDUE":
      return "연체";
    case "SCHEDULED":
      return "예정";
    default:
      return "자료 대기";
  }
};

const getDataStatus = (
  summary: ContributionSummaryView | null,
  profile: MemberContributionProfileView | null,
): ContributionDataStatus => {
  if (profile?.dataStatus) return profile.dataStatus;
  if (summary) return "PARTIAL";
  return "WAITING";
};

const getErpStatusLabel = (dataStatus: ContributionDataStatus, syncedAt: string | null) => {
  if (syncedAt) return `${syncedAt.slice(0, 10)} 동기화`;
  if (dataStatus === "SYNCED") return "동기화 완료";
  if (dataStatus === "PARTIAL") return "기초 자료 반영";
  return "ERP 연동 예정";
};

const getSourceLabel = (source: ContributionLedgerEntryView["source"]) => {
  switch (source) {
    case "ERP":
      return "ERP 반영";
    case "IMPORT":
      return "승인 자료 반영";
    case "MANUAL":
      return "관리자 입력";
    default:
      return "출처 확인 중";
  }
};

const getPaymentProgress = (totalPlannedAmount: number | null, totalPaid: number | null) => {
  if (!totalPlannedAmount || totalPaid === null) return null;
  return Math.min(100, Math.max(0, Math.round((totalPaid / totalPlannedAmount) * 100)));
};

export function buildContributionDashboardView({
  summary,
  profile,
  stages,
  ledgerEntries,
}: BuildContributionDashboardInput): ContributionDashboardView {
  const dataStatus = getDataStatus(summary, profile);
  const totalPlannedAmount = profile?.totalPlannedAmount ?? summary?.totalDue ?? null;
  const totalPaid = summary ? summary.totalPaid : null;

  return {
    dataStatus,
    statusLabel: getSummaryStatusLabel(summary?.status ?? null),
    erpStatusLabel: getErpStatusLabel(dataStatus, profile?.erpSyncedAt ?? null),
    selectedUnitLabel: profile?.selectedUnitLabel || "자료 대기",
    totalPlannedAmount,
    totalPaid,
    unpaidAmount: summary ? summary.unpaidAmount : null,
    overdueAmount: summary ? summary.overdueAmount : null,
    lateFee: summary ? summary.lateFee : null,
    paymentProgress: getPaymentProgress(totalPlannedAmount, totalPaid),
    nextDueDate: summary?.nextDueDate ?? null,
    noticeMessage:
      summary?.noticeMessage ||
      "ERP 또는 관리자 승인 납부자료가 반영되면 본인의 평형과 납부 단계별 상세 내역이 표시됩니다.",
    stageSummary: stages
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((stage) => ({
        ...stage,
        statusLabel: getStageStatusLabel(stage.status),
      })),
    ledgerEntries: ledgerEntries.map((entry) => ({
      ...entry,
      sourceLabel: getSourceLabel(entry.source),
    })),
  };
}
