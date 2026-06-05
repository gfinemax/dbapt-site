import { describe, expect, it, vi, beforeEach } from "vitest";

const mockGetSession = vi.hoisted(() => vi.fn());
const mockCreateDocumentSignedUpload = vi.hoisted(() => vi.fn());
const mockPrisma = vi.hoisted(() => ({
  document: {
    create: vi.fn(),
    update: vi.fn(),
  },
  disclosureEmptyMessage: {
    upsert: vi.fn(),
  },
}));

vi.mock("@/lib/auth", () => ({
  getSession: mockGetSession,
}));

vi.mock("@/lib/db", () => ({
  prisma: mockPrisma,
}));

vi.mock("@/lib/document-storage", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/document-storage")>();
  return {
    ...actual,
    createDocumentSignedUpload: mockCreateDocumentSignedUpload,
    uploadDocumentFile: vi.fn(),
  };
});

describe("document upload API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates signed upload targets for admin document files", async () => {
    mockGetSession.mockResolvedValue({ id: "admin-1", role: "ADMIN" });
    mockCreateDocumentSignedUpload
      .mockResolvedValueOnce({
        path: "documents/2026-06-05/main.pdf",
        token: "main-token",
        signedUrl: "https://storage.example/upload-main",
        contentType: "application/pdf",
      })
      .mockResolvedValueOnce({
        path: "documents/2026-06-05/attachment.docx",
        token: "attachment-token",
        signedUrl: "https://storage.example/upload-attachment",
        contentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });

    const { POST } = await import("@/app/api/documents/upload-url/route");
    const response = await POST(
      new Request("http://localhost/api/documents/upload-url", {
        method: "POST",
        body: JSON.stringify({
          files: [
            { name: "main.pdf", size: 6 * 1024 * 1024 },
            { name: "attachment.docx", size: 1024 },
          ],
        }),
      }),
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      uploads: [
        { path: "documents/2026-06-05/main.pdf", token: "main-token" },
        { path: "documents/2026-06-05/attachment.docx", token: "attachment-token" },
      ],
    });
  });

  it("saves metadata for files already uploaded through signed URLs", async () => {
    mockGetSession.mockResolvedValue({ id: "admin-1", role: "ADMIN" });
    mockPrisma.document.create.mockResolvedValue({
      id: "doc-1",
      title: "테스트",
      attachments: [],
    });

    const { POST } = await import("@/app/api/documents/route");
    const response = await POST(
      new Request("http://localhost/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "테스트",
          description: "자료확인",
          category: "DISCLOSURE",
          subCategory: "정관 및 조합규약",
          documentDate: "2026-06-05",
          publishedAt: "2026-06-05",
          isStarred: false,
          file: {
            path: "documents/2026-06-05/main.pdf",
            name: "main.pdf",
            size: 6 * 1024 * 1024,
          },
          attachments: [
            {
              path: "documents/2026-06-05/attachment.docx",
              name: "attachment.docx",
              size: 1024,
            },
          ],
        }),
      }),
    );

    expect(response.status).toBe(200);
    expect(mockPrisma.document.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        filePath: "documents/2026-06-05/main.pdf",
        fileName: "main.pdf",
        fileSize: 6 * 1024 * 1024,
        attachments: {
          create: [
            {
              filePath: "documents/2026-06-05/attachment.docx",
              fileName: "attachment.docx",
              fileSize: 1024,
            },
          ],
        },
      }),
    }));
    expect(await response.json()).toMatchObject({ success: true });
  });

  it("updates document metadata for admins", async () => {
    mockGetSession.mockResolvedValue({ id: "admin-1", role: "ADMIN" });
    mockPrisma.document.update.mockResolvedValue({
      id: "doc-1",
      title: "수정된 문서",
      description: "수정 설명",
      category: "DISCLOSURE",
      subCategory: "운영관리규정",
      documentDate: new Date("2026-06-01"),
      publishedAt: new Date("2026-06-05"),
      isStarred: true,
      attachments: [],
    });

    const { PATCH } = await import("@/app/api/documents/[id]/route");
    const response = await PATCH(
      new Request("http://localhost/api/documents/doc-1", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "수정된 문서",
          description: "수정 설명",
          category: "DISCLOSURE",
          subCategory: "운영관리규정",
          documentDate: "2026-06-01",
          publishedAt: "2026-06-05",
          isStarred: true,
        }),
      }),
      { params: Promise.resolve({ id: "doc-1" }) },
    );

    expect(response.status).toBe(200);
    expect(mockPrisma.document.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: "doc-1" },
      data: expect.objectContaining({
        title: "수정된 문서",
        description: "수정 설명",
        category: "DISCLOSURE",
        subCategory: "운영관리규정",
        documentDate: new Date("2026-06-01"),
        publishedAt: new Date("2026-06-05"),
        isStarred: true,
      }),
      include: {
        attachments: true,
      },
    }));
    expect(await response.json()).toMatchObject({ success: true });
  });

  it("saves disclosure empty-card messages for admins", async () => {
    mockGetSession.mockResolvedValue({ id: "admin-1", role: "ADMIN" });
    mockPrisma.disclosureEmptyMessage.upsert.mockResolvedValue({
      id: "empty-message-1",
      subCategory: "회계관리규정",
      title: "회계관리규정 자료 준비 중",
      message: "회계 기준 개정본 검토 후 공개할 예정입니다.",
    });

    const { PATCH } = await import("@/app/api/disclosure-empty-messages/route");
    const response = await PATCH(
      new Request("http://localhost/api/disclosure-empty-messages", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subCategory: "회계관리규정",
          title: "회계관리규정 자료 준비 중",
          message: "회계 기준 개정본 검토 후 공개할 예정입니다.",
        }),
      }),
    );

    expect(response.status).toBe(200);
    expect(mockPrisma.disclosureEmptyMessage.upsert).toHaveBeenCalledWith({
      where: { subCategory: "회계관리규정" },
      create: {
        subCategory: "회계관리규정",
        title: "회계관리규정 자료 준비 중",
        message: "회계 기준 개정본 검토 후 공개할 예정입니다.",
      },
      update: {
        title: "회계관리규정 자료 준비 중",
        message: "회계 기준 개정본 검토 후 공개할 예정입니다.",
      },
    });
    expect(await response.json()).toMatchObject({ success: true });
  });
});
