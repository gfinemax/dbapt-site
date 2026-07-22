import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SecurityAuditDashboard } from "@/components/portal/security-audit-dashboard";
import { buildAuditWhere, getAuditEnvironment, normalizeAuditFilters } from "@/lib/admin/document-audit";

describe("security audit dashboard", () => {
  it("shows the exact document, file, action, user, network, and environment", () => {
    render(
      <SecurityAuditDashboard
        rows={[{
          id: "log-1",
          actionType: "DOWNLOAD",
          resourceType: "ATTACHMENT",
          attachmentId: "attachment-1",
          fileName: "개인정보 처리 결과.pdf",
          fileSize: 2048,
          requestPath: "/api/documents/attachments/attachment-1",
          ipAddress: "203.0.113.10",
          userAgent: "Mozilla/5.0 (Windows NT 10.0) Chrome/126.0",
          createdAt: "2026-07-22T01:00:00.000Z",
          user: { name: "홍길동", loginId: "member-1", role: "MEMBER" },
          document: { id: "doc-1", title: "개인정보 보호 조치 결과", category: "NOTICE", fileName: "본문.pdf" },
        }]}
        total={1}
        page={1}
        params={{}}
        summary={{ todayViews: 3, todayDownloads: 2, recentUsers: 4, totalDownloads: 10 }}
      />,
    );

    const table = screen.getByRole("table");
    expect(within(table).getByText("홍길동")).toBeInTheDocument();
    expect(within(table).getByText("개인정보 보호 조치 결과")).toBeInTheDocument();
    expect(within(table).getByText("개인정보 처리 결과.pdf")).toBeInTheDocument();
    expect(within(table).getByText("첨부파일")).toBeInTheDocument();
    expect(within(table).getByText("다운로드")).toBeInTheDocument();
    expect(within(table).getByText("203.0.113.10")).toBeInTheDocument();
    expect(within(table).getByText("PC · Chrome")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "CSV 내보내기" })).toHaveAttribute("href", "/api/admin/audit-logs/export?");
  });

  it("normalizes filters and builds a server-side audit query", () => {
    const filters = normalizeAuditFilters({ q: " 개인정보 ", action: "DOWNLOAD", resource: "ATTACHMENT", role: "MEMBER", from: "2026-07-01", to: "2026-07-22", page: "2" });
    expect(filters).toMatchObject({ q: "개인정보", action: "DOWNLOAD", resource: "ATTACHMENT", role: "MEMBER", page: 2 });
    expect(buildAuditWhere(filters)).toMatchObject({ actionType: "DOWNLOAD", resourceType: "ATTACHMENT", user: { role: "MEMBER" } });
    expect(getAuditEnvironment("Mozilla/5.0 (iPhone) Version/18.0 Mobile Safari/604.1")).toEqual({ device: "모바일", browser: "Safari", os: "iOS" });
  });
});
