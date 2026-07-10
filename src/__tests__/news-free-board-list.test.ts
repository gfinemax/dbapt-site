import { describe, expect, it } from "vitest";

import { buildFreeBoardPostList } from "@/lib/news/free-board-list";
import type { FreePostView, NewsUserView } from "@/lib/news/types";

const author: NewsUserView = {
  id: "user-1",
  name: "홍길동",
  loginId: "hong",
  role: "MEMBER",
};

const post = (overrides: Partial<FreePostView> = {}): FreePostView => ({
  id: "post-1",
  title: "자유게시판 실제 글",
  content: "<p>조합원 의견 본문입니다.</p>",
  postType: "FREE",
  isStarred: false,
  createdAt: "2026-06-19T00:00:00.000Z",
  registeredAt: "2026-06-20T01:30:00.000Z",
  author,
  comments: [],
  ...overrides,
});

describe("buildFreeBoardPostList", () => {
  it("normalizes posts and builds one-level comment trees", () => {
    const items = buildFreeBoardPostList(
      [
        post({
          comments: [
            {
              id: "comment-1",
              content: "부모 댓글",
              createdAt: "2026-06-19T00:00:00.000Z",
              parentId: null,
              author,
            },
            {
              id: "reply-1",
              content: "답글",
              createdAt: "2026-06-19T00:01:00.000Z",
              parentId: "comment-1",
              author,
            },
          ],
        }),
      ],
      "ALL",
      "",
    );

    expect(items[0]).toMatchObject({
      id: "post-1",
      postType: "FREE",
      commentCount: 2,
      isReal: true,
    });
    expect(items[0]?.comments[0]?.replies[0]?.id).toBe("reply-1");
  });

  it("filters by post type and searches plain text content", () => {
    const items = buildFreeBoardPostList(
      [
        post({ id: "free-post", title: "일반 글", postType: "FREE" }),
        post({
          id: "question-post",
          title: "질문 글",
          content: "<p>분담금 <strong>납부</strong> 일정 질문입니다.</p>",
          postType: "QUESTION",
        }),
      ],
      "QUESTION",
      "납부 일정",
    );

    expect(items.map((item) => item.id)).toEqual(["question-post"]);
  });

  it("normalizes unknown post types to FREE", () => {
    const items = buildFreeBoardPostList(
      [post({ postType: "UNKNOWN" })],
      "FREE",
      "",
    );

    expect(items[0]?.postType).toBe("FREE");
  });

  it("keeps free-board attachment metadata and uses the registered date for display and editing", () => {
    const items = buildFreeBoardPostList(
      [
        post({
          attachmentPath: "/uploads/free-agenda.pdf",
          attachmentName: "free-agenda.pdf",
          attachmentSize: 4096,
        }),
      ],
      "ALL",
      "",
    );

    expect(items[0]).toMatchObject({
      registeredAt: "2026-06-20 10:30",
      registeredDate: "2026-06-20",
      registeredAtRaw: "2026-06-20T01:30:00.000Z",
      attachmentPath: "/uploads/free-agenda.pdf",
      attachmentName: "free-agenda.pdf",
      attachmentSize: 4096,
    });
    expect(items[0]).not.toHaveProperty("createdAtRaw");
  });
});
