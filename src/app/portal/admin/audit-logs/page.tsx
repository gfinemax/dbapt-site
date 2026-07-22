import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SecurityAuditDashboard } from "@/components/portal/security-audit-dashboard";
import { AUDIT_PAGE_SIZE, buildAuditWhere, normalizeAuditFilters, type AuditSearchParams } from "@/lib/admin/document-audit";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const metadata: Metadata = { title: "보안 감사 | 대방동 지역주택조합" };
export const dynamic = "force-dynamic";

export default async function SecurityAuditPage({ searchParams }: { searchParams: Promise<AuditSearchParams> }) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/login");

  const rawParams = await searchParams;
  const filters = normalizeAuditFilters(rawParams);
  const where = buildAuditWhere(filters);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [logs, total, todayViews, todayDownloads, totalDownloads, recentUserRows] = await Promise.all([
    prisma.documentLog.findMany({
      where,
      include: { user: { select: { name: true, loginId: true, role: true } }, document: { select: { id: true, title: true, category: true, fileName: true } } },
      orderBy: { createdAt: "desc" },
      skip: (filters.page - 1) * AUDIT_PAGE_SIZE,
      take: AUDIT_PAGE_SIZE,
    }),
    prisma.documentLog.count({ where }),
    prisma.documentLog.count({ where: { actionType: "VIEW", createdAt: { gte: today } } }),
    prisma.documentLog.count({ where: { actionType: "DOWNLOAD", createdAt: { gte: today } } }),
    prisma.documentLog.count({ where: { actionType: "DOWNLOAD" } }),
    prisma.documentLog.findMany({ where: { createdAt: { gte: sevenDaysAgo } }, select: { userId: true }, distinct: ["userId"] }),
  ]);

  return <SecurityAuditDashboard rows={logs.map((log) => ({ ...log, user: { ...log.user, name: log.user.name || "이름 없음" }, createdAt: log.createdAt.toISOString() }))} total={total} page={filters.page} params={rawParams} summary={{ todayViews, todayDownloads, recentUsers: recentUserRows.length, totalDownloads }} />;
}
