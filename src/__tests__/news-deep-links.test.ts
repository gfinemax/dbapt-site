import { describe, expect, it } from "vitest";

import {
  findNewsletterFromSearchParams,
  findNoticeFromSearchParams,
  getNewsTabFromSearchParams,
} from "@/lib/news/deep-links";
import type { CoopNewsView, NewsUserView } from "@/lib/news/types";

const author: NewsUserView = {
  id: "admin-1",
  name: "관리자",
  loginId: "admin",
  role: "ADMIN",
};

const news = (overrides: Partial<CoopNewsView> = {}): CoopNewsView => ({
  id: "notice-1",
  category: "NOTICE",
  title: "공지사항",
  content: "공지 내용",
  createdAt: "2026-06-19T00:00:00.000Z",
  author,
  comments: [],
  ...overrides,
});

describe("news deep-link helpers", () => {
  it("accepts only supported tab query values", () => {
    expect(getNewsTabFromSearchParams(new URLSearchParams("tab=free"))).toBe("free");
    expect(getNewsTabFromSearchParams(new URLSearchParams("tab=development"))).toBe("development");
    expect(getNewsTabFromSearchParams(new URLSearchParams("tab=unknown"))).toBeNull();
    expect(getNewsTabFromSearchParams(new URLSearchParams(""))).toBeNull();
  });

  it("finds only notice items from the news query", () => {
    const params = new URLSearchParams("news=notice-1");

    expect(
      findNoticeFromSearchParams(
        [
          news({ id: "notice-1", category: "NOTICE" }),
          news({ id: "newsletter-1", category: "WEEKLY_MONTHLY" }),
        ],
        params,
      )?.id,
    ).toBe("notice-1");
  });

  it("ignores non-notice items that happen to match the news query", () => {
    expect(
      findNoticeFromSearchParams(
        [news({ id: "newsletter-1", category: "WEEKLY_MONTHLY" })],
        new URLSearchParams("news=newsletter-1"),
      ),
    ).toBeNull();
  });

  it("finds only newsletter items from the news query", () => {
    const params = new URLSearchParams("news=newsletter-1");

    expect(
      findNewsletterFromSearchParams(
        [
          news({ id: "notice-1", category: "NOTICE" }),
          news({ id: "newsletter-1", category: "WEEKLY_MONTHLY" }),
        ],
        params,
      )?.id,
    ).toBe("newsletter-1");
  });
});
