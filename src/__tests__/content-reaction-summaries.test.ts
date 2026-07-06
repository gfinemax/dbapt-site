import { beforeEach, describe, expect, it, vi } from "vitest";

const mockPrisma = vi.hoisted(() => ({} as {
  contentReaction?: {
    findMany: ReturnType<typeof vi.fn>;
  };
}));

vi.mock("@/lib/db", () => ({
  prisma: mockPrisma,
}));

describe("content reaction summaries", () => {
  beforeEach(() => {
    delete mockPrisma.contentReaction;
    vi.clearAllMocks();
  });

  it("returns default like summaries when the reaction delegate is unavailable", async () => {
    const { loadContentReactionSummaries } = await import("@/lib/server/content-reaction-summaries");

    const summaries = await loadContentReactionSummaries("COOP_NEWS", ["news-1"], "member-1");

    expect(summaries.get("news-1")).toEqual({
      likeCount: 0,
      likedByCurrentUser: false,
    });
  });

  it("groups like summaries by target and current user", async () => {
    mockPrisma.contentReaction = {
      findMany: vi.fn().mockResolvedValue([
        { userId: "member-1", coopNewsId: "news-1", freePostId: null, documentId: null },
        { userId: "member-2", coopNewsId: "news-1", freePostId: null, documentId: null },
        { userId: "member-2", coopNewsId: "news-2", freePostId: null, documentId: null },
      ]),
    };
    const { loadContentReactionSummaries } = await import("@/lib/server/content-reaction-summaries");

    const summaries = await loadContentReactionSummaries("COOP_NEWS", ["news-1", "news-2"], "member-1");

    expect(summaries.get("news-1")).toEqual({
      likeCount: 2,
      likedByCurrentUser: true,
    });
    expect(summaries.get("news-2")).toEqual({
      likeCount: 1,
      likedByCurrentUser: false,
    });
  });
});
