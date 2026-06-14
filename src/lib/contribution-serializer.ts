import { buildContributionDashboardView } from "./contribution-dashboard";
import type {
  ContributionDashboardView,
  ContributionDataStatus,
  ContributionLedgerEntryView,
  ContributionStageCategory,
  ContributionStageStatus,
  ContributionSummaryView,
  PaymentNoticeView,
} from "./contribution-types";

type ContributionSummaryRecord = {
  totalDue: number;
  totalPaid: number;
  unpaidAmount: number;
  overdueAmount: number;
  lateFee: number;
  nextDueDate: Date | null;
  status: string;
  noticeMessage: string | null;
  updatedAt: Date;
};

type PaymentNoticeRecord = {
  id: string;
  type: string;
  status: string;
  title: string;
  message: string;
  unpaidAmount: number;
  overdueAmount: number;
  lateFee: number;
  dueDate: Date | null;
  createdAt: Date;
};

type ContributionProfileRecord = {
  selectedUnitLabel: string | null;
  unitAreaM2: number | null;
  dataStatus: string;
  syncedAt: Date | null;
  paymentPlan: {
    totalPlannedAmount: number | null;
    stages: ContributionPaymentStageRecord[];
  } | null;
} | null;

type ContributionPaymentStageRecord = {
  id: string;
  label: string;
  category: string;
  amount: number | null;
  dueDate: Date | null;
  sortOrder: number;
};

type ContributionLedgerRecord = {
  id: string;
  stageId?: string | null;
  label: string | null;
  amount: number;
  paidAt: Date;
  source: string;
  stage?: {
    label: string;
  } | null;
};

export function serializeContributionSummary(
  summary: ContributionSummaryRecord | null,
): ContributionSummaryView | null {
  if (!summary) return null;

  return {
    totalDue: summary.totalDue,
    totalPaid: summary.totalPaid,
    unpaidAmount: summary.unpaidAmount,
    overdueAmount: summary.overdueAmount,
    lateFee: summary.lateFee,
    nextDueDate: summary.nextDueDate?.toISOString() || null,
    status: summary.status as ContributionSummaryView["status"],
    noticeMessage: summary.noticeMessage,
    updatedAt: summary.updatedAt.toISOString(),
  };
}

export function serializePaymentNotices(notices: PaymentNoticeRecord[]): PaymentNoticeView[] {
  return notices.map((notice) => ({
    id: notice.id,
    type: notice.type as PaymentNoticeView["type"],
    status: notice.status as PaymentNoticeView["status"],
    title: notice.title,
    message: notice.message,
    unpaidAmount: notice.unpaidAmount,
    overdueAmount: notice.overdueAmount,
    lateFee: notice.lateFee,
    dueDate: notice.dueDate?.toISOString() || null,
    createdAt: notice.createdAt.toISOString(),
  }));
}

const toContributionDataStatus = (status: string): ContributionDataStatus => {
  if (status === "SYNCED" || status === "PARTIAL" || status === "WAITING") return status;
  return "WAITING";
};

const toContributionStageCategory = (category: string): ContributionStageCategory => {
  const supported: ContributionStageCategory[] = [
    "APPLICATION_CERTIFICATE_FEE",
    "CONTRACT_PAYMENT",
    "LAND_CONTRIBUTION_1",
    "LAND_CONTRIBUTION_2",
    "INITIAL_PAYMENT",
    "INTERMEDIATE_PAYMENT",
    "BALANCE_PAYMENT",
    "JOINING_FEE",
    "LAND_CONTRIBUTION",
    "OTHER",
  ];
  return supported.includes(category as ContributionStageCategory)
    ? (category as ContributionStageCategory)
    : "OTHER";
};

const toLedgerSource = (source: string): ContributionLedgerEntryView["source"] => {
  if (source === "ERP" || source === "MANUAL" || source === "IMPORT") return source;
  return "UNKNOWN";
};

const getStageStatus = (
  plannedAmount: number | null,
  paidAmount: number | null,
  dueDate: Date | null,
): ContributionStageStatus => {
  if (!plannedAmount) return "WAITING";
  if ((paidAmount ?? 0) >= plannedAmount) return "PAID";
  if ((paidAmount ?? 0) > 0) return "PARTIAL";
  if (dueDate && dueDate.getTime() < Date.now()) return "OVERDUE";
  return "SCHEDULED";
};

export function serializeContributionDashboard(
  summary: ContributionSummaryView | null,
  profile: ContributionProfileRecord,
  ledgerRecords: ContributionLedgerRecord[],
): ContributionDashboardView {
  const profileView = profile
    ? {
        selectedUnitLabel: profile.selectedUnitLabel,
        unitAreaM2: profile.unitAreaM2,
        totalPlannedAmount: profile.paymentPlan?.totalPlannedAmount ?? null,
        dataStatus: toContributionDataStatus(profile.dataStatus),
        erpSyncedAt: profile.syncedAt?.toISOString() ?? null,
      }
    : null;

  const ledgerEntries = ledgerRecords.map((entry): ContributionLedgerEntryView => ({
    id: entry.id,
    label: entry.label || entry.stage?.label || "분담금 납부",
    amount: entry.amount,
    paidAt: entry.paidAt.toISOString(),
    stageLabel: entry.stage?.label ?? null,
    source: toLedgerSource(entry.source),
  }));

  const paidAmountByStageId = new Map<string, number>();
  for (const entry of ledgerRecords) {
    if (!entry.stageId) continue;
    paidAmountByStageId.set(entry.stageId, (paidAmountByStageId.get(entry.stageId) ?? 0) + entry.amount);
  }

  const stages =
    profile?.paymentPlan?.stages.map((stage) => {
      const paidAmount = paidAmountByStageId.get(stage.id) ?? 0;
      const unpaidAmount = stage.amount === null ? null : Math.max(stage.amount - paidAmount, 0);

      return {
        id: stage.id,
        label: stage.label,
        category: toContributionStageCategory(stage.category),
        plannedAmount: stage.amount,
        paidAmount,
        unpaidAmount,
        dueDate: stage.dueDate?.toISOString() ?? null,
        status: getStageStatus(stage.amount, paidAmount, stage.dueDate),
        sortOrder: stage.sortOrder,
      };
    }) ?? [];

  return buildContributionDashboardView({
    summary,
    profile: profileView,
    stages,
    ledgerEntries,
  });
}
