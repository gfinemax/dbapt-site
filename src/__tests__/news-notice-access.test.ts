import { describe, expect, it } from "vitest";

import {
  buildNoticeCommentEditDraft,
  canCommentOnNotice,
  canEditNotice,
  canMutateNoticeComment,
} from "@/lib/news/notice-access";
import type { CoopNewsView, NewsCommentView, NewsSessionView, NewsUserView } from "@/lib/news/types";

const member: NewsUserView = {
  id: "member-1",
  name: "홍길동",
  loginId: "hong",
  role: "MEMBER",
};

const session = (overrides: Partial<NewsSessionView> = {}): NewsSessionView => ({
  id: "member-1",
  loginId: "hong",
  name: "홍길동",
  role: "MEMBER",
  ...overrides,
});

const notice = (overrides: Partial<CoopNewsView> = {}): CoopNewsView => ({
  id: "notice-1",
  category: "NOTICE",
  title: "공지",
  content: "본문",
  createdAt: "2026-06-19T00:00:00.000Z",
  author: member,
  comments: [],
  ...overrides,
});

const comment = (overrides: Partial<NewsCommentView> = {}): NewsCommentView => ({
  id: "comment-1",
  content: "댓글",
  createdAt: "2026-06-19T00:00:00.000Z",
  parentId: null,
  author: member,
  ...overrides,
});

describe("notice access helpers", () => {
  it("allows admins to edit real notices but never mock notices", () => {
    expect(canEditNotice(notice(), true)).toBe(true);
    expect(canEditNotice(notice({ id: "mock-notice-1" }), true)).toBe(false);
    expect(canEditNotice(notice(), false)).toBe(false);
  });

  it("allows comments only on real notices", () => {
    expect(canCommentOnNotice(notice())).toBe(true);
    expect(canCommentOnNotice(notice({ id: "mock-notice-1" }))).toBe(false);
    expect(canCommentOnNotice(null)).toBe(false);
  });

  it("allows admins or the original author to mutate a notice comment", () => {
    expect(canMutateNoticeComment(comment(), session({ role: "ADMIN" }))).toBe(true);
    expect(canMutateNoticeComment(comment(), session({ id: "member-1" }))).toBe(true);
    expect(canMutateNoticeComment(comment(), session({ id: "member-2" }))).toBe(false);
    expect(canMutateNoticeComment(comment(), null)).toBe(false);
  });

  it("builds comment edit drafts with safe display author fallback", () => {
    expect(buildNoticeCommentEditDraft(comment({ displayAuthorName: "사무국" }))).toEqual({
      id: "comment-1",
      content: "댓글",
      displayAuthorName: "사무국",
    });
    expect(buildNoticeCommentEditDraft(comment({ displayAuthorName: "외부 작성자" })).displayAuthorName).toBe("운영자");
  });
});
