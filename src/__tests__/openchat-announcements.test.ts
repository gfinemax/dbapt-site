import { describe, expect, it, vi } from "vitest";

const approvedDisclosure = {
  id: "doc-1",
  title: "  대의원   회의록  ",
  category: "DISCLOSURE",
  subCategory: "대의원 회의록",
  status: "APPROVED",
  publishedAt: new Date("2026-06-13T00:00:00.000Z"),
  createdAt: new Date("2026-06-12T00:00:00.000Z"),
  filePath: "documents/2026/private.pdf",
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
        documentId: "doc-1",
        status: "DRAFT",
        message: expect.stringContaining("대의원 회의록"),
      }),
    });
    const message = prisma.openChatAnnouncement.create.mock.calls[0][0].data.message as string;
    expect(message).toContain("[대방동 지역주택조합 공개자료 안내]");
    expect(message).toContain("홈페이지 로그인 후 공개자료 메뉴에서 확인해 주세요.");
    expect(message).toContain("https://dbapt.example/disclosure");
    expect(message).not.toContain("documents/2026/private.pdf");
  });

  it("uses the Vercel disclosure URL when no site URL is configured", async () => {
    const { buildOpenChatAnnouncementMessage } = await import("@/lib/notifications/openchat-announcements");

    const message = buildOpenChatAnnouncementMessage({
      document: approvedDisclosure,
    });

    expect(message).toContain("https://dbapt-site.vercel.app/disclosure");
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

      expect(message).toContain("https://dbapt-site.vercel.app/disclosure");
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
        documentId: "doc-1",
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
        id: "doc-1",
        title: "대의원 회의록",
      },
    })).toContain("OPENCHAT announcement-1 status=DRAFT document=doc-1 title=\"대의원 회의록\"");
  });
});
