import { describe, expect, it } from "vitest";
import { getNoticeCommentAuthorName } from "@/lib/news/comment-author";
import type { NewsCommentView } from "@/lib/news/types";

function comment(overrides: Partial<NewsCommentView> = {}): NewsCommentView {
  return {
    id: "comment-1",
    content: "댓글",
    createdAt: "2026-06-19T00:00:00.000Z",
    parentId: null,
    author: {
      id: "user-1",
      name: "홍길동",
      signupName: null,
      loginId: "member1",
      role: "MEMBER",
      memberType: "REGULAR",
    },
    ...overrides,
  };
}

describe("getNoticeCommentAuthorName", () => {
  it("uses the configured public display name for admin comments", () => {
    expect(getNoticeCommentAuthorName(comment({
      displayAuthorName: "사무국",
      author: {
        id: "admin-1",
        name: "관리자",
        signupName: null,
        loginId: "admin",
        role: "ADMIN",
        memberType: "ASSOCIATE",
      },
    }))).toBe("사무국");
  });

  it("falls back to operator for admin comments without a configured name", () => {
    expect(getNoticeCommentAuthorName(comment({
      author: {
        id: "admin-1",
        name: "관리자",
        signupName: null,
        loginId: "admin",
        role: "ADMIN",
        memberType: "ASSOCIATE",
      },
    }))).toBe("운영자");
  });

  it("uses the member name for non-admin comments", () => {
    expect(getNoticeCommentAuthorName(comment())).toBe("홍길동");
  });

  it("falls back to a generic member label when the member name is absent", () => {
    expect(getNoticeCommentAuthorName(comment({
      author: {
        id: "user-1",
        name: null,
        signupName: null,
        loginId: "member1",
        role: "MEMBER",
        memberType: "REGULAR",
      },
    }))).toBe("조합원");
  });

  it("marks refund and related-party comment authors", () => {
    expect(getNoticeCommentAuthorName(comment({
      author: {
        id: "refund-1",
        name: "박정산",
        signupName: null,
        loginId: "refund1",
        role: "REFUND",
        memberType: "REFUND",
      },
    }))).toBe("박정산 (환불)");

    expect(getNoticeCommentAuthorName(comment({
      author: {
        id: "associate-1",
        name: "외부관계자",
        signupName: null,
        loginId: "associate1",
        role: "ASSOCIATE",
        memberType: "ASSOCIATE",
      },
    }))).toBe("외부관계자 (관계자)");
  });
});
