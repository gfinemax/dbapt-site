import type { CoopNewsView, FreePostView } from "@/lib/news/types";
import { buildDevelopmentLogList } from "./development-log";

export type NewsClientSummary = {
  noticeItems: CoopNewsView[];
  newsletterItems: CoopNewsView[];
  developmentLogItems: CoopNewsView[];
  adminDevelopmentLogItems: CoopNewsView[];
  latestStarredNotice: CoopNewsView | null;
  freePostsCount: number;
  newsletterCount: number;
  developmentLogCount: number;
};

export function buildNewsClientSummary(
  newsList: readonly CoopNewsView[],
  freePosts: readonly FreePostView[],
): NewsClientSummary {
  const noticeItems = newsList.filter((item) => item.category === "NOTICE");
  const newsletterItems = newsList.filter((item) => item.category === "WEEKLY_MONTHLY");
  const developmentLogItems = buildDevelopmentLogList(newsList, { includeAdminOnly: false });
  const adminDevelopmentLogItems = buildDevelopmentLogList(newsList, { includeAdminOnly: true });

  return {
    noticeItems,
    newsletterItems,
    developmentLogItems,
    adminDevelopmentLogItems,
    latestStarredNotice: noticeItems.find((notice) => notice.isStarred) || noticeItems[0] || null,
    freePostsCount: freePosts.length,
    newsletterCount: newsletterItems.length,
    developmentLogCount: developmentLogItems.length,
  };
}
