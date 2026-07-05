import { describe, expect, it, vi } from "vitest";

const approvedDisclosure = {
  id: "33333333-4444-4555-8666-777777777777",
  title: "  대의원   회의록  ",
  category: "DISCLOSURE",
  subCategory: "대의원 회의록",
  status: "APPROVED",
  publishedAt: new Date("2026-06-13T00:00:00.000Z"),
  createdAt: new Date("2026-06-12T00:00:00.000Z"),
  filePath: "documents/2026/private.pdf",
};

const newsletter = {
  id: "22222222-3333-4444-8555-666666666666",
  title: "  대방동   2026년 7월 조합 월간 소식지  ",
  category: "WEEKLY_MONTHLY",
  content: "월간 소식지 본문",
  createdAt: new Date("2026-07-01T00:00:00.000Z"),
  attachmentPath: "/uploads/newsletter.pdf",
};

const noticeNews = {
  id: "11111111-2222-4333-8444-555555555555",
  title: "  대방동 지역주택조합 공식 홈페이지 오픈 안내  ",
  category: "NOTICE",
  content: "공지 본문",
  createdAt: new Date("2026-06-17T00:00:00.000Z"),
  attachmentPath: "/uploads/notice.pdf",
};

const freePostAnnouncementSource = {
  id: "b472f16e-3e90-40c6-889a-06375fa56b05",
  title: "  자유게시판 운영 방침 안내  ",
  content: "자유게시판 운영 방침입니다.",
  postType: "NOTICE",
  createdAt: new Date("2026-06-18T09:00:00.000Z"),
};

function createMockPrisma(params?: {
  existingAnnouncement?: {
    id: string;
    status: string;
    message: string;
  } | null;
}) {
  return {
    openChatAnnouncement: {
      findFirst: vi.fn().mockResolvedValue(params?.existingAnnouncement ?? null),
      create: vi.fn().mockImplementation(async (input) => ({
        id: "announcement-created",
        ...input.data,
      })),
      update: vi.fn().mockImplementation(async (input) => ({
        id: input.where.id,
        ...input.data,
      })),
    },
  };
}

