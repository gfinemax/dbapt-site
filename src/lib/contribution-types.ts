export type ContributionStatus = "NORMAL" | "UNPAID" | "OVERDUE";
export type PaymentNoticeStatus = "DRAFT" | "APPROVED" | "SENT" | "CANCELLED";
export type PaymentNoticeType = "UNPAID" | "OVERDUE";
export type ContributionDataStatus = "WAITING" | "PARTIAL" | "SYNCED";
export type ContributionStageStatus = "WAITING" | "SCHEDULED" | "PARTIAL" | "PAID" | "UNPAID" | "OVERDUE";
export type ContributionStageCategory =
  | "APPLICATION_CERTIFICATE_FEE"
  | "CONTRACT_PAYMENT"
  | "LAND_CONTRIBUTION_1"
  | "LAND_CONTRIBUTION_2"
  | "INITIAL_PAYMENT"
  | "INTERMEDIATE_PAYMENT"
  | "BALANCE_PAYMENT"
  | "JOINING_FEE"
  | "LAND_CONTRIBUTION"
  | "OTHER";

export type ContributionSummaryView = {
  totalDue: number;
  totalPaid: number;
  unpaidAmount: number;
  overdueAmount: number;
  lateFee: number;
  nextDueDate: string | null;
  status: ContributionStatus;
  noticeMessage: string | null;
  updatedAt: string | null;
};

export type PaymentNoticeView = {
  id: string;
  type: PaymentNoticeType;
  status: PaymentNoticeStatus;
  title: string;
  message: string;
  unpaidAmount: number;
  overdueAmount: number;
  lateFee: number;
  dueDate: string | null;
  createdAt: string;
};

export type MemberContributionProfileView = {
  selectedUnitLabel: string | null;
  unitAreaM2?: number | null;
  totalPlannedAmount?: number | null;
  dataStatus: ContributionDataStatus;
  erpSyncedAt: string | null;
};

export type ContributionStageView = {
  id: string;
  label: string;
  category: ContributionStageCategory;
  plannedAmount: number | null;
  paidAmount: number | null;
  unpaidAmount: number | null;
  dueDate: string | null;
  status: ContributionStageStatus;
  sortOrder: number;
};

export type ContributionLedgerEntryView = {
  id: string;
  label: string;
  amount: number;
  paidAt: string;
  stageLabel: string | null;
  source: "ERP" | "MANUAL" | "IMPORT" | "UNKNOWN";
};

export type ContributionDashboardView = {
  dataStatus: ContributionDataStatus;
  statusLabel: string;
  erpStatusLabel: string;
  selectedUnitLabel: string;
  totalPlannedAmount: number | null;
  totalPaid: number | null;
  unpaidAmount: number | null;
  overdueAmount: number | null;
  lateFee: number | null;
  paymentProgress: number | null;
  nextDueDate: string | null;
  noticeMessage: string;
  stageSummary: Array<ContributionStageView & { statusLabel: string }>;
  ledgerEntries: Array<ContributionLedgerEntryView & { sourceLabel: string }>;
};
