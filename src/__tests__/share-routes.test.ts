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
    mockPrisma.freePost.findFirst.mockResolvedValue({
      id: "free-1",
      title: "설명회 후기",
      content: "<p>조합원 만남</p>",
      imagePath: null,
      socialImagePath: "/uploads/social-preview-free.png",
    });

    const { generateMetadata } = await import("@/app/share/free/[id]/page");
    const metadata = await generateMetadata({
      params: Promise.resolve({ id: "free-1" }),
    });

    expect(mockPrisma.freePost.findFirst).toHaveBeenCalledWith({
      where: {
        id: "free-1",
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
    expect(metadata.openGraph?.url).toBe("/share/free/free-1");
    expect(metadata.openGraph?.images).toEqual([
      {
        url: "/uploads/social-preview-free.png",
        width: 1200,
        height: 630,
        alt: "설명회 후기",
      },
    ]);
    expect(metadata.twitter?.images).toEqual(["/uploads/social-preview-free.png"]);
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
    mockPrisma.coopNews.findFirst.mockResolvedValue({
      id: "notice-1",
      title: "공지사항",
      content: "<p>공지 본문</p>",
      imagePath: null,
      socialImagePath: "/uploads/social-preview-notice.png",
    });

    const { generateMetadata } = await import("@/app/share/notice/[id]/page");
    const metadata = await generateMetadata({
      params: Promise.resolve({ id: "notice-1" }),
    });

    expect(mockPrisma.coopNews.findFirst).toHaveBeenCalledWith({
      where: {
        id: "notice-1",
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
    expect(metadata.openGraph?.url).toBe("/share/notice/notice-1");
    expect(metadata.openGraph?.images).toEqual([
      {
        url: "/uploads/social-preview-notice.png",
        width: 1200,
        height: 630,
        alt: "공지사항",
      },
    ]);
  });

  it("uses newsletter social preview metadata on a short public share URL", async () => {
    mockPrisma.coopNews.findFirst.mockResolvedValue({
      id: "newsletter-1",
      title: "조합소식",
      content: "<p>소식 본문</p>",
      imagePath: null,
      socialImagePath: "/uploads/social-preview-newsletter.png",
    });

    const { generateMetadata } = await import("@/app/share/newsletter/[id]/page");
    const metadata = await generateMetadata({
      params: Promise.resolve({ id: "newsletter-1" }),
    });

    expect(mockPrisma.coopNews.findFirst).toHaveBeenCalledWith({
      where: {
        id: "newsletter-1",
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
    expect(metadata.openGraph?.url).toBe("/share/newsletter/newsletter-1");
    expect(metadata.openGraph?.images).toEqual([
      {
        url: "/uploads/social-preview-newsletter.png",
        width: 1200,
        height: 630,
        alt: "조합소식",
      },
    ]);
  });

  it("uses approved disclosure document metadata on a short public share URL", async () => {
    mockPrisma.document.findFirst.mockResolvedValue({
      id: "doc-1",
      title: "대의원 회의록",
      description: "7월 회의자료",
      socialImagePath: "/uploads/social-preview-document.png",
    });

    const { generateMetadata } = await import("@/app/share/document/[id]/page");
    const metadata = await generateMetadata({
      params: Promise.resolve({ id: "doc-1" }),
    });

    expect(mockPrisma.document.findFirst).toHaveBeenCalledWith({
      where: {
        id: "doc-1",
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
    expect(metadata.openGraph?.url).toBe("/share/document/doc-1");
    expect(metadata.openGraph?.images).toEqual([
      {
        url: "/uploads/social-preview-document.png",
        width: 1200,
        height: 628,
        alt: "대의원 회의록",
      },
    ]);
  });
});
