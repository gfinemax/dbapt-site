import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { serializeDocuments } from "@/lib/document-serializer";
import { serializeContributionSummary, serializePaymentNotices } from "@/lib/contribution-serializer";
import { HomeClient } from "@/components/landing/home-client";
import { type Document } from "@/components/portal/document-table";
import { type LogEntry } from "@/components/portal/audit-logs-table";
import type { ContributionSummaryView, PaymentNoticeView } from "@/lib/contribution-types";

export default async function Home() {
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
  let contributionSummary: ContributionSummaryView | null = null;
  let paymentNotices: PaymentNoticeView[] = [];

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
      
      // Convert Date objects to ISO string safely
      documents = serializeDocuments(docs);

      const [summary, notices] = await Promise.all([
        prisma.contributionSummary.findUnique({
          where: { userId: session.id },
        }),
        prisma.paymentNotice.findMany({
          where: {
            userId: session.id,
            status: { in: ["DRAFT", "APPROVED"] },
          },
          orderBy: { createdAt: "desc" },
        }),
      ]);
      contributionSummary = serializeContributionSummary(summary);
      paymentNotices = serializePaymentNotices(notices);

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
        // 보안 감사 로그 수집
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

        // 가입 승인 대기 유저 수집
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

        // 이미 승인된 소셜 유저 수집
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
      console.error("Error loading homepage session data:", e);
    }
  }

  return (
    <HomeClient
      session={session}
      documents={documents}
      logs={logs}
      refundInfo={refundInfo}
      pendingUsers={pendingUsers}
      approvedSocialUsers={approvedSocialUsers}
      contributionSummary={contributionSummary}
      paymentNotices={paymentNotices}
    />
  );
}
