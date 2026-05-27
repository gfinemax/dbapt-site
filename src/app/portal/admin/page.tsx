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
    />
  );
}
