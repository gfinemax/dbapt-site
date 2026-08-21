import { describe, expect, it } from "vitest";
import { buildDocumentSocialPreview } from "@/lib/document-social-preview";

describe("document social preview", () => {
  it("uses a dedicated Kakao preview image for public disclosure documents", () => {
    const preview = buildDocumentSocialPreview({
      id: "doc-1",
      title: "대의원 회의록",
      description: "7월 회의자료",
      socialImagePath: "/uploads/social-preview.png",
    });

    expect(preview.image).toEqual({
      url: "/uploads/social-preview.png",
      width: 1200,
      height: 628,
      alt: "대의원 회의록",
    });
  });

  it("declares the Kakao-specific generated image at 800x400", () => {
    const preview = buildDocumentSocialPreview({
      id: "doc-2",
      title: "이사회 회의록",
      socialImagePath: "/uploads/kakao-preview-800x400-20260821-131500.jpg",
    });

    expect(preview.image).toMatchObject({ width: 800, height: 400 });
  });
});
