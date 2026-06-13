import { describe, expect, it, vi, beforeEach } from "vitest";

const mockGetSession = vi.hoisted(() => vi.fn());
const mockMarkOpenChatAnnouncementCopied = vi.hoisted(() => vi.fn());
const mockUpsertOpenChatAnnouncementForDocument = vi.hoisted(() => vi.fn());
const mockPrisma = vi.hoisted(() => ({
  document: {
    findUnique: vi.fn(),
  },
  openChatAnnouncement: {
    findFirst: vi.fn(),
  },
}));

vi.mock("@/lib/auth", () => ({
  getSession: mockGetSession,
}));

vi.mock("@/lib/db", () => ({
  prisma: mockPrisma,
}));

vi.mock("@/lib/notifications/openchat-announcements", () => ({
  markOpenChatAnnouncementCopied: mockMarkOpenChatAnnouncementCopied,
  upsertOpenChatAnnouncementForDocument: mockUpsertOpenChatAnnouncementForDocument,
}));

describe("openchat announcements API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the latest announcement for an admin document copy request", async () => {
    mockGetSession.mockResolvedValue({ id: "admin-1", role: "ADMIN" });
    mockPrisma.openChatAnnouncement.findFirst.mockResolvedValue({
      id: "announcement-1",
      documentId: "doc-1",
      status: "DRAFT",
      message: "공지문 본문",
      copiedAt: null,
      updatedAt: new Date("2026-06-14T00:00:00.000Z"),
      document: {
        id: "doc-1",
        title: "대의원 회의록",
      },
    });

    const { GET } = await import("@/app/api/openchat/announcements/route");
    const response = await GET(new Request("http://localhost/api/openchat/announcements?documentId=doc-1"));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(mockPrisma.openChatAnnouncement.findFirst).toHaveBeenCalledWith({
      where: {
        documentId: "doc-1",
        status: {
          in: ["DRAFT", "COPIED"],
        },
      },
      orderBy: { updatedAt: "desc" },
      include: {
        document: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });
    expect(data.announcement.message).toBe("공지문 본문");
  });

  it("generates and returns an announcement when an approved disclosure document has no draft yet", async () => {
    mockGetSession.mockResolvedValue({ id: "admin-1", role: "ADMIN" });
    mockPrisma.openChatAnnouncement.findFirst.mockResolvedValue(null);
    mockPrisma.document.findUnique.mockResolvedValue({
      id: "doc-old",
      title: "조합원명부 (86명 260403)",
      category: "DISCLOSURE",
      subCategory: "조합원 연명부",
      status: "APPROVED",
      publishedAt: new Date("2026-04-03T00:00:00.000Z"),
      createdAt: new Date("2026-04-03T00:00:00.000Z"),
    });
    mockUpsertOpenChatAnnouncementForDocument.mockResolvedValue({
      status: "CREATED",
      announcementId: "announcement-generated",
      message: "생성된 공지문 본문",
    });

    const { GET } = await import("@/app/api/openchat/announcements/route");
    const response = await GET(new Request("http://localhost/api/openchat/announcements?documentId=doc-old"));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(mockPrisma.document.findUnique).toHaveBeenCalledWith({ where: { id: "doc-old" } });
    expect(mockUpsertOpenChatAnnouncementForDocument).toHaveBeenCalledWith({
      prisma: mockPrisma,
      document: expect.objectContaining({
        id: "doc-old",
        title: "조합원명부 (86명 260403)",
      }),
    });
    expect(data.announcement).toEqual({
      id: "announcement-generated",
      documentId: "doc-old",
      status: "DRAFT",
      message: "생성된 공지문 본문",
    });
  });

  it("marks an announcement copied for admins", async () => {
    mockGetSession.mockResolvedValue({ id: "admin-1", role: " ADMIN " });
    mockMarkOpenChatAnnouncementCopied.mockResolvedValue({
      status: "COPIED",
      announcementId: "announcement-1",
      message: "공지문 본문",
    });

    const { PATCH } = await import("@/app/api/openchat/announcements/route");
    const response = await PATCH(new Request("http://localhost/api/openchat/announcements", {
      method: "PATCH",
      body: JSON.stringify({ announcementId: "announcement-1" }),
    }));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(mockMarkOpenChatAnnouncementCopied).toHaveBeenCalledWith({
      prisma: mockPrisma,
      announcementId: "announcement-1",
    });
    expect(data.result.status).toBe("COPIED");
  });

  it("rejects member access", async () => {
    mockGetSession.mockResolvedValue({ id: "member-1", role: "MEMBER" });

    const { GET } = await import("@/app/api/openchat/announcements/route");
    const response = await GET(new Request("http://localhost/api/openchat/announcements?documentId=doc-1"));
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toBe("관리자 권한이 필요합니다.");
  });
});
