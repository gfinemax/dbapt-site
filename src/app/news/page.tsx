import { Suspense } from "react";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  emptyPersonalLibraryData,
  loadPersonalLibraryData,
  type PersonalLibrarySession,
} from "@/lib/personal-library-data";
import { NewsClient } from "@/components/news/news-client";
import { PersonalLibraryDrawerHost } from "@/components/portal/personal-library-drawer-host";
import { getUserDisplayName } from "@/lib/user-display-name";
import type { CoopNewsView, FAQView, FreePostView } from "@/lib/news/types";

type NewsPageProps = {
  searchParams?: Promise<{
    tab?: string | string[];
    post?: string | string[];
  }>;
};

function getFirstSearchParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function NewsPage({ searchParams }: NewsPageProps = {}) {
  const resolvedSearchParams = await searchParams;
  const requestedTab = getFirstSearchParam(resolvedSearchParams?.tab);
  const requestedFreePostId = getFirstSearchParam(resolvedSearchParams?.post);
  const session = (await getSession()) as PersonalLibrarySession | null;

  let newsList: CoopNewsView[] = [];
  let freePosts: FreePostView[] = [];
  let faqs: FAQView[] = [];
  let personalLibraryData = emptyPersonalLibraryData();

  try {
    // 1. 공지사항 및 조합뉴스(주/월간소식) 조회 (Public)
    const newsData = await prisma.coopNews.findMany({
      include: {
        author: {
          select: {
            id: true,
            name: true,
            signupName: true,
            loginId: true,
            role: true,
          },
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                signupName: true,
                loginId: true,
                role: true,
              },
            },
          },
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { registeredAt: "desc" },
    });

    newsList = newsData.map((item) => ({
      ...item,
      registeredAt: item.registeredAt.toISOString(),
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
      author: {
        id: item.author.id,
        name: item.displayAuthorName || item.author.name || "관리자",
        signupName: item.author.signupName,
        loginId: item.author.loginId || "admin",
        role: item.author.role,
      },
      comments: item.comments.map((comment) => ({
        ...comment,
        createdAt: comment.createdAt.toISOString(),
        author: {
          id: comment.author.id,
          name: getUserDisplayName(comment.author),
          signupName: comment.author.signupName,
          loginId: comment.author.loginId || "social",
          role: comment.author.role,
        },
      })),
      attachmentPath: item.attachmentPath,
      attachmentName: item.attachmentName,
      attachmentSize: item.attachmentSize,
    }));

    // 2. 로그인 세션이 있을 경우 자유게시판 및 FAQ 수집 (MEMBER, ADMIN, REFUND 전용)
    if (session) {
      const postsData = await prisma.freePost.findMany({
        include: {
          author: {
            select: {
              id: true,
              name: true,
              signupName: true,
              loginId: true,
              role: true,
            },
          },
          comments: {
            include: {
              author: {
                select: {
                  id: true,
                  name: true,
                  signupName: true,
                  loginId: true,
                  role: true,
                },
              },
            },
            orderBy: { createdAt: "asc" },
          },
        },
        orderBy: { registeredAt: "desc" },
      });

      freePosts = postsData.map((post) => ({
        ...post,
        registeredAt: post.registeredAt.toISOString(),
        createdAt: post.createdAt.toISOString(),
        updatedAt: post.updatedAt.toISOString(),
        postType: post.postType || "FREE",
        author: {
          id: post.author.id,
          name: post.author.name || "조합원",
          signupName: post.author.signupName,
          loginId: post.author.loginId || "social",
          role: post.author.role,
          displayAuthorName: post.displayAuthorName,
        },
        comments: post.comments.map((c) => ({
          ...c,
          createdAt: c.createdAt.toISOString(),
          author: {
            id: c.author.id,
            name: c.author.name || "조합원",
            signupName: c.author.signupName,
            loginId: c.author.loginId || "social",
            role: c.author.role,
            displayAuthorName: c.displayAuthorName,
          },
        })),
        isPublicShareEnabled: post.isPublicShareEnabled,
        publicShareEnabledAt: post.publicShareEnabledAt?.toISOString() ?? null,
      }));

      const faqData = await prisma.fAQ.findMany({
        orderBy: { createdAt: "desc" },
      });

      faqs = faqData.map((faq) => ({
        ...faq,
        createdAt: faq.createdAt.toISOString(),
      }));
    } else if (requestedTab === "free" && requestedFreePostId) {
      const publicSharedPost = await prisma.freePost.findFirst({
        where: {
          id: requestedFreePostId,
          isPublicShareEnabled: true,
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              signupName: true,
              loginId: true,
              role: true,
            },
          },
        },
      });

      if (publicSharedPost) {
        const publicAuthorName = publicSharedPost.displayAuthorName || "조합원";
        freePosts = [{
          ...publicSharedPost,
          registeredAt: publicSharedPost.registeredAt.toISOString(),
          createdAt: publicSharedPost.createdAt.toISOString(),
          updatedAt: publicSharedPost.updatedAt.toISOString(),
          postType: publicSharedPost.postType || "FREE",
          author: {
            id: publicSharedPost.author.id,
            name: publicAuthorName,
            signupName: publicAuthorName,
            loginId: null,
            role: publicSharedPost.author.role,
            displayAuthorName: publicSharedPost.displayAuthorName,
          },
          comments: [],
          isPublicShareEnabled: publicSharedPost.isPublicShareEnabled,
          publicShareEnabledAt: publicSharedPost.publicShareEnabledAt?.toISOString() ?? null,
        }];
      }
    }
  } catch (e) {
    console.error("Error loading news page server data:", e);
  }

  if (session) {
    try {
      personalLibraryData = await loadPersonalLibraryData(session);
    } catch (e) {
      console.error("Error loading news page personal library data:", e);
    }
  }

  if (personalLibraryData.contentBookmarks.length > 0) {
    const bookmarkedCoopNewsIds = new Set(
      personalLibraryData.contentBookmarks
        .filter((bookmark) => bookmark.targetType === "COOP_NEWS")
        .map((bookmark) => bookmark.targetId),
    );
    const bookmarkedFreePostIds = new Set(
      personalLibraryData.contentBookmarks
        .filter((bookmark) => bookmark.targetType === "FREE_POST")
        .map((bookmark) => bookmark.targetId),
    );
    newsList = newsList.map((item) => ({
      ...item,
      isBookmarkedByCurrentUser: bookmarkedCoopNewsIds.has(item.id),
    }));
    freePosts = freePosts.map((post) => ({
      ...post,
      isBookmarkedByCurrentUser: bookmarkedFreePostIds.has(post.id),
    }));
  }

  return (
    <PersonalLibraryDrawerHost session={session} {...personalLibraryData}>
      <main className="flex-1 animate-page-in min-h-screen bg-warm-canvas">
        <Suspense fallback={
          <div className="w-full min-h-[400px] flex items-center justify-center bg-warm-canvas">
            <div className="text-xs font-bold text-graphite/60 animate-pulse">정보를 로드하고 있습니다...</div>
          </div>
        }>
          <NewsClient
            session={session}
            initialNewsList={newsList}
            initialFreePosts={freePosts}
            initialFaqs={faqs}
          />
        </Suspense>
      </main>
    </PersonalLibraryDrawerHost>
  );
}
