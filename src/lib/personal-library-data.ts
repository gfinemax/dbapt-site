import { prisma } from "@/lib/db";
import { serializeContributionSummary, serializePaymentNotices } from "@/lib/contribution-serializer";
import { loadContributionDashboardData } from "@/lib/contribution-dashboard-data";
import { isDemoApprovedAccount } from "@/lib/demo-account-filter";
import { serializeDocuments } from "@/lib/document-serializer";
import { normalizeMemberType } from "@/lib/member-type";
import { getUserContactDisplay } from "@/lib/user-contact-display";
import { type LogEntry } from "@/components/portal/audit-logs-table";
import { type Document } from "@/components/portal/document-table";
import type { ContributionDashboardView, ContributionSummaryView, PaymentNoticeView } from "@/lib/contribution-types";

export type PersonalLibrarySession = {
  id: string;
  loginId: string | null;
  name: string;
  role: string;
  email?: string;
};

export type PersonalLibraryData = {
  documents: Document[];
  logs: LogEntry[];
  refundInfo: {
    totalPaid: number;
    refundAmount: number;
    processedState: string;
    targetDate: string | null;
  } | null;
  contributionSummary: ContributionSummaryView | null;
  contributionDashboard: ContributionDashboardView | null;
  paymentNotices: PaymentNoticeView[];
  pendingUsers: {
    id: string;
    name: string;
    email: string;
    signupName?: string | null;
    signupPhone?: string | null;
    signupMemo?: string | null;
    createdAt: string;
  }[];
  approvedSocialUsers: {
    id: string;
    name: string;
    email: string;
    role: string;
    memberType: string;
    createdAt: string;
  }[];
};

export const emptyPersonalLibraryData = (): PersonalLibraryData => ({
  documents: [],
  logs: [],
  refundInfo: null,
  contributionSummary: null,
  contributionDashboard: null,
  paymentNotices: [],
  pendingUsers: [],
  approvedSocialUsers: [],
});

export async function loadPersonalLibraryData(
  session: PersonalLibrarySession | null,
): Promise<PersonalLibraryData> {
  const data = emptyPersonalLibraryData();
  if (!session) return data;

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
  data.documents = serializeDocuments(docs);

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
  data.contributionSummary = serializeContributionSummary(summary);
  data.paymentNotices = serializePaymentNotices(notices);
  data.contributionDashboard = await loadContributionDashboardData(session.id, data.contributionSummary);

  if (session.role !== "ADMIN" && data.documents.length > 0) {
    const documentIds = data.documents.map((doc) => doc.id);
    const [viewedLogs, bookmarks] = await Promise.all([
      prisma.documentLog.findMany({
        where: {
          userId: session.id,
          documentId: { in: documentIds },
          actionType: { in: ["VIEW", "DOWNLOAD"] },
        },
        select: { documentId: true },
        distinct: ["documentId"],
      }),
      prisma.personalDocumentBookmark.findMany({
        where: {
          userId: session.id,
          documentId: { in: documentIds },
        },
        select: { documentId: true },
      }),
    ]);
    const viewedIds = new Set(viewedLogs.map((log) => log.documentId));
    const bookmarkedIds = new Set(bookmarks.map((bookmark) => bookmark.documentId));

    data.documents = data.documents.map((doc) => ({
      ...doc,
      isViewedByCurrentUser: viewedIds.has(doc.id),
      isBookmarkedByCurrentUser: bookmarkedIds.has(doc.id),
    }));
  }

  if (session.role === "REFUND") {
    const info = await prisma.refundInfo.findUnique({
      where: { userId: session.id },
    });
    if (info) {
      data.refundInfo = {
        totalPaid: info.totalPaid,
        refundAmount: info.refundAmount,
        processedState: info.processedState,
        targetDate: info.targetDate ? info.targetDate.toISOString() : null,
      };
    }
  }

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

    data.logs = docLogs
      .filter((log) => !isDemoApprovedAccount(log.user))
      .map((log) => ({
        ...log,
        createdAt: log.createdAt.toISOString(),
        user: {
          name: log.user.name || "이름 없음",
          loginId: log.user.loginId || "소셜회원",
          role: log.user.role,
        },
      }));

    const pendingUsers = await prisma.user.findMany({
      where: { role: "PENDING" },
      orderBy: { createdAt: "desc" },
    });
    data.pendingUsers = pendingUsers.map((user) => ({
      id: user.id,
      name: user.name || "이름 없음",
      email: user.email || "이메일 없음",
      signupName: user.signupName,
      signupPhone: user.signupPhone,
      signupMemo: user.signupMemo,
      createdAt: user.createdAt.toISOString(),
    }));

    const approvedUsers = await prisma.user.findMany({
      where: {
        role: { in: ["MEMBER", "REFUND", "ASSOCIATE"] },
      },
      orderBy: { updatedAt: "desc" },
    });
    data.approvedSocialUsers = approvedUsers
      .filter((user) => !isDemoApprovedAccount(user))
      .map((user) => ({
        id: user.id,
        name: user.name || "이름 없음",
        email: getUserContactDisplay(user),
        role: user.role,
        memberType: normalizeMemberType(user.memberType, user.role),
        createdAt: user.createdAt.toISOString(),
      }));
  }

  return data;
}
