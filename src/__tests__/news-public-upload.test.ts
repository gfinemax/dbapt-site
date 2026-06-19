import { describe, expect, it, vi } from "vitest";

import { uploadPublicFile } from "@/lib/news/public-upload";

describe("uploadPublicFile", () => {
  it("posts file and kind to the public upload endpoint", async () => {
    const file = new File(["hello"], "notice.png", { type: "image/png" });
    const fetchImpl = vi.fn(async (_url: string, init?: RequestInit) => {
      const formData = init?.body as FormData;

      expect(formData.get("file")).toBe(file);
      expect(formData.get("kind")).toBe("image");

      return {
        ok: true,
        json: async () => ({ url: "/uploads/notice.png", name: "notice.png", size: 5 }),
      } as Response;
    });

    await expect(uploadPublicFile(file, "image", fetchImpl)).resolves.toEqual({
      url: "/uploads/notice.png",
      name: "notice.png",
      size: 5,
    });
    expect(fetchImpl).toHaveBeenCalledWith("/api/upload", expect.objectContaining({
      method: "POST",
    }));
  });

  it("throws the API error message when upload fails", async () => {
    const file = new File(["hello"], "notice.png", { type: "image/png" });
    const fetchImpl = vi.fn(async () => ({
      ok: false,
      json: async () => ({ error: "이미지 업로드 실패" }),
    } as Response));

    await expect(uploadPublicFile(file, "attachment", fetchImpl)).rejects.toThrow("이미지 업로드 실패");
  });
});
