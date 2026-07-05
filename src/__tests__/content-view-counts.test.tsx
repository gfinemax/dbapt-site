import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { NoticeBoard } from "@/components/news/notice-board";
import { FreeBoard } from "@/components/news/free-board";
import { DocumentTable, type Document } from "@/components/portal/document-table";
import { MeetingsTable } from "@/components/disclosure/meetings-table";

const mockGetSession = vi.hoisted(() => vi.fn());
const mockDownloadDocumentFile = vi.hoisted(() => vi.fn());
const mockPrisma = vi.hoisted(() => ({
  coopNews: {
    update: vi.fn(),
  },
  document: {
    findUnique: vi.fn(),
    update: vi.fn(),
  },
  documentLog: {
    create: vi.fn(),
  },
  freePost: {
    findUnique: vi.fn(),
    update: vi.fn(),
  },
}));

vi.mock("@/lib/auth", () => ({
  getSession: mockGetSession,
}));

vi.mock("@/lib/db", () => ({
  prisma: mockPrisma,
}));

vi.mock("@/lib/document-storage", () => ({
  downloadDocumentFile: mockDownloadDocumentFile,
}));

vi.mock("@/components/portal/pdf-viewer-modal", () => ({
  PdfViewerModal: ({ documentTitle }: { documentTitle: string }) => (
    <div data-testid="pdf-viewer-title">{documentTitle}</div>
  ),
}));

const notice = {
  id: "notice-views",
  title: "조회수 공지",
  content: "공지 본문",
  category: "NOTICE",
  viewCount: 42,
  isStarred: false,
  author: { id: "admin-1", name: "사무국", loginId: "admin", role: "ADMIN" },
  createdAt: "2026-07-04T00:00:00.000Z",
  registeredAt: "2026-07-04T00:00:00.000Z",
  updatedAt: "2026-07-04T00:00:00.000Z",
  comments: [],
};

const freePost = {
  id: "free-views",
  title: "조회수 자유글",
  content: "자유글 본문",
  postType: "FREE",
  viewCount: 7,
  isStarred: false,
  author: { id: "member-1", name: "조합원", loginId: "member", role: "MEMBER" },
  createdAt: "2026-07-04T00:00:00.000Z",
  registeredAt: "2026-07-04T00:00:00.000Z",
  updatedAt: "2026-07-04T00:00:00.000Z",
  comments: [],
};

const document: Document = {
  id: "doc-views",
  title: "열람수 공개자료",
  description: "공개자료 설명",
  category: "DISCLOSURE",
  subCategory: "총회 의사록",
  fileName: "minutes.pdf",
  fileSize: 1024,
  status: "APPROVED",
  viewCount: 13,
  publishedAt: "2026-07-04T00:00:00.000Z",
  documentDate: "2026-07-04T00:00:00.000Z",
  createdAt: "2026-07-04T00:00:00.000Z",
};

