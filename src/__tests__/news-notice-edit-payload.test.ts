import { describe, expect, it } from "vitest";

import { buildNoticeEditPayload } from "@/lib/news/notice-edit-payload";

describe("buildNoticeEditPayload", () => {
  it("builds the PATCH payload for notice edits", () => {
    expect(
      buildNoticeEditPayload({
        id: "notice-1",
        title: "수정 공지",
        content: "<p>수정 본문</p>",
        attachmentPath: "/files/notice.pdf",
        attachmentName: "notice.pdf",
        attachmentSize: 2048,
        isStarred: true,
        displayAuthorName: "사무국",
        registeredAt: "2026-06-21T09:30",
      }),
    ).toEqual({
      id: "notice-1",
      title: "수정 공지",
      content: "<p>수정 본문</p>",
      category: "NOTICE",
      registeredAt: "2026-06-21T09:30",
      attachmentPath: "/files/notice.pdf",
      attachmentName: "notice.pdf",
      attachmentSize: 2048,
      isStarred: true,
      displayAuthorName: "사무국",
    });
  });

  it("keeps null attachment fields when an attachment is removed or absent", () => {
    expect(
      buildNoticeEditPayload({
        id: "notice-1",
        title: "첨부 없는 공지",
        content: "<p>본문</p>",
        attachmentPath: null,
        attachmentName: null,
        attachmentSize: null,
        isStarred: false,
        displayAuthorName: "운영자",
      }),
    ).toMatchObject({
      attachmentPath: null,
      attachmentName: null,
      attachmentSize: null,
    });
  });
});
