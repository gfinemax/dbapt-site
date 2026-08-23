import { CalendarClock, Check, ChevronDown, Coins, Database, Home, Layers3, ReceiptText } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ContributionDashboardView, PaymentNoticeView } from "@/lib/contribution-types";

type ContributionDashboardProps = { dashboard: ContributionDashboardView; paymentNotices?: PaymentNoticeView[]; hideSelectedUnit?: boolean; compact?: boolean };

const formatMoney = (value: number | null) => value === null ? "대기" : `${value.toLocaleString()} 원`;
const formatDate = (value: string | null) => {
  if (!value) return "대기";
  const date = new Date(value);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};
const formatPendingText = (value: string) => value === "자료 대기" ? "대기" : value;
const getStatusClass = (label: string) => {
  if (label.includes("연체")) return "bg-ember-orange/10 text-ember-orange";
  if (label.includes("미납")) return "bg-sunburst-yellow/25 text-charcoal-primary";
  if (label.includes("정상") || label.includes("완료")) return "bg-meadow-green/10 text-midnight";
  return "bg-stone-surface text-graphite";
};
const commonStageHints = [
  { fullLabel: "신청금(가입필증)", title: "신청금", detail: "가입필증" },
  { fullLabel: "계약금", title: "계약금", detail: null },
  { fullLabel: "1차분담금", title: "1차분담금", detail: null },
  { fullLabel: "2차분담금", title: "2차분담금", detail: null },
  { fullLabel: "초반 납입금 · 중도금 · 잔금", title: "초반 납입금", detail: "중도금 · 잔금" },
];