describe("content view counts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetSession.mockResolvedValue({ id: "member-1", role: "MEMBER", loginId: "member", name: "조합원" });
    mockDownloadDocumentFile.mockResolvedValue(new Blob(["%PDF-1.4"], { type: "application/pdf" }));
  });

  it("shows notice view counts in the list and detail metadata", async () => {
    render(
      <NoticeBoard
        isLoggedIn
        isAdmin={false}
        newsList={[notice]}
        onRefresh={vi.fn()}
      />,
    );

    expect(screen.getByText("조회 42회")).toBeInTheDocument();
    fireEvent.click(screen.getByText("조회수 공지"));

    const dialog = screen.getByRole("dialog", { name: "공지사항 상세 열람" });
    expect(within(dialog).getByText("조회 42회")).toBeInTheDocument();
  });

  it("uses a dedicated notice view-count column instead of the comment column", () => {
    render(
      <NoticeBoard
        isLoggedIn
        isAdmin={false}
        newsList={[notice]}
        onRefresh={vi.fn()}
      />,
    );

    const table = screen.getByRole("table", { name: "공지사항 목록" });
    expect(within(table).getByRole("columnheader", { name: "조회수" })).toBeInTheDocument();
    expect(within(table).queryByRole("columnheader", { name: "댓글" })).not.toBeInTheDocument();
    expect(within(table).getByText("조회 42회")).toBeInTheDocument();
    expect(screen.getByText("조회수는 2026.07.05부터 집계됩니다.")).toBeInTheDocument();
  });

  it("increments a news post view count through the view endpoint", async () => {
    mockPrisma.coopNews.update.mockResolvedValue({ id: "notice-views", viewCount: 43 });

    const { POST } = await import("@/app/api/news/[id]/view/route");
    const response = await POST(new Request("http://localhost/api/news/notice-views/view", { method: "POST" }), {
      params: Promise.resolve({ id: "notice-views" }),
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(mockPrisma.coopNews.update).toHaveBeenCalledWith({
      where: { id: "notice-views" },
      data: { viewCount: { increment: 1 } },
      select: { id: true, viewCount: true },
    });
    expect(data).toEqual({ success: true, id: "notice-views", viewCount: 43 });
  });

  it("shows free-board post view counts in the list and focus panel metadata", async () => {
    render(
      <FreeBoard
        session={{ id: "member-1", name: "조합원", loginId: "member", role: "MEMBER" }}
        posts={[freePost]}
        onRefresh={vi.fn()}
      />,
    );

    expect(screen.getByText("조회 7회")).toBeInTheDocument();
    fireEvent.click(screen.getByText("조회수 자유글"));

    const panel = screen.getByLabelText("토론 집중 패널");
    expect(within(panel).getByText("조회 7회")).toBeInTheDocument();
  });

  it("keeps free-board comment counts and adds a dedicated view-count column", () => {
    render(
      <FreeBoard
        session={{ id: "member-1", name: "조합원", loginId: "member", role: "MEMBER" }}
        posts={[freePost]}
        onRefresh={vi.fn()}
      />,
    );

    const table = screen.getByRole("table", { name: "자유게시판 게시글 목록" });
    expect(within(table).getByRole("columnheader", { name: "댓글" })).toBeInTheDocument();
    expect(within(table).getByRole("columnheader", { name: "조회수" })).toBeInTheDocument();
    expect(within(table).getByText("조회 7회")).toBeInTheDocument();
    expect(screen.getByText("조회수는 2026.07.05부터 집계됩니다.")).toBeInTheDocument();
  });

  it("increments a free-board post view count through the view endpoint", async () => {
    mockPrisma.freePost.findUnique.mockResolvedValue({
      id: "free-views",
      isPublicShareEnabled: false,
    });
    mockPrisma.freePost.update.mockResolvedValue({ id: "free-views", viewCount: 8 });

    const { POST } = await import("@/app/api/news/free/[id]/view/route");
    const response = await POST(new Request("http://localhost/api/news/free/free-views/view", { method: "POST" }), {
      params: Promise.resolve({ id: "free-views" }),
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(mockPrisma.freePost.update).toHaveBeenCalledWith({
      where: { id: "free-views" },
      data: { viewCount: { increment: 1 } },
      select: { id: true, viewCount: true },
    });
    expect(data).toEqual({ success: true, id: "free-views", viewCount: 8 });
  });

  it("shows document read counts in disclosure document cards and tables", () => {
    render(<DocumentTable documents={[document]} role="MEMBER" />);

    expect(screen.getAllByText("열람 13회").length).toBeGreaterThan(0);
  });

  it("shows a disclosure read-count column and collection baseline notice", () => {
    render(<MeetingsTable isLoggedIn documents={[document]} />);

    const table = screen.getByRole("table");
    expect(within(table).getByRole("columnheader", { name: "열람수" })).toBeInTheDocument();
    expect(within(table).getByText("열람 13회")).toBeInTheDocument();
    expect(screen.getByText("열람수는 2026.07.05부터 집계됩니다.")).toBeInTheDocument();
  });

  it("increments a document read count when the PDF view is served", async () => {
    mockPrisma.document.findUnique.mockResolvedValue({
      id: "doc-views",
      title: "열람수 공개자료",
      category: "DISCLOSURE",
      status: "APPROVED",
      fileName: "minutes.pdf",
      filePath: "documents/minutes.pdf",
    });
    mockPrisma.document.update.mockResolvedValue({ id: "doc-views", viewCount: 14 });

    const { GET } = await import("@/app/api/documents/[id]/view/route");
    const response = await GET(new Request("http://localhost/api/documents/doc-views/view"), {
      params: Promise.resolve({ id: "doc-views" }),
    });

    expect(response.status).toBe(200);
    expect(mockPrisma.document.update).toHaveBeenCalledWith({
      where: { id: "doc-views" },
      data: { viewCount: { increment: 1 } },
      select: { id: true, viewCount: true },
    });
  });
});
