import { describe, expect, it } from "vitest";

import { buildNewsClientSummary } from "@/lib/news/news-client-summary";
import type { CoopNewsView, FreePostView, NewsUserView } from "@/lib/news/types";

const author: NewsUserView = {
  id: "admin-1",
  name: "관리자",
  loginId: "admin",
  role: "ADMIN",
};

const news = (overrides: Partial<CoopNewsView> = {}): CoopNewsView => ({
  id: "news-1",
  category: "NOTICE",
  title: "공지사항",
  content: "공지 내용",
  createdAt: "2026-06-19T00:00:00.000Z",
  author,
  comments: [],
  ...overrides,
});

const freePost = (overrides: Partial<FreePostView> = {}): FreePostView => ({
  id: "post-1",
  title: "자유글",
  content: "본문",
  postType: "FREE",
  createdAt: "2026-06-19T00:00:00.000Z",
  author,
  comments: [],
  ...overrides,
});

describe("buildNewsClientSummary", () => {
  it("groups news by tab and counts board items", () => {
    const summary = buildNewsClientSummary(
      [
        news({ id: "notice-1", category: "NOTICE" }),
        news({ id: "newsletter-1", category: "WEEKLY_MONTHLY" }),
      ],
      [freePost(), freePost({ id: "post-2" })],
    );

    expect(summary.noticeItems.map((item) => item.id)).toEqual(["notice-1"]);
    expect(summary.newsletterItems.map((item) => item.id)).toEqual(["newsletter-1"]);
    expect(summary.freePostsCount).toBe(2);
    expect(summary.newsletterCount).toBe(1);
  });

  it("prefers a starred notice for the overview card and otherwise falls back to the first notice", () => {
    const starredSummary = buildNewsClientSummary(
      [
        news({ id: "notice-normal", category: "NOTICE", isStarred: false }),
        news({ id: "notice-starred", category: "NOTICE", isStarred: true }),
      ],
      [],
    );
    const fallbackSummary = buildNewsClientSummary(
      [news({ id: "notice-first", category: "NOTICE" })],
      [],
    );

    expect(starredSummary.latestStarredNotice?.id).toBe("notice-starred");
    expect(fallbackSummary.latestStarredNotice?.id).toBe("notice-first");
  });
});
