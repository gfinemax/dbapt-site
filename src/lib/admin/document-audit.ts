import type { Prisma } from "@prisma/client";

export const AUDIT_PAGE_SIZE = 30;

export type AuditSearchParams = {
  q?: string;
  action?: string;
  resource?: string;
  role?: string;
  from?: string;
  to?: string;
  page?: string;
};

export function normalizeAuditFilters(params: AuditSearchParams) {
  return {
    q: params.q?.trim() || "",
    action: ["VIEW", "DOWNLOAD"].includes(params.action || "") ? params.action! : "",
    resource: ["MAIN_FILE", "LEGACY_ATTACHMENT", "ATTACHMENT", "MERGED_FILE"].includes(params.resource || "")
      ? params.resource!
      : "",
    role: ["ADMIN", "MEMBER", "REFUND", "ASSOCIATE"].includes(params.role || "") ? params.role! : "",
    from: /^\d{4}-\d{2}-\d{2}$/.test(params.from || "") ? params.from! : "",
    to: /^\d{4}-\d{2}-\d{2}$/.test(params.to || "") ? params.to! : "",
    page: Math.max(1, Number.parseInt(params.page || "1", 10) || 1),
  };
}

export function buildAuditWhere(filters: ReturnType<typeof normalizeAuditFilters>): Prisma.DocumentLogWhereInput {
  const where: Prisma.DocumentLogWhereInput = {};
  if (filters.action) where.actionType = filters.action;
  if (filters.resource) where.resourceType = filters.resource;
  if (filters.role) where.user = { role: filters.role };
  if (filters.from || filters.to) {
    where.createdAt = {
      ...(filters.from ? { gte: new Date(`${filters.from}T00:00:00+09:00`) } : {}),
      ...(filters.to ? { lte: new Date(`${filters.to}T23:59:59.999+09:00`) } : {}),
    };
  }
  if (filters.q) {
    where.OR = [
      { fileName: { contains: filters.q, mode: "insensitive" } },
      { ipAddress: { contains: filters.q, mode: "insensitive" } },
      { document: { title: { contains: filters.q, mode: "insensitive" } } },
      { user: { name: { contains: filters.q, mode: "insensitive" } } },
      { user: { loginId: { contains: filters.q, mode: "insensitive" } } },
    ];
  }
  return where;
}

export function getAuditResourceLabel(resourceType: string) {
  switch (resourceType) {
    case "ATTACHMENT": return "첨부파일";
    case "LEGACY_ATTACHMENT": return "추가 첨부";
    case "MERGED_FILE": return "통합 PDF";
    default: return "본문 파일";
  }
}

export function getAuditEnvironment(userAgent: string | null) {
  if (!userAgent) return { device: "알 수 없음", browser: "알 수 없음", os: "알 수 없음" };
  const device = /mobile|android|iphone|ipad/i.test(userAgent) ? "모바일" : "PC";
  const browser = /edg\//i.test(userAgent)
    ? "Edge"
    : /chrome\//i.test(userAgent)
      ? "Chrome"
      : /firefox\//i.test(userAgent)
        ? "Firefox"
        : /safari\//i.test(userAgent)
          ? "Safari"
          : "기타 브라우저";
  const os = /windows/i.test(userAgent)
    ? "Windows"
    : /android/i.test(userAgent)
      ? "Android"
      : /iphone|ipad|ios/i.test(userAgent)
        ? "iOS"
        : /mac os|macintosh/i.test(userAgent)
          ? "macOS"
          : /linux/i.test(userAgent)
            ? "Linux"
            : "기타 OS";
  return { device, browser, os };
}
