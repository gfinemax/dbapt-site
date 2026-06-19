import { describe, expect, it } from "vitest";
import { buildNewsletterList } from "@/lib/news/newsletter-list";
import type { CoopNewsView, NewsUserView } from "@/lib/news/types";

const author: NewsUserView = {
  id: "admin-1",
  name: "사무국",
  signupName: null,
  loginId: "admin",
  role: "ADMIN",
};

function newsletter(id: string, title = "2026년 6월 월간 소식"): CoopNewsView {
  return {
    id,
    category: "WEEKLY_MONTHLY",
    title,
    content: "조합 월간 소식 본문",
    viewCount: 7,
    isStarred: true,
    imagePath: "/uploads/newsletter.png",
    attachmentPath: "/uploads/newsletter.pdf",
    attachmentName: "newsletter.pdf",
    attachmentSize: 1234,
    createdAt: "2026-06-19T00:00:00.000Z",
    updatedAt: "2026-06-19T00:00:00.000Z",
    author,
    comments: [],
  };
}

describe("buildNewsletterList", () => {
  it("normalizes real newsletter rows and appends the upcoming preview", () => {
    const items = buildNewsletterList([newsletter("newsletter-1")], "");

    expect(items).toHaveLength(2);
    expect(items[0]).toMatchObject({
      id: "newsletter-1",
      createdAt: "2026.06.19",
      isReal: true,
      isPreview: false,
      author: { name: "사무국" },
    });
    expect(items[1]).toMatchObject({
      isReal: false,
      isPreview: true,
    });
  });

  it("filters real and preview rows by title", () => {
    const items = buildNewsletterList([
      newsletter("newsletter-1", "현장 브리핑"),
      newsletter("newsletter-2", "월간 회계 보고"),
    ], "회계");

    expect(items.map((item) => item.id)).toEqual(["newsletter-2"]);
  });

  it("keeps the upcoming preview searchable", () => {
    const items = buildNewsletterList([], "오픈 예정");

    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({
      id: "upcoming-newsletter-2026-07-issue-1",
      isPreview: true,
    });
  });
});