describe("openchat announcements", () => {
  async function expectShortUrl(message: string, kind: "document" | "free" | "newsletter" | "notice", id: string) {
    const { buildAbsoluteShortShareUrl } = await import("@/lib/short-share-url");

    expect(message).toContain(buildAbsoluteShortShareUrl(kind, id, "https://dbapt.example"));
    expect(message).not.toContain(`/share/${kind}/`);
  }

  it("skips documents that are not approved disclosure documents", async () => {
    const { upsertOpenChatAnnouncementForDocument } = await import("@/lib/notifications/openchat-announcements");
    const prisma = createMockPrisma();

    const result = await upsertOpenChatAnnouncementForDocument({
      prisma,
      document: {
        ...approvedDisclosure,
        category: "NOTICE",
      },
    });

    expect(result.status).toBe("SKIPPED");
    expect(result.skippedReason).toBe("NOT_APPROVED_DISCLOSURE");
    expect(prisma.openChatAnnouncement.findFirst).not.toHaveBeenCalled();
    expect(prisma.openChatAnnouncement.create).not.toHaveBeenCalled();
  });

  it("creates an announcement message for approved disclosure documents without file paths", async () => {
    const { upsertOpenChatAnnouncementForDocument } = await import("@/lib/notifications/openchat-announcements");
    const prisma = createMockPrisma();

    const result = await upsertOpenChatAnnouncementForDocument({
      prisma,
      document: approvedDisclosure,
      siteUrl: "https://dbapt.example",
    });

    expect(result.status).toBe("CREATED");
    expect(prisma.openChatAnnouncement.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        documentId: "33333333-4444-4555-8666-777777777777",
        status: "DRAFT",
        message: expect.stringContaining("대의원 회의록"),
      }),
    });
    const message = prisma.openChatAnnouncement.create.mock.calls[0][0].data.message as string;
    expect(message).toContain("[홈페이지 공개자료 안내]");
    expect(message).toContain("새 공개자료가 등록되었습니다.");
    expect(message).toContain("🎁대의원 회의록(등록일: 2026. 06. 13.)");
    expect(message).toContain("아래 링크로 확인해 주세요.");
    await expectShortUrl(message, "document", approvedDisclosure.id);
    expect(message).not.toContain("제목:");
    expect(message).not.toContain("\n등록일:");
    expect(message).not.toContain("분류:");
    expect(message).not.toContain("documents/2026/private.pdf");
  });

  it("creates an announcement message for cooperative newsletter posts with the public detail URL", async () => {
    const { upsertOpenChatAnnouncementForNews } = await import("@/lib/notifications/openchat-announcements");
    const prisma = createMockPrisma();

    const result = await upsertOpenChatAnnouncementForNews({
      prisma,
      news: newsletter,
      siteUrl: "https://dbapt.example",
    });

    expect(result.status).toBe("CREATED");
    expect(prisma.openChatAnnouncement.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        coopNewsId: "22222222-3333-4444-8555-666666666666",
        status: "DRAFT",
        message: expect.stringContaining("대방동 2026년 7월 조합 월간 소식지"),
      }),
    });
    const message = prisma.openChatAnnouncement.create.mock.calls[0][0].data.message as string;
    expect(message).toContain("[홈페이지 조합소식 안내]");
    expect(message).toContain("새 조합소식이 등록되었습니다.");
    expect(message).toContain("🎁대방동 2026년 7월 조합 월간 소식지(등록일: 2026. 07. 01.)");
    expect(message).toContain("아래 링크로 확인해 주세요.");
    await expectShortUrl(message, "newsletter", newsletter.id);
    expect(message).not.toContain("제목:");
    expect(message).not.toContain("\n등록일:");
    expect(message).not.toContain("분류:");
    expect(message).not.toContain("https://dbapt.example/uploads/newsletter.pdf");
  });

  it("creates an announcement message for cooperative notice posts with the public detail URL", async () => {
    const { upsertOpenChatAnnouncementForNews } = await import("@/lib/notifications/openchat-announcements");
    const prisma = createMockPrisma();

    const result = await upsertOpenChatAnnouncementForNews({
      prisma,
      news: noticeNews,
      siteUrl: "https://dbapt.example",
    });

    expect(result.status).toBe("CREATED");
    expect(prisma.openChatAnnouncement.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        coopNewsId: "11111111-2222-4333-8444-555555555555",
        status: "DRAFT",
        message: expect.stringContaining("대방동 지역주택조합 공식 홈페이지 오픈 안내"),
      }),
    });
    const message = prisma.openChatAnnouncement.create.mock.calls[0][0].data.message as string;
    expect(message).toContain("[홈페이지 공지사항 안내]");
    expect(message).toContain("새 공지사항이 등록되었습니다.");
    expect(message).toContain("🎁대방동 지역주택조합 공식 홈페이지 오픈 안내(등록일: 2026. 06. 17.)");
    expect(message).toContain("아래 링크로 확인해 주세요.");
    await expectShortUrl(message, "notice", noticeNews.id);
    expect(message).not.toContain("제목:");
    expect(message).not.toContain("\n등록일:");
    expect(message).not.toContain("분류:");
    expect(message).not.toContain("https://dbapt.example/uploads/notice.pdf");
  });

  it("uses an item-level cooperative news URL when no PDF attachment is registered", async () => {
    const { buildOpenChatNewsAnnouncementMessage } = await import("@/lib/notifications/openchat-announcements");

    const message = buildOpenChatNewsAnnouncementMessage({
      news: {
        ...noticeNews,
        attachmentPath: null,
      },
      siteUrl: "https://dbapt.example",
    });

    await expectShortUrl(message, "notice", noticeNews.id);
  });

  it("creates an announcement message for free-board posts without body content", async () => {
    const { upsertOpenChatAnnouncementForFreePost } = await import("@/lib/notifications/openchat-announcements");
    const prisma = createMockPrisma();

    const result = await upsertOpenChatAnnouncementForFreePost({
      prisma,
      post: freePostAnnouncementSource,
      siteUrl: "https://dbapt.example",
    });

    expect(result.status).toBe("CREATED");
    expect(prisma.openChatAnnouncement.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        freePostId: "b472f16e-3e90-40c6-889a-06375fa56b05",
        status: "DRAFT",
        message: expect.stringContaining("자유게시판 운영 방침 안내"),
      }),
    });
    const message = prisma.openChatAnnouncement.create.mock.calls[0][0].data.message as string;
    expect(message).toContain("[홈페이지 자유게시판 안내]");
    expect(message).toContain("새 게시글이 등록되었습니다.");
    expect(message).toContain("🎁자유게시판 운영 방침 안내(등록일: 2026. 06. 18.)");
    expect(message).toContain("아래 링크로 확인해 주세요.");
    await expectShortUrl(message, "free", freePostAnnouncementSource.id);
    expect(message).not.toContain("제목:");
    expect(message).not.toContain("\n등록일:");
    expect(message).not.toContain("유형:");
    expect(message).not.toContain("자유게시판 운영 방침입니다.");
  });

  it("uses the Vercel disclosure URL when no site URL is configured", async () => {
    const { buildOpenChatAnnouncementMessage } = await import("@/lib/notifications/openchat-announcements");

    const message = buildOpenChatAnnouncementMessage({
      document: approvedDisclosure,
    });

    const { buildAbsoluteShortShareUrl } = await import("@/lib/short-share-url");
    expect(message).toContain(buildAbsoluteShortShareUrl("document", approvedDisclosure.id));
    expect(message).not.toContain("https://www.dbapt.com/disclosure");
  });

  it("does not use the public site URL for OpenChat announcements", async () => {
    const previousSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    process.env.NEXT_PUBLIC_SITE_URL = "https://www.dbapt.com";
    const { buildOpenChatAnnouncementMessage } = await import("@/lib/notifications/openchat-announcements");

    try {
      const message = buildOpenChatAnnouncementMessage({
        document: approvedDisclosure,
      });

      const { buildAbsoluteShortShareUrl } = await import("@/lib/short-share-url");
      expect(message).toContain(buildAbsoluteShortShareUrl("document", approvedDisclosure.id));
      expect(message).not.toContain("https://www.dbapt.com/disclosure");
    } finally {
      if (previousSiteUrl === undefined) {
        delete process.env.NEXT_PUBLIC_SITE_URL;
      } else {
        process.env.NEXT_PUBLIC_SITE_URL = previousSiteUrl;
      }
    }
  });

  it("updates an existing draft announcement for the same document", async () => {
    const { upsertOpenChatAnnouncementForDocument } = await import("@/lib/notifications/openchat-announcements");
    const prisma = createMockPrisma({
      existingAnnouncement: {
        id: "announcement-1",
        status: "DRAFT",
        message: "old message",
      },
    });

    const result = await upsertOpenChatAnnouncementForDocument({
      prisma,
      document: approvedDisclosure,
      siteUrl: "https://dbapt.example",
    });

    expect(result.status).toBe("UPDATED");
    expect(prisma.openChatAnnouncement.update).toHaveBeenCalledWith({
      where: { id: "announcement-1" },
      data: expect.objectContaining({
        message: expect.stringContaining("대의원 회의록"),
        status: "DRAFT",
        copiedAt: null,
      }),
    });
  });

  it("does not overwrite a copied announcement unless forced", async () => {
    const { upsertOpenChatAnnouncementForDocument } = await import("@/lib/notifications/openchat-announcements");
    const prisma = createMockPrisma({
      existingAnnouncement: {
        id: "announcement-1",
        status: "COPIED",
        message: "copied message",
      },
    });

    const result = await upsertOpenChatAnnouncementForDocument({
      prisma,
      document: approvedDisclosure,
      siteUrl: "https://dbapt.example",
    });

    expect(result.status).toBe("SKIPPED");
    expect(result.skippedReason).toBe("ALREADY_COPIED");
    expect(prisma.openChatAnnouncement.update).not.toHaveBeenCalled();
    expect(prisma.openChatAnnouncement.create).not.toHaveBeenCalled();
  });

  it("creates a new draft when forcing a copied announcement", async () => {
    const { upsertOpenChatAnnouncementForDocument } = await import("@/lib/notifications/openchat-announcements");
    const prisma = createMockPrisma({
      existingAnnouncement: {
        id: "announcement-1",
        status: "COPIED",
        message: "copied message",
      },
    });

    const result = await upsertOpenChatAnnouncementForDocument({
      prisma,
      document: approvedDisclosure,
      siteUrl: "https://dbapt.example",
      force: true,
    });

    expect(result.status).toBe("CREATED");
    expect(prisma.openChatAnnouncement.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        documentId: "33333333-4444-4555-8666-777777777777",
        status: "DRAFT",
      }),
    });
  });

  it("marks an announcement as copied", async () => {
    const { markOpenChatAnnouncementCopied } = await import("@/lib/notifications/openchat-announcements");
    const prisma = createMockPrisma();

    const result = await markOpenChatAnnouncementCopied({
      prisma,
      announcementId: "announcement-1",
      now: new Date("2026-06-13T12:00:00.000Z"),
    });

    expect(result.status).toBe("COPIED");
    expect(prisma.openChatAnnouncement.update).toHaveBeenCalledWith({
      where: { id: "announcement-1" },
      data: {
        status: "COPIED",
        copiedAt: new Date("2026-06-13T12:00:00.000Z"),
      },
    });
  });

  it("formats announcement rows for CLI review", async () => {
    const { formatOpenChatAnnouncement } = await import("@/lib/notifications/openchat-announcements");

    expect(formatOpenChatAnnouncement({
      id: "announcement-1",
      status: "DRAFT",
      message: "message",
      copiedAt: null,
      createdAt: new Date("2026-06-13T00:00:00.000Z"),
      updatedAt: new Date("2026-06-13T00:00:00.000Z"),
      document: {
        id: "33333333-4444-4555-8666-777777777777",
        title: "대의원 회의록",
      },
    })).toContain("OPENCHAT announcement-1 status=DRAFT document=33333333-4444-4555-8666-777777777777 title=\"대의원 회의록\"");
  });
});
