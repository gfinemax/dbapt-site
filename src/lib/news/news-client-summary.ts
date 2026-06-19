import type { CoopNewsView, FreePostView } from "@/lib/news/types";

export type NewsClientSummary = {
  noticeItems: CoopNewsView[];
  newsletterItems: CoopNewsView[];
  latestStarredNotice: CoopNewsView | null;
  freePostsCount: number;
  newsletterCount: number;
};

export function buildNewsClientSummary(
  newsList: readonly CoopNewsView[],
  freePosts: readonly FreePostView[],
): NewsClientSummary {
  const noticeItems = newsList.filter((item) => item.category === "NOTICE");
  const newsletterItems = newsList.filter((item) => item.category === "WEEKLY_MONTHLY");

  return {
    noticeItems,
    newsletterItems,
    latestStarredNotice: noticeItems.find((notice) => notice.isStarred) || noticeItems[0] || null,
    freePostsCount: freePosts.length,
    newsletterCount: newsletterItems.length,
  };
}
