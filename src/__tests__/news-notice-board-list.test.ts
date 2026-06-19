import { describe, expect, it } from "vitest";

import { buildNoticeBoardList } from "@/lib/news/notice-board-list";
import type { CoopNewsView, NewsUserView } from "@/lib/news/types";

const author: NewsUserView = {
  id: "admin-1",
  name: "관리자",
  loginId: "admin",
  role: "ADMIN",
};

const notice = (overrides: Partial<CoopNewsView> = {}): CoopNewsView => ({
  id: "notice-1",
  category: "NOTICE",
  title: "공지사항",
  content: "공지 내용",
  createdAt: "2026-06-19T00:00:00.000Z",
  author,
  comments: [],
  ...overrides,
});

describe("buildNoticeBoardList", () => {
  it("formats notices for the board and keeps important notices first", () => {
    const items = buildNoticeBoardList(
      [
        notice({ id: "normal-new", title: "최신 일반", createdAt: "2026-06-20T00:00:00.000Z" }),
        notice({ id: "starred-old", title: "중요 이전", createdAt: "2026-06-18T00:00:00.000Z", isStarred: true }),
      ],
      "",
    );

    expect(items.map((item) => item.id)).toEqual(["starred-old", "normal-new"]);
    expect(items[0]).toMatchObject({
      createdAt: "2026.06.18",
      isReal: true,
    });
  });

  it("searches by notice title after normalization", () => {
    const items = buildNoticeBoardList(
      [
        notice({ id: "target", title: "분담금 납부 안내" }),
        notice({ id: "other", title: "조합 일정 안내" }),
      ],
      "분담금",
    );

    expect(items.map((item) => item.id)).toEqual(["target"]);
  });
});
