import { getSession } from "@/lib/auth";
import { HomeClient } from "@/components/landing/home-client";
import { emptyPersonalLibraryData, loadPersonalLibraryData } from "@/lib/personal-library-data";
import { prisma } from "@/lib/db";
import type { LandingNotice } from "@/components/landing/notices-section";

export default async function Home() {
  const session = (await getSession()) as {
    id: string;
    loginId: string | null;
    name: string;
    role: string;
    email?: string;
  } | null;

  let personalLibraryData = emptyPersonalLibraryData();
  let notices: LandingNotice[] = [];

  try {
    const [noticeData, freePostData] = await Promise.all([
      prisma.coopNews.findMany({
        where: { category: "NOTICE" },
        select: {
          id: true,
          title: true,
          registeredAt: true,
          createdAt: true,
          isStarred: true,
        },
        orderBy: [
          { isStarred: "desc" },
          { registeredAt: "desc" },
        ],
        take: 2,
      }),
      prisma.freePost.findMany({
        select: {
          id: true,
          title: true,
          registeredAt: true,
          createdAt: true,
          isStarred: true,
        },
        orderBy: [
          { isStarred: "desc" },
          { registeredAt: "desc" },
        ],
        take: 1,
      }),
    ]);

    notices = [
      ...noticeData.map((notice) => ({
        id: notice.id,
        kind: "notice" as const,
        title: notice.title,
        createdAt: notice.registeredAt.toISOString(),
        isStarred: notice.isStarred,
      })),
      ...freePostData.map((post) => ({
        id: post.id,
        kind: "free" as const,
        title: post.title,
        createdAt: post.registeredAt.toISOString(),
        isStarred: post.isStarred,
      })),
    ]
      .sort((a, b) => {
        if (a.isStarred !== b.isStarred) {
          return Number(b.isStarred) - Number(a.isStarred);
        }

        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      })
      .slice(0, 3);
  } catch (e) {
    console.error("Error loading homepage notices and posts:", e);
  }

  if (session) {
    try {
      personalLibraryData = await loadPersonalLibraryData(session);
    } catch (e) {
      console.error("Error loading homepage session data:", e);
    }
  }

  return (
    <HomeClient
      session={session}
      documents={personalLibraryData.documents}
      logs={personalLibraryData.logs}
      refundInfo={personalLibraryData.refundInfo}
      pendingUsers={personalLibraryData.pendingUsers}
      approvedSocialUsers={personalLibraryData.approvedSocialUsers}
      contributionSummary={personalLibraryData.contributionSummary}
      contributionDashboard={personalLibraryData.contributionDashboard}
      paymentNotices={personalLibraryData.paymentNotices}
      contentBookmarks={personalLibraryData.contentBookmarks}
      notices={notices}
    />
  );
}
