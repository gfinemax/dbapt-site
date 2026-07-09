import { describe, expect, it } from "vitest";
import {
  buildActiveEditedNoticeView,
  buildEditedNoticeView,
  mergeNoticeRefresh,
  replaceNoticeInList,
} from "@/lib/news/notice-mutations";
import type { CoopNewsView, NewsUserView } from "@/lib/news/types";

const admin: NewsUserView = {
  id: "admin-1",
  name: "관리자",
  signupName: null,
  loginId: "admin",
  role: "ADMIN",
};

function notice(id: string, category = "NOTICE"): CoopNewsView {
  return {
    id,
    category,
    title: `${id} title`,
    content: `${id} content`,
    createdAt: "2026-06-19T00:00:00.000Z",
    updatedAt: "2026-06-19T00:00:00.000Z",
    author: admin,
    comments: [],
  };
}

describe("notice mutations", () => {
  it("merges refreshed notice rows before preserving non-notice rows", () => {
    const refreshed = [notice("fresh-notice")];
    const previous = [notice("old-notice"), notice("newsletter", "WEEKLY_MONTHLY")];

    const next = mergeNoticeRefresh(previous, refreshed);

    expect(next.map((item) => item.id)).toEqual(["fresh-notice", "newsletter"]);
  });

  it("replaces a notice in the current list", () => {
    const updated = { ...notice("notice-1"), title: "수정된 공지" };

    const next = replaceNoticeInList([notice("notice-1"), notice("notice-2")], updated);

    expect(next.map((item) => item.title)).toEqual(["수정된 공지", "notice-2 title"]);
  });

  it("builds an edited notice view with display author fallback", () => {
    const fallback = notice("notice-1");
    const edited = buildEditedNoticeView(
      {
        id: "notice-1",
        category: "NOTICE",
        title: "수정된 제목",
        content: "수정된 본문",
        createdAt: "2026-06-18T12:00:00.000Z",
        updatedAt: "2026-06-19T12:00:00.000Z",
        displayAuthorName: "사무국",
        author: { role: "ADMIN" },
      },
      fallback,
    );

    expect(edited.title).toBe("수정된 제목");
    expect(edited.author.name).toBe("사무국");
    expect(edited.author.id).toBe("admin-1");
    expect(edited.comments).toEqual([]);
  });

  it("formats the active edited notice date and marks it as real", () => {
    const edited = buildActiveEditedNoticeView(
      { ...notice("notice-1"), createdAt: "2026-06-18T12:00:00.000Z" },
      "운영자",
    );

    expect(edited.createdAt).toBe("2026.06.18");
    expect(edited.displayAuthorName).toBe("운영자");
    expect(edited.isReal).toBe(true);
  });

  it("formats active edited notice registeredAt with the Korea calendar date", () => {
    const edited = buildActiveEditedNoticeView(
      {
        ...notice("notice-1"),
        registeredAt: "2026-07-08T17:26:00.000Z",
      },
      "운영자",
    );

    expect(edited.createdAt).toBe("2026.07.09");
  });
});
