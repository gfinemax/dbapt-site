import { describe, expect, it, vi, beforeEach } from "vitest";

const mockGetSession = vi.hoisted(() => vi.fn());
const mockCreateDocumentSignedUpload = vi.hoisted(() => vi.fn());
const mockSupabaseRemove = vi.hoisted(() => vi.fn());
const mockPrisma = vi.hoisted(() => ({
  document: {
    create: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  disclosureEmptyMessage: {
    upsert: vi.fn(),
  },
  disclosureCardContent: {
    upsert: vi.fn(),
  },
}));

vi.mock("@/lib/auth", () => ({
  getSession: mockGetSession,
}));

vi.mock("@/lib/db", () => ({
  prisma: mockPrisma,
}));

vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => ({
    storage: {
      from: vi.fn(() => ({
        remove: mockSupabaseRemove,
      })),
    },
  })),
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
          subCategory: "수발신 공문",
          correspondenceType: "회신",
          replyToDocumentId: "received-doc-1",
          replyNotRequired: false,
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
        correspondenceType: "회신",
        replyToDocumentId: "received-doc-1",
        replyNotRequired: false,
      }),
    }));
    expect(await response.json()).toMatchObject({ success: true });
  });

  it("saves reply due date for received correspondence that requires a reply", async () => {
    mockGetSession.mockResolvedValue({ id: "admin-1", role: "ADMIN" });
    mockPrisma.document.create.mockResolvedValue({
      id: "doc-1",
      title: "수신 공문",
      attachments: [],
    });

    const { POST } = await import("@/app/api/documents/route");
    const response = await POST(
      new Request("http://localhost/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "수신 공문",
          description: "회신 필요",
          category: "DISCLOSURE",
          subCategory: "수발신 공문",
          correspondenceType: "수신",
          replyNotRequired: false,
          replyDueDate: "2026-06-20",
          documentDate: "2026-06-05",
          publishedAt: "2026-06-05",
          file: {
            path: "documents/2026-06-05/main.pdf",
            name: "main.pdf",
            size: 1024,
          },
        }),
      }),
    );

    expect(response.status).toBe(200);
    expect(mockPrisma.document.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        correspondenceType: "수신",
        replyNotRequired: false,
        replyDueDate: new Date("2026-06-20"),
      }),
    }));
  });

  it("normalizes virtual sent correspondence folder uploads to stored correspondence metadata", async () => {
    mockGetSession.mockResolvedValue({ id: "admin-1", role: "ADMIN" });
    mockPrisma.document.create.mockResolvedValue({
      id: "doc-1",
      title: "발신 공문",
      attachments: [],
    });

    const { POST } = await import("@/app/api/documents/route");
    const response = await POST(
      new Request("http://localhost/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "발신 공문",
          description: "발신 문서",
          category: "DISCLOSURE",
          subCategory: "발신 공문",
          correspondenceType: null,
          documentDate: "2026-06-05",
          publishedAt: "2026-06-05",
          file: {
            path: "documents/2026-06-05/sent.pdf",
            name: "sent.pdf",
            size: 1024,
          },
        }),
      }),
    );

    expect(response.status).toBe(200);
    expect(mockPrisma.document.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        subCategory: "수발신 공문",
        correspondenceType: "발신",
      }),
    }));
  });

  it("updates document metadata for admins", async () => {
    mockGetSession.mockResolvedValue({ id: "admin-1", role: "ADMIN" });
    mockPrisma.document.update.mockResolvedValue({
      id: "doc-1",
      title: "수정된 문서",
      description: "수정 설명",
      category: "DISCLOSURE",
      subCategory: "수발신 공문",
      correspondenceType: "회신",
      replyToDocumentId: "received-doc-1",
      replyNotRequired: false,
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
          subCategory: "수발신 공문",
          correspondenceType: "회신",
          replyToDocumentId: "received-doc-1",
          replyNotRequired: false,
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
        subCategory: "수발신 공문",
        correspondenceType: "회신",
        replyToDocumentId: "received-doc-1",
        replyNotRequired: false,
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

  it("updates reply due date for received correspondence", async () => {
    mockGetSession.mockResolvedValue({ id: "admin-1", role: "ADMIN" });
    mockPrisma.document.update.mockResolvedValue({
      id: "doc-1",
      title: "수정된 수신 공문",
      category: "DISCLOSURE",
      subCategory: "수발신 공문",
      correspondenceType: "수신",
      replyNotRequired: false,
      replyDueDate: new Date("2026-06-20"),
      attachments: [],
    });

    const { PATCH } = await import("@/app/api/documents/[id]/route");
    const response = await PATCH(
      new Request("http://localhost/api/documents/doc-1", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "수정된 수신 공문",
          category: "DISCLOSURE",
          subCategory: "수발신 공문",
          correspondenceType: "수신",
          replyNotRequired: false,
          replyDueDate: "2026-06-20",
          documentDate: "2026-06-01",
          publishedAt: "2026-06-05",
        }),
      }),
      { params: Promise.resolve({ id: "doc-1" }) },
    );

    expect(response.status).toBe(200);
    expect(mockPrisma.document.update).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        correspondenceType: "수신",
        replyNotRequired: false,
        replyDueDate: new Date("2026-06-20"),
      }),
    }));
  });

  it("deletes documents for normalized admin sessions", async () => {
    process.env.SUPABASE_URL = "https://supabase.example";
    process.env.SUPABASE_SECRET_KEY = "secret";
    mockGetSession.mockResolvedValue({ id: "admin-1", role: " admin " });
    mockPrisma.document.findUnique.mockResolvedValue({
      id: "doc-1",
      filePath: "documents/2026/main.pdf",
      attachmentPath: "documents/2026/legacy.pdf",
      attachments: [
        {
          id: "att-1",
          filePath: "documents/2026/extra.docx",
        },
      ],
    });
    mockSupabaseRemove.mockResolvedValue({ error: null });
    mockPrisma.document.delete.mockResolvedValue({ id: "doc-1" });

    const { DELETE } = await import("@/app/api/documents/[id]/route");
    const response = await DELETE(
      new Request("http://localhost/api/documents/doc-1", { method: "DELETE" }),
      { params: Promise.resolve({ id: "doc-1" }) },
    );

    expect(response.status).toBe(200);
    expect(mockSupabaseRemove).toHaveBeenCalledWith([
      "documents/2026/main.pdf",
      "documents/2026/legacy.pdf",
      "documents/2026/extra.docx",
    ]);
    expect(mockPrisma.document.delete).toHaveBeenCalledWith({ where: { id: "doc-1" } });
    expect(await response.json()).toMatchObject({ success: true });
  });

  it("updates the main document file and appends additional attachments for admins", async () => {
    mockGetSession.mockResolvedValue({ id: "admin-1", role: "ADMIN" });
    mockPrisma.document.findUnique.mockResolvedValue({
      id: "doc-1",
      filePath: "documents/old/main.pdf",
      attachmentPath: null,
      attachments: [
        {
          id: "att-old",
          filePath: "documents/old/old-attachment.docx",
        },
      ],
    });
    mockPrisma.document.update.mockResolvedValue({
      id: "doc-1",
      title: "수정된 문서",
      filePath: "documents/2026-06-09/new-main.docx",
      fileName: "new-main.docx",
      fileSize: 4096,
      attachments: [
        {
          id: "att-old",
          filePath: "documents/old/old-attachment.docx",
          fileName: "old-attachment.docx",
          fileSize: 1024,
        },
        {
          id: "att-new",
          filePath: "documents/2026-06-09/new-attachment.pdf",
          fileName: "new-attachment.pdf",
          fileSize: 2048,
        },
      ],
    });

    const { PATCH } = await import("@/app/api/documents/[id]/route");
    const response = await PATCH(
      new Request("http://localhost/api/documents/doc-1", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "수정된 문서",
          file: {
            path: "documents/2026-06-09/new-main.docx",
            name: "new-main.docx",
            size: 4096,
          },
          appendAttachments: [
            {
              path: "documents/2026-06-09/new-attachment.pdf",
              name: "new-attachment.pdf",
              size: 2048,
            },
          ],
        }),
      }),
      { params: Promise.resolve({ id: "doc-1" }) },
    );

    expect(response.status).toBe(200);
    expect(mockPrisma.document.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: "doc-1" },
      data: expect.objectContaining({
        title: "수정된 문서",
        filePath: "documents/2026-06-09/new-main.docx",
        fileName: "new-main.docx",
        fileSize: 4096,
        attachments: {
          create: [
            {
              filePath: "documents/2026-06-09/new-attachment.pdf",
              fileName: "new-attachment.pdf",
              fileSize: 2048,
            },
          ],
        },
      }),
      include: {
        attachments: true,
      },
    }));
    expect(await response.json()).toMatchObject({
      success: true,
      document: {
        fileName: "new-main.docx",
        attachments: [
          {
            fileName: "old-attachment.docx",
          },
          {
            fileName: "new-attachment.pdf",
          },
        ],
      },
    });
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

  it("saves disclosure card title and content overrides for admins", async () => {
    mockGetSession.mockResolvedValue({ id: "admin-1", role: "ADMIN" });
    mockPrisma.disclosureCardContent.upsert.mockResolvedValue({
      id: "card-content-1",
      itemId: "rules-3",
      title: "운영관리규정 수정 제목",
      description: "운영관리규정 수정 본문입니다.",
    });

    const { PATCH } = await import("@/app/api/disclosure-card-contents/route");
    const response = await PATCH(
      new Request("http://localhost/api/disclosure-card-contents", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemId: "rules-3",
          title: "운영관리규정 수정 제목",
          description: "운영관리규정 수정 본문입니다.",
        }),
      }),
    );

    expect(response.status).toBe(200);
    expect(mockPrisma.disclosureCardContent.upsert).toHaveBeenCalledWith({
      where: { itemId: "rules-3" },
      create: {
        itemId: "rules-3",
        title: "운영관리규정 수정 제목",
        description: "운영관리규정 수정 본문입니다.",
      },
      update: {
        title: "운영관리규정 수정 제목",
        description: "운영관리규정 수정 본문입니다.",
      },
    });
    expect(await response.json()).toMatchObject({
      success: true,
      cardContent: {
        itemId: "rules-3",
        title: "운영관리규정 수정 제목",
        description: "운영관리규정 수정 본문입니다.",
      },
    });
  });
});
