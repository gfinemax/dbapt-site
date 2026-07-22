import { NextResponse } from "next/server";
import { buildAuditWhere, getAuditEnvironment, getAuditResourceLabel, normalizeAuditFilters } from "@/lib/admin/document-audit";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

const csvCell = (value: unknown) => `"${String(value ?? "").replaceAll('"', '""')}"`;

export async function GET(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "관리자 권한이 필요합니다." }, { status: 403 });
  }

  const url = new URL(request.url);
  const filters = normalizeAuditFilters(Object.fromEntries(url.searchParams.entries()));
  const logs = await prisma.documentLog.findMany({
    where: buildAuditWhere(filters),
    include: {
      user: { select: { name: true, loginId: true, role: true } },
      document: { select: { title: true, category: true, fileName: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 10_000,
  });

  const header = ["일시", "사용자", "아이디", "역할", "활동", "문서 제목", "문서 분류", "실제 파일명", "파일 종류", "파일 크기", "IP 주소", "기기", "브라우저", "운영체제", "요청 경로", "사용자 환경"];
  const rows = logs.map((log) => {
    const environment = getAuditEnvironment(log.userAgent);
    return [
      log.createdAt.toISOString(), log.user.name, log.user.loginId, log.user.role,
      log.actionType === "DOWNLOAD" ? "다운로드" : "열람",
      log.document.title, log.document.category, log.fileName || log.document.fileName,
      getAuditResourceLabel(log.resourceType), log.fileSize, log.ipAddress,
      environment.device, environment.browser, environment.os, log.requestPath, log.userAgent,
    ];
  });
  const csv = `\uFEFF${[header, ...rows].map((row) => row.map(csvCell).join(",")).join("\r\n")}`;
  const date = new Date().toISOString().slice(0, 10);

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="document-audit-${date}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
