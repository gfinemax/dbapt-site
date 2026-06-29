import { beforeEach, describe, expect, it, vi } from "vitest";
import * as reactionRoute from "@/app/api/news/comment-reactions/route";

const mockGetSession = vi.hoisted(() => vi.fn());
const mockPrisma = vi.hoisted(() => ({
  coopNewsComment: {
    findUnique: vi.fn(),
  },
  freeComment: {
    findUnique: vi.fn(),
  },
  commentReaction: {
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
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
  return new Request("http://localhost/api/news/comment-reactions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("comment reaction API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetSession.mockResolvedValue({ id: "member-1", role: "MEMBER" });
    mockPrisma.coopNewsComment.findUnique.mockResolvedValue({ id: "comment-1" });
    mockPrisma.freeComment.findUnique.mockResolvedValue(null);
    mockPrisma.commentReaction.findMany.mockResolvedValue([
      { emoji: "👍", userId: "member-1" },
      { emoji: "👍", userId: "member-2" },
    ]);
  });

  it("requires login before toggling a comment reaction", async () => {
    mockGetSession.mockResolvedValue(null);

    const response = await reactionRoute.POST(reactionRequest({
      targetType: "COOP_NEWS_COMMENT",
      targetId: "comment-1",
      emoji: "👍",
    }));

    expect(response.status).toBe(401);
    expect(await response.json()).toMatchObject({ error: "로그인이 필요합니다." });
    expect(mockPrisma.commentReaction.create).not.toHaveBeenCalled();
  });

  it("creates a reaction and returns the updated summary", async () => {
    mockPrisma.commentReaction.findFirst.mockResolvedValue(null);
    mockPrisma.commentReaction.create.mockResolvedValue({ id: "reaction-1" });

    const response = await reactionRoute.POST(reactionRequest({
      targetType: "COOP_NEWS_COMMENT",
      targetId: "comment-1",
      emoji: "👍",
    }));

    expect(response.status).toBe(200);
    expect(mockPrisma.commentReaction.create).toHaveBeenCalledWith({
      data: {
        userId: "member-1",
        emoji: "👍",
        coopNewsCommentId: "comment-1",
      },
    });
    expect(await response.json()).toMatchObject({
      success: true,
      reactionSummary: [{ emoji: "👍", count: 2, selectedByCurrentUser: true }],
    });
  });

  it("removes an existing same-emoji reaction", async () => {
    mockPrisma.commentReaction.findFirst.mockResolvedValue({
      id: "reaction-1",
      emoji: "👍",
    });
    mockPrisma.commentReaction.findMany.mockResolvedValue([
      { emoji: "👍", userId: "member-2" },
    ]);

    const response = await reactionRoute.POST(reactionRequest({
      targetType: "COOP_NEWS_COMMENT",
      targetId: "comment-1",
      emoji: "👍",
    }));

    expect(response.status).toBe(200);
    expect(mockPrisma.commentReaction.delete).toHaveBeenCalledWith({ where: { id: "reaction-1" } });
    expect(await response.json()).toMatchObject({
      success: true,
      reactionSummary: [{ emoji: "👍", count: 1, selectedByCurrentUser: false }],
    });
  });

  it("replaces an existing different-emoji reaction", async () => {
    mockPrisma.freeComment.findUnique.mockResolvedValue({ id: "free-comment-1" });
    mockPrisma.commentReaction.findFirst.mockResolvedValue({
      id: "reaction-1",
      emoji: "❤️",
    });
    mockPrisma.commentReaction.update.mockResolvedValue({ id: "reaction-1", emoji: "👏" });
    mockPrisma.commentReaction.findMany.mockResolvedValue([
      { emoji: "👏", userId: "member-1" },
    ]);

    const response = await reactionRoute.POST(reactionRequest({
      targetType: "FREE_COMMENT",
      targetId: "free-comment-1",
      emoji: "👏",
    }));

    expect(response.status).toBe(200);
    expect(mockPrisma.freeComment.findUnique).toHaveBeenCalledWith({
      where: { id: "free-comment-1" },
      select: { id: true },
    });
    expect(mockPrisma.commentReaction.update).toHaveBeenCalledWith({
      where: { id: "reaction-1" },
      data: { emoji: "👏" },
    });
    expect(await response.json()).toMatchObject({
      success: true,
      reactionSummary: [{ emoji: "👏", count: 1, selectedByCurrentUser: true }],
    });
  });

  it("rejects unsupported emoji and unknown targets", async () => {
    const badEmoji = await reactionRoute.POST(reactionRequest({
      targetType: "COOP_NEWS_COMMENT",
      targetId: "comment-1",
      emoji: "🚀",
    }));
    expect(badEmoji.status).toBe(400);

    mockPrisma.coopNewsComment.findUnique.mockResolvedValue(null);
    const missingTarget = await reactionRoute.POST(reactionRequest({
      targetType: "COOP_NEWS_COMMENT",
      targetId: "missing",
      emoji: "👍",
    }));
    expect(missingTarget.status).toBe(404);
  });
});
