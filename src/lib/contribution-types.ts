export type ContributionStatus = "NORMAL" | "UNPAID" | "OVERDUE";
export type PaymentNoticeStatus = "DRAFT" | "APPROVED" | "SENT" | "CANCELLED";
export type PaymentNoticeType = "UNPAID" | "OVERDUE";

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
