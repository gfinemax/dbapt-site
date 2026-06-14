import { CalendarClock, Database, Home, Layers3, ReceiptText, WalletCards } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ContributionDashboardView, PaymentNoticeView } from "@/lib/contribution-types";

type ContributionDashboardProps = {
  dashboard: ContributionDashboardView;
  paymentNotices?: PaymentNoticeView[];
};

const formatMoney = (value: number | null) => {
  if (value === null) return "대기";
  return `${value.toLocaleString()} 원`;
};

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return "대기";
  const date = new Date(dateStr);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};

const formatPendingText = (value: string) => (value === "자료 대기" ? "대기" : value);

const getStatusClass = (statusLabel: string) => {
  if (statusLabel.includes("연체")) return "bg-ember-orange/10 text-ember-orange";
  if (statusLabel.includes("미납")) return "bg-sunburst-yellow/25 text-charcoal-primary";
  if (statusLabel.includes("정상") || statusLabel.includes("완료")) return "bg-meadow-green/10 text-midnight";
  return "bg-stone-surface text-graphite";
};

const commonStageHints = [
  { fullLabel: "신청금(가입필증)", title: "신청금", detail: "가입필증" },
  { fullLabel: "계약금", title: "계약금", detail: null },
  { fullLabel: "1차분담금", title: "1차분담금", detail: null },
  { fullLabel: "2차분담금", title: "2차분담금", detail: null },
  { fullLabel: "초반 납입금 · 중도금 · 잔금", title: "초반 납입금", detail: "중도금 · 잔금" },
];

