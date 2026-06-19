import { describe, expect, it } from "vitest";

import {
  buildNoticeCommentCreatePayload,
  buildNoticeCommentUpdatePayload,
} from "@/lib/news/notice-comment-payload";

describe("notice comment payload helpers", () => {
  it("builds create payloads for top-level comments and replies", () => {
    expect(
      buildNoticeCommentCreatePayload({
        newsId: "notice-1",
        content: "댓글",
        parentCommentId: undefined,
        isAdmin: false,
        displayAuthorName: "사무국",
      }),
    ).toEqual({
      newsId: "notice-1",
      content: "댓글",
    });

    expect(
      buildNoticeCommentCreatePayload({
        newsId: "notice-1",
        content: "답글",
        parentCommentId: "comment-1",
        isAdmin: true,
        displayAuthorName: "사무국",
      }),
    ).toEqual({
      newsId: "notice-1",
      content: "답글",
      parentCommentId: "comment-1",
      displayAuthorName: "사무국",
    });
  });

  it("builds update payloads with display author only for admins", () => {
    expect(
      buildNoticeCommentUpdatePayload({
        commentId: "comment-1",
        content: "수정 댓글",
        isAdmin: false,
        displayAuthorName: "사무국",
      }),
    ).toEqual({
      commentId: "comment-1",
      content: "수정 댓글",
    });

    expect(
      buildNoticeCommentUpdatePayload({
        commentId: "comment-1",
        content: "수정 댓글",
        isAdmin: true,
        displayAuthorName: "사무국",
      }),
    ).toEqual({
      commentId: "comment-1",
      content: "수정 댓글",
      displayAuthorName: "사무국",
    });
  });
});
