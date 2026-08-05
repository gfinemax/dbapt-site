import { beforeEach, describe, expect, it, vi } from "vitest";

const { downloadAccessibleFreePostAttachment, isPdfAttachment } = vi.hoisted(() => ({
  downloadAccessibleFreePostAttachment: vi.fn(),
  isPdfAttachment: vi.fn((fileName: string) => fileName.endsWith(".pdf")),
}));

vi.mock("@/lib/news/free-post-attachment", () => ({
  downloadAccessibleFreePostAttachment,
  isPdfAttachment,
}));

import { GET as viewAttachment } from "@/app/api/news/free/[id]/attachment/view/route";
import { GET as downloadAttachment } from "@/app/api/news/free/[id]/attachment/download/route";

const successfulResult = {
  ok: true,
  post: {
    id: "free-1",
    title: "입장문",
    attachmentName: "입장문.pdf",
    attachmentPath: "storage-path",
    attachmentSize: 3,
    isPublicShareEnabled: true,
  },
  session: null,
  file: new Blob(["pdf"], { type: "application/pdf" }),
};

describe("free-post attachment routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    downloadAccessibleFreePostAttachment.mockResolvedValue(successfulResult);
  });

  it("serves the viewer response inline without caching it", async () => {
    const response = await viewAttachment(new Request("https://site.test"), {
      params: Promise.resolve({ id: "free-1" }),
    });

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("application/pdf");
    expect(response.headers.get("content-disposition")).toContain("inline");
    expect(response.headers.get("content-disposition")).toContain("filename*=UTF-8''");
    expect(response.headers.get("cache-control")).toBe("private, no-store");
  });

  it("keeps original download as a separate attachment response", async () => {
    const response = await downloadAttachment(new Request("https://site.test"), {
      params: Promise.resolve({ id: "free-1" }),
    });

    expect(response.status).toBe(200);
    expect(response.headers.get("content-disposition")).toContain("attachment");
    expect(response.headers.get("content-disposition")).toContain("filename*=UTF-8''");
  });

  it("returns the access error without reading the file", async () => {
    downloadAccessibleFreePostAttachment.mockResolvedValue({
      ok: false,
      error: "로그인 후 첨부파일을 볼 수 있습니다.",
      status: 401,
    });

    const response = await viewAttachment(new Request("https://site.test"), {
      params: Promise.resolve({ id: "free-1" }),
    });

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: "로그인 후 첨부파일을 볼 수 있습니다." });
  });
});
