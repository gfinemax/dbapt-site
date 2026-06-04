import { describe, expect, it, vi, beforeEach } from "vitest";

const mockGetSession = vi.hoisted(() => vi.fn());
const mockCreateDocumentSignedUpload = vi.hoisted(() => vi.fn());
const mockPrisma = vi.hoisted(() => ({
  document: {
    create: vi.fn(),
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
});
