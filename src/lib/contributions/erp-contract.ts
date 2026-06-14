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
  syncedAt: string;
  plan: {
    externalPlanId: string;
    name: string;
    version: string;
    stages: ErpContributionStage[];
  } | null;
  ledgerEntries: ErpContributionLedgerEntry[];
};

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
