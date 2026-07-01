import { describe, expect, it, vi, beforeEach } from "vitest";
import * as boardCopyRoute from "@/app/api/news/board-copy/route";

const mockGetSession = vi.hoisted(() => vi.fn());
const mockPrisma = vi.hoisted(() => ({
  coopNews: {
    findUnique: vi.fn(),
    create: vi.fn(),
  },
  freePost: {
    findUnique: vi.fn(),
    create: vi.fn(),
  },
}));

vi.mock("@/lib/auth", () => ({
  getSession: mockGetSession,
}));

vi.mock("@/lib/db", () => ({
  prisma: mockPrisma,
}));

const registeredAt = new Date("2026-06-30T09:30:00.000Z");

function jsonRequest(body: Record<string, unknown>) {
  return new Request("http://localhost/api/news/board-copy", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("news board copy API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects unauthenticated board copy requests", async () => {
    mockGetSession.mockResolvedValue(null);

    const response = await boardCopyRoute.POST(
      jsonRequest({ sourceType: "COOP_NEWS", sourceId: "notice-1" }),
    );

    expect(response.status).toBe(401);
    expect(await response.json()).toMatchObject({ error: "로그인이 필요합니다." });
    expect(mockPrisma.freePost.create).not.toHaveBeenCalled();
    expect(mockPrisma.coopNews.create).not.toHaveBeenCalled();
  });

  it("rejects non-admin board copy requests", async () => {
    mockGetSession.mockResolvedValue({ id: "member-1", role: "MEMBER" });

    const response = await boardCopyRoute.POST(
      jsonRequest({ sourceType: "FREE_POST", sourceId: "free-1" }),
    );

    expect(response.status).toBe(403);
    expect(await response.json()).toMatchObject({ error: "관리자 권한이 필요합니다." });
    expect(mockPrisma.freePost.create).not.toHaveBeenCalled();
    expect(mockPrisma.coopNews.create).not.toHaveBeenCalled();
  });

  it("copies a notice into the free board without comments or public sharing", async () => {
    mockGetSession.mockResolvedValue({ id: "admin-1", role: "ADMIN" });
    mockPrisma.coopNews.findUnique.mockResolvedValue({
      id: "notice-1",
      title: "중요 공지",
      content: "<p>공지 본문</p>",
      attachmentPath: "/uploads/notice.pdf",
      attachmentName: "notice.pdf",
      attachmentSize: 2048,
      displayAuthorName: "사무국",
      isStarred: true,
      registeredAt,
    });
    mockPrisma.freePost.create.mockResolvedValue({ id: "free-copy-1" });

    const response = await boardCopyRoute.POST(
      jsonRequest({ sourceType: "COOP_NEWS", sourceId: "notice-1" }),
    );

    expect(response.status).toBe(200);
    expect(mockPrisma.freePost.create).toHaveBeenCalledWith({
      data: {
        title: "중요 공지",
        content: "<p>공지 본문</p>",
        attachmentPath: "/uploads/notice.pdf",
        attachmentName: "notice.pdf",
        attachmentSize: 2048,
        displayAuthorName: "사무국",
        isStarred: true,
        postType: "NOTICE",
        registeredAt,
        authorId: "admin-1",
        isPublicShareEnabled: false,
        publicShareEnabledAt: null,
      },
    });
    expect(await response.json()).toMatchObject({
      success: true,
      targetType: "FREE_POST",
      target: { id: "free-copy-1" },
    });
  });

  it("copies a free-board post into notices without comments or free-board-only sharing", async () => {
    mockGetSession.mockResolvedValue({ id: "admin-1", role: "ADMIN" });
    mockPrisma.freePost.findUnique.mockResolvedValue({
      id: "free-1",
      title: "자유게시글 공지화",
      content: "<p>자유글 본문</p>",
      attachmentPath: "/uploads/free.pdf",
      attachmentName: "free.pdf",
      attachmentSize: 4096,
      displayAuthorName: "운영자",
      isStarred: true,
      registeredAt,
      isPublicShareEnabled: true,
      publicShareEnabledAt: new Date("2026-06-30T10:00:00.000Z"),
    });
    mockPrisma.coopNews.create.mockResolvedValue({ id: "notice-copy-1" });

    const response = await boardCopyRoute.POST(
      jsonRequest({ sourceType: "FREE_POST", sourceId: "free-1" }),
    );

    expect(response.status).toBe(200);
    expect(mockPrisma.coopNews.create).toHaveBeenCalledWith({
      data: {
        title: "자유게시글 공지화",
        content: "<p>자유글 본문</p>",
        category: "NOTICE",
        imagePath: null,
        attachmentPath: "/uploads/free.pdf",
        attachmentName: "free.pdf",
        attachmentSize: 4096,
        displayAuthorName: "운영자",
        isStarred: true,
        registeredAt,
        authorId: "admin-1",
      },
    });
    expect(await response.json()).toMatchObject({
      success: true,
      targetType: "COOP_NEWS",
      target: { id: "notice-copy-1" },
    });
  });

  it("returns 404 when the source post does not exist", async () => {
    mockGetSession.mockResolvedValue({ id: "admin-1", role: "ADMIN" });
    mockPrisma.coopNews.findUnique.mockResolvedValue(null);

    const response = await boardCopyRoute.POST(
      jsonRequest({ sourceType: "COOP_NEWS", sourceId: "missing-notice" }),
    );

    expect(response.status).toBe(404);
    expect(await response.json()).toMatchObject({ error: "복사할 원본 글을 찾을 수 없습니다." });
    expect(mockPrisma.freePost.create).not.toHaveBeenCalled();
  });
});
