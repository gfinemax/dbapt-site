import { describe, expect, it } from "vitest";
import {
  appendNoticeComment,
  appendNoticeCommentToList,
  removeNoticeComment,
  removeNoticeCommentFromList,
  replaceNoticeComment,
  replaceNoticeCommentInList,
} from "@/lib/news/comment-mutations";
import type { CoopNewsView, NewsCommentView } from "@/lib/news/types";

const author = {
  id: "admin-1",
  name: "관리자",
  signupName: null,
  loginId: "admin",
  role: "ADMIN",
};

function comment(id: string, overrides: Partial<NewsCommentView> = {}): NewsCommentView {
  return {
    id,
    content: `${id} content`,
    createdAt: "2026-06-19T00:00:00.000Z",
    newsId: "notice-1",
    parentId: null,
    author,
    ...overrides,
  };
}

function notice(id: string, comments: NewsCommentView[] = []): CoopNewsView {
  return {
    id,
    category: "NOTICE",
    title: `${id} title`,
    content: `${id} content`,
    createdAt: "2026-06-19T00:00:00.000Z",
    author,
    comments,
  };
}

describe("notice comment mutations", () => {
  it("appends a comment only to the target notice", () => {
    const list = [notice("notice-1"), notice("notice-2")];
    const nextComment = comment("comment-1", { newsId: "notice-1" });

    const next = appendNoticeCommentToList(list, "notice-1", nextComment);

    expect(next[0].comments).toEqual([nextComment]);
    expect(next[1].comments).toEqual([]);
    expect(list[0].comments).toEqual([]);
  });

  it("replaces an edited comment by news id and comment id", () => {
    const oldComment = comment("comment-1", { content: "old" });
    const editedComment = comment("comment-1", { content: "edited", newsId: "notice-1" });
    const list = [notice("notice-1", [oldComment]), notice("notice-2", [comment("other", { newsId: "notice-2" })])];

    const next = replaceNoticeCommentInList(list, editedComment);

    expect(next[0].comments[0].content).toBe("edited");
    expect(next[1].comments[0].id).toBe("other");
  });

  it("removes a comment and its direct replies", () => {
    const root = comment("root");
    const reply = comment("reply", { parentId: "root" });
    const unrelated = comment("unrelated");
    const list = [notice("notice-1", [root, reply, unrelated])];

    const next = removeNoticeCommentFromList(list, "root");

    expect(next[0].comments.map((item) => item.id)).toEqual(["unrelated"]);
  });

  it("returns the active notice unchanged when the mutation belongs to another notice", () => {
    const activeNotice = notice("notice-1", [comment("comment-1")]);
    const foreignComment = comment("foreign", { newsId: "notice-2" });

    expect(appendNoticeComment(activeNotice, "notice-2", foreignComment)).toBe(activeNotice);
    expect(replaceNoticeComment(activeNotice, foreignComment)).toBe(activeNotice);
  });

  it("supports null active notice updates", () => {
    expect(appendNoticeComment(null, "notice-1", comment("comment-1"))).toBeNull();
    expect(replaceNoticeComment(null, comment("comment-1", { newsId: "notice-1" }))).toBeNull();
    expect(removeNoticeComment(null, "comment-1")).toBeNull();
  });
});
