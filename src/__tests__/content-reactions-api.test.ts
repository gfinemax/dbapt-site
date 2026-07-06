import { beforeEach, describe, expect, it, vi } from "vitest";
import * as contentReactionRoute from "@/app/api/content-reactions/route";

const mockGetSession = vi.hoisted(() => vi.fn());
const mockPrisma = vi.hoisted(() => ({
  coopNews: {
    findUnique: vi.fn(),
  },
  freePost: {
    findUnique: vi.fn(),
  },
  document: {
    findUnique: vi.fn(),
  },
  contentReaction: {
    findFirst: vi.fn(),
    create: vi.fn(),
    delete: vi.fn(),
    findMany: vi.fn(),
  },
}));

vi.mock("@/lib/auth", () => ({
  getSession: mockGetSession,
}));

vi.mock("@/lib/db", () => ({
  prisma: mockPrisma,
}));

function reactionRequest(body: Record<string, unknown>) {
  return new Request("http://localhost/api/content-reactions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("content reaction API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetSession.mockResolvedValue({ id: "member-1", role: "MEMBER" });
    mockPrisma.freePost.findUnique.mockResolvedValue({ id: "free-1" });
    mockPrisma.coopNews.findUnique.mockResolvedValue(null);
    mockPrisma.document.findUnique.mockResolvedValue(null);
    mockPrisma.contentReaction.findMany.mockResolvedValue([
      { userId: "member-1" },
      { userId: "member-2" },
    ]);
  });

  it("requires login before toggling a content like", async () => {
    mockGetSession.mockResolvedValue(null);

    const response = await contentReactionRoute.POST(reactionRequest({
      targetType: "FREE_POST",
      targetId: "free-1",
    }));

    expect(response.status).toBe(401);
    expect(await response.json()).toMatchObject({ error: "로그인이 필요합니다." });
    expect(mockPrisma.contentReaction.create).not.toHaveBeenCalled();
  });

  it("creates a like and returns the updated summary", async () => {
    mockPrisma.contentReaction.findFirst.mockResolvedValue(null);
    mockPrisma.contentReaction.create.mockResolvedValue({ id: "reaction-1" });

    const response = await contentReactionRoute.POST(reactionRequest({
      targetType: "FREE_POST",
      targetId: "free-1",
    }));

    expect(response.status).toBe(200);
    expect(mockPrisma.contentReaction.create).toHaveBeenCalledWith({
      data: {
        userId: "member-1",
        freePostId: "free-1",
      },
    });
    expect(await response.json()).toMatchObject({
      success: true,
      targetType: "FREE_POST",
      targetId: "free-1",
      likeCount: 2,
      likedByCurrentUser: true,
    });
  });

  it("removes an existing like", async () => {
    mockPrisma.contentReaction.findFirst.mockResolvedValue({ id: "reaction-1" });
    mockPrisma.contentReaction.findMany.mockResolvedValue([
      { userId: "member-2" },
    ]);

    const response = await contentReactionRoute.POST(reactionRequest({
      targetType: "FREE_POST",
      targetId: "free-1",
    }));

    expect(response.status).toBe(200);
    expect(mockPrisma.contentReaction.delete).toHaveBeenCalledWith({ where: { id: "reaction-1" } });
    expect(await response.json()).toMatchObject({
      likeCount: 1,
      likedByCurrentUser: false,
    });
  });

  it("validates document targets", async () => {
    mockPrisma.freePost.findUnique.mockResolvedValue(null);
    mockPrisma.document.findUnique.mockResolvedValue({ id: "doc-1" });
    mockPrisma.contentReaction.findFirst.mockResolvedValue(null);

    const response = await contentReactionRoute.POST(reactionRequest({
      targetType: "DOCUMENT",
      targetId: "doc-1",
    }));

    expect(response.status).toBe(200);
    expect(mockPrisma.document.findUnique).toHaveBeenCalledWith({
      where: { id: "doc-1" },
      select: { id: true },
    });
    expect(mockPrisma.contentReaction.create).toHaveBeenCalledWith({
      data: {
        userId: "member-1",
        documentId: "doc-1",
      },
    });
  });

  it("rejects unsupported and missing targets", async () => {
    const badTarget = await contentReactionRoute.POST(reactionRequest({
      targetType: "FREE_COMMENT",
      targetId: "comment-1",
    }));
    expect(badTarget.status).toBe(400);

    mockPrisma.freePost.findUnique.mockResolvedValue(null);
    const missingTarget = await contentReactionRoute.POST(reactionRequest({
      targetType: "FREE_POST",
      targetId: "missing",
    }));
    expect(missingTarget.status).toBe(404);
  });
});
