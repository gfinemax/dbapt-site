// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";

const getSessionMock = vi.fn();
const prismaMock = {
  personalContentBookmark: {
    upsert: vi.fn(),
    deleteMany: vi.fn(),
  },
};

vi.mock("@/lib/auth", () => ({
  getSession: getSessionMock,
}));

vi.mock("@/lib/db", () => ({
  prisma: prismaMock,
}));

describe("personal content bookmark API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a coop news bookmark for the current user", async () => {
    getSessionMock.mockResolvedValue({
      id: "member-1",
      loginId: "member1",
      name: "이조합",
      role: "MEMBER",
    });
    prismaMock.personalContentBookmark.upsert.mockResolvedValue({
      id: "bookmark-1",
      userId: "member-1",
      targetType: "COOP_NEWS",
      targetId: "notice-1",
    });

    const { POST } = await import("@/app/api/me/content-bookmarks/route");
    const response = await POST(
      new Request("http://localhost/api/me/content-bookmarks", {
        method: "POST",
        body: JSON.stringify({ targetType: "COOP_NEWS", targetId: "notice-1" }),
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(prismaMock.personalContentBookmark.upsert).toHaveBeenCalledWith({
      where: {
        userId_targetType_targetId: {
          userId: "member-1",
          targetType: "COOP_NEWS",
          targetId: "notice-1",
        },
      },
      update: {},
      create: {
        userId: "member-1",
        targetType: "COOP_NEWS",
        targetId: "notice-1",
      },
    });
    expect(body.bookmarked).toBe(true);
  });

  it("removes only the current user's free post bookmark", async () => {
    getSessionMock.mockResolvedValue({
      id: "member-1",
      loginId: "member1",
      name: "이조합",
      role: "MEMBER",
    });
    prismaMock.personalContentBookmark.deleteMany.mockResolvedValue({ count: 1 });

    const { DELETE } = await import("@/app/api/me/content-bookmarks/route");
    const response = await DELETE(
      new Request("http://localhost/api/me/content-bookmarks?targetType=FREE_POST&targetId=free-1", {
        method: "DELETE",
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(prismaMock.personalContentBookmark.deleteMany).toHaveBeenCalledWith({
      where: { userId: "member-1", targetType: "FREE_POST", targetId: "free-1" },
    });
    expect(body.bookmarked).toBe(false);
  });
});
