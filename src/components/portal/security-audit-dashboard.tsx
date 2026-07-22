import Link from "next/link";
import { ArrowLeft, Download, Eye, FileDown, ShieldCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  AUDIT_PAGE_SIZE,
  getAuditEnvironment,
  getAuditResourceLabel,
  type AuditSearchParams,
} from "@/lib/admin/document-audit";

export type SecurityAuditRow = {
  id: string;
  actionType: string;
  resourceType: string;
  attachmentId: string | null;
  fileName: string | null;
  fileSize: number | null;
  requestPath: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  user: { name: string; loginId: string | null; role: string };
  document: { id: string; title: string; category: string; fileName: string };
};

type SecurityAuditDashboardProps = {
  rows: SecurityAuditRow[];
  total: number;
  page: number;
  params: AuditSearchParams;
  summary: { todayViews: number; todayDownloads: number; recentUsers: number; totalDownloads: number };
};

const formatDateTime = (value: string) => new Intl.DateTimeFormat("ko-KR", {
  dateStyle: "medium",
  timeStyle: "medium",
  timeZone: "Asia/Seoul",
}).format(new Date(value));

const formatSize = (value: number | null) => {
  if (value === null) return "기록 없음";
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / 1024 / 1024).toFixed(1)} MB`;
};

const roleLabels: Record<string, string> = {
  ADMIN: "관리자",
  MEMBER: "정식 조합원",
  REFUND: "환불 조합원",
  ASSOCIATE: "관계자",
};

function buildPageHref(params: AuditSearchParams, page: number) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value && key !== "page") query.set(key, value);
  });
  query.set("page", String(page));
  return `/portal/admin/audit-logs?${query.toString()}`;
}

export function SecurityAuditDashboard({ rows, total, page, params, summary }: SecurityAuditDashboardProps) {
  const pageCount = Math.max(1, Math.ceil(total / AUDIT_PAGE_SIZE));
  const summaryCards: Array<{ label: string; value: number; icon: LucideIcon }> = [
    { label: "오늘 열람", value: summary.todayViews, icon: Eye },
    { label: "오늘 다운로드", value: summary.todayDownloads, icon: Download },
    { label: "최근 7일 이용자", value: summary.recentUsers, icon: ShieldCheck },
    { label: "누적 다운로드", value: summary.totalDownloads, icon: FileDown },
  ];
  const exportQuery = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value && key !== "page") exportQuery.set(key, value);
  });

  return (
    <main className="min-h-screen bg-parchment-card px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1500px] space-y-6">
        <section className="rounded-3xl border border-stone-surface bg-white p-6 sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <Link href="/portal/admin" className="inline-flex items-center gap-2 text-xs font-semibold text-graphite hover:text-charcoal-primary">
                <ArrowLeft className="size-4" /> 관리자 포털
              </Link>
              <div className="mt-5 flex items-center gap-3">
                <span className="grid size-11 place-items-center rounded-2xl bg-midnight text-white"><ShieldCheck className="size-6" /></span>
                <div>
                  <h1 className="text-2xl font-semibold text-charcoal-primary sm:text-3xl">보안 감사 및 다운로드 이력</h1>
                  <p className="mt-1 text-sm text-graphite">누가 어떤 문서의 어느 파일을 열람하거나 내려받았는지 확인합니다.</p>
                </div>
              </div>
            </div>
            <a href={`/api/admin/audit-logs/export?${exportQuery.toString()}`} className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-midnight px-4 text-xs font-bold text-white hover:bg-charcoal-primary">
              <FileDown className="size-4" /> CSV 내보내기
            </a>
          </div>
        </section>

        <section aria-label="감사 이력 요약" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {summaryCards.map(({ label, value, icon: Icon }) => (
            <article key={label} className="rounded-2xl border border-stone-surface bg-white p-5">
              <Icon className="size-5 text-sky-blue" />
              <p className="mt-3 text-xs font-semibold text-graphite">{label}</p>
              <p className="mt-1 text-2xl font-bold text-charcoal-primary">{value.toLocaleString("ko-KR")}</p>
            </article>
          ))}
        </section>

        <section className="rounded-3xl border border-stone-surface bg-white p-5 sm:p-6">
          <form className="grid gap-3 lg:grid-cols-[minmax(240px,1fr)_repeat(5,minmax(120px,auto))_auto]" method="get">
            <input name="q" defaultValue={params.q} placeholder="사용자·문서·파일명·IP 검색" className="h-11 rounded-xl border border-stone-surface px-4 text-sm" />
            <select name="action" defaultValue={params.action} className="h-11 rounded-xl border border-stone-surface px-3 text-sm"><option value="">전체 활동</option><option value="VIEW">열람</option><option value="DOWNLOAD">다운로드</option></select>
            <select name="resource" defaultValue={params.resource} className="h-11 rounded-xl border border-stone-surface px-3 text-sm"><option value="">전체 파일</option><option value="MAIN_FILE">본문</option><option value="ATTACHMENT">첨부파일</option><option value="LEGACY_ATTACHMENT">추가 첨부</option><option value="MERGED_FILE">통합 PDF</option></select>
            <select name="role" defaultValue={params.role} className="h-11 rounded-xl border border-stone-surface px-3 text-sm"><option value="">전체 역할</option><option value="ADMIN">관리자</option><option value="MEMBER">정식 조합원</option><option value="REFUND">환불 조합원</option><option value="ASSOCIATE">관계자</option></select>
            <input type="date" name="from" aria-label="조회 시작일" defaultValue={params.from} className="h-11 rounded-xl border border-stone-surface px-3 text-sm" />
            <input type="date" name="to" aria-label="조회 종료일" defaultValue={params.to} className="h-11 rounded-xl border border-stone-surface px-3 text-sm" />
            <button className="h-11 rounded-xl bg-sky-blue px-5 text-sm font-bold text-white">조회</button>
          </form>
          <div className="mt-4 flex items-center justify-between border-t border-stone-surface pt-4 text-xs text-graphite"><span>검색 결과 {total.toLocaleString("ko-KR")}건</span><Link href="/portal/admin/audit-logs" className="font-semibold hover:text-charcoal-primary">필터 초기화</Link></div>
        </section>

        <section className="overflow-hidden rounded-3xl border border-stone-surface bg-white">
          {rows.length === 0 ? <div className="px-6 py-16 text-center text-sm text-graphite">조건에 맞는 감사 기록이 없습니다.</div> : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1250px] border-collapse text-left text-sm">
                <thead className="bg-parchment-card text-xs font-semibold text-charcoal-primary"><tr><th className="px-5 py-4">일시</th><th className="px-5 py-4">사용자</th><th className="px-5 py-4">활동</th><th className="px-5 py-4">대상 문서</th><th className="px-5 py-4">실제 파일</th><th className="px-5 py-4">파일 종류</th><th className="px-5 py-4">IP</th><th className="px-5 py-4">접속 환경</th></tr></thead>
                <tbody className="divide-y divide-stone-surface">
                  {rows.map((row) => { const environment = getAuditEnvironment(row.userAgent); return (
                    <tr key={row.id} className="align-top hover:bg-parchment-card/60">
                      <td className="whitespace-nowrap px-5 py-4 font-mono text-xs">{formatDateTime(row.createdAt)}</td>
                      <td className="whitespace-nowrap px-5 py-4"><div className="font-semibold text-charcoal-primary">{row.user.name}</div><div className="mt-1 text-xs text-ash">{row.user.loginId || "소셜 회원"} · {roleLabels[row.user.role] || row.user.role}</div></td>
                      <td className="px-5 py-4"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${row.actionType === "DOWNLOAD" ? "bg-ember-orange/10 text-ember-orange" : "bg-sky-blue/10 text-sky-blue"}`}>{row.actionType === "DOWNLOAD" ? "다운로드" : "열람"}</span></td>
                      <td className="max-w-[260px] px-5 py-4"><div className="font-semibold text-charcoal-primary">{row.document.title}</div><div className="mt-1 text-xs text-ash">{row.document.category}</div></td>
                      <td className="max-w-[280px] px-5 py-4"><div className="break-all font-mono text-xs text-charcoal-primary">{row.fileName || row.document.fileName}</div><div className="mt-1 text-xs text-ash">{formatSize(row.fileSize)}</div></td>
                      <td className="whitespace-nowrap px-5 py-4"><span className="rounded-full bg-parchment-card px-2.5 py-1 text-xs font-semibold">{getAuditResourceLabel(row.resourceType)}</span></td>
                      <td className="whitespace-nowrap px-5 py-4 font-mono text-xs">{row.ipAddress || "-"}</td>
                      <td className="px-5 py-4 text-xs"><div>{environment.device} · {environment.browser}</div><div className="mt-1 text-ash">{environment.os}</div><details className="mt-2"><summary className="cursor-pointer text-sky-blue">상세</summary><p className="mt-2 max-w-[320px] break-all text-[10px] leading-4 text-ash">{row.userAgent || "기록 없음"}<br />{row.requestPath || "이전 기록"}</p></details></td>
                    </tr>
                  ); })}
                </tbody>
              </table>
            </div>
          )}
          <nav aria-label="감사 이력 페이지 이동" className="flex items-center justify-center gap-3 border-t border-stone-surface px-5 py-4 text-xs">
            {page > 1 ? <Link href={buildPageHref(params, page - 1)} className="rounded-full border border-stone-surface px-4 py-2 font-semibold">이전</Link> : <span className="rounded-full border border-stone-surface px-4 py-2 text-ash opacity-50">이전</span>}
            <span className="font-mono text-graphite">{page} / {pageCount}</span>
            {page < pageCount ? <Link href={buildPageHref(params, page + 1)} className="rounded-full border border-stone-surface px-4 py-2 font-semibold">다음</Link> : <span className="rounded-full border border-stone-surface px-4 py-2 text-ash opacity-50">다음</span>}
          </nav>
        </section>
      </div>
    </main>
  );
}
