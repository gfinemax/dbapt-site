import React from "react";
import { existsSync, readdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NoticeBoard } from "@/components/news/notice-board";
import { CoopNewsletter } from "@/components/news/coop-newsletter";
import { FreeBoard } from "@/components/news/free-board";
import { NewsClient } from "@/components/news/news-client";
import { NoticeRichContent } from "@/components/news/notice-rich-editor";
import * as newsRoute from "@/app/api/news/route";
import * as noticeCommentsRoute from "@/app/api/news/comments/route";
import * as freeRoute from "@/app/api/news/free/route";
import * as uploadRoute from "@/app/api/upload/route";

const mockGetSession = vi.hoisted(() => vi.fn());
const mockRouterPush = vi.hoisted(() => vi.fn());
const mockPrisma = vi.hoisted(() => ({
  coopNews: {
    create: vi.fn(),
    update: vi.fn(),
    findMany: vi.fn(),
    findUnique: vi.fn(),
    delete: vi.fn(),
  },
  freePost: {
    create: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  freeComment: {
    create: vi.fn(),
    findUnique: vi.fn(),
    delete: vi.fn(),
  },
  coopNewsComment: {
    create: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));
const mockMkdir = vi.hoisted(() => vi.fn());
const mockWriteFile = vi.hoisted(() => vi.fn());
const testUploadNames = ["notice.pdf", "blob"];

vi.mock("@/lib/auth", () => ({
  getSession: mockGetSession,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockRouterPush }),
  useSearchParams: () => new URLSearchParams(""),
}));

vi.mock("@/lib/db", () => ({
  prisma: mockPrisma,
}));

vi.mock("node:fs/promises", async (importOriginal) => {
  const actual = await importOriginal<typeof import("node:fs/promises")>();
  return {
    ...actual,
    mkdir: mockMkdir,
    writeFile: mockWriteFile,
  };
});

afterEach(() => {
  const uploadDir = join(process.cwd(), "public", "uploads");
  if (!existsSync(uploadDir)) return;

  for (const name of readdirSync(uploadDir)) {
    if (testUploadNames.some((suffix) => name.endsWith(suffix))) {
      rmSync(join(uploadDir, name), { force: true });
    }
  }
});

const realNotice = {
  id: "notice-1",
  title: "실제 공지",
  content: "실제 공지 내용",
  viewCount: 0,
  isStarred: false,
  author: { name: "관리자", role: "ADMIN" },
  createdAt: "2026-06-01T00:00:00.000Z",
  updatedAt: "2026-06-01T00:00:00.000Z",
  category: "NOTICE",
  imagePath: "/uploads/notice.png",
  attachmentPath: "/uploads/notice.pdf",
  attachmentName: "notice.pdf",
  attachmentSize: 1024,
  comments: [],
};

const realNewsletter = {
  ...realNotice,
  id: "newsletter-1",
  title: "실제 조합뉴스",
  category: "WEEKLY_MONTHLY",
};

const realFreePost = {
  id: "free-1",
  title: "실제 자유게시글",
  content: "실제 자유게시글 내용",
  createdAt: "2026-06-01T00:00:00.000Z",
  updatedAt: "2026-06-01T00:00:00.000Z",
  author: { id: "member-1", name: "조합원", loginId: "member1", role: "MEMBER" },
  comments: [],
};

const freeComment = {
  id: "comment-1",
  content: "원댓글입니다.",
  postId: "free-1",
  parentId: null,
  createdAt: "2026-06-01T01:00:00.000Z",
  author: { id: "member-1", name: "조합원", loginId: "member1", role: "MEMBER" },
};

const noticeComment = {
  id: "notice-comment-1",
  content: "확인했습니다.",
  newsId: "notice-1",
  parentId: null,
  createdAt: "2026-06-01T02:00:00.000Z",
  author: { id: "member-1", name: "조합원", loginId: "member1", role: "MEMBER" },
};

function jsonRequest(body: Record<string, unknown>) {
  return new Request("http://localhost/api/news", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("news admin API controls", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockMkdir.mockResolvedValue(undefined);
    mockWriteFile.mockResolvedValue(undefined);
  });

  it("rejects notice creation for non-admin sessions", async () => {
    mockGetSession.mockResolvedValue({ id: "member-1", role: "MEMBER" });
    mockPrisma.coopNews.create.mockResolvedValue(realNotice);

    const response = await newsRoute.POST(
      jsonRequest({ title: "공지", content: "본문", category: "NOTICE" }),
    );

    expect(response.status).toBe(403);
    expect(await response.json()).toMatchObject({ error: "관리자 권한이 필요합니다." });
    expect(mockPrisma.coopNews.create).not.toHaveBeenCalled();
  });

  it("rejects notice deletion for non-admin sessions", async () => {
    mockGetSession.mockResolvedValue({ id: "member-1", role: "MEMBER" });
    mockPrisma.coopNews.findUnique.mockResolvedValue(realNotice);

    const response = await newsRoute.DELETE(
      new Request("http://localhost/api/news?id=notice-1", { method: "DELETE" }),
    );

    expect(response.status).toBe(403);
    expect(await response.json()).toMatchObject({ error: "관리자 권한이 필요합니다." });
    expect(mockPrisma.coopNews.delete).not.toHaveBeenCalled();
  });

  it("rejects notice updates for non-admin sessions", async () => {
    mockGetSession.mockResolvedValue({ id: "member-1", role: "MEMBER" });
    mockPrisma.coopNews.update.mockResolvedValue(realNotice);

    const response = await newsRoute.PATCH(
      jsonRequest({ id: "notice-1", title: "수정", content: "본문", category: "NOTICE" }),
    );

    expect(response.status).toBe(403);
    expect(await response.json()).toMatchObject({ error: "관리자 권한이 필요합니다." });
    expect(mockPrisma.coopNews.update).not.toHaveBeenCalled();
  });

  it("updates notice content and attachment metadata for admins", async () => {
    mockGetSession.mockResolvedValue({ id: "admin-1", role: "ADMIN" });
    mockPrisma.coopNews.update.mockResolvedValue({ ...realNotice, title: "수정 공지" });

    const response = await newsRoute.PATCH(
      jsonRequest({
        id: "notice-1",
        title: "수정 공지",
        content: "수정 본문",
        category: "NOTICE",
        imagePath: "/uploads/updated.png",
        attachmentPath: "/uploads/updated.pdf",
        attachmentName: "updated.pdf",
        attachmentSize: 2048,
        isStarred: true,
      }),
    );

    expect(response.status).toBe(200);
    expect(mockPrisma.coopNews.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: "notice-1" },
      data: expect.objectContaining({
        title: "수정 공지",
        content: "수정 본문",
        imagePath: "/uploads/updated.png",
        attachmentPath: "/uploads/updated.pdf",
        attachmentName: "updated.pdf",
        attachmentSize: 2048,
        isStarred: true,
      }),
    }));
  });

  it("rejects notice comments for unauthenticated sessions", async () => {
    mockGetSession.mockResolvedValue(null);

    const response = await noticeCommentsRoute.POST(
      new Request("http://localhost/api/news/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newsId: "notice-1", content: "확인했습니다." }),
      }),
    );

    expect(response.status).toBe(401);
    expect(await response.json()).toMatchObject({ error: "로그인이 필요합니다." });
    expect(mockPrisma.coopNewsComment.create).not.toHaveBeenCalled();
  });

  it("creates notice comments for logged-in members", async () => {
    mockGetSession.mockResolvedValue({ id: "member-1", role: "MEMBER" });
    mockPrisma.coopNews.findUnique.mockResolvedValue({ id: "notice-1", category: "NOTICE" });
    mockPrisma.coopNewsComment.create.mockResolvedValue(noticeComment);

    const response = await noticeCommentsRoute.POST(
      new Request("http://localhost/api/news/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newsId: "notice-1", content: " 확인했습니다. " }),
      }),
    );

    expect(response.status).toBe(200);
    expect(mockPrisma.coopNewsComment.create).toHaveBeenCalledWith(expect.objectContaining({
      data: {
        newsId: "notice-1",
        content: "확인했습니다.",
        authorId: "member-1",
      },
    }));
    expect(await response.json()).toMatchObject({ success: true, comment: noticeComment });
  });

  it("stores administrator display author names on notice comments", async () => {
    mockGetSession.mockResolvedValue({ id: "admin-1", role: "ADMIN" });
    mockPrisma.coopNews.findUnique.mockResolvedValue({ id: "notice-1", category: "NOTICE" });
    mockPrisma.coopNewsComment.create.mockResolvedValue({
      ...noticeComment,
      displayAuthorName: "사무국",
    });

    const response = await noticeCommentsRoute.POST(
      new Request("http://localhost/api/news/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newsId: "notice-1",
          content: " 관리자 확인 의견 ",
          displayAuthorName: "사무국",
        }),
      }),
    );

    expect(response.status).toBe(200);
    expect(mockPrisma.coopNewsComment.create).toHaveBeenCalledWith(expect.objectContaining({
      data: {
        newsId: "notice-1",
        content: "관리자 확인 의견",
        authorId: "admin-1",
        displayAuthorName: "사무국",
      },
    }));
  });

  it("creates notice comment replies under the top-level parent comment", async () => {
    mockGetSession.mockResolvedValue({ id: "member-2", role: "MEMBER" });
    mockPrisma.coopNews.findUnique.mockResolvedValue({ id: "notice-1", category: "NOTICE" });
    mockPrisma.coopNewsComment.findUnique.mockResolvedValue({
      ...noticeComment,
      id: "notice-reply-1",
      parentId: "notice-comment-1",
    });
    mockPrisma.coopNewsComment.create.mockResolvedValue({
      ...noticeComment,
      id: "notice-reply-new",
      content: "@조합원 확인 답글",
      parentId: "notice-comment-1",
    });

    const response = await noticeCommentsRoute.POST(
      new Request("http://localhost/api/news/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newsId: "notice-1",
          parentCommentId: "notice-reply-1",
          content: "@조합원 확인 답글",
        }),
      }),
    );

    expect(response.status).toBe(200);
    expect(mockPrisma.coopNewsComment.findUnique).toHaveBeenCalledWith({
      where: { id: "notice-reply-1" },
      select: { id: true, newsId: true, parentId: true },
    });
    expect(mockPrisma.coopNewsComment.create).toHaveBeenCalledWith(expect.objectContaining({
      data: {
        newsId: "notice-1",
        content: "@조합원 확인 답글",
        authorId: "member-2",
        parentId: "notice-comment-1",
      },
    }));
  });

  it("rejects notice comment replies for a different notice", async () => {
    mockGetSession.mockResolvedValue({ id: "member-2", role: "MEMBER" });
    mockPrisma.coopNews.findUnique.mockResolvedValue({ id: "notice-1", category: "NOTICE" });
    mockPrisma.coopNewsComment.findUnique.mockResolvedValue({
      ...noticeComment,
      id: "notice-comment-other",
      newsId: "notice-other",
      parentId: null,
    });

    const response = await noticeCommentsRoute.POST(
      new Request("http://localhost/api/news/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newsId: "notice-1",
          parentCommentId: "notice-comment-other",
          content: "다른 공지 댓글에는 답글 불가",
        }),
      }),
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({ error: "답글 대상 댓글이 공지사항과 일치하지 않습니다." });
    expect(mockPrisma.coopNewsComment.create).not.toHaveBeenCalled();
  });

  it("updates notice comments for the author or administrators", async () => {
    mockGetSession.mockResolvedValue({ id: "admin-1", role: "ADMIN" });
    mockPrisma.coopNewsComment.findUnique.mockResolvedValue({
      ...noticeComment,
      authorId: "member-1",
      news: { category: "NOTICE" },
    });
    mockPrisma.coopNewsComment.update.mockResolvedValue({
      ...noticeComment,
      content: "수정된 댓글",
      displayAuthorName: "운영자",
    });

    const response = await noticeCommentsRoute.PATCH(
      new Request("http://localhost/api/news/comments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          commentId: "notice-comment-1",
          content: " 수정된 댓글 ",
          displayAuthorName: "운영자",
        }),
      }),
    );

    expect(response.status).toBe(200);
    expect(mockPrisma.coopNewsComment.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: "notice-comment-1" },
      data: {
        content: "수정된 댓글",
        displayAuthorName: "운영자",
      },
    }));
  });

  it("deletes notice comments for the author or administrators", async () => {
    mockGetSession.mockResolvedValue({ id: "admin-1", role: "ADMIN" });
    mockPrisma.coopNewsComment.findUnique.mockResolvedValue({
      ...noticeComment,
      authorId: "member-1",
      news: { category: "NOTICE" },
    });
    mockPrisma.coopNewsComment.delete.mockResolvedValue(noticeComment);

    const response = await noticeCommentsRoute.DELETE(
      new Request("http://localhost/api/news/comments?commentId=notice-comment-1", {
        method: "DELETE",
      }),
    );

    expect(response.status).toBe(200);
    expect(mockPrisma.coopNewsComment.delete).toHaveBeenCalledWith({
      where: { id: "notice-comment-1" },
    });
  });

  it("rejects image upload for unauthenticated sessions", async () => {
    mockGetSession.mockResolvedValue(null);
    const formData = new FormData();
    formData.set("file", new File(["image"], "notice.png", { type: "image/png" }));

    const response = await uploadRoute.POST(
      new Request("http://localhost/api/upload", { method: "POST", body: formData }),
    );

    expect(response.status).toBe(401);
    expect(await response.json()).toMatchObject({ error: "인증되지 않은 사용자입니다." });
    expect(mockWriteFile).not.toHaveBeenCalled();
  });

  it("rejects oversized image uploads", async () => {
    mockGetSession.mockResolvedValue({ id: "admin-1", role: "ADMIN" });
    const request = {
      formData: async () => ({
        get: () => ({
          name: "large.png",
          type: "image/png",
          size: 5 * 1024 * 1024 + 1,
          arrayBuffer: async () => new ArrayBuffer(0),
        }),
      }),
    } as unknown as Request;

    const response = await uploadRoute.POST(request);

    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({ error: "이미지는 5MB 이하만 업로드할 수 있습니다." });
    expect(mockWriteFile).not.toHaveBeenCalled();
  });

  it("rejects disguised non-image upload names", async () => {
    mockGetSession.mockResolvedValue({ id: "admin-1", role: "ADMIN" });
    const request = {
      formData: async () => ({
        get: () => ({
          name: "vector.svg",
          type: "image/svg+xml",
          size: 3,
          arrayBuffer: async () => new ArrayBuffer(0),
        }),
      }),
    } as unknown as Request;

    const response = await uploadRoute.POST(request);

    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({ error: "jpg, png, gif, webp 이미지만 업로드할 수 있습니다." });
    expect(mockWriteFile).not.toHaveBeenCalled();
  });

  it("rejects image files when uploaded as attachments", async () => {
    mockGetSession.mockResolvedValue({ id: "admin-1", role: "ADMIN" });
    const request = {
      formData: async () => ({
        get: (name: string) => {
          if (name === "kind") return "attachment";
          return {
            name: "photo.png",
            type: "image/png",
            size: 3,
            arrayBuffer: async () => new ArrayBuffer(0),
          };
        },
      }),
    } as unknown as Request;

    const response = await uploadRoute.POST(request);

    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({ error: "이미지는 본문 이미지로만 업로드할 수 있습니다." });
    expect(mockWriteFile).not.toHaveBeenCalled();
  });

  it("allows authenticated member body image uploads but keeps attachments admin-only", async () => {
    mockGetSession.mockResolvedValue({ id: "member-1", role: "MEMBER" });

    const imageResponse = await uploadRoute.POST({
      formData: async () => ({
        get: (name: string) => {
          if (name === "kind") return "image";
          return {
            name: "freeboard.png",
            type: "image/png",
            size: 5,
            arrayBuffer: async () => new ArrayBuffer(5),
          };
        },
      }),
    } as unknown as Request);

    expect(imageResponse.status).toBe(200);
    expect(await imageResponse.json()).toMatchObject({
      success: true,
      name: "freeboard.png",
      kind: "image",
    });

    const attachmentResponse = await uploadRoute.POST({
      formData: async () => ({
        get: (name: string) => {
          if (name === "kind") return "attachment";
          return {
            name: "notice.pdf",
            type: "application/pdf",
            size: 5,
            arrayBuffer: async () => new ArrayBuffer(5),
          };
        },
      }),
    } as unknown as Request);

    expect(attachmentResponse.status).toBe(403);
    expect(await attachmentResponse.json()).toMatchObject({ error: "관리자 권한이 필요합니다." });
  });

  it("accepts public attachment uploads with a separate size cap", async () => {
    mockGetSession.mockResolvedValue({ id: "admin-1", role: "ADMIN" });
    const request = {
      formData: async () => ({
        get: (name: string) => {
          if (name === "kind") return "attachment";
          return {
            name: "notice.pdf",
            type: "application/pdf",
            size: 3,
            arrayBuffer: async () => new ArrayBuffer(3),
          };
        },
      }),
    } as unknown as Request;

    const response = await uploadRoute.POST(request);

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      success: true,
      name: "notice.pdf",
      size: 3,
    });
  });

  it("rejects oversized attachment uploads", async () => {
    mockGetSession.mockResolvedValue({ id: "admin-1", role: "ADMIN" });
    const request = {
      formData: async () => ({
        get: (name: string) => {
          if (name === "kind") return "attachment";
          return {
            name: "large.pdf",
            type: "application/pdf",
            size: 20 * 1024 * 1024 + 1,
            arrayBuffer: async () => new ArrayBuffer(0),
          };
        },
      }),
    } as unknown as Request;

    const response = await uploadRoute.POST(request);

    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({ error: "첨부파일은 20MB 이하만 업로드할 수 있습니다." });
    expect(mockWriteFile).not.toHaveBeenCalled();
  });

  it("persists uploaded attachment metadata when creating news", async () => {
    mockGetSession.mockResolvedValue({ id: "admin-1", role: "ADMIN" });
    mockPrisma.coopNews.create.mockResolvedValue(realNotice);

    const response = await newsRoute.POST(
      jsonRequest({
        title: "첨부 공지",
        content: "본문",
        category: "NOTICE",
        attachmentPath: "/uploads/notice.pdf",
        attachmentName: "notice.pdf",
        attachmentSize: 1024,
      }),
    );

    expect(response.status).toBe(200);
    expect(mockPrisma.coopNews.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        attachmentPath: "/uploads/notice.pdf",
        attachmentName: "notice.pdf",
        attachmentSize: 1024,
      }),
    }));
  });

  it("persists an allowed display author name when administrators create news", async () => {
    mockGetSession.mockResolvedValue({ id: "admin-1", role: "ADMIN" });
    mockPrisma.coopNews.create.mockResolvedValue({ ...realNotice, displayAuthorName: "사무국" });

    const response = await newsRoute.POST(
      jsonRequest({
        title: "작성자 선택 공지",
        content: "본문",
        category: "NOTICE",
        displayAuthorName: "사무국",
      }),
    );

    expect(response.status).toBe(200);
    expect(mockPrisma.coopNews.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        displayAuthorName: "사무국",
        authorId: "admin-1",
      }),
    }));
  });

  it("rejects unsupported display author names when administrators create news", async () => {
    mockGetSession.mockResolvedValue({ id: "admin-1", role: "ADMIN" });

    const response = await newsRoute.POST(
      jsonRequest({
        title: "작성자 선택 공지",
        content: "본문",
        category: "NOTICE",
        displayAuthorName: "감사단",
      }),
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({
      error: "작성자는 사무국 또는 운영자 중에서 선택해 주세요.",
    });
    expect(mockPrisma.coopNews.create).not.toHaveBeenCalled();
  });

  it("creates free-board replies under the top-level parent comment", async () => {
    mockGetSession.mockResolvedValue({ id: "member-2", role: "MEMBER" });
    mockPrisma.freeComment.findUnique.mockResolvedValue({
      ...freeComment,
      id: "comment-reply",
      parentId: "comment-1",
    });
    mockPrisma.freeComment.create.mockResolvedValue({
      ...freeComment,
      id: "comment-new",
      content: "@조합원 다시 답글",
      parentId: "comment-1",
    });

    const response = await freeRoute.POST(
      jsonRequest({
        postId: "free-1",
        parentCommentId: "comment-reply",
        content: "@조합원 다시 답글",
      }),
    );

    expect(response.status).toBe(200);
    expect(mockPrisma.freeComment.findUnique).toHaveBeenCalledWith({
      where: { id: "comment-reply" },
      select: { id: true, postId: true, parentId: true },
    });
    expect(mockPrisma.freeComment.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        postId: "free-1",
        parentId: "comment-1",
        content: "@조합원 다시 답글",
        authorId: "member-2",
      }),
    }));
  });

  it("rejects free-board replies when the parent comment belongs to another post", async () => {
    mockGetSession.mockResolvedValue({ id: "member-2", role: "MEMBER" });
    mockPrisma.freeComment.findUnique.mockResolvedValue({
      ...freeComment,
      postId: "other-free-post",
    });

    const response = await freeRoute.POST(
      jsonRequest({
        postId: "free-1",
        parentCommentId: "comment-1",
        content: "다른 게시글 댓글에는 답글 불가",
      }),
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({ error: "답글 대상 댓글이 게시글과 일치하지 않습니다." });
    expect(mockPrisma.freeComment.create).not.toHaveBeenCalled();
  });

  it("rejects post update for non-author and non-admin sessions", async () => {
    mockGetSession.mockResolvedValue({ id: "member-2", role: "MEMBER" });
    mockPrisma.freePost.findUnique.mockResolvedValue({ ...realFreePost, authorId: "member-1" });

    const response = await freeRoute.PATCH(
      jsonRequest({
        postId: "free-1",
        title: "수정제목",
        content: "수정내용",
      }),
    );

    expect(response.status).toBe(403);
    expect(await response.json()).toMatchObject({ error: "수정 권한이 없습니다." });
    expect(mockPrisma.freePost.update).not.toHaveBeenCalled();
  });

  it("allows post update for the author", async () => {
    mockGetSession.mockResolvedValue({ id: "member-1", role: "MEMBER" });
    mockPrisma.freePost.findUnique.mockResolvedValue({ ...realFreePost, authorId: "member-1" });
    mockPrisma.freePost.update.mockResolvedValue({ ...realFreePost, title: "수정제목", content: "수정내용" });

    const response = await freeRoute.PATCH(
      jsonRequest({
        postId: "free-1",
        title: "수정제목",
        content: "수정내용",
      }),
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ success: true });
    expect(mockPrisma.freePost.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: "free-1" },
      data: { title: "수정제목", content: "수정내용", postType: "FREE" },
    }));
  });

  it("allows post update for administrators", async () => {
    mockGetSession.mockResolvedValue({ id: "admin-1", role: "ADMIN" });
    mockPrisma.freePost.findUnique.mockResolvedValue({ ...realFreePost, authorId: "member-1" });
    mockPrisma.freePost.update.mockResolvedValue({ ...realFreePost, title: "수정제목", content: "수정내용" });

    const response = await freeRoute.PATCH(
      jsonRequest({
        postId: "free-1",
        title: "수정제목",
        content: "수정내용",
      }),
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ success: true });
    expect(mockPrisma.freePost.update).toHaveBeenCalled();
  });

  it("ignores isStarred on post creation for non-admin sessions", async () => {
    mockGetSession.mockResolvedValue({ id: "member-1", role: "MEMBER" });
    mockPrisma.freePost.create.mockResolvedValue(realFreePost);

    const response = await freeRoute.POST(
      jsonRequest({
        title: "신규글",
        content: "내용",
        isStarred: true,
      }),
    );

    expect(response.status).toBe(200);
    expect(mockPrisma.freePost.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        title: "신규글",
        isStarred: false,
      }),
    }));
  });

  it("allows isStarred setting on post creation for admins", async () => {
    mockGetSession.mockResolvedValue({ id: "admin-1", role: "ADMIN" });
    mockPrisma.freePost.create.mockResolvedValue({ ...realFreePost, isStarred: true });

    const response = await freeRoute.POST(
      jsonRequest({
        title: "신규글",
        content: "내용",
        isStarred: true,
      }),
    );

    expect(response.status).toBe(200);
    expect(mockPrisma.freePost.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        title: "신규글",
        isStarred: true,
      }),
    }));
  });

  it("stores administrator display author names on free-board posts and comments", async () => {
    mockGetSession.mockResolvedValue({ id: "admin-1", role: "ADMIN" });
    mockPrisma.freePost.create.mockResolvedValue({ ...realFreePost, displayAuthorName: "운영자" });

    let response = await freeRoute.POST(
      jsonRequest({
        title: "운영자 글",
        content: "내용",
        displayAuthorName: "운영자",
      }),
    );

    expect(response.status).toBe(200);
    expect(mockPrisma.freePost.create).toHaveBeenLastCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        displayAuthorName: "운영자",
      }),
    }));

    mockPrisma.freeComment.create.mockResolvedValue({ ...freeComment, displayAuthorName: "사무국" });
    response = await freeRoute.POST(
      jsonRequest({
        postId: "free-1",
        content: "관리자 댓글",
        displayAuthorName: "사무국",
      }),
    );

    expect(response.status).toBe(200);
    expect(mockPrisma.freeComment.create).toHaveBeenLastCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        displayAuthorName: "사무국",
      }),
    }));
  });

  it("rejects invalid administrator display author names on free-board posts", async () => {
    mockGetSession.mockResolvedValue({ id: "admin-1", role: "ADMIN" });

    const response = await freeRoute.POST(
      jsonRequest({
        title: "잘못된 작성자",
        content: "내용",
        displayAuthorName: "감사단",
      }),
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({
      error: "작성자는 사무국 또는 운영자 중에서 선택해 주세요.",
    });
    expect(mockPrisma.freePost.create).not.toHaveBeenCalled();
  });

  it("stores free-board post types and limits operation notices to administrators", async () => {
    mockGetSession.mockResolvedValue({ id: "member-1", role: "MEMBER" });
    mockPrisma.freePost.create.mockResolvedValue({ ...realFreePost, postType: "DISCUSSION" });

    let response = await freeRoute.POST(
      jsonRequest({
        title: "토론글",
        content: "내용",
        postType: "DISCUSSION",
      }),
    );

    expect(response.status).toBe(200);
    expect(mockPrisma.freePost.create).toHaveBeenLastCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        postType: "DISCUSSION",
      }),
    }));

    mockPrisma.freePost.create.mockResolvedValue({ ...realFreePost, postType: "FREE" });
    response = await freeRoute.POST(
      jsonRequest({
        title: "운영안내 시도",
        content: "내용",
        postType: "NOTICE",
      }),
    );

    expect(response.status).toBe(200);
    expect(mockPrisma.freePost.create).toHaveBeenLastCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        postType: "FREE",
      }),
    }));

    mockGetSession.mockResolvedValue({ id: "admin-1", role: "ADMIN" });
    mockPrisma.freePost.create.mockResolvedValue({ ...realFreePost, postType: "NOTICE" });
    response = await freeRoute.POST(
      jsonRequest({
        title: "운영안내",
        content: "내용",
        postType: "NOTICE",
      }),
    );

    expect(response.status).toBe(200);
    expect(mockPrisma.freePost.create).toHaveBeenLastCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        postType: "NOTICE",
      }),
    }));
  });

  it("allows isStarred update on PATCH for admins but ignores it for non-admin authors", async () => {
    mockGetSession.mockResolvedValue({ id: "member-1", role: "MEMBER" });
    mockPrisma.freePost.findUnique.mockResolvedValue({ ...realFreePost, authorId: "member-1" });
    mockPrisma.freePost.update.mockResolvedValue({ ...realFreePost, title: "수정제목" });

    // Non-admin author tries to update isStarred
    let response = await freeRoute.PATCH(
      jsonRequest({
        postId: "free-1",
        title: "수정제목",
        content: "수정내용",
        isStarred: true,
      }),
    );
    expect(response.status).toBe(200);
    expect(mockPrisma.freePost.update).toHaveBeenLastCalledWith(expect.objectContaining({
      data: expect.not.objectContaining({
        isStarred: true,
      }),
    }));

    // Admin tries to update isStarred
    mockGetSession.mockResolvedValue({ id: "admin-1", role: "ADMIN" });
    response = await freeRoute.PATCH(
      jsonRequest({
        postId: "free-1",
        title: "수정제목",
        content: "수정내용",
        isStarred: true,
      }),
    );
    expect(response.status).toBe(200);
    expect(mockPrisma.freePost.update).toHaveBeenLastCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        isStarred: true,
      }),
    }));
  });

  it("updates free-board post type for authors but keeps operation notices admin-only", async () => {
    mockGetSession.mockResolvedValue({ id: "member-1", role: "MEMBER" });
    mockPrisma.freePost.findUnique.mockResolvedValue({ ...realFreePost, authorId: "member-1" });
    mockPrisma.freePost.update.mockResolvedValue({ ...realFreePost, postType: "QUESTION" });

    let response = await freeRoute.PATCH(
      jsonRequest({
        postId: "free-1",
        title: "수정제목",
        content: "수정내용",
        postType: "QUESTION",
      }),
    );

    expect(response.status).toBe(200);
    expect(mockPrisma.freePost.update).toHaveBeenLastCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        postType: "QUESTION",
      }),
    }));

    response = await freeRoute.PATCH(
      jsonRequest({
        postId: "free-1",
        title: "수정제목",
        content: "수정내용",
        postType: "NOTICE",
      }),
    );

    expect(response.status).toBe(200);
    expect(mockPrisma.freePost.update).toHaveBeenLastCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        postType: "FREE",
      }),
    }));
  });
});

