import { Suspense } from "react";
import type { Metadata } from "next";
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
import { summarizeCommentReactions } from "@/lib/news/comment-reactions";
import { buildFreePostSocialPreview, buildNewsPostSocialPreview } from "@/lib/news/social-preview";
import { siteTitle, socialPreviewImage } from "@/lib/site-metadata";
import type { CoopNewsView, FAQView, FreePostView } from "@/lib/news/types";

type NewsPageProps = {
  searchParams?: Promise<{
    tab?: string | string[];
    post?: string | string[];
    news?: string | string[];
  }>;
};

function getFirstSearchParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export async function generateMetadata({ searchParams }: NewsPageProps = {}): Promise<Metadata> {
  const resolvedSearchParams = await searchParams;
  const requestedTab = getFirstSearchParam(resolvedSearchParams?.tab);
  const requestedFreePostId = getFirstSearchParam(resolvedSearchParams?.post);
  const requestedNewsId = getFirstSearchParam(resolvedSearchParams?.news);

  const defaultMetadata: Metadata = {
    title: `소통마당 | ${siteTitle}`,
    description: "대방동 지역주택조합 공지사항과 자유게시판",
    openGraph: {
      title: `소통마당 | ${siteTitle}`,
      description: "대방동 지역주택조합 공지사항과 자유게시판",
      url: "/news",
      siteName: siteTitle,
      locale: "ko_KR",
      type: "website",
      images: [socialPreviewImage],
    },
    twitter: {
      card: "summary_large_image",
      title: `소통마당 | ${siteTitle}`,
      description: "대방동 지역주택조합 공지사항과 자유게시판",
      images: [socialPreviewImage.url],
    },
  };

  if ((requestedTab === "notice" || requestedTab === "newsletter") && requestedNewsId) {
    const category = requestedTab === "newsletter" ? "WEEKLY_MONTHLY" : "NOTICE";

    try {
      const publicNewsPost = await prisma.coopNews.findFirst({
        where: {
          id: requestedNewsId,
          category,
        },
        select: {
          id: true,
          title: true,
          content: true,
          imagePath: true,
          socialImagePath: true,
        },
      });

      if (!publicNewsPost) {
        return defaultMetadata;
      }

      const preview = buildNewsPostSocialPreview(publicNewsPost);

      return {
        title: `${preview.title} | ${siteTitle}`,
        description: preview.description,
        openGraph: {
          title: preview.title,
          description: preview.description,
          url: `/news?tab=${requestedTab}&news=${encodeURIComponent(publicNewsPost.id)}`,
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
    } catch (e) {
      console.error("Error loading news social metadata:", e);
      return defaultMetadata;
    }
  }

  if (requestedTab !== "free" || !requestedFreePostId) {
    return defaultMetadata;
  }

  try {
    const publicSharedPost = await prisma.freePost.findFirst({
      where: {
        id: requestedFreePostId,
        isPublicShareEnabled: true,
      },
      select: {
        id: true,
        title: true,
        content: true,
        imagePath: true,
        socialImagePath: true,
      },
    });

    if (!publicSharedPost) {
      return defaultMetadata;
    }

    const preview = buildFreePostSocialPreview(publicSharedPost);

    return {
      title: `${preview.title} | ${siteTitle}`,
      description: preview.description,
      openGraph: {
        title: preview.title,
        description: preview.description,
        url: `/news?tab=free&post=${encodeURIComponent(publicSharedPost.id)}`,
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
  } catch (e) {
    console.error("Error loading free-board social metadata:", e);
    return defaultMetadata;
  }
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
            reactions: {
              select: {
                emoji: true,
                userId: true,
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
          reactionSummary: summarizeCommentReactions(comment.reactions, session?.id),
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
              reactions: {
                select: {
                  emoji: true,
                  userId: true,
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
          reactionSummary: summarizeCommentReactions(c.reactions, session.id),
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
