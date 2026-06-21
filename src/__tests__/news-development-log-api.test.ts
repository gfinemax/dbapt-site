import { describe, expect, it, vi, beforeEach } from "vitest";
import { DEVELOPMENT_LOG_CATEGORIES } from "@/lib/news/development-log";
import * as newsRoute from "@/app/api/news/route";
import * as commentsRoute from "@/app/api/news/comments/route";
import * as draftRoute from "@/app/api/news/development-log/draft/route";

const mockGetSession = vi.hoisted(() => vi.fn());
const mockPrisma = vi.hoisted(() => ({
  coopNews: {
    create: vi.fn(),
    findUnique: vi.fn(),
    delete: vi.fn(),
  },
  coopNewsComment: {
    create: vi.fn(),
  },
}));
const mockExecFileSync = vi.hoisted(() => vi.fn());

vi.mock("@/lib/auth", () => ({
  getSession: mockGetSession,
}));

vi.mock("@/lib/db", () => ({
  prisma: mockPrisma,
}));

vi.mock("node:child_process", () => ({
  execFileSync: mockExecFileSync,
  default: {
    execFileSync: mockExecFileSync,
  },
}));

describe("development log draft API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects non-admin draft generation", async () => {
    mockGetSession.mockResolvedValue({ id: "member-1", role: "MEMBER" });

    const response = await draftRoute.POST(new Request("http://localhost/api/news/development-log/draft"));

    expect(response.status).toBe(403);
    expect(await response.json()).toMatchObject({ error: "관리자 권한이 필요합니다." });
    expect(mockPrisma.coopNews.create).not.toHaveBeenCalled();
  });

  it("creates a draft development log from recent commit messages", async () => {
    mockGetSession.mockResolvedValue({ id: "admin-1", role: "ADMIN" });
    mockExecFileSync.mockReturnValue("사업현황 향후 추진절차 수정\n모바일 자료실 표시 오류 수정\n");
    mockPrisma.coopNews.create.mockResolvedValue({
      id: "devlog-1",
      category: DEVELOPMENT_LOG_CATEGORIES.draft,
      title: "2026년 6월 4주차 업데이트",
      content: "자동 생성 본문",
    });

    const response = await draftRoute.POST(
      new Request("http://localhost/api/news/development-log/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: "2026-06-21T09:00:00+09:00" }),
      }),
    );

    expect(response.status).toBe(200);
    expect(mockPrisma.coopNews.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        category: DEVELOPMENT_LOG_CATEGORIES.draft,
        title: "2026년 6월 4주차 업데이트",
        authorId: "admin-1",
        displayAuthorName: "운영자",
      }),
    }));
    expect(mockPrisma.coopNews.create.mock.calls[0][0].data.content).toContain(
      "- 사업현황 향후 추진절차 수정",
    );
    expect(mockPrisma.coopNews.create.mock.calls[0][0].data.content).toContain("버전\nv2026.06.4");
    expect(await response.json()).toMatchObject({ success: true, news: { id: "devlog-1" } });
  });

  it("lets logged-in members create public development requirements", async () => {
    mockGetSession.mockResolvedValue({ id: "member-1", role: "MEMBER" });
    mockPrisma.coopNews.create.mockResolvedValue({
      id: "request-1",
      category: DEVELOPMENT_LOG_CATEGORIES.request,
      title: "모바일 메뉴 개선 요청",
      content: "모바일에서 개발일지를 더 쉽게 찾고 싶습니다.",
    });

    const response = await newsRoute.POST(
      new Request("http://localhost/api/news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "모바일 메뉴 개선 요청",
          content: "모바일에서 개발일지를 더 쉽게 찾고 싶습니다.",
          category: DEVELOPMENT_LOG_CATEGORIES.request,
        }),
      }),
    );

    expect(response.status).toBe(200);
    expect(mockPrisma.coopNews.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        category: DEVELOPMENT_LOG_CATEGORIES.request,
        authorId: "member-1",
      }),
    }));
    expect(await response.json()).toMatchObject({ success: true, news: { id: "request-1" } });
  });

  it("keeps non-admin members from creating development-log release posts", async () => {
    mockGetSession.mockResolvedValue({ id: "member-1", role: "MEMBER" });

    const response = await newsRoute.POST(
      new Request("http://localhost/api/news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "관리자 개발일지",
          content: "관리자가 작성해야 하는 개발일지입니다.",
          category: DEVELOPMENT_LOG_CATEGORIES.published,
        }),
      }),
    );

    expect(response.status).toBe(403);
    expect(mockPrisma.coopNews.create).not.toHaveBeenCalled();
  });

  it("lets logged-in members comment on development logs and requirement posts", async () => {
    mockGetSession.mockResolvedValue({ id: "member-1", role: "MEMBER" });
    mockPrisma.coopNews.findUnique.mockResolvedValue({
      id: "request-1",
      category: DEVELOPMENT_LOG_CATEGORIES.request,
    });
    mockPrisma.coopNewsComment.create.mockResolvedValue({
      id: "comment-1",
      newsId: "request-1",
      content: "저도 같은 요구사항입니다.",
    });

    const response = await commentsRoute.POST(
      new Request("http://localhost/api/news/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newsId: "request-1",
          content: " 저도 같은 요구사항입니다. ",
        }),
      }),
    );

    expect(response.status).toBe(200);
    expect(mockPrisma.coopNewsComment.create).toHaveBeenCalledWith(expect.objectContaining({
      data: {
        newsId: "request-1",
        content: "저도 같은 요구사항입니다.",
        authorId: "member-1",
      },
    }));
    expect(await response.json()).toMatchObject({ success: true, comment: { id: "comment-1" } });
  });

  it("lets members delete their own development requirement posts", async () => {
    mockGetSession.mockResolvedValue({ id: "member-1", role: "MEMBER" });
    mockPrisma.coopNews.findUnique.mockResolvedValue({
      id: "request-1",
      category: DEVELOPMENT_LOG_CATEGORIES.request,
      authorId: "member-1",
    });
    mockPrisma.coopNews.delete.mockResolvedValue({ id: "request-1" });

    const response = await newsRoute.DELETE(
      new Request("http://localhost/api/news?id=request-1", { method: "DELETE" }),
    );

    expect(response.status).toBe(200);
    expect(mockPrisma.coopNews.delete).toHaveBeenCalledWith({ where: { id: "request-1" } });
  });

  it("rejects deleting another member's development requirement post", async () => {
    mockGetSession.mockResolvedValue({ id: "member-2", role: "MEMBER" });
    mockPrisma.coopNews.findUnique.mockResolvedValue({
      id: "request-1",
      category: DEVELOPMENT_LOG_CATEGORIES.request,
      authorId: "member-1",
    });

    const response = await newsRoute.DELETE(
      new Request("http://localhost/api/news?id=request-1", { method: "DELETE" }),
    );

    expect(response.status).toBe(403);
    expect(await response.json()).toMatchObject({ error: "삭제 권한이 없습니다." });
    expect(mockPrisma.coopNews.delete).not.toHaveBeenCalled();
  });
});
