import { describe, expect, it } from "vitest";

import { mergeNewsCategoryRefresh } from "@/lib/news/category-refresh";
import type { CoopNewsView, NewsUserView } from "@/lib/news/types";

const author: NewsUserView = {
  id: "admin-1",
  name: "관리자",
  loginId: "admin",
  role: "ADMIN",
};

const news = (id: string, category: string): CoopNewsView => ({
  id,
  category,
  title: id,
  content: "content",
  createdAt: "2026-06-19T00:00:00.000Z",
  author,
  comments: [],
});

describe("mergeNewsCategoryRefresh", () => {
  it("replaces only the refreshed category and preserves other categories", () => {
    const next = mergeNewsCategoryRefresh(
      [
        news("old-notice", "NOTICE"),
        news("old-newsletter", "WEEKLY_MONTHLY"),
        news("other", "OTHER"),
      ],
      [news("new-newsletter", "WEEKLY_MONTHLY")],
      "WEEKLY_MONTHLY",
    );

    expect(next.map((item) => item.id)).toEqual(["new-newsletter", "old-notice", "other"]);
  });
});