export function ContributionDashboard({ dashboard, paymentNotices = [], hideSelectedUnit = false, compact = false }: ContributionDashboardProps) {
  const isPending = dashboard.totalPaid === null;
  const ledgerTotal = dashboard.ledgerEntries.reduce((sum, entry) => sum + entry.amount, 0);
  const latestLedgerEntry = dashboard.ledgerEntries.slice().sort((a, b) => new Date(b.paidAt).getTime() - new Date(a.paidAt).getTime())[0];

  return (
    <article id="member-contribution" tabIndex={-1} className={cn("scroll-mt-6 overflow-hidden focus:outline-none", compact ? "bg-transparent" : "stone-card bg-white p-5 sm:p-7 lg:p-8")}>
      <div data-testid="contribution-dashboard-layout" className="space-y-7">
        <header className={cn("space-y-4", compact && "flex justify-end")}>
          {!compact && <div className="max-w-3xl">
            <h2 className="text-2xl font-semibold text-charcoal-primary">내 분담금 현황</h2>
            <p className="mt-2 text-sm leading-6 text-graphite">{dashboard.noticeMessage}</p>
          </div>}
          <div className={cn("flex flex-wrap items-center gap-2", compact && "justify-end")}>
            <span className={cn("inline-flex rounded-full px-3 py-1 text-xs font-semibold", getStatusClass(dashboard.statusLabel))}>{dashboard.statusLabel}</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-parchment-card px-3 py-1 text-xs font-semibold text-graphite"><Database className="size-3.5" aria-hidden="true" />{dashboard.erpStatusLabel}</span>
          </div>
        </header>

        <section data-testid="contribution-payment-hero" aria-label="내가 납부한 금액 요약" className="overflow-hidden rounded-[17px] bg-parchment-card shadow-[inset_0_0_0_1px_#f2f0ed]">
          <div className="grid lg:grid-cols-[minmax(0,1fr)_250px]">
            <div className="relative p-5 sm:p-7 sm:pr-44">
              <div className="flex items-center gap-2 text-sm font-semibold text-charcoal-primary"><ReceiptText className="size-4 text-ember-orange" aria-hidden="true" />내가 납부한 금액</div>
              <p className={cn("mt-3 break-keep font-semibold tracking-[-0.04em] text-midnight", isPending ? "text-2xl sm:text-3xl" : "text-[2rem] leading-none sm:text-[2.75rem]")}>
                {isPending ? "납부자료 반영 대기" : formatMoney(dashboard.totalPaid)}
              </p>
              <dl className="mt-6 grid gap-4 border-t border-stone-surface pt-5 sm:grid-cols-2">
                <div className="flex items-start gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white text-graphite shadow-[inset_0_0_0_1px_#f2f0ed]"><ReceiptText className="size-4" aria-hidden="true" /></span>
                  <div><dt className="text-xs text-ash">납부 내역</dt><dd className="mt-1 text-sm font-semibold text-charcoal-primary">{dashboard.ledgerEntries.length > 0 ? `총 ${dashboard.ledgerEntries.length}건` : "승인 자료 반영 대기"}</dd></div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white text-graphite shadow-[inset_0_0_0_1px_#f2f0ed]"><CalendarClock className="size-4" aria-hidden="true" /></span>
                  <div><dt className="text-xs text-ash">최근 납부</dt><dd className="mt-1 text-sm font-semibold text-charcoal-primary">{latestLedgerEntry ? `${formatDate(latestLedgerEntry.paidAt)} · ${formatMoney(latestLedgerEntry.amount)}` : "납부 내역 대기"}</dd></div>
                </div>
              </dl>
              <div className="pointer-events-none absolute bottom-5 right-5 hidden items-end text-ember-orange/80 sm:flex" aria-hidden="true">
                <ReceiptText className="size-24 stroke-[1.15]" />
                <Coins className="-ml-5 size-14 stroke-[1.35] text-deep-amber/70" />
              </div>
            </div>
            <dl className="grid grid-cols-2 border-t border-stone-surface bg-white/70 lg:grid-cols-1 lg:border-l lg:border-t-0">
              {!hideSelectedUnit && <div className="p-5 sm:p-6"><dt className="flex items-center gap-2 text-xs font-semibold text-ash"><Home className="size-4" aria-hidden="true" />신청 평형</dt><dd className="mt-2 text-xl font-semibold text-charcoal-primary">{formatPendingText(dashboard.selectedUnitLabel)}</dd></div>}
              <div className={cn("p-5 sm:p-6", !hideSelectedUnit && "border-l border-stone-surface lg:border-l-0 lg:border-t")}>
                <dt className="flex items-center gap-2 text-xs font-semibold text-ash"><CalendarClock className="size-4" aria-hidden="true" />다음 납부일</dt>
                <dd className="mt-2 text-xl font-semibold text-charcoal-primary">{formatDate(dashboard.nextDueDate)}</dd>
                {!dashboard.nextDueDate && <p className="mt-1 text-xs leading-5 text-ash">조합 일정 확정 후 안내</p>}
              </div>
            </dl>
          </div>
        </section>

        <section data-testid="contribution-stage-section" className="space-y-4 rounded-[10px] bg-white p-4 shadow-[inset_0_0_0_1px_#f2f0ed] sm:p-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2"><Layers3 className="size-4 text-ember-orange" aria-hidden="true" /><h3 className="text-sm font-semibold text-charcoal-primary">납부 단계</h3></div>
            {dashboard.stageSummary.length === 0 && <p className="max-w-3xl text-sm leading-6 text-graphite">ERP 또는 관리자 승인 자료가 반영되면 단계별 금액과 일정이 표시됩니다.</p>}
          </div>
          {dashboard.stageSummary.length > 0 ? (
            <ol aria-label="납부 단계" className="relative grid gap-3 before:absolute before:left-[10%] before:right-[10%] before:top-5 before:hidden before:border-t before:border-dashed before:border-fog md:grid-cols-5 md:before:block">
              {dashboard.stageSummary.map((stage) => (
                <li key={stage.id} className="relative rounded-[10px] bg-parchment-card p-3 text-center">
                  <span className={cn("relative z-10 mx-auto mb-3 flex size-10 items-center justify-center rounded-full", stage.statusLabel.includes("완료") ? "bg-meadow-green/10 text-meadow-green" : stage.statusLabel.includes("일부") ? "bg-sunburst-yellow/20 text-deep-amber" : "bg-stone-surface text-ash")}><ReceiptText className="size-4" aria-hidden="true" /></span>
                  <div className="flex flex-col items-center gap-2">
                    <div className="min-w-0"><p className="break-keep text-sm font-semibold text-charcoal-primary">{stage.label}</p><p className="mt-1 text-xs text-ash">{formatDate(stage.dueDate)}</p></div>
                    <span className={cn("shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold", getStatusClass(stage.statusLabel))}>{stage.statusLabel}</span>
                  </div>
                  {stage.paidAmount !== null && stage.paidAmount > 0 && <div className="mt-3 text-xs"><p className="text-ash">내가 납부한 금액</p><p className="mt-1 font-semibold text-charcoal-primary">{formatMoney(stage.paidAmount)}</p></div>}
                </li>
              ))}
            </ol>
          ) : (
            <div>
              <ol aria-label="예상 납부 단계" className="relative mt-2 grid grid-cols-2 gap-3 before:absolute before:left-[10%] before:right-[10%] before:top-5 before:hidden before:border-t before:border-dashed before:border-fog md:grid-cols-5 md:before:block">
                {commonStageHints.map((stage, index) => <li key={stage.fullLabel} aria-label={stage.fullLabel} className="relative min-w-0 rounded-[10px] bg-parchment-card px-3 py-3 text-center"><span className="relative z-10 mx-auto mb-3 inline-flex size-10 items-center justify-center rounded-full bg-white text-ash shadow-[inset_0_0_0_1px_#f2f0ed]"><span className="text-xs font-semibold">{index + 1}</span></span><span className="block space-y-1"><span className="block break-keep text-sm font-semibold leading-5 text-charcoal-primary">{stage.title}</span>{stage.detail && <span className="block break-keep text-xs leading-5 text-graphite">{stage.detail}</span>}<span className="block text-[11px] text-ash">일정 대기</span></span></li>)}
              </ol>
            </div>
          )}

          <div id="member-ledger" tabIndex={-1} aria-labelledby="member-ledger-title" className="scroll-mt-6 rounded-[10px] bg-white p-4 shadow-[inset_0_0_0_1px_#f2f0ed] focus:outline-none">
            {dashboard.ledgerEntries.length > 0 ? (
              <div>
                <div className="mb-3 flex items-center justify-between"><h3 id="member-ledger-title" className="text-sm font-semibold text-charcoal-primary">납부내역</h3><span className="text-xs text-ash">최근 승인 내역 · 총 {dashboard.ledgerEntries.length}건</span></div>
                <div className="overflow-x-auto rounded-[10px] border border-stone-surface">
                  <table className="w-full min-w-[560px] text-left text-xs">
                    <thead className="bg-parchment-card text-ash"><tr><th className="px-3 py-2 font-medium">납부일</th><th className="px-3 py-2 font-medium">구분</th><th className="px-3 py-2 text-right font-medium">납부 금액</th><th className="px-3 py-2 text-right font-medium">상태</th></tr></thead>
                    <tbody className="divide-y divide-stone-surface">{dashboard.ledgerEntries.slice(0, 3).map((entry) => <tr key={entry.id}><td className="px-3 py-2.5 text-graphite">{formatDate(entry.paidAt)}</td><td className="px-3 py-2.5 font-semibold text-charcoal-primary">{entry.stageLabel || entry.label}</td><td className="px-3 py-2.5 text-right font-semibold text-charcoal-primary">{formatMoney(entry.amount)}</td><td className="px-3 py-2.5 text-right"><span className="rounded-full bg-meadow-green/10 px-2 py-1 font-semibold text-midnight">납부 완료</span></td></tr>)}</tbody>
                  </table>
                </div>
              <details id="member-ledger-disclosure" data-testid="contribution-ledger-disclosure" className="group mt-3">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-[10px] px-1 py-1 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-midnight [&::-webkit-details-marker]:hidden">
                  <span className="min-w-0 text-xs text-ash">합계 {formatMoney(ledgerTotal)}</span>
                  <span className="inline-flex shrink-0 items-center gap-1.5 text-xs font-semibold text-graphite"><span className="group-open:hidden">전체 납부내역 보기</span><span className="hidden group-open:inline">접기</span><ChevronDown className="size-4 transition-transform duration-200 group-open:rotate-180" aria-hidden="true" /></span>
                </summary>
                <div className="mt-4 overflow-hidden rounded-[10px] bg-parchment-card"><ol aria-label="전체 납부 거래내역" className="divide-y divide-stone-surface">{dashboard.ledgerEntries.map((entry) => <li key={entry.id} className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 gap-y-1 px-4 py-3 text-xs"><span className="min-w-0 break-keep font-semibold text-charcoal-primary">{entry.label}</span><span className="whitespace-nowrap font-semibold text-graphite">{formatMoney(entry.amount)}</span><time className="text-ash" dateTime={entry.paidAt}>{formatDate(entry.paidAt)}</time><span className="whitespace-nowrap text-right text-ash">{entry.sourceLabel}</span></li>)}</ol></div>
              </details>
              </div>
            ) : (
              <div className="text-xs leading-5 text-graphite"><div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between"><h3 id="member-ledger-title" className="text-sm font-semibold text-charcoal-primary">납부내역</h3><p className="text-xs text-ash">승인 자료 반영 후 표시</p></div><p className="font-semibold text-charcoal-primary">승인된 납부 내역이 아직 없습니다.</p><p className="mt-1">ERP 또는 관리자 승인 자료가 반영되면 최근 납부 내역이 표시됩니다.</p></div>
            )}
          </div>
          {paymentNotices.length > 0 && <div className="rounded-[10px] bg-white p-3 text-xs text-graphite shadow-[inset_0_0_0_1px_#f2f0ed]"><p className="font-semibold text-charcoal-primary">{paymentNotices[0].title}</p><p className="mt-1">미확인 납부 안내 {paymentNotices.length}건이 있습니다.</p></div>}
        </section>
        {!isPending && <p className="flex items-center gap-2 text-xs leading-5 text-ash"><Check className="size-3.5 text-meadow-green" aria-hidden="true" />표시 금액은 승인된 납부 원장에 반영된 내역만 합산합니다.</p>}
      </div>
    </article>
  );
}
