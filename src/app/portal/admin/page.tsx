import type { Metadata } from "next";
import { PortalShell } from "@/components/portal/portal-shell";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { isDemoApprovedAccount } from "@/lib/demo-account-filter";
import { serializeDocuments } from "@/lib/document-serializer";
import { normalizeMemberType } from "@/lib/member-type";
import { getUserContactDisplay } from "@/lib/user-contact-display";

import { type Document } from "@/components/portal/document-table";
import { type LogEntry } from "@/components/portal/audit-logs-table";

export const metadata: Metadata = {
  title: "관리자 포털 | 대방동 지역주택조합",
};

export default async function AdminPortalPage() {
  const session = (await getSession()) as { id: string; loginId: string; name: string; role: string } | null;

  let documents: Document[] = [];
  let logs: LogEntry[] = [];
  let pendingUsers: { id: string; name: string; email: string; signupName?: string | null; signupPhone?: string | null; signupMemo?: string | null; createdAt: string }[] = [];
  let approvedSocialUsers: { id: string; name: string; email: string; role: string; memberType: string; createdAt: string }[] = [];

  if (session) {
    try {
      // 1. Fetch all documents (approved + pending)
      const docs = await prisma.document.findMany({
        include: {
          attachments: true,
        },
        orderBy: { documentDate: "desc" },
      });
      documents = serializeDocuments(docs);

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

      logs = docLogs
        .filter((log) => !isDemoApprovedAccount(log.user))
        .map(log => ({
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
        signupName: u.signupName,
        signupPhone: u.signupPhone,
        signupMemo: u.signupMemo,
        createdAt: u.createdAt.toISOString(),
      }));

      // 4. Fetch already approved users eligible for role conversion
      const approvedUsersRaw = await prisma.user.findMany({
        where: {
          role: { in: ["MEMBER", "REFUND", "ASSOCIATE"] },
        },
        orderBy: { updatedAt: "desc" },
      });
      approvedSocialUsers = approvedUsersRaw
        .filter((u) => !isDemoApprovedAccount(u))
        .map(u => ({
          id: u.id,
          name: u.name || "이름 없음",
          email: getUserContactDisplay(u),
          role: u.role,
          memberType: normalizeMemberType(u.memberType, u.role),
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
