import { beforeEach, describe, expect, it, vi } from "vitest";

const mockPrisma = vi.hoisted(() => ({
  freePost: {
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

  it("uses a publicly shared free-board post body image for the social preview", async () => {
    mockPrisma.freePost.findFirst.mockResolvedValue({
      id: "free-1",
      title: "설명회 후기",
      content:
        '<p>조합원 만남</p><p><img src="https://qhgxsafflybrjnhyxqzs.supabase.co/storage/v1/object/public/news/free-1.png" /></p>',
      imagePath: null,
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