describe("news admin visible controls", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(window, "confirm").mockReturnValue(true);
    vi.spyOn(window, "alert").mockImplementation(() => {});
  });

  it("shows notice create and delete controls only to admins", () => {
    const { rerender } = render(
      <NoticeBoard
        isLoggedIn
        isAdmin={false}
        newsList={[realNotice]}
        onRefresh={vi.fn()}
      />,
    );

    expect(screen.queryByRole("button", { name: "+ 신규 공지사항 등록" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "공지 삭제" })).not.toBeInTheDocument();

    rerender(
      <NoticeBoard
        isLoggedIn
        isAdmin
        newsList={[realNotice]}
        onRefresh={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: "+ 신규 공지사항 등록" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "공지 삭제" })).toBeInTheDocument();
  });

  it("removes the notice intro panel while keeping the existing search row and comment counts", () => {
    render(
      <NoticeBoard
        isLoggedIn
        isAdmin={false}
        newsList={[{ ...realNotice, comments: [noticeComment] }]}
        onRefresh={vi.fn()}
      />,
    );

    expect(screen.queryByText("★ 중요 필독 공지사항")).not.toBeInTheDocument();
    expect(screen.queryByText("공식 안내 현황")).not.toBeInTheDocument();
    expect(screen.getByPlaceholderText("공지사항 제목 검색…")).toBeInTheDocument();
    expect(screen.getByRole("table", { name: "공지사항 목록" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "댓글" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "댓글 1개 보기" })).toBeInTheDocument();
  });

  it("shows the selected display author name instead of the admin account name", () => {
    render(
      <NoticeBoard
        isLoggedIn
        isAdmin={false}
        newsList={[{ ...realNotice, displayAuthorName: "사무국" }]}
        onRefresh={vi.fn()}
      />,
    );

    expect(screen.getByRole("cell", { name: "사무국" })).toBeInTheDocument();
    expect(screen.queryByRole("cell", { name: "관리자" })).not.toBeInTheDocument();
  });

  it("does not append hardcoded mock notices to the notice board", () => {
    const { rerender } = render(
      <NoticeBoard
        isLoggedIn
        isAdmin={false}
        newsList={[]}
        onRefresh={vi.fn()}
      />,
    );

    expect(screen.queryByText("대방동 지역주택조합 공식 홈페이지 론칭 안내")).not.toBeInTheDocument();
    expect(screen.queryByText("조합원 전용 정보공개 및 에스크로 자금보고 운영 규정")).not.toBeInTheDocument();
    expect(screen.queryByText("사업시행인가 대비 설계·용역 실무 보고서 공람 안내")).not.toBeInTheDocument();
    expect(screen.getByText("검색 조건에 맞는 공지사항이 존재하지 않습니다.")).toBeInTheDocument();

    rerender(
      <NoticeBoard
        isLoggedIn
        isAdmin={false}
        newsList={[realNotice]}
        onRefresh={vi.fn()}
      />,
    );

    expect(screen.getByText("실제 공지")).toBeInTheDocument();
    expect(screen.queryByText("대방동 지역주택조합 공식 홈페이지 론칭 안내")).not.toBeInTheDocument();
    expect(screen.queryByText("조합원 전용 정보공개 및 에스크로 자금보고 운영 규정")).not.toBeInTheDocument();
    expect(screen.queryByText("사업시행인가 대비 설계·용역 실무 보고서 공람 안내")).not.toBeInTheDocument();
  });

  it("animates the important notice star without rendering the circular marker", () => {
    render(
      <NoticeBoard
        isLoggedIn
        isAdmin={false}
        newsList={[{ ...realNotice, isStarred: true }]}
        onRefresh={vi.fn()}
      />,
    );

    const titleCell = screen.getByText("실제 공지").closest("td");
    expect(titleCell).not.toBeNull();

    const titleScope = within(titleCell as HTMLElement);
    const star = titleScope.getByTestId("notice-important-star");
    const badgeText = titleScope.getByText("중요");

    expect(titleScope.queryByTestId("notice-important-pulse")).not.toBeInTheDocument();
    expect(star).toHaveTextContent("★");
    expect(star).toHaveClass("animate-ping");
    expect(star).toHaveClass("motion-reduce:animate-none");
    expect(star).not.toHaveClass("rounded-full");
    expect(star.compareDocumentPosition(badgeText) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("copies an openchat announcement message from the notice list", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      configurable: true,
    });
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          announcement: {
            id: "announcement-notice-1",
            message: "[대방동 지역주택조합 조합소식 안내]\n- 분류: 조합 공지사항",
          },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });
    vi.stubGlobal("fetch", fetchMock);

    render(
      <NoticeBoard
        isLoggedIn
        isAdmin
        newsList={[realNotice]}
        onRefresh={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "실제 공지 오픈채팅 공지문 복사" }));

    await waitFor(() => expect(writeText).toHaveBeenCalledWith(
      "[대방동 지역주택조합 조합소식 안내]\n- 분류: 조합 공지사항",
    ));
    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      "/api/openchat/announcements?newsId=notice-1",
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "/api/openchat/announcements",
      expect.objectContaining({
        method: "PATCH",
        body: JSON.stringify({ announcementId: "announcement-notice-1" }),
      }),
    );
    expect(screen.getByText("복사됨")).toBeInTheDocument();
  });

  it("falls back to a textarea copy when clipboard API is unavailable", async () => {
    const execCommand = vi.fn().mockReturnValue(true);
    Object.defineProperty(navigator, "clipboard", {
      value: undefined,
      configurable: true,
    });
    Object.defineProperty(document, "execCommand", {
      value: execCommand,
      configurable: true,
    });
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          announcement: {
            id: "announcement-notice-fallback",
            message: "[대방동 지역주택조합 조합소식 안내]\n- 분류: 조합 공지사항",
          },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });
    vi.stubGlobal("fetch", fetchMock);

    render(
      <NoticeBoard
        isLoggedIn
        isAdmin
        newsList={[realNotice]}
        onRefresh={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "실제 공지 오픈채팅 공지문 복사" }));

    await waitFor(() => expect(execCommand).toHaveBeenCalledWith("copy"));
    expect(screen.getByText("복사됨")).toBeInTheDocument();
  });

  it("opens the notice detail drawer from the left side", () => {
    render(
      <NewsClient
        session={null}
        initialNewsList={[realNotice]}
        initialFreePosts={[]}
        initialFaqs={[]}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "공지 읽기 →" }));

    const drawer = screen.getByLabelText("공지사항 상세 드로어");
    expect(drawer).toHaveClass("left-0");
    expect(drawer).toHaveClass("border-r");
    expect(drawer).toHaveClass("slide-in-from-left");
    expect(drawer).not.toHaveClass("right-0");
    expect(drawer).not.toHaveClass("slide-in-from-right");
  });

  it("submits the selected notice display author from the edit drawer", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          news: {
            ...realNotice,
            displayAuthorName: "사무국",
            author: { name: "관리자", role: "ADMIN" },
          },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ newsList: [{ ...realNotice, displayAuthorName: "사무국" }] }),
      });
    vi.stubGlobal("fetch", fetchMock);

    render(
      <NewsClient
        session={{ id: "admin-1", loginId: "admin", name: "관리자", role: "ADMIN" }}
        initialNewsList={[{ ...realNotice, displayAuthorName: "운영자" }]}
        initialFreePosts={[]}
        initialFaqs={[]}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "공지 읽기 →" }));
    const drawer = screen.getByLabelText("공지사항 상세 드로어");
    fireEvent.click(within(drawer).getByRole("button", { name: "수정" }));

    const authorSelect = within(drawer).getByLabelText("공지 작성자");
    expect(authorSelect).toHaveValue("운영자");
    fireEvent.change(authorSelect, { target: { value: "사무국" } });
    fireEvent.click(within(drawer).getByRole("button", { name: "수정사항 저장" }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith(
      "/api/news",
      expect.objectContaining({
        method: "PATCH",
        body: expect.stringContaining("\"displayAuthorName\":\"사무국\""),
      }),
    ));
  });

  it("lets administrators choose notice comment authors and edit or delete comments", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          comment: {
            ...noticeComment,
            id: "notice-comment-new",
            content: "사무국 신규 댓글",
            displayAuthorName: "사무국",
            author: { id: "admin-1", name: "관리자", loginId: "admin", role: "ADMIN" },
          },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          comment: {
            ...noticeComment,
            content: "수정된 확인 의견",
            displayAuthorName: "운영자",
            author: { id: "admin-1", name: "관리자", loginId: "admin", role: "ADMIN" },
          },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });
    vi.stubGlobal("fetch", fetchMock);
    vi.spyOn(window, "confirm").mockReturnValue(true);

    render(
      <NewsClient
        session={{ id: "admin-1", name: "관리자", loginId: "admin", role: "ADMIN" }}
        initialNewsList={[{
          ...realNotice,
          comments: [{
            ...noticeComment,
            displayAuthorName: "운영자",
            author: { id: "admin-1", name: "관리자", loginId: "admin", role: "ADMIN" },
          }],
        }]}
        initialFreePosts={[]}
        initialFaqs={[]}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "공지 읽기 →" }));
    const drawer = screen.getByLabelText("공지사항 상세 드로어");

    expect(within(drawer).getAllByText("운영자").length).toBeGreaterThan(0);
    fireEvent.change(within(drawer).getByLabelText("댓글 작성자"), { target: { value: "사무국" } });
    fireEvent.change(within(drawer).getByLabelText("공지사항 댓글 작성"), {
      target: { value: "사무국 신규 댓글" },
    });
    fireEvent.click(within(drawer).getByRole("button", { name: "댓글 등록" }));

    await waitFor(() => expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      "/api/news/comments",
      expect.objectContaining({
        method: "POST",
        body: expect.stringContaining("\"displayAuthorName\":\"사무국\""),
      }),
    ));

    fireEvent.click(within(drawer).getAllByRole("button", { name: "댓글 수정" })[0]);
    fireEvent.change(within(drawer).getByLabelText("댓글 수정 작성자"), { target: { value: "운영자" } });
    fireEvent.change(within(drawer).getByLabelText("댓글 수정 내용"), {
      target: { value: "수정된 확인 의견" },
    });
    fireEvent.click(within(drawer).getByRole("button", { name: "수정 완료" }));

    await waitFor(() => expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "/api/news/comments",
      expect.objectContaining({
        method: "PATCH",
        body: expect.stringContaining("\"displayAuthorName\":\"운영자\""),
      }),
    ));

    fireEvent.click(within(drawer).getAllByRole("button", { name: "댓글 삭제" })[0]);

    await waitFor(() => expect(fetchMock).toHaveBeenNthCalledWith(
      3,
      "/api/news/comments?commentId=notice-comment-1",
      expect.objectContaining({ method: "DELETE" }),
    ));
  });

  it("shows one-level replies in the notice drawer and sends parent comment ids for new replies", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, comment: { ...noticeComment, id: "notice-reply-new" } }),
    });
    vi.stubGlobal("fetch", fetchMock);

    render(
      <NewsClient
        session={{ id: "member-2", name: "답글러", loginId: "member2", role: "MEMBER" }}
        initialNewsList={[{
          ...realNotice,
          comments: [
            noticeComment,
            {
              ...noticeComment,
              id: "notice-reply-1",
              content: "확인 답글입니다.",
              parentId: "notice-comment-1",
              author: { id: "member-2", name: "답글러", loginId: "member2", role: "MEMBER" },
            },
          ],
        }]}
        initialFreePosts={[]}
        initialFaqs={[]}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "공지 읽기 →" }));
    const drawer = screen.getByLabelText("공지사항 상세 드로어");

    expect(within(drawer).getByText("확인했습니다.")).toBeInTheDocument();
    expect(within(drawer).queryByText("확인 답글입니다.")).not.toBeInTheDocument();

    fireEvent.click(within(drawer).getByRole("button", { name: "답글 1개 보기" }));
    expect(within(drawer).getByText("확인 답글입니다.")).toBeInTheDocument();

    fireEvent.click(within(drawer).getByRole("button", { name: "답글 작성" }));
    fireEvent.change(within(drawer).getByPlaceholderText("공지 댓글에 답글을 작성해 주세요…"), {
      target: { value: "새 공지 답글입니다." },
    });
    fireEvent.click(within(drawer).getByRole("button", { name: "답글 등록" }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith(
      "/api/news/comments",
      expect.objectContaining({
        method: "POST",
        body: expect.stringContaining("\"parentCommentId\":\"notice-comment-1\""),
      }),
    ));
  });

  it("shows the permit milestone only through the completed district plan stage", () => {
    render(
      <NewsClient
        session={null}
        initialNewsList={[realNewsletter]}
        initialFreePosts={[]}
        initialFaqs={[]}
      />,
    );

    expect(screen.getByText("인허가 시행율:")).toBeInTheDocument();
    expect(screen.getByText("지구단위(완료)")).toBeInTheDocument();
    expect(screen.queryByText("85%")).not.toBeInTheDocument();
    expect(screen.queryByText("심의(완료)")).not.toBeInTheDocument();
    expect(screen.queryByText("사업시행(준비)")).not.toBeInTheDocument();
  });

  it("replaces newsletter mock issues with the upcoming July first issue preview", () => {
    render(
      <CoopNewsletter
        isLoggedIn={false}
        isAdmin={false}
        newsList={[]}
        onRefresh={vi.fn()}
      />,
    );

    expect(screen.getByText("대방동 지주택 2026년 7월 조합 월간 소식지 (제1호) 오픈 예정")).toBeInTheDocument();
    expect(screen.getByText(/제1호에서는 조합 운영 일정/)).toBeInTheDocument();
    expect(screen.getByText(/인허가 진행 기준/)).toBeInTheDocument();
    expect(screen.getByText(/확정되지 않은 사안은 확정 표현 없이/)).toBeInTheDocument();
    expect(screen.queryByText("대방동 2026년 5월 조합 월간 소식지 (제24호)")).not.toBeInTheDocument();
    expect(screen.queryByText("대방동 5월 3주차 주간 실무 브리핑 (제98호)")).not.toBeInTheDocument();
    expect(screen.queryByText("대방동 2026년 4월 조합 월간 소식지 (제23호)")).not.toBeInTheDocument();
  });

  it("renders notice rich content with editor-matched body typography", () => {
    const { container } = render(
      <NoticeRichContent content="<p>동작구청 방문 결과 공유드립니다</p>" />,
    );

    const content = container.querySelector(".notice-rich-content");

    expect(content).toHaveClass("text-xs");
    expect(content).toHaveClass("leading-relaxed");
    expect(content).toHaveClass("text-charcoal-primary");
  });

  it("uploads a newsletter image file before creating the newsletter", async () => {
    const onRefresh = vi.fn().mockResolvedValue(undefined);
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, url: "/uploads/thumb.png" }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, news: realNewsletter }),
      });
    vi.stubGlobal("fetch", fetchMock);

    render(
      <CoopNewsletter
        isLoggedIn
        isAdmin
        newsList={[]}
        onRefresh={onRefresh}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "+ 신규 주/월간소식 등록" }));
    fireEvent.change(screen.getByPlaceholderText(/대방동 2026년 6월/), {
      target: { value: "6월 조합뉴스" },
    });
    fireEvent.change(screen.getByPlaceholderText(/상세 실적 보고/), {
      target: { value: "6월 사업 진행 보고입니다." },
    });
    fireEvent.change(screen.getByLabelText("카드 썸네일 이미지 파일 (선택)"), {
      target: { files: [new File(["image"], "thumb.png", { type: "image/png" })] },
    });
    fireEvent.click(screen.getByRole("button", { name: "조합뉴스 즉시 등록" }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    expect(fetchMock).toHaveBeenNthCalledWith(1, "/api/upload", expect.objectContaining({ method: "POST" }));
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "/api/news",
      expect.objectContaining({
        method: "POST",
        body: expect.stringContaining("\"imagePath\":\"/uploads/thumb.png\""),
      }),
    );
    expect(onRefresh).toHaveBeenCalled();
  });

  it("copies an openchat announcement message for a real cooperative newsletter", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      configurable: true,
    });
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          announcement: {
            id: "announcement-news-1",
            message: "[대방동 지역주택조합 조합소식 안내]\n새 조합소식이 등록되었습니다.",
          },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });
    vi.stubGlobal("fetch", fetchMock);

    render(
      <CoopNewsletter
        isLoggedIn
        isAdmin
        newsList={[realNewsletter]}
        onRefresh={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByText("실제 조합뉴스"));
    fireEvent.click(screen.getByRole("button", { name: "실제 조합뉴스 오픈채팅 공지문 복사" }));

    await waitFor(() => expect(writeText).toHaveBeenCalledWith(
      "[대방동 지역주택조합 조합소식 안내]\n새 조합소식이 등록되었습니다.",
    ));
    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      "/api/openchat/announcements?newsId=newsletter-1",
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "/api/openchat/announcements",
      expect.objectContaining({
        method: "PATCH",
        body: JSON.stringify({ announcementId: "announcement-news-1" }),
      }),
    );
    expect(screen.getByText("공지문 복사됨")).toBeInTheDocument();
  });

  it("shows an openchat announcement copy button on real cooperative newsletter cards", () => {
    render(
      <CoopNewsletter
        isLoggedIn
        isAdmin
        newsList={[realNewsletter]}
        onRefresh={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: "실제 조합뉴스 목록 오픈채팅 공지문 복사" })).toBeInTheDocument();
  });

  it("uses a pasted notice body image with resize controls before creating the notice", async () => {
    const onRefresh = vi.fn().mockResolvedValue(undefined);
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, url: "/uploads/pasted.png", name: "pasted.png", size: 5 }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, url: "/uploads/agenda.pdf", name: "agenda.pdf", size: 6 }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, news: realNotice }),
      });
    vi.stubGlobal("fetch", fetchMock);

    render(
      <NoticeBoard
        isLoggedIn
        isAdmin
        newsList={[]}
        onRefresh={onRefresh}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "+ 신규 공지사항 등록" }));
    expect(screen.queryByLabelText("공지 이미지 파일 (선택)")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "굵게" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "밑줄" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "이미지 삽입" })).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText("공지사항의 제목을 입력하십시오."), {
      target: { value: "붙여넣기 공지" },
    });
    const editor = screen.getByRole("textbox", { name: "공지 내용 편집창" });
    fireEvent.input(editor, {
      currentTarget: { innerHTML: "<p>붙여넣기 본문</p>" },
    });
    fireEvent.paste(editor, {
      clipboardData: {
        files: [new File(["image"], "clipboard.png", { type: "image/png" })],
      },
    });
    await waitFor(() => expect(screen.getByAltText("본문 이미지")).toBeInTheDocument());
    expect(screen.getByLabelText("이미지 크기")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("이미지 크기"), {
      target: { value: "55" },
    });
    fireEvent.change(screen.getByLabelText("첨부파일 (선택)"), {
      target: { files: [new File(["agenda"], "agenda.pdf", { type: "application/pdf" })] },
    });
    fireEvent.click(screen.getByRole("button", { name: "공지사항 즉시 등록" }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(3));
    expect(fetchMock).toHaveBeenNthCalledWith(1, "/api/upload", expect.objectContaining({ method: "POST" }));
    expect(fetchMock).toHaveBeenNthCalledWith(2, "/api/upload", expect.objectContaining({ method: "POST" }));
    expect(fetchMock).toHaveBeenNthCalledWith(
      3,
      "/api/news",
      expect.objectContaining({
        method: "POST",
        body: expect.stringContaining("<img"),
      }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      3,
      "/api/news",
      expect.objectContaining({
        body: expect.stringContaining("/uploads/pasted.png"),
      }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      3,
      "/api/news",
      expect.objectContaining({
        body: expect.stringMatching(/width:\s*55%/),
      }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      3,
      "/api/news",
      expect.objectContaining({
        body: expect.not.stringContaining("\"imagePath\":\"/uploads/pasted.png\""),
      }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      3,
      "/api/news",
      expect.objectContaining({
        body: expect.stringContaining("\"attachmentPath\":\"/uploads/agenda.pdf\""),
      }),
    );
    expect(onRefresh).toHaveBeenCalled();
  });

  it("submits the selected notice display author from the admin drawer", async () => {
    const onRefresh = vi.fn().mockResolvedValue(undefined);
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, news: { ...realNotice, displayAuthorName: "사무국" } }),
    });
    vi.stubGlobal("fetch", fetchMock);

    render(
      <NoticeBoard
        isLoggedIn
        isAdmin
        newsList={[]}
        onRefresh={onRefresh}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "+ 신규 공지사항 등록" }));
    fireEvent.change(screen.getByLabelText("공지 작성자"), {
      target: { value: "사무국" },
    });
    fireEvent.change(screen.getByPlaceholderText("공지사항의 제목을 입력하십시오."), {
      target: { value: "작성자 선택 공지" },
    });
    const editor = screen.getByRole("textbox", { name: "공지 내용 편집창" });
    editor.innerHTML = "<p>작성자 선택 본문</p>";
    fireEvent.input(editor);
    fireEvent.click(screen.getByRole("button", { name: "공지사항 즉시 등록" }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/news",
      expect.objectContaining({
        method: "POST",
        body: expect.stringContaining("\"displayAuthorName\":\"사무국\""),
      }),
    );
    expect(onRefresh).toHaveBeenCalled();
  });

  it("shows free board posts as a notice-style list and writes body images in the editor", async () => {
    const onRefresh = vi.fn().mockResolvedValue(undefined);
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, url: "/uploads/free-image.png", name: "free-image.png", size: 5 }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, post: realFreePost }),
      });
    vi.stubGlobal("fetch", fetchMock);

    render(
      <FreeBoard
        session={{ id: "member-1", name: "조합원", loginId: "member1", role: "MEMBER" }}
        posts={[realFreePost]}
        onRefresh={onRefresh}
      />,
    );

    expect(screen.getByRole("table", { name: "자유게시판 게시글 목록" })).toBeInTheDocument();
    expect(screen.queryByText("토론 공간 현황")).not.toBeInTheDocument();
    expect(screen.getByPlaceholderText("자유게시판 제목/내용 검색…")).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "No." })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "제목" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "작성자" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "작성일" })).toBeInTheDocument();
    expect(screen.getByText("2026-06-01 09:00")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "✍️ 새 게시글 작성" }));
    expect(screen.getByRole("button", { name: "이미지 삽입" })).toBeInTheDocument();
    expect(screen.getByLabelText("글 유형")).toHaveValue("FREE");
    fireEvent.change(screen.getByLabelText("글 유형"), { target: { value: "DISCUSSION" } });

    fireEvent.change(screen.getByPlaceholderText("의견을 명확하게 요약한 제목을 입력해 주십시오."), {
      target: { value: "이미지 포함 자유글" },
    });

    const editor = screen.getByRole("textbox", { name: "자유게시판 본문 편집창" });
    fireEvent.input(editor, {
      currentTarget: { innerHTML: "<p>자유게시판 본문</p>" },
    });
    fireEvent.paste(editor, {
      clipboardData: {
        files: [new File(["image"], "free-image.png", { type: "image/png" })],
      },
    });

    await waitFor(() => expect(screen.getByAltText("본문 이미지")).toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: "게시글 작성 완료" }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    expect(fetchMock).toHaveBeenNthCalledWith(1, "/api/upload", expect.objectContaining({ method: "POST" }));
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "/api/news/free",
      expect.objectContaining({
        method: "POST",
        body: expect.stringContaining("<img"),
      }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "/api/news/free",
      expect.objectContaining({
        body: expect.stringContaining("/uploads/free-image.png"),
      }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "/api/news/free",
      expect.objectContaining({
        body: expect.stringContaining("\"postType\":\"DISCUSSION\""),
      }),
    );
    expect(onRefresh).toHaveBeenCalled();
  });

  it("renders and filters free-board post type badges", () => {
    render(
      <FreeBoard
        session={{ id: "member-1", name: "조합원", loginId: "member1", role: "MEMBER" }}
        posts={[
          { ...realFreePost, id: "free-1", title: "자유글 제목", postType: "FREE" },
          { ...realFreePost, id: "discussion-1", title: "토론글 제목", postType: "DISCUSSION" },
          { ...realFreePost, id: "notice-1", title: "운영안내 제목", postType: "NOTICE" },
        ]}
        onRefresh={vi.fn()}
      />,
    );

    expect(screen.getAllByText("자유글").length).toBeGreaterThan(0);
    expect(screen.getAllByText("토론글").length).toBeGreaterThan(0);
    expect(screen.getAllByText("운영안내").length).toBeGreaterThan(0);
    expect(screen.queryByText("정식 토론")).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("글 유형 필터"), { target: { value: "DISCUSSION" } });

    expect(screen.getByText("토론글 제목")).toBeInTheDocument();
    expect(screen.queryByText("자유글 제목")).not.toBeInTheDocument();
    expect(screen.queryByText("운영안내 제목")).not.toBeInTheDocument();
  });

  it("lets only administrators select operation notice as a free-board post type", () => {
    const { rerender } = render(
      <FreeBoard
        session={{ id: "member-1", name: "조합원", loginId: "member1", role: "MEMBER" }}
        posts={[]}
        onRefresh={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "✍️ 새 게시글 작성" }));
    expect(within(screen.getByLabelText("글 유형")).queryByRole("option", { name: "운영안내" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "닫기" }));

    rerender(
      <FreeBoard
        session={{ id: "admin-1", name: "관리자", loginId: "admin", role: "ADMIN" }}
        posts={[]}
        onRefresh={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "✍️ 새 게시글 작성" }));
    expect(within(screen.getByLabelText("글 유형")).getByRole("option", { name: "운영안내" })).toBeInTheDocument();
  });

  it("lets administrators choose display author names for free-board posts and comments", async () => {
    const onRefresh = vi.fn().mockResolvedValue(undefined);
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, post: { ...realFreePost, displayAuthorName: "사무국" } }),
    });
    vi.stubGlobal("fetch", fetchMock);

    render(
      <FreeBoard
        session={{ id: "admin-1", name: "관리자", loginId: "admin", role: "ADMIN" }}
        posts={[{
          ...realFreePost,
          displayAuthorName: "사무국",
          author: { id: "admin-1", name: "관리자", loginId: "admin", role: "ADMIN" },
          comments: [
            {
              ...freeComment,
              displayAuthorName: "운영자",
              author: { id: "admin-1", name: "관리자", loginId: "admin", role: "ADMIN" },
            },
          ],
        }]}
        onRefresh={onRefresh}
      />,
    );

    expect(screen.getByText("사무국 (나)")).toBeInTheDocument();
    fireEvent.click(screen.getByText("실제 자유게시글"));
    const panel = screen.getByLabelText("토론 집중 패널");
    expect(within(panel).getByText("작성자: 사무국 (나)")).toBeInTheDocument();
    expect(within(panel).getByText("운영자 (나)")).toBeInTheDocument();

    fireEvent.change(within(panel).getByLabelText("댓글 작성자"), { target: { value: "사무국" } });
    fireEvent.change(within(panel).getByLabelText("자유게시판 댓글 작성"), {
      target: { value: "관리자 댓글" },
    });
    fireEvent.click(within(panel).getByRole("button", { name: "의견 등록" }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith(
      "/api/news/free",
      expect.objectContaining({
        method: "POST",
        body: expect.stringContaining("\"displayAuthorName\":\"사무국\""),
      }),
    ));

    fireEvent.click(screen.getByRole("button", { name: "목록으로" }));
    fireEvent.click(screen.getByRole("button", { name: "✍️ 새 게시글 작성" }));
    expect(screen.getByLabelText("게시글 작성자")).toHaveValue("운영자");
    fireEvent.change(screen.getByLabelText("게시글 작성자"), { target: { value: "사무국" } });
    expect(screen.getByLabelText("게시글 작성자")).toHaveValue("사무국");
  });

  it("copies an openchat announcement message from the free-board list", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      configurable: true,
    });
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          announcement: {
            id: "announcement-free-1",
            message: "[대방동 지역주택조합 자유게시판 안내]\n- 유형: 자유글",
          },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });
    vi.stubGlobal("fetch", fetchMock);

    render(
      <FreeBoard
        session={{ id: "admin-1", name: "관리자", loginId: "admin", role: "ADMIN" }}
        posts={[realFreePost]}
        onRefresh={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "실제 자유게시글 오픈채팅 공지문 복사" }));

    await waitFor(() => expect(writeText).toHaveBeenCalledWith(
      "[대방동 지역주택조합 자유게시판 안내]\n- 유형: 자유글",
    ));
    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      "/api/openchat/announcements?freePostId=free-1",
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "/api/openchat/announcements",
      expect.objectContaining({
        method: "PATCH",
        body: JSON.stringify({ announcementId: "announcement-free-1" }),
      }),
    );
    expect(screen.getByText("복사됨")).toBeInTheDocument();
  });

  it("handles an empty free-board announcement response without logging a JSON syntax error", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const fetchMock = vi.fn().mockResolvedValueOnce(new Response("", { status: 500 }));
    vi.stubGlobal("fetch", fetchMock);

    render(
      <FreeBoard
        session={{ id: "admin-1", name: "관리자", loginId: "admin", role: "ADMIN" }}
        posts={[realFreePost]}
        onRefresh={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "실제 자유게시글 오픈채팅 공지문 복사" }));

    await waitFor(() => expect(screen.getByText("실패")).toBeInTheDocument());
    expect(consoleError).toHaveBeenCalledWith(expect.objectContaining({
      message: "오픈채팅 공지문 생성 요청에 실패했습니다.",
    }));
    expect(consoleError.mock.calls.some(([error]) => error instanceof SyntaxError)).toBe(false);
    consoleError.mockRestore();
  });

  it("does not append hardcoded mock posts to the free board", () => {
    const { rerender } = render(
      <FreeBoard
        session={{ id: "member-1", name: "조합원", loginId: "member1", role: "MEMBER" }}
        posts={[]}
        onRefresh={vi.fn()}
      />,
    );

    expect(screen.queryByText("최근 임시총회 의결서 공증 완료본 확인했습니다.")).not.toBeInTheDocument();
    expect(screen.queryByText("신규로 등재된 주간 실무 보고서 유익하네요.")).not.toBeInTheDocument();
    expect(screen.queryByText("데모 피드")).not.toBeInTheDocument();
    expect(screen.getByText("검색 조건에 맞는 자유게시판 글이 없습니다.")).toBeInTheDocument();

    rerender(
      <FreeBoard
        session={{ id: "member-1", name: "조합원", loginId: "member1", role: "MEMBER" }}
        posts={[realFreePost]}
        onRefresh={vi.fn()}
      />,
    );

    expect(screen.getByText("실제 자유게시글")).toBeInTheDocument();
    expect(screen.getAllByText("자유글").length).toBeGreaterThan(0);
    expect(screen.queryByText("최근 임시총회 의결서 공증 완료본 확인했습니다.")).not.toBeInTheDocument();
    expect(screen.queryByText("신규로 등재된 주간 실무 보고서 유익하네요.")).not.toBeInTheDocument();
    expect(screen.queryByText("데모 피드")).not.toBeInTheDocument();
  });

  it("uses the corrected signup display name for free board authors and comments", () => {
    render(
      <FreeBoard
        session={{ id: "member-1", name: "최마리", loginId: "member1", role: "MEMBER" }}
        posts={[{
          ...realFreePost,
          author: { id: "member-1", name: "marie Choi", signupName: "최마리", loginId: "member1", role: "MEMBER" },
          comments: [
            {
              ...freeComment,
              author: { id: "member-2", name: "Google Name", signupName: "김참여", loginId: "member2", role: "MEMBER" },
            },
          ],
        }]}
        onRefresh={vi.fn()}
      />,
    );

    expect(screen.getByText("최마리 (나)")).toBeInTheDocument();
    expect(screen.queryByText(/marie Choi/)).not.toBeInTheDocument();

    fireEvent.click(screen.getByText("실제 자유게시글"));
    const panel = screen.getByLabelText("토론 집중 패널");

    expect(within(panel).getByText("작성자: 최마리 (나)")).toBeInTheDocument();
    expect(within(panel).getByText(/김\*조합원/)).toBeInTheDocument();
    expect(within(panel).queryByText(/Google Name/)).not.toBeInTheDocument();
  });

  it("opens a left focus panel from the free board list and keeps the post URL addressable", () => {
    window.history.pushState({}, "", "/news?tab=free");

    render(
      <FreeBoard
        session={{ id: "member-1", name: "조합원", loginId: "member1", role: "MEMBER" }}
        posts={[realFreePost]}
        onRefresh={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByText("실제 자유게시글"));

    const panel = screen.getByLabelText("토론 집중 패널");
    expect(panel).toBeInTheDocument();
    expect(panel).toHaveClass("left-0");
    expect(panel).toHaveClass("max-w-2xl");
    expect(panel).toHaveClass("slide-in-from-left");
    expect(panel).not.toHaveClass("right-0");
    expect(panel).not.toHaveClass("max-w-3xl");
    expect(within(panel).getByRole("heading", { name: "자유게시판 글 열람" })).toBeInTheDocument();
    expect(within(panel).getByRole("heading", { name: "실제 자유게시글" })).toBeInTheDocument();
    expect(within(panel).getByText("실제 자유게시글 내용")).toBeInTheDocument();
    const richContent = panel.querySelector(".notice-rich-content");
    expect(richContent).toHaveClass("text-xs");
    expect(richContent).toHaveClass("leading-relaxed");
    expect(richContent).not.toHaveClass("text-sm");
    expect(richContent).not.toHaveClass("leading-8");
    expect(window.location.search).toContain("post=free-1");

    fireEvent.click(screen.getByRole("button", { name: "목록으로" }));

    expect(screen.queryByLabelText("토론 집중 패널")).not.toBeInTheDocument();
    expect(window.location.search).not.toContain("post=free-1");
  });

  it("shows one-level replies in the focus panel and sends parent comment ids for new replies", async () => {
    const onRefresh = vi.fn().mockResolvedValue(undefined);
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, comment: { id: "comment-new" } }),
    });
    vi.stubGlobal("fetch", fetchMock);

    render(
      <FreeBoard
        session={{ id: "member-2", name: "답글러", loginId: "member2", role: "MEMBER" }}
        posts={[{
          ...realFreePost,
          comments: [
            freeComment,
            {
              ...freeComment,
              id: "comment-2",
              content: "첫 번째 답글입니다.",
              parentId: "comment-1",
              author: { id: "member-2", name: "답글러", loginId: "member2", role: "MEMBER" },
            },
            {
              ...freeComment,
              id: "comment-3",
              content: "@답글러 두 번째 답글입니다.",
              parentId: "comment-1",
              author: { id: "member-3", name: "참여자", loginId: "member3", role: "MEMBER" },
            },
          ],
        }]}
        onRefresh={onRefresh}
      />,
    );

    fireEvent.click(screen.getByText("실제 자유게시글"));
    const panel = screen.getByLabelText("토론 집중 패널");

    expect(within(panel).getByText("원댓글입니다.")).toBeInTheDocument();
    expect(within(panel).queryByText("첫 번째 답글입니다.")).not.toBeInTheDocument();

    fireEvent.click(within(panel).getByRole("button", { name: "답글 2개 보기" }));
    expect(within(panel).getByText("첫 번째 답글입니다.")).toBeInTheDocument();
    expect(within(panel).getByText("@답글러 두 번째 답글입니다.")).toBeInTheDocument();

    fireEvent.click(within(panel).getByRole("button", { name: "답글 작성" }));
    fireEvent.change(within(panel).getByPlaceholderText("원댓글에 답글을 작성해 주세요…"), {
      target: { value: "새 답글입니다." },
    });
    fireEvent.click(within(panel).getByRole("button", { name: "답글 등록" }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith(
      "/api/news/free",
      expect.objectContaining({
        method: "POST",
        body: expect.stringContaining("\"parentCommentId\":\"comment-1\""),
      }),
    ));
    expect(onRefresh).toHaveBeenCalled();
  });

  it("allows post editing in the focus panel and calls PATCH API", async () => {
    window.history.pushState({}, "", "/news?tab=free");
    const onRefresh = vi.fn().mockResolvedValue(undefined);
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, post: { ...realFreePost, title: "완전수정제목" } }),
    });
    vi.stubGlobal("fetch", fetchMock);

    render(
      <FreeBoard
        session={{ id: "member-1", name: "조합원", loginId: "member1", role: "MEMBER" }}
        posts={[realFreePost]}
        onRefresh={onRefresh}
      />,
    );

    // Open detail panel
    fireEvent.click(screen.getByText("실제 자유게시글"));
    const panel = screen.getByLabelText("토론 집중 패널");

    // Click edit button
    const editBtn = within(panel).getByRole("button", { name: "게시글 수정" });
    expect(editBtn).toBeInTheDocument();
    fireEvent.click(editBtn);

    // Drawer should open and inputs pre-filled
    const drawer = screen.getByLabelText("게시글 수정 드로어");
    expect(drawer).toBeInTheDocument();
    expect(screen.getByText("게시글 수정")).toBeInTheDocument();

    const titleInput = screen.getByPlaceholderText("의견을 명확하게 요약한 제목을 입력해 주십시오.");
    expect(titleInput).toHaveValue("실제 자유게시글");
    fireEvent.change(titleInput, { target: { value: "완전수정제목" } });

    // Submit edit
    fireEvent.click(screen.getByRole("button", { name: "수정 완료" }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith(
      "/api/news/free",
      expect.objectContaining({
        method: "PATCH",
        body: expect.stringContaining("\"title\":\"완전수정제목\""),
      }),
    ));
    expect(onRefresh).toHaveBeenCalled();
  });
});
