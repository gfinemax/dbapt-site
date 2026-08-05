import { beforeEach, describe, expect, it, vi } from "vitest";

const { getSession, findUnique, downloadPublicUpload } = vi.hoisted(() => ({
  getSession: vi.fn(),
  findUnique: vi.fn(),
  downloadPublicUpload: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({ getSession }));
vi.mock("@/lib/db", () => ({
  prisma: { freePost: { findUnique } },
}));
vi.mock("@/lib/document-storage", () => ({ downloadPublicUpload }));

import {
  downloadAccessibleFreePostAttachment,
  loadAccessibleFreePostAttachment,
} from "@/lib/news/free-post-attachment";

const sharedPost = {
  id: "free-1",
  title: "공개 게시글",
  attachmentPath: "https://project.supabase.co/storage/v1/object/public/uploads/uploads/report.pdf",
  attachmentName: "report.pdf",
  attachmentSize: 1024,
  isPublicShareEnabled: true,
};

describe("free-post attachment access", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getSession.mockResolvedValue(null);
    findUnique.mockResolvedValue(sharedPost);
  });

  it("allows a non-member to read an attachment only when public sharing is enabled", async () => {
    await expect(loadAccessibleFreePostAttachment("free-1")).resolves.toMatchObject({
      ok: true,
      post: { id: "free-1", attachmentName: "report.pdf" },
    });

    findUnique.mockResolvedValue({ ...sharedPost, isPublicShareEnabled: false });
    await expect(loadAccessibleFreePostAttachment("free-1")).resolves.toEqual({
      ok: false,
      error: "로그인 후 첨부파일을 볼 수 있습니다.",
      status: 401,
    });
  });

  it("allows a signed-in member regardless of public sharing", async () => {
    getSession.mockResolvedValue({ id: "member-1", role: "MEMBER" });
    findUnique.mockResolvedValue({ ...sharedPost, isPublicShareEnabled: false });

    await expect(loadAccessibleFreePostAttachment("free-1")).resolves.toMatchObject({ ok: true });
  });

  it("downloads only the attachment path returned by the authorized post lookup", async () => {
    const file = new Blob(["pdf"], { type: "application/pdf" });
    downloadPublicUpload.mockResolvedValue(file);

    await expect(downloadAccessibleFreePostAttachment("free-1")).resolves.toMatchObject({
      ok: true,
      file,
    });
    expect(downloadPublicUpload).toHaveBeenCalledWith(sharedPost.attachmentPath);
  });
});
