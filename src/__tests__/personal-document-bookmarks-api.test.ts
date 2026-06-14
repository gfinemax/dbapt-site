// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";

const getSessionMock = vi.fn();
const prismaMock = {
  personalDocumentBookmark: {
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

describe("personal document bookmark API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a bookmark for the current user", async () => {
    getSessionMock.mockResolvedValue({
      id: "member-1",
      loginId: "member1",
      name: "이조합",
      role: "MEMBER",
    });
    prismaMock.personalDocumentBookmark.upsert.mockResolvedValue({
      id: "bookmark-1",
      userId: "member-1",
      documentId: "doc-1",
    });

    const { POST } = await import("@/app/api/me/document-bookmarks/route");
    const response = await POST(
      new Request("http://localhost/api/me/document-bookmarks", {
        method: "POST",
        body: JSON.stringify({ documentId: "doc-1" }),
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(prismaMock.personalDocumentBookmark.upsert).toHaveBeenCalledWith({
      where: { userId_documentId: { userId: "member-1", documentId: "doc-1" } },
      update: {},
      create: { userId: "member-1", documentId: "doc-1" },
    });
    expect(body.bookmarked).toBe(true);
  });

  it("removes only the current user's bookmark", async () => {
    getSessionMock.mockResolvedValue({
      id: "member-1",
      loginId: "member1",
      name: "이조합",
      role: "MEMBER",
    });
    prismaMock.personalDocumentBookmark.deleteMany.mockResolvedValue({ count: 1 });

    const { DELETE } = await import("@/app/api/me/document-bookmarks/route");
    const response = await DELETE(
      new Request("http://localhost/api/me/document-bookmarks?documentId=doc-1", {
        method: "DELETE",
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(prismaMock.personalDocumentBookmark.deleteMany).toHaveBeenCalledWith({
      where: { userId: "member-1", documentId: "doc-1" },
    });
    expect(body.bookmarked).toBe(false);
  });
});
