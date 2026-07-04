import { describe, expect, it } from "vitest";
import {
  buildFreePostSocialPreview,
  getFirstRichTextImageSrc,
} from "@/lib/news/social-preview";

describe("news social preview", () => {
  it("uses the first image embedded in a free-board post body", () => {
    const preview = buildFreePostSocialPreview({
      id: "free-1",
      title: "설명회 후기",
      content:
        '<p>첫 문장</p><p><img src="https://qhgxsafflybrjnhyxqzs.supabase.co/storage/v1/object/public/news/photo.png" alt="본문 이미지" /></p>',
      imagePath: null,
    });

    expect(preview.image?.url).toBe(
      "https://qhgxsafflybrjnhyxqzs.supabase.co/storage/v1/object/public/news/photo.png",
    );
    expect(preview.title).toBe("설명회 후기");
    expect(preview.description).toBe("첫 문장 [이미지]");
  });

  it("falls back to the legacy image path when the body has no image", () => {
    const preview = buildFreePostSocialPreview({
      id: "free-2",
      title: "운영 안내",
      content: "<p>본문만 있습니다.</p>",
      imagePath: "/uploads/free-cover.png",
    });

    expect(preview.image?.url).toBe("/uploads/free-cover.png");
  });

  it("ignores unsafe image sources in rich text", () => {
    expect(getFirstRichTextImageSrc('<img src="javascript:alert(1)" />')).toBeNull();
    expect(getFirstRichTextImageSrc('<img src="data:image/png;base64,abc" />')).toBeNull();
  });
});
