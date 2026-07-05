import { beforeEach, describe, expect, it, vi } from "vitest";

const mockPrisma = vi.hoisted(() => ({
  coopNews: {
    findFirst: vi.fn(),
  },
  document: {
    findFirst: vi.fn(),
  },
  freePost: {
    findFirst: vi.fn(),
  },
}));

vi.mock("@/lib/db", () => ({
  prisma: mockPrisma,
}));

describe("short share routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("uses free-board social preview metadata on a short public share URL", async () => {
    const { buildShortSharePath } = await import("@/lib/short-share-url");
    const id = "b472f16e-3e90-40c6-889a-06375fa56b05";
    mockPrisma.freePost.findFirst.mockResolvedValue({
      id,
      title: "설명회 후기",
      content: "<p>조합원 만남</p>",
      imagePath: null,
      socialImagePath: "/uploads/social-preview-free.png",
    });

    const { generateMetadata } = await import("@/app/share/free/[id]/page");
    const metadata = await generateMetadata({
      params: Promise.resolve({ id }),
    });

    expect(mockPrisma.freePost.findFirst).toHaveBeenCalledWith({
      where: {
        id,
        isPublicShareEnabled: true,
      },
      select: {
        id: true,
        title: true,
        content: true,
        imagePath: true,
        socialImagePath: true,
      },
    });
    expect(metadata.openGraph?.url).toBe("/share/free/b472f16e-3e90-40c6-889a-06375fa56b05");
    expect(metadata.openGraph?.images).toEqual([
      {
        url: "/uploads/social-preview-free.png",
        width: 1200,
        height: 630,
        alt: "설명회 후기",
      },
    ]);
    expect(metadata.twitter?.images).toEqual(["/uploads/social-preview-free.png"]);

    const { generateMetadata: generateShortMetadata } = await import("@/app/s/[code]/page");
    const shortMetadata = await generateShortMetadata({
      params: Promise.resolve({ code: buildShortSharePath("free", id).replace("/s/", "") }),
    });

    expect(shortMetadata.openGraph?.url).toBe(buildShortSharePath("free", id));
    expect(shortMetadata.openGraph?.images).toEqual(metadata.openGraph?.images);
  });

  it("keeps default metadata when a free-board post is not public shared", async () => {
    mockPrisma.freePost.findFirst.mockResolvedValue(null);

    const { generateMetadata } = await import("@/app/share/free/[id]/page");
    const metadata = await generateMetadata({
      params: Promise.resolve({ id: "private-free" }),
    });

    expect(metadata.openGraph?.images).toEqual([
      {
        url: "/assets/hero/community-hero-04.png",
        width: 1672,
        height: 941,
        alt: "대방동 지역주택조합 대표 이미지",
      },
    ]);
  });

  it("uses notice social preview metadata on a short public share URL", async () => {
    const { buildShortSharePath } = await import("@/lib/short-share-url");
    const id = "11111111-2222-4333-8444-555555555555";
    mockPrisma.coopNews.findFirst.mockResolvedValue({
      id,
      title: "공지사항",
      content: "<p>공지 본문</p>",
      imagePath: null,
      socialImagePath: "/uploads/social-preview-notice.png",
    });

    const { generateMetadata } = await import("@/app/share/notice/[id]/page");
    const metadata = await generateMetadata({
      params: Promise.resolve({ id }),
    });

    expect(mockPrisma.coopNews.findFirst).toHaveBeenCalledWith({
      where: {
        id,
        category: "NOTICE",
      },
      select: {
        id: true,
        title: true,
        content: true,
        imagePath: true,
        socialImagePath: true,
      },
    });
    expect(metadata.openGraph?.url).toBe("/share/notice/11111111-2222-4333-8444-555555555555");
    expect(metadata.openGraph?.images).toEqual([
      {
        url: "/uploads/social-preview-notice.png",
        width: 1200,
        height: 630,
        alt: "공지사항",
      },
    ]);

    const { generateMetadata: generateShortMetadata } = await import("@/app/s/[code]/page");
    const shortMetadata = await generateShortMetadata({
      params: Promise.resolve({ code: buildShortSharePath("notice", id).replace("/s/", "") }),
    });

    expect(shortMetadata.openGraph?.url).toBe(buildShortSharePath("notice", id));
    expect(shortMetadata.openGraph?.images).toEqual(metadata.openGraph?.images);
  });

  it("uses newsletter social preview metadata on a short public share URL", async () => {
    const { buildShortSharePath } = await import("@/lib/short-share-url");
    const id = "22222222-3333-4444-8555-666666666666";
    mockPrisma.coopNews.findFirst.mockResolvedValue({
      id,
      title: "조합소식",
      content: "<p>소식 본문</p>",
      imagePath: null,
      socialImagePath: "/uploads/social-preview-newsletter.png",
    });

    const { generateMetadata } = await import("@/app/share/newsletter/[id]/page");
    const metadata = await generateMetadata({
      params: Promise.resolve({ id }),
    });

    expect(mockPrisma.coopNews.findFirst).toHaveBeenCalledWith({
      where: {
        id,
        category: "WEEKLY_MONTHLY",
      },
      select: {
        id: true,
        title: true,
        content: true,
        imagePath: true,
        socialImagePath: true,
      },
    });
    expect(metadata.openGraph?.url).toBe("/share/newsletter/22222222-3333-4444-8555-666666666666");
    expect(metadata.openGraph?.images).toEqual([
      {
        url: "/uploads/social-preview-newsletter.png",
        width: 1200,
        height: 630,
        alt: "조합소식",
      },
    ]);

    const { generateMetadata: generateShortMetadata } = await import("@/app/s/[code]/page");
    const shortMetadata = await generateShortMetadata({
      params: Promise.resolve({ code: buildShortSharePath("newsletter", id).replace("/s/", "") }),
    });

    expect(shortMetadata.openGraph?.url).toBe(buildShortSharePath("newsletter", id));
    expect(shortMetadata.openGraph?.images).toEqual(metadata.openGraph?.images);
  });

  it("uses approved disclosure document metadata on a short public share URL", async () => {
    const { buildShortSharePath } = await import("@/lib/short-share-url");
    const id = "33333333-4444-4555-8666-777777777777";
    mockPrisma.document.findFirst.mockResolvedValue({
      id,
      title: "대의원 회의록",
      description: "7월 회의자료",
      socialImagePath: "/uploads/social-preview-document.png",
    });

    const { generateMetadata } = await import("@/app/share/document/[id]/page");
    const metadata = await generateMetadata({
      params: Promise.resolve({ id }),
    });

    expect(mockPrisma.document.findFirst).toHaveBeenCalledWith({
      where: {
        id,
        category: "DISCLOSURE",
        status: "APPROVED",
      },
      select: {
        id: true,
        title: true,
        description: true,
        socialImagePath: true,
      },
    });
    expect(metadata.openGraph?.url).toBe("/share/document/33333333-4444-4555-8666-777777777777");
    expect(metadata.openGraph?.images).toEqual([
      {
        url: "/uploads/social-preview-document.png",
        width: 1200,
        height: 628,
        alt: "대의원 회의록",
      },
    ]);

    const { generateMetadata: generateShortMetadata } = await import("@/app/s/[code]/page");
    const shortMetadata = await generateShortMetadata({
      params: Promise.resolve({ code: buildShortSharePath("document", id).replace("/s/", "") }),
    });

    expect(shortMetadata.openGraph?.url).toBe(buildShortSharePath("document", id));
    expect(shortMetadata.openGraph?.images).toEqual(metadata.openGraph?.images);
  });
});
