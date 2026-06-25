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
  contentBookmarks: PersonalLibraryContentBookmark[];
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

export type PersonalLibraryContentBookmark = {
  id: string;
  targetType: "COOP_NEWS" | "FREE_POST";
  targetId: string;
  sourceLabel: string;
  title: string;
  description: string | null;
  href: string;
  createdAt: string;
  registeredAt: string;
  isStarred: boolean;
};

export const emptyPersonalLibraryData = (): PersonalLibraryData => ({
  documents: [],
  contentBookmarks: [],
  logs: [],
  refundInfo: null,
  contributionSummary: null,
  contributionDashboard: null,
  paymentNotices: [],
  pendingUsers: [],
  approvedSocialUsers: [],
});

function toPlainText(value: string | null | undefined) {
  return (value || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getCoopNewsSourceLabel(category: string) {
  return category === "WEEKLY_MONTHLY" ? "조합뉴스" : "공지사항";
}

function getCoopNewsHref(category: string, id: string) {
  return category === "WEEKLY_MONTHLY"
    ? `/news?tab=newsletter&news=${encodeURIComponent(id)}`
    : `/news?tab=notice&notice=${encodeURIComponent(id)}`;
}

async function loadPersonalContentBookmarks(userId: string): Promise<PersonalLibraryContentBookmark[]> {
  const bookmarks = await prisma.personalContentBookmark.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
  if (bookmarks.length === 0) return [];

  const coopNewsIds = bookmarks
    .filter((bookmark) => bookmark.targetType === "COOP_NEWS")
    .map((bookmark) => bookmark.targetId);
  const freePostIds = bookmarks
    .filter((bookmark) => bookmark.targetType === "FREE_POST")
    .map((bookmark) => bookmark.targetId);

  const [coopNewsItems, freePostItems] = await Promise.all([
    coopNewsIds.length > 0
      ? prisma.coopNews.findMany({
          where: { id: { in: coopNewsIds } },
          select: {
            id: true,
            category: true,
            title: true,
            content: true,
            isStarred: true,
            registeredAt: true,
          },
        })
      : Promise.resolve([]),
    freePostIds.length > 0
      ? prisma.freePost.findMany({
          where: { id: { in: freePostIds } },
          select: {
            id: true,
            postType: true,
            title: true,
            content: true,
            isStarred: true,
            registeredAt: true,
          },
        })
      : Promise.resolve([]),
  ]);

  const coopNewsById = new Map(coopNewsItems.map((item) => [item.id, item]));
  const freePostById = new Map(freePostItems.map((item) => [item.id, item]));

  const contentBookmarks: PersonalLibraryContentBookmark[] = [];

  for (const bookmark of bookmarks) {
    if (bookmark.targetType === "COOP_NEWS") {
      const item = coopNewsById.get(bookmark.targetId);
      if (!item) continue;
      contentBookmarks.push({
        id: bookmark.id,
        targetType: "COOP_NEWS" as const,
        targetId: item.id,
        sourceLabel: getCoopNewsSourceLabel(item.category),
        title: item.title,
        description: toPlainText(item.content).slice(0, 120) || null,
        href: getCoopNewsHref(item.category, item.id),
        createdAt: bookmark.createdAt.toISOString(),
        registeredAt: item.registeredAt.toISOString(),
        isStarred: item.isStarred,
      });
      continue;
    }

    if (bookmark.targetType === "FREE_POST") {
      const item = freePostById.get(bookmark.targetId);
      if (!item) continue;
      contentBookmarks.push({
        id: bookmark.id,
        targetType: "FREE_POST" as const,
        targetId: item.id,
        sourceLabel: item.postType === "NOTICE" ? "자유게시판 공지" : "자유게시판",
        title: item.title,
        description: toPlainText(item.content).slice(0, 120) || null,
        href: `/news?tab=free&post=${encodeURIComponent(item.id)}`,
        createdAt: bookmark.createdAt.toISOString(),
        registeredAt: item.registeredAt.toISOString(),
        isStarred: item.isStarred,
      });
    }
  }

  return contentBookmarks;
}

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
  data.contentBookmarks = await loadPersonalContentBookmarks(session.id);

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
