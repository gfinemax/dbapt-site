import type { Metadata } from "next";
import { PortalShell } from "@/components/portal/portal-shell";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

import { type Document } from "@/components/portal/document-table";
import { type LogEntry } from "@/components/portal/audit-logs-table";

export const metadata: Metadata = {
  title: "관리자 포털 | 대방동 지역주택조합",
};

export default async function AdminPortalPage() {
  const session = (await getSession()) as { id: string; loginId: string; name: string; role: string } | null;

  let documents: Document[] = [];
  let logs: LogEntry[] = [];
  let pendingUsers: { id: string; name: string; email: string; createdAt: string }[] = [];
  let approvedSocialUsers: { id: string; name: string; email: string; role: string; createdAt: string }[] = [];

  if (session) {
    try {
      // 1. Fetch all documents (approved + pending)
      const docs = await prisma.document.findMany({
        orderBy: { createdAt: "desc" },
      });
      documents = docs.map(doc => ({
        ...doc,
        publishedAt: doc.publishedAt ? doc.publishedAt.toISOString() : null,
        createdAt: doc.createdAt.toISOString(),
        updatedAt: doc.updatedAt.toISOString(),
      }));

      // 2. Fetch all security audit logs
      const docLogs = await prisma.documentLog.findMany({
        include: {
          user: {
            select: {
              name: true,
              loginId: true,
              role: true,
            },
          },
          document: {
            select: {
              title: true,
              category: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      logs = docLogs.map(log => ({
        ...log,
        createdAt: log.createdAt.toISOString(),
        user: {
          ...log.user,
          name: log.user.name || "이름 없음",
          loginId: log.user.loginId || "소셜회원",
        }
      }));

      // 3. Fetch pending registration users (Google OAuth signup simulation)
      const pUsers = await prisma.user.findMany({
        where: { role: "PENDING" },
        orderBy: { createdAt: "desc" },
      });
      pendingUsers = pUsers.map(u => ({
        id: u.id,
        name: u.name || "이름 없음",
        email: u.email || "이메일 없음",
        createdAt: u.createdAt.toISOString(),
      }));

      // 4. Fetch already approved social users (MEMBER or REFUND who have email)
      const approvedUsersRaw = await prisma.user.findMany({
        where: {
          email: { not: null },
          role: { in: ["MEMBER", "REFUND"] },
        },
        orderBy: { updatedAt: "desc" },
      });
      approvedSocialUsers = approvedUsersRaw.map(u => ({
        id: u.id,
        name: u.name || "이름 없음",
        email: u.email || "이메일 없음",
        role: u.role,
        createdAt: u.createdAt.toISOString(),
      }));
    } catch (e) {
      console.error("Error loading admin portal data:", e);
    }
  }

  return (
    <PortalShell
      role="admin"
      session={session}
      documents={documents}
      logs={logs}
      pendingUsers={pendingUsers}
      approvedSocialUsers={approvedSocialUsers}
    />
  );
}
