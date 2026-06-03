import type { ContributionSummaryView, PaymentNoticeView } from "./contribution-types";

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
