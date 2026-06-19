import { describe, expect, it } from "vitest";

import { buildNoticeEditDraft } from "@/lib/news/notice-edit-draft";
import type { CoopNewsView, NewsUserView } from "@/lib/news/types";

const author: NewsUserView = {
  id: "admin-1",
  name: "관리자",
  loginId: "admin",
  role: "ADMIN",
};

const notice = (overrides: Partial<CoopNewsView> = {}): CoopNewsView => ({
  id: "notice-1",
  category: "NOTICE",
  title: "공지사항",
  content: "<p>본문</p>",
  createdAt: "2026-06-19T00:00:00.000Z",
  author,
  comments: [],
  ...overrides,
});

describe("buildNoticeEditDraft", () => {
  it("copies editable notice fields into a draft", () => {
    expect(
      buildNoticeEditDraft(
        notice({
          title: "수정 제목",
          attachmentPath: "/files/a.pdf",
          attachmentName: "a.pdf",
          attachmentSize: 1234,
          isStarred: true,
          displayAuthorName: "사무국",
        }),
      ),
    ).toMatchObject({
      title: "수정 제목",
      content: "<p>본문</p>",
      attachmentPath: "/files/a.pdf",
      attachmentName: "a.pdf",
      attachmentSize: 1234,
      isStarred: true,
      displayAuthorName: "사무국",
    });
  });

  it("prepends legacy image html when imagePath is missing from content", () => {
    const draft = buildNoticeEditDraft(
      notice({
        imagePath: "/uploads/notice.png",
        content: "<p>본문</p>",
      }),
    );

    expect(draft.content).toBe(
      '<p><img src="/uploads/notice.png" alt="본문 이미지" data-width="100" style="width:100%;max-width:100%;height:auto;" /></p><p>본문</p>',
    );
  });

  it("does not duplicate legacy image html when content already contains the image", () => {
    const draft = buildNoticeEditDraft(
      notice({
        imagePath: "/uploads/notice.png",
        content: '<p><img src="/uploads/notice.png" /></p><p>본문</p>',
      }),
    );

    expect(draft.content).toBe('<p><img src="/uploads/notice.png" /></p><p>본문</p>');
  });
});
