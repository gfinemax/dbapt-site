"use client";

import type { ContributionSummaryView, PaymentNoticeView } from "@/lib/contribution-types";
import { cn } from "@/lib/utils";

type ContributionSummaryMiniProps = {
  contributionSummary?: ContributionSummaryView | null;
  paymentNotices?: PaymentNoticeView[];
  className?: string;
};

const formatNumber = (num: number) => num.toLocaleString();

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
};

const getStatusLabel = (status?: string | null) => {
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

const getStatusClass = (status?: string | null) => {
  switch (status) {
    case "OVERDUE":
      return "bg-ember-orange/10 text-ember-orange";
    case "UNPAID":
      return "bg-sunburst-yellow/20 text-charcoal-primary";
    case "NORMAL":
      return "bg-meadow-green/10 text-midnight";
    default:
      return "bg-stone-surface text-graphite";
  }
};

export function ContributionSummaryMini({
  contributionSummary,
  paymentNotices = [],
  className,
}: ContributionSummaryMiniProps) {
  if (!contributionSummary) {
    return null;
  }

  const firstNotice = paymentNotices[0];

  return (
    <div
      className={cn(
        "rounded-2xl border border-dashed border-stone-surface bg-white/70 p-4 text-[11px] text-graphite",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="text-xs font-bold text-charcoal-primary">내 분담금 요약</h4>
          <p className="mt-1 leading-relaxed text-graphite/85">
            {contributionSummary.noticeMessage || "승인된 납부자료 기준으로 본인 분담금 현황을 표시합니다."}
          </p>
        </div>
        <span
          className={cn(
            "shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold",
            getStatusClass(contributionSummary.status),
          )}
        >
          {getStatusLabel(contributionSummary.status)}
        </span>
      </div>

      <dl className="mt-3 grid grid-cols-2 gap-3 border-t border-stone-surface/70 pt-3">
        <div>
          <dt className="text-[10px] text-ash">총 고지액</dt>
          <dd className="mt-0.5 font-bold text-charcoal-primary">
            {formatNumber(contributionSummary.totalDue)} 원
          </dd>
        </div>
        <div>
          <dt className="text-[10px] text-ash">총 납부액</dt>
          <dd className="mt-0.5 font-bold text-charcoal-primary">
            {formatNumber(contributionSummary.totalPaid)} 원
          </dd>
        </div>
        <div>
          <dt className="text-[10px] text-ash">미납액</dt>
          <dd
            className={cn(
              "mt-0.5 font-bold",
              contributionSummary.unpaidAmount ? "text-ember-orange" : "text-meadow-green",
            )}
          >
            {formatNumber(contributionSummary.unpaidAmount)} 원
          </dd>
        </div>
        <div>
          <dt className="text-[10px] text-ash">다음 납부기한</dt>
          <dd className="mt-0.5 font-bold text-charcoal-primary">
            {formatDate(contributionSummary.nextDueDate)}
          </dd>
        </div>
      </dl>

      {firstNotice && (
        <div className="mt-3 rounded-xl bg-parchment-card p-3 leading-relaxed">
          <p className="font-bold text-charcoal-primary">{firstNotice.title}</p>
          <p className="mt-1 text-graphite/85">{firstNotice.message}</p>
        </div>
      )}
    </div>
  );
}
