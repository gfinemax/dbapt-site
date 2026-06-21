import { describe, expect, it, vi, beforeEach } from "vitest";
import { DEVELOPMENT_LOG_CATEGORIES } from "@/lib/news/development-log";
import * as draftRoute from "@/app/api/news/development-log/draft/route";

const mockGetSession = vi.hoisted(() => vi.fn());
const mockPrisma = vi.hoisted(() => ({
  coopNews: {
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
});
