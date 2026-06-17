/* eslint-disable @typescript-eslint/no-explicit-any */

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

export default async function NewsPage() {
  const session = (await getSession()) as PersonalLibrarySession | null;

  let newsList: any[] = [];
  let freePosts: any[] = [];
  let faqs: any[] = [];
  let personalLibraryData = emptyPersonalLibraryData();

  try {
    // 1. 공지사항 및 조합뉴스(주/월간소식) 조회 (Public)
    const newsData = await prisma.coopNews.findMany({
      include: {
        author: {
          select: {
            id: true,
            name: true,
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
                loginId: true,
                role: true,
              },
            },
          },
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    newsList = newsData.map((item) => ({
      ...item,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
      author: {
        id: item.author.id,
        name: item.displayAuthorName || item.author.name || "관리자",
        loginId: item.author.loginId || "admin",
        role: item.author.role,
      },
      comments: item.comments.map((comment) => ({
        ...comment,
        createdAt: comment.createdAt.toISOString(),
        author: {
          id: comment.author.id,
          name: comment.author.name || "조합원",
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
              name: true,
              loginId: true,
              role: true,
            },
          },
          comments: {
            include: {
              author: {
                select: {
                  name: true,
                  loginId: true,
                  role: true,
                },
              },
            },
            orderBy: { createdAt: "asc" },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      freePosts = postsData.map((post) => ({
        ...post,
        createdAt: post.createdAt.toISOString(),
        updatedAt: post.updatedAt.toISOString(),
        author: {
          name: post.author.name || "조합원",
          loginId: post.author.loginId || "social",
          role: post.author.role,
        },
        comments: post.comments.map((c) => ({
          ...c,
          createdAt: c.createdAt.toISOString(),
          author: {
            name: c.author.name || "조합원",
            loginId: c.author.loginId || "social",
            role: c.author.role,
          },
        })),
      }));

      const faqData = await prisma.fAQ.findMany({
        orderBy: { createdAt: "desc" },
      });

      faqs = faqData.map((faq) => ({
        ...faq,
        createdAt: faq.createdAt.toISOString(),
      }));
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