export function ContributionDashboard({ dashboard, paymentNotices = [] }: ContributionDashboardProps) {
  const progress = dashboard.paymentProgress;
  const isPending = progress === null;

  return (
    <article className="stone-card bg-white p-5 sm:p-7">
      <div data-testid="contribution-dashboard-layout" className="space-y-6">
        <div className="space-y-4">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-semibold text-charcoal-primary">내 분담금 현황</h2>
            <p className="mt-2 text-sm leading-6 text-graphite">
              {dashboard.noticeMessage}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className={cn("inline-flex rounded-full px-3 py-1 text-xs font-semibold", getStatusClass(dashboard.statusLabel))}>
              {dashboard.statusLabel}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-parchment-card px-3 py-1 text-xs font-semibold text-graphite">
              <Database className="size-3.5" aria-hidden="true" />
              {dashboard.erpStatusLabel}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <div className="rounded-[10px] bg-parchment-card px-4 py-3">
            <div className="flex items-center gap-2 whitespace-nowrap text-xs font-semibold text-ash">
              <Home className="size-4" aria-hidden="true" />
              신청 평형
            </div>
            <div className="mt-1.5 text-base font-semibold text-charcoal-primary">{formatPendingText(dashboard.selectedUnitLabel)}</div>
          </div>
          <div className="rounded-[10px] bg-parchment-card px-4 py-3">
            <div className="flex items-center gap-2 whitespace-nowrap text-xs font-semibold text-ash">
              <WalletCards className="size-4" aria-hidden="true" />
              총 예정액
            </div>
            <div className="mt-1.5 text-base font-semibold text-charcoal-primary">{formatMoney(dashboard.totalPlannedAmount)}</div>
          </div>
          <div className="rounded-[10px] bg-parchment-card px-4 py-3">
            <div className="flex items-center gap-2 whitespace-nowrap text-xs font-semibold text-ash">
              <ReceiptText className="size-4" aria-hidden="true" />
              총 납부액
            </div>
            <div className="mt-1.5 text-base font-semibold text-charcoal-primary">{formatMoney(dashboard.totalPaid)}</div>
          </div>
          <div className="rounded-[10px] bg-parchment-card px-4 py-3">
            <div className="flex items-center gap-2 whitespace-nowrap text-xs font-semibold text-ash">
              <CalendarClock className="size-4" aria-hidden="true" />
              다음 납부일
            </div>
            <div className="mt-1.5 text-base font-semibold text-charcoal-primary">{formatDate(dashboard.nextDueDate)}</div>
          </div>
        </div>

        <div
          data-testid="contribution-progress-panel"
          className={cn(
            "rounded-[10px] p-5",
            isPending
              ? "bg-parchment-card text-charcoal-primary shadow-[inset_0_0_0_1px_#f2f0ed]"
              : "bg-midnight text-white",
          )}
        >
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_260px] lg:items-end">
            <div>
              <p className={cn("text-xs font-semibold", isPending ? "text-ash" : "text-white/60")}>납부 진행률</p>
              <p className="mt-1 text-2xl font-semibold">{isPending ? "납부자료 반영 대기" : `${progress}%`}</p>
              <div className={cn("mt-4 h-2 overflow-hidden rounded-full", isPending ? "bg-stone-surface" : "bg-white/15")}>
                <div
                  className={cn("h-full rounded-full transition-[width] duration-300", isPending ? "bg-ash/40" : "bg-meadow-green")}
                  style={{ width: `${progress ?? 0}%` }}
                />
              </div>
            </div>
            <div className={cn("grid grid-cols-2 gap-2 text-xs leading-5 lg:block lg:text-right", isPending ? "text-graphite/70" : "text-white/70")}>
              <div>
                <span>미납액 </span>
                <strong className={cn("font-semibold", isPending ? "text-charcoal-primary" : "text-white")}>{formatMoney(dashboard.unpaidAmount)}</strong>
              </div>
              <div className="lg:mt-1">
                <span>연체 / 연체료 </span>
                <strong className={cn("font-semibold", isPending ? "text-charcoal-primary" : "text-white")}>{formatMoney(dashboard.overdueAmount)} / {formatMoney(dashboard.lateFee)}</strong>
              </div>
            </div>
          </div>
        </div>

        <section data-testid="contribution-stage-section" className="space-y-4 rounded-[10px] bg-parchment-card p-4 sm:p-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Layers3 className="size-4 text-ember-orange" aria-hidden="true" />
              <h3 className="text-sm font-semibold text-charcoal-primary">납부 단계</h3>
            </div>
            {dashboard.stageSummary.length === 0 && (
              <p className="max-w-3xl text-sm leading-6 text-graphite">
                ERP 또는 관리자 승인 자료가 반영되면 단계별 금액과 일정이 표시됩니다.
              </p>
            )}
          </div>

          {dashboard.stageSummary.length > 0 ? (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {dashboard.stageSummary.map((stage) => (
                <div key={stage.id} className="rounded-[10px] bg-white p-3 shadow-[inset_0_0_0_1px_#f2f0ed]">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-charcoal-primary">{stage.label}</p>
                      <p className="mt-1 text-xs text-ash">{formatDate(stage.dueDate)}</p>
                    </div>
                    <span className={cn("shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold", getStatusClass(stage.statusLabel))}>
                      {stage.statusLabel}
                    </span>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-ash">예정액</p>
                      <p className="mt-1 font-semibold text-charcoal-primary">{formatMoney(stage.plannedAmount)}</p>
                    </div>
                    <div>
                      <p className="text-ash">납부액</p>
                      <p className="mt-1 font-semibold text-charcoal-primary">{formatMoney(stage.paidAmount)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-[10px] bg-white p-4 shadow-[inset_0_0_0_1px_#f2f0ed]">
              <p className="text-sm font-semibold text-charcoal-primary">납부계획 반영 대기</p>
              <ol aria-label="예상 납부 단계" className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-5">
                {commonStageHints.map((stage, index) => (
                  <li
                    key={stage.fullLabel}
                    aria-label={stage.fullLabel}
                    className="flex min-h-[104px] min-w-0 flex-col justify-between rounded-[10px] bg-parchment-card px-3 py-3"
                  >
                    <span className="inline-flex size-5 items-center justify-center rounded-full bg-ember-orange/10 text-[11px] font-semibold text-ember-orange">
                      {index + 1}
                    </span>
                    <span className="block space-y-1">
                      <span className="block break-keep text-sm font-semibold leading-5 text-charcoal-primary">{stage.title}</span>
                      {stage.detail && <span className="block break-keep text-xs leading-5 text-graphite">{stage.detail}</span>}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          <div className="rounded-[10px] bg-white p-4 shadow-[inset_0_0_0_1px_#f2f0ed]">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="text-sm font-semibold text-charcoal-primary">최근 납부 원장</h3>
              {dashboard.ledgerEntries.length === 0 && (
                <p className="text-xs text-ash">승인 자료 반영 후 표시</p>
              )}
            </div>
            {dashboard.ledgerEntries.length > 0 ? (
              <div className="mt-3 grid gap-2 md:grid-cols-3">
                {dashboard.ledgerEntries.slice(0, 3).map((entry) => (
                  <div key={entry.id} className="rounded-[10px] bg-parchment-card px-3 py-2 text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-charcoal-primary">{entry.label}</span>
                      <span className="font-semibold text-graphite">{formatMoney(entry.amount)}</span>
                    </div>
                    <div className="mt-1 flex items-center justify-between gap-2 text-ash">
                      <span>{formatDate(entry.paidAt)}</span>
                      <span>{entry.sourceLabel}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-3 text-xs leading-5 text-graphite">
                <p className="font-semibold text-charcoal-primary">승인된 납부 내역이 아직 없습니다.</p>
                <p className="mt-1">ERP 또는 관리자 승인 자료가 반영되면 최근 납부 내역이 표시됩니다.</p>
              </div>
            )}
          </div>

          {paymentNotices.length > 0 && (
            <div className="mt-5 rounded-[10px] bg-white p-3 text-xs text-graphite shadow-[inset_0_0_0_1px_#f2f0ed]">
              <p className="font-semibold text-charcoal-primary">{paymentNotices[0].title}</p>
              <p className="mt-1">미확인 납부 안내 {paymentNotices.length}건이 있습니다.</p>
            </div>
          )}
        </section>
      </div>
    </article>
  );
}
