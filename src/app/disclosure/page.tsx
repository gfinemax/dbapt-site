import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { serializeDocuments } from "@/lib/document-serializer";
import { DisclosurePageClientShell } from "@/components/disclosure/disclosure-page-client-shell";
import { type Document } from "@/components/portal/document-table";
import { type LogEntry } from "@/components/portal/audit-logs-table";

export default async function DisclosurePage() {
  const session = (await getSession()) as {
    id: string;
    loginId: string | null;
    name: string;
    role: string;
    email?: string;
  } | null;

  let documents: Document[] = [];
  let logs: LogEntry[] = [];
  let refundInfo: {
    totalPaid: number;
    refundAmount: number;
    processedState: string;
    targetDate: string | null;
  } | null = null;
  let pendingUsers: { id: string; name: string; email: string; signupName?: string | null; signupPhone?: string | null; signupMemo?: string | null; createdAt: string }[] = [];
  let approvedSocialUsers: { id: string; name: string; email: string; role: string; createdAt: string }[] = [];

  if (session) {
    try {
      const whereClause: { status?: string } = {};
      if (session.role !== "ADMIN") {
        whereClause.status = "APPROVED";
      }

      const docs = await prisma.document.findMany({
        where: whereClause,
        include: {
          attachments: true,
        },
        orderBy: { documentDate: "desc" },
      });
      
      documents = serializeDocuments(docs);

      // 2. REFUND 전용 정산 데이터 수집
      if (session.role === "REFUND") {
        const info = await prisma.refundInfo.findUnique({
          where: { userId: session.id },
        });
        if (info) {
          refundInfo = {
            totalPaid: info.totalPaid,
            refundAmount: info.refundAmount,
            processedState: info.processedState,
            targetDate: info.targetDate ? info.targetDate.toISOString() : null,
          };
        }
      }

      // 3. ADMIN 전용 보안 로그 및 가입 승인 대기 명세 수집
      if (session.role === "ADMIN") {
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
            name: log.user.name || "이름 없음",
            loginId: log.user.loginId || "소셜회원",
            role: log.user.role,
          }
        }));

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
      }
    } catch (e) {
      console.error("Error loading disclosure page session data:", e);
    }
  }

  return (
    <DisclosurePageClientShell
      session={session}
      documents={documents}
      logs={logs}
      refundInfo={refundInfo}
      pendingUsers={pendingUsers}
      approvedSocialUsers={approvedSocialUsers}
    />
  );
}
