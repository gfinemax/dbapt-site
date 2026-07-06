import type { Metadata } from "next";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { isDemoApprovedAccount } from "@/lib/demo-account-filter";
import { buildDocumentSocialPreview } from "@/lib/document-social-preview";
import { serializeDocuments } from "@/lib/document-serializer";
import { normalizeMemberType } from "@/lib/member-type";
import { loadContentReactionSummaries } from "@/lib/server/content-reaction-summaries";
import { defaultSiteMetadata, siteTitle } from "@/lib/site-metadata";
import { getUserContactDisplay } from "@/lib/user-contact-display";
import { DisclosurePageClientShell } from "@/components/disclosure/disclosure-page-client-shell";
import { type DisclosureCardContent, type DisclosureEmptyMessage } from "@/components/disclosure/disclosure-client";
import { type Document } from "@/components/portal/document-table";
import { type LogEntry } from "@/components/portal/audit-logs-table";

type DisclosureCardContentDelegate = {
  findMany: (args: { orderBy: { itemId: "asc" } }) => Promise<DisclosureCardContent[]>;
};

function getDisclosureCardContentDelegate() {
  return (prisma as typeof prisma & {
    disclosureCardContent?: DisclosureCardContentDelegate;
  }).disclosureCardContent;
}

type DisclosurePageProps = {
  searchParams?: Promise<{
    document?: string;
  }>;
};

export async function generateMetadata({ searchParams }: DisclosurePageProps = {}): Promise<Metadata> {
  const resolvedSearchParams = await searchParams;
  const requestedDocumentId =
    typeof resolvedSearchParams?.document === "string" ? resolvedSearchParams.document : null;

  if (!requestedDocumentId) {
    return defaultSiteMetadata;
  }

  try {
    const publicDocument = await prisma.document.findFirst({
      where: {
        id: requestedDocumentId,
        category: "DISCLOSURE",
        status: "APPROVED",
      },
      select: {
        id: true,
        title: true,
        description: true,
        socialImagePath: true,
      },
    });

    if (!publicDocument) {
      return defaultSiteMetadata;
    }

    const preview = buildDocumentSocialPreview(publicDocument);

    return {
      metadataBase: defaultSiteMetadata.metadataBase,
      title: `${preview.title} | ${siteTitle}`,
      description: preview.description,
      openGraph: {
        title: preview.title,
        description: preview.description,
        url: `/disclosure?document=${encodeURIComponent(publicDocument.id)}`,
        siteName: siteTitle,
        locale: "ko_KR",
        type: "article",
        images: [preview.image],
      },
      twitter: {
        card: "summary_large_image",
        title: preview.title,
        description: preview.description,
        images: [preview.image.url],
      },
    };
  } catch (error) {
    console.error("Disclosure metadata error:", error);
    return defaultSiteMetadata;
  }
}

async function addCurrentUserBookmarkFlags(documents: Document[], userId: string) {
  if (documents.length === 0) return documents;

  const bookmarks = await prisma.personalDocumentBookmark.findMany({
    where: {
      userId,
      documentId: { in: documents.map((document) => document.id) },
    },
    select: { documentId: true },
  });
  const bookmarkedIds = new Set(bookmarks.map((bookmark) => bookmark.documentId));

  return documents.map((document) => ({
    ...document,
    isBookmarkedByCurrentUser: bookmarkedIds.has(document.id),
  }));
}

export default async function DisclosurePage({ searchParams }: DisclosurePageProps = {}) {
  const resolvedSearchParams = await searchParams;
  const requestedDocumentId =
    typeof resolvedSearchParams?.document === "string" ? resolvedSearchParams.document : null;
  const session = (await getSession()) as {
    id: string;
    loginId: string | null;
    name: string;
    role: string;
    email?: string;
  } | null;

  let documents: Document[] = [];
  let emptyMessages: DisclosureEmptyMessage[] = [];
  let cardContents: DisclosureCardContent[] = [];
  let logs: LogEntry[] = [];
  let refundInfo: {
    totalPaid: number;
    refundAmount: number;
    processedState: string;
    targetDate: string | null;
  } | null = null;
  let pendingUsers: { id: string; name: string; email: string; signupName?: string | null; signupPhone?: string | null; signupMemo?: string | null; createdAt: string }[] = [];
  let approvedSocialUsers: { id: string; name: string; email: string; role: string; memberType: string; createdAt: string }[] = [];

  try {
    const disclosureCardContent = getDisclosureCardContentDelegate();
    if (disclosureCardContent) {
      const savedCardContents = await disclosureCardContent.findMany({
        orderBy: { itemId: "asc" },
      });
      cardContents = savedCardContents.map((content) => ({
        itemId: content.itemId,
        title: content.title,
        description: content.description,
      }));
    }
  } catch (e) {
    console.error("Error loading disclosure card content overrides:", e);
  }

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
      
      const documentLikeSummaries = await loadContentReactionSummaries(
        "DOCUMENT",
        docs.map((document) => document.id),
        session.id,
      );
      documents = await addCurrentUserBookmarkFlags(
        serializeDocuments(docs, session.id).map((document) => ({
          ...document,
          ...(documentLikeSummaries.get(document.id) || { likeCount: 0, likedByCurrentUser: false }),
        })),
        session.id,
      );

      const savedEmptyMessages = await prisma.disclosureEmptyMessage.findMany({
        orderBy: { subCategory: "asc" },
      });
      emptyMessages = savedEmptyMessages.map((message) => ({
        subCategory: message.subCategory,
        title: message.title,
        message: message.message,
      }));

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

        logs = docLogs
          .filter((log) => !isDemoApprovedAccount(log.user))
          .map(log => ({
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
      }
    } catch (e) {
      console.error("Error loading disclosure page session data:", e);
    }
  } else if (requestedDocumentId) {
    try {
      const publicDocument = await prisma.document.findFirst({
        where: {
          id: requestedDocumentId,
          category: "DISCLOSURE",
          status: "APPROVED",
        },
        include: {
          attachments: true,
        },
      });

      if (publicDocument) {
        const documentLikeSummaries = await loadContentReactionSummaries("DOCUMENT", [publicDocument.id], null);
        documents = serializeDocuments([publicDocument]).map((document) => ({
          ...document,
          ...(documentLikeSummaries.get(document.id) || { likeCount: 0, likedByCurrentUser: false }),
        }));
      } else {
        documents = [];
      }
    } catch (e) {
      console.error("Error loading public disclosure document:", e);
    }
  }

  return (
    <DisclosurePageClientShell
      session={session}
      documents={documents}
      emptyMessages={emptyMessages}
      cardContents={cardContents}
      logs={logs}
      refundInfo={refundInfo}
      pendingUsers={pendingUsers}
      approvedSocialUsers={approvedSocialUsers}
    />
  );
}
