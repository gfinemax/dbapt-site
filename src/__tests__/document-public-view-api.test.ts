import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGetSession = vi.hoisted(() => vi.fn());
const mockDownloadDocumentFile = vi.hoisted(() => vi.fn());
const mockPrisma = vi.hoisted(() => ({
  attachment: {
    findUnique: vi.fn(),
  },
  document: {
    findUnique: vi.fn(),
  },
  documentLog: {
    create: vi.fn(),
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

function createPdfBlob() {
  return new Blob(["%PDF-1.4 public"], { type: "application/pdf" });
}

describe("public document PDF view API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetSession.mockResolvedValue(null);
  });

  it("streams an approved disclosure PDF without a login session", async () => {
    mockPrisma.document.findUnique.mockResolvedValue({
      id: "doc-public",
      title: "대의원 회의록",
      category: "DISCLOSURE",
      status: "APPROVED",
      fileName: "delegate-minutes.pdf",
      filePath: "documents/delegate-minutes.pdf",
    });
    mockDownloadDocumentFile.mockResolvedValue(createPdfBlob());

    const { GET } = await import("@/app/api/documents/[id]/view/route");
    const response = await GET(
      new Request("http://localhost/api/documents/doc-public/view"),
      { params: Promise.resolve({ id: "doc-public" }) },
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("application/pdf");
    expect(response.headers.get("Content-Disposition")).toContain("inline");
    expect(mockDownloadDocumentFile).toHaveBeenCalledWith("documents/delegate-minutes.pdf");
    expect(mockPrisma.documentLog.create).not.toHaveBeenCalled();
  });

  it("does not open approved accounting PDFs to anonymous visitors", async () => {
    mockPrisma.document.findUnique.mockResolvedValue({
      id: "doc-accounting",
      title: "회계 보고",
      category: "ACCOUNTING",
      status: "APPROVED",
      fileName: "accounting.pdf",
      filePath: "documents/accounting.pdf",
    });

    const { GET } = await import("@/app/api/documents/[id]/view/route");
    const response = await GET(
      new Request("http://localhost/api/documents/doc-accounting/view"),
      { params: Promise.resolve({ id: "doc-accounting" }) },
    );

    expect(response.status).toBe(401);
    expect(mockDownloadDocumentFile).not.toHaveBeenCalled();
  });

  it("streams an approved disclosure PDF attachment without a login session", async () => {
    mockPrisma.attachment.findUnique.mockResolvedValue({
      id: "att-public",
      documentId: "doc-public",
      fileName: "appendix.pdf",
      filePath: "documents/appendix.pdf",
      document: {
        id: "doc-public",
        category: "DISCLOSURE",
        status: "APPROVED",
      },
    });
    mockDownloadDocumentFile.mockResolvedValue(createPdfBlob());

    const { GET } = await import("@/app/api/documents/attachments/[attachmentId]/view/route");
    const response = await GET(
      new Request("http://localhost/api/documents/attachments/att-public/view"),
      { params: Promise.resolve({ attachmentId: "att-public" }) },
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("application/pdf");
    expect(mockDownloadDocumentFile).toHaveBeenCalledWith("documents/appendix.pdf");
    expect(mockPrisma.documentLog.create).not.toHaveBeenCalled();
  });
});
