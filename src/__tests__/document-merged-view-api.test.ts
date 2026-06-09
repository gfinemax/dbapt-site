import { describe, expect, it, vi, beforeEach } from "vitest";
import { PDFDocument } from "pdf-lib";

const mockGetSession = vi.hoisted(() => vi.fn());
const mockDownloadDocumentFile = vi.hoisted(() => vi.fn());
const mockPrisma = vi.hoisted(() => ({
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

async function createPdfBlob() {
  const pdf = await PDFDocument.create();
  pdf.addPage([200, 200]);
  const bytes = await pdf.save();
  return new Blob([bytes], { type: "application/pdf" });
}

describe("document merged PDF view API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("merges the main PDF and PDF attachments into one inline PDF response", async () => {
    mockGetSession.mockResolvedValue({ id: "member-1", role: "MEMBER" });
    mockPrisma.document.findUnique.mockResolvedValue({
      id: "doc-1",
      title: "운영관리규정 최신본",
      status: "APPROVED",
      fileName: "main.pdf",
      filePath: "documents/main.pdf",
      attachments: [
        {
          id: "att-1",
          fileName: "appendix-1.pdf",
          filePath: "documents/appendix-1.pdf",
        },
        {
          id: "att-2",
          fileName: "appendix-2.docx",
          filePath: "documents/appendix-2.docx",
        },
        {
          id: "att-3",
          fileName: "appendix-3.pdf",
          filePath: "documents/appendix-3.pdf",
        },
      ],
    });
    mockDownloadDocumentFile
      .mockResolvedValueOnce(await createPdfBlob())
      .mockResolvedValueOnce(await createPdfBlob())
      .mockResolvedValueOnce(await createPdfBlob());
    mockPrisma.documentLog.create.mockResolvedValue({ id: "log-1" });

    const { GET } = await import("@/app/api/documents/[id]/merged-view/route");
    const response = await GET(
      new Request("http://localhost/api/documents/doc-1/merged-view", {
        headers: { "user-agent": "vitest", "x-forwarded-for": "127.0.0.1" },
      }),
      { params: Promise.resolve({ id: "doc-1" }) },
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("application/pdf");
    expect(response.headers.get("Content-Disposition")).toContain("inline");
    expect(mockDownloadDocumentFile).toHaveBeenCalledTimes(3);
    expect(mockDownloadDocumentFile).toHaveBeenNthCalledWith(1, "documents/main.pdf");
    expect(mockDownloadDocumentFile).toHaveBeenNthCalledWith(2, "documents/appendix-1.pdf");
    expect(mockDownloadDocumentFile).toHaveBeenNthCalledWith(3, "documents/appendix-3.pdf");

    const mergedPdf = await PDFDocument.load(await response.arrayBuffer());
    expect(mergedPdf.getPageCount()).toBe(3);
  });
});
