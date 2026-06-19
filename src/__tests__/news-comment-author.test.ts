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
      },
    }))).toBe("조합원");
  });
});
