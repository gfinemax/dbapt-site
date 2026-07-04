import { beforeEach, describe, expect, it, vi } from "vitest";

const mockPrisma = vi.hoisted(() => ({
  freePost: {
    findFirst: vi.fn(),
  },
  coopNews: {
    findFirst: vi.fn(),
  },
}));

vi.mock("@/lib/db", () => ({
  prisma: mockPrisma,
}));

vi.mock("@/lib/auth", () => ({
  getSession: vi.fn(),
}));

vi.mock("@/components/news/news-client", () => ({
  NewsClient: () => null,
}));

vi.mock("@/components/portal/personal-library-drawer-host", () => ({
  PersonalLibraryDrawerHost: ({ children }: { children: unknown }) => children,
}));

describe("news page metadata", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("uses a notice body image for notice social previews", async () => {
    mockPrisma.coopNews.findFirst.mockResolvedValue({
      id: "notice-1",
      title: "설명회 후기 공지",
      content: '<p>조합원 만남</p><p><img src="/uploads/notice-body.png" /></p>',
      imagePath: null,
      socialImagePath: null,
    });

    const { generateMetadata } = await import("@/app/news/page");
    const metadata = await generateMetadata({
      searchParams: Promise.resolve({ tab: "notice", news: "notice-1" }),
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
    expect(metadata.openGraph?.images).toEqual([
      {
        url: "/uploads/notice-body.png",
        width: 1200,
        height: 630,
        alt: "설명회 후기 공지",
      },
    ]);
    expect(metadata.twitter?.images).toEqual(["/uploads/notice-body.png"]);
  });

  it("uses a notice Kakao preview image before the body image for social previews", async () => {
    mockPrisma.coopNews.findFirst.mockResolvedValue({
      id: "notice-2",
      title: "카톡 대표 공지",
      content: '<p><img src="/uploads/body-image.png" /></p>',
      imagePath: "/uploads/card-image.png",
      socialImagePath: "/uploads/kakao-preview.png",
    });

    const { generateMetadata } = await import("@/app/news/page");
    const metadata = await generateMetadata({
      searchParams: Promise.resolve({ tab: "notice", news: "notice-2" }),
    });

    expect(metadata.openGraph?.images).toEqual([
      {
        url: "/uploads/kakao-preview.png",
        width: 1200,
        height: 630,
        alt: "카톡 대표 공지",
      },
    ]);
  });

  it("uses a publicly shared free-board post body image for the social preview", async () => {
    mockPrisma.freePost.findFirst.mockResolvedValue({
      id: "free-1",
      title: "설명회 후기",
      content:
        '<p>조합원 만남</p><p><img src="https://qhgxsafflybrjnhyxqzs.supabase.co/storage/v1/object/public/news/free-1.png" /></p>',
      imagePath: null,
      socialImagePath: null,
    });

    const { generateMetadata } = await import("@/app/news/page");
    const metadata = await generateMetadata({
      searchParams: Promise.resolve({ tab: "free", post: "free-1" }),
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
    expect(metadata.openGraph?.images).toEqual([
      {
        url: "https://qhgxsafflybrjnhyxqzs.supabase.co/storage/v1/object/public/news/free-1.png",
        width: 1200,
        height: 630,
        alt: "설명회 후기",
      },
    ]);
    expect(metadata.twitter?.images).toEqual([
      "https://qhgxsafflybrjnhyxqzs.supabase.co/storage/v1/object/public/news/free-1.png",
    ]);
  });

  it("keeps the default site metadata when the free-board post is not publicly shared", async () => {
    mockPrisma.freePost.findFirst.mockResolvedValue(null);

    const { generateMetadata } = await import("@/app/news/page");
    const metadata = await generateMetadata({
      searchParams: Promise.resolve({ tab: "free", post: "private-1" }),
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
});
