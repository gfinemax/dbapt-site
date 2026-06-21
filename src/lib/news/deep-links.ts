import type { CoopNewsView } from "@/lib/news/types";

export type NewsTabId = "notice" | "free" | "faq" | "newsletter" | "development";

const NEWS_TAB_IDS: readonly NewsTabId[] = ["notice", "free", "faq", "newsletter", "development"];

type SearchParamsReader = Pick<URLSearchParams, "get">;

export function getNewsTabFromSearchParams(searchParams: SearchParamsReader): NewsTabId | null {
  const tab = searchParams.get("tab");
  return NEWS_TAB_IDS.includes(tab as NewsTabId) ? (tab as NewsTabId) : null;
}

export function findNoticeFromSearchParams(
  newsList: readonly CoopNewsView[],
  searchParams: SearchParamsReader,
): CoopNewsView | null {
  const noticeId = searchParams.get("news");
  if (!noticeId) return null;

  return newsList.find((notice) => notice.id === noticeId && notice.category === "NOTICE") || null;
}

export function findNewsletterFromSearchParams(
  newsList: readonly CoopNewsView[],
  searchParams: SearchParamsReader,
): CoopNewsView | null {
  const newsId = searchParams.get("news");
  if (!newsId) return null;

  return newsList.find((news) => news.id === newsId && news.category === "WEEKLY_MONTHLY") || null;
}
