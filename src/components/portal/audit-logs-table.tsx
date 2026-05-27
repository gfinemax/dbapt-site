"use client";

export type LogEntry = {
  id: string;
  actionType: string;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  user: {
    name: string;
    loginId: string;
    role: string;
  };
  document: {
    title: string;
    category: string;
  };
};

type AuditLogsTableProps = {
  logs: LogEntry[];
};

export function AuditLogsTable({ logs }: AuditLogsTableProps) {
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate()
    ).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(
      d.getMinutes()
    ).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`;
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "MEMBER":
        return "정식 조합원";
      case "REFUND":
        return "환불 조합원";
      case "ADMIN":
        return "관리자";
      default:
        return role;
    }
  };

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold text-charcoal-primary mb-4">보안 감사 및 다운로드 이력</h3>
      
      {logs.length === 0 ? (
        <div className="stone-card px-6 py-12 text-center text-graphite text-sm">
          기록된 감사 로그가 존재하지 않습니다.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-[#f2f0ed] bg-white">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[#f2f0ed] bg-[#f8f7f4] text-xs font-semibold text-charcoal-primary uppercase tracking-wider">
                <th className="px-5 py-4">일시</th>
                <th className="px-5 py-4">사용자</th>
                <th className="px-5 py-4">역할</th>
                <th className="px-5 py-4">대상 문서</th>
                <th className="px-5 py-4">활동</th>
                <th className="px-5 py-4">IP 주소</th>
                <th className="px-5 py-4">브라우저/환경</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f2f0ed] text-graphite">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-[#fbfaf9] transition-colors">
                  <td className="whitespace-nowrap px-5 py-4 font-mono text-xs">{formatDate(log.createdAt)}</td>
                  <td className="whitespace-nowrap px-5 py-4">
                    <span className="font-medium text-charcoal-primary">{log.user.name}</span>
                    <span className="ml-1 text-xs text-graphite/70 font-mono">({log.user.loginId})</span>
                  </td>
                  <td className="whitespace-nowrap px-5 py-4">
                    <span className="text-xs">{getRoleLabel(log.user.role)}</span>
                  </td>
                  <td className="px-5 py-4 max-w-xs truncate">
                    <span className="font-medium text-charcoal-primary">{log.document.title}</span>
                  </td>
                  <td className="whitespace-nowrap px-5 py-4">
                    <span className="inline-flex rounded-full bg-ember-orange/10 px-2.5 py-0.5 text-xs font-semibold text-ember-orange">
                      {log.actionType === "DOWNLOAD" ? "다운로드" : log.actionType}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 font-mono text-xs">{log.ipAddress || "-"}</td>
                  <td className="px-5 py-4 text-xs max-w-xs truncate" title={log.userAgent || ""}>
                    {log.userAgent || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
