import { describe, expect, it } from "vitest";

import {
  buildFreeBoardCommentCreatePayload,
  buildFreeBoardDeleteUrl,
  buildFreeBoardPostCreatePayload,
  buildFreeBoardPostUpdatePayload,
} from "@/lib/news/free-board-api";

describe("free board API helpers", () => {
  it("builds post create and update payloads", () => {
    expect(
      buildFreeBoardPostCreatePayload({
        title: "새 글",
        content: "<p>본문</p>",
        postType: "FREE",
        isStarred: false,
        isAdmin: false,
        displayAuthorName: "사무국",
      }),
    ).toEqual({
      title: "새 글",
      content: "<p>본문</p>",
      postType: "FREE",
      isStarred: false,
    });

    expect(
      buildFreeBoardPostUpdatePayload({
        postId: "post-1",
        title: "수정 글",
        content: "<p>수정 본문</p>",
        postType: "NOTICE",
        isStarred: true,
        isAdmin: true,
        displayAuthorName: "사무국",
      }),
    ).toEqual({
      postId: "post-1",
      title: "수정 글",
      content: "<p>수정 본문</p>",
      postType: "NOTICE",
      isStarred: true,
      displayAuthorName: "사무국",
    });
  });

  it("builds comment create payloads for members and admin replies", () => {
    expect(
      buildFreeBoardCommentCreatePayload({
        postId: "post-1",
        content: "댓글",
        parentCommentId: undefined,
        isAdmin: false,
        displayAuthorName: "사무국",
      }),
    ).toEqual({
      postId: "post-1",
      content: "댓글",
    });

    expect(
      buildFreeBoardCommentCreatePayload({
        postId: "post-1",
        content: "답글",
        parentCommentId: "comment-1",
        isAdmin: true,
        displayAuthorName: "사무국",
      }),
    ).toEqual({
      postId: "post-1",
      content: "답글",
      parentCommentId: "comment-1",
      displayAuthorName: "사무국",
    });
  });

  it("builds delete URLs for posts and comments", () => {
    expect(buildFreeBoardDeleteUrl({ postId: "post-1" })).toBe("/api/news/free?postId=post-1");
    expect(buildFreeBoardDeleteUrl({ commentId: "comment-1" })).toBe("/api/news/free?commentId=comment-1");
    expect(buildFreeBoardDeleteUrl({})).toBe("/api/news/free");
  });

  it("encodes delete query parameters", () => {
    expect(buildFreeBoardDeleteUrl({ postId: "post 1" })).toBe("/api/news/free?postId=post+1");
  });
});
