import { describe, expect, it } from "vitest";

import { buildNoticeBoardList } from "@/lib/news/notice-board-list";
import type { CoopNewsView, NewsUserView } from "@/lib/news/types";

const author: NewsUserView = {
  id: "admin-1",
  name: "관리자",
  loginId: "admin",
  role: "ADMIN",
  memberType: "ASSOCIATE",
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

  it("uses registeredAt as the visible and sortable notice date", () => {
    const items = buildNoticeBoardList(
      [
        notice({
          id: "created-newer",
          title: "작성일은 최신",
          createdAt: "2026-06-22T00:00:00.000Z",
          registeredAt: "2026-06-18T00:00:00.000Z",
        }),
        notice({
          id: "registered-newer",
          title: "등록일은 최신",
          createdAt: "2026-06-19T00:00:00.000Z",
          registeredAt: "2026-06-21T00:00:00.000Z",
        }),
      ],
      "",
    );

    expect(items.map((item) => item.id)).toEqual(["registered-newer", "created-newer"]);
    expect(items[0].createdAt).toBe("2026.06.21");
  });

  it("formats registeredAt with the Korea calendar date", () => {
    const items = buildNoticeBoardList(
      [
        notice({
          id: "midnight-korea",
          registeredAt: "2026-07-08T17:26:00.000Z",
        }),
      ],
      "",
    );

    expect(items[0].createdAt).toBe("2026.07.09");
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

  it("formats notice author names with content author policy", () => {
    const items = buildNoticeBoardList(
      [
        notice({
          id: "refund-notice",
          author: {
            id: "refund-1",
            name: "박정산",
            signupName: null,
            loginId: "refund1",
            role: "REFUND",
            memberType: "REFUND",
          },
        }),
        notice({
          id: "admin-notice",
          displayAuthorName: "사무국",
          author,
        }),
      ],
      "",
    );

    expect(items.find((item) => item.id === "refund-notice")?.author.name).toBe("박정산 (환불)");
    expect(items.find((item) => item.id === "admin-notice")?.author.name).toBe("사무국");
  });
});
