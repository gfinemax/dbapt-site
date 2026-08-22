import type { ContributionStageCategory } from "@/lib/contribution-types";

export const ERP_CONTRIBUTION_LEDGER_PATH = "/api/contributions/ledger";

export type ErpContributionStageScope = "COMMON" | "UNIT_DEPENDENT";

export type ErpContributionStage = {
  externalStageId: string;
  label: string;
  category: ContributionStageCategory;
  amount: number | null;
  dueDate: string | null;
  sortOrder: number;
  scope: ErpContributionStageScope;
};

export type ErpContributionLedgerEntry = {
  externalId: string;
  stageExternalId: string | null;
  label: string;
  amount: number;
  paidAt: string;
  method: string | null;
  memo: string | null;
};

export type ErpContributionLedgerSnapshot = {
  externalMemberId: string;
  selectedUnitLabel: string | null;
  unitAreaM2: number | null;
  totalPlannedAmount: number | null;
  totalPaid: number;
  unpaidAmount: number;
  overdueAmount: number;
  lateFee: number;
  nextDueDate: string | null;
  memberStatus: string;
  syncedAt: string;
  plan: {
    externalPlanId: string;
    name: string;
    version: string;
    stages: ErpContributionStage[];
  } | null;
  ledgerEntries: ErpContributionLedgerEntry[];
};

export function buildDashboardFromErpSnapshot(snapshot: ErpContributionLedgerSnapshot) {
  const mapped = mapErpLedgerSnapshotToContributionRecords(snapshot);
  const paidByStage = new Map<string, number>();
  for (const entry of mapped.ledgerEntries) {
    if (!entry.stageExternalId) continue;
    paidByStage.set(entry.stageExternalId, (paidByStage.get(entry.stageExternalId) ?? 0) + entry.amount);
  }

  return {
    summary: {
      totalDue: snapshot.totalPlannedAmount ?? 0,
      totalPaid: snapshot.totalPaid,
      unpaidAmount: snapshot.unpaidAmount,
      overdueAmount: snapshot.overdueAmount,
      lateFee: snapshot.lateFee,
      nextDueDate: snapshot.nextDueDate,
      status: snapshot.overdueAmount > 0 ? "OVERDUE" as const : snapshot.unpaidAmount > 0 ? "UNPAID" as const : "NORMAL" as const,
      noticeMessage: "회계프로그램에 확정된 납부 내역을 기준으로 표시합니다.",
      updatedAt: snapshot.syncedAt,
    },
    profile: {
      selectedUnitLabel: snapshot.selectedUnitLabel,
      unitAreaM2: snapshot.unitAreaM2,
      totalPlannedAmount: snapshot.totalPlannedAmount,
      dataStatus: "SYNCED" as const,
      erpSyncedAt: snapshot.syncedAt,
    },
    stages: mapped.stages.map((stage) => {
      const paidAmount = paidByStage.get(stage.externalId) ?? 0;
      return {
        id: stage.externalId,
        label: stage.label,
        category: stage.category,
        plannedAmount: stage.amount,
        paidAmount,
        unpaidAmount: stage.amount === null ? null : Math.max(stage.amount - paidAmount, 0),
        dueDate: stage.dueDate,
        status: stage.amount !== null && paidAmount >= stage.amount ? "PAID" as const : paidAmount > 0 ? "PARTIAL" as const : "SCHEDULED" as const,
        sortOrder: stage.sortOrder,
      };
    }),
    ledgerEntries: mapped.ledgerEntries.map((entry) => ({
      id: entry.externalId,
      label: entry.label,
      amount: entry.amount,
      paidAt: entry.paidAt,
      stageLabel: mapped.stages.find((stage) => stage.externalId === entry.stageExternalId)?.label ?? null,
      source: "ERP" as const,
    })),
  };
}

export type InternalContributionSyncPayload = {
  profile: {
    externalMemberId: string;
    selectedUnitLabel: string | null;
    unitAreaM2: number | null;
    dataStatus: "SYNCED";
    syncedAt: string;
  };
  paymentPlan: {
    externalId: string;
    name: string;
    version: string;
    totalPlannedAmount: number | null;
  } | null;
  stages: Array<{
    externalId: string;
    label: string;
    category: ContributionStageCategory;
    amount: number | null;
    dueDate: string | null;
    sortOrder: number;
    scope: ErpContributionStageScope;
  }>;
  ledgerEntries: Array<{
    externalId: string;
    stageExternalId: string | null;
    label: string;
    amount: number;
    paidAt: string;
    method: string | null;
    memo: string | null;
    source: "ERP";
  }>;
};

export function mapErpLedgerSnapshotToContributionRecords(
  snapshot: ErpContributionLedgerSnapshot,
): InternalContributionSyncPayload {
  return {
    profile: {
      externalMemberId: snapshot.externalMemberId,
      selectedUnitLabel: snapshot.selectedUnitLabel,
      unitAreaM2: snapshot.unitAreaM2,
      dataStatus: "SYNCED",
      syncedAt: snapshot.syncedAt,
    },
    paymentPlan: snapshot.plan
      ? {
          externalId: snapshot.plan.externalPlanId,
          name: snapshot.plan.name,
          version: snapshot.plan.version,
          totalPlannedAmount: snapshot.totalPlannedAmount,
        }
      : null,
    stages:
      snapshot.plan?.stages.map((stage) => ({
        externalId: stage.externalStageId,
        label: stage.label,
        category: stage.category,
        amount: stage.amount,
        dueDate: stage.dueDate,
        sortOrder: stage.sortOrder,
        scope: stage.scope,
      })) ?? [],
    ledgerEntries: snapshot.ledgerEntries.map((entry) => ({
      externalId: entry.externalId,
      stageExternalId: entry.stageExternalId,
      label: entry.label,
      amount: entry.amount,
      paidAt: entry.paidAt,
      method: entry.method,
      memo: entry.memo,
      source: "ERP",
    })),
  };
}
