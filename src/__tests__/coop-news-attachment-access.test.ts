import { beforeEach, describe, expect, it, vi } from "vitest";

const { findUnique, downloadPublicUpload } = vi.hoisted(() => ({
  findUnique: vi.fn(),
  downloadPublicUpload: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  prisma: { coopNews: { findUnique } },
}));
vi.mock("@/lib/document-storage", () => ({ downloadPublicUpload }));

import {
  downloadAccessibleCoopNewsAttachment,
  loadAccessibleCoopNewsAttachment,
} from "@/lib/news/coop-news-attachment";

const noticeItem = {
  id: "notice-1",
  title: "공개 공지사항",
  attachmentPath: "https://project.supabase.co/storage/v1/object/public/uploads/uploads/notice.pdf",
  attachmentName: "notice.pdf",
  attachmentSize: 2048,
};

describe("coop-news attachment access", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    findUnique.mockResolvedValue(noticeItem);
  });

  it("allows non-logged-in users to access and read coop news attachments", async () => {
    await expect(loadAccessibleCoopNewsAttachment("notice-1")).resolves.toMatchObject({
      ok: true,
      news: { id: "notice-1", attachmentName: "notice.pdf" },
    });
  });

  it("returns 404 error when notice does not exist or has no attachment", async () => {
    findUnique.mockResolvedValue(null);
    await expect(loadAccessibleCoopNewsAttachment("notice-999")).resolves.toEqual({
      ok: false,
      error: "존재하지 않는 공지사항입니다.",
      status: 404,
    });

    findUnique.mockResolvedValue({ ...noticeItem, attachmentPath: null });
    await expect(loadAccessibleCoopNewsAttachment("notice-1")).resolves.toEqual({
      ok: false,
      error: "첨부파일이 없습니다.",
      status: 404,
    });
  });

  it("downloads the attachment file for coop news", async () => {
    const file = new Blob(["pdf-data"], { type: "application/pdf" });
    downloadPublicUpload.mockResolvedValue(file);

    await expect(downloadAccessibleCoopNewsAttachment("notice-1")).resolves.toMatchObject({
      ok: true,
      file,
    });
    expect(downloadPublicUpload).toHaveBeenCalledWith(noticeItem.attachmentPath);
  });
});
