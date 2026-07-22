import { beforeEach, describe, expect, it, vi } from "vitest";

const createMock = vi.fn();

vi.mock("@/lib/db", () => ({ prisma: { documentLog: { create: createMock } } }));

describe("document audit recorder", () => {
  beforeEach(() => createMock.mockReset());

  it("stores a file-level snapshot after an authorized file operation", async () => {
    createMock.mockResolvedValue({ id: "log-1" });
    const { recordDocumentAccess } = await import("@/lib/document-audit");
    await recordDocumentAccess({
      request: new Request("https://example.test/api/documents/attachments/att-1", { headers: { "x-forwarded-for": "203.0.113.1, 10.0.0.1", "user-agent": "Chrome" } }),
      session: { id: "user-1" },
      documentId: "doc-1",
      actionType: "DOWNLOAD",
      resourceType: "ATTACHMENT",
      attachmentId: "att-1",
      fileName: "증빙.pdf",
      fileSize: 4096,
    });

    expect(createMock).toHaveBeenCalledWith({ data: {
      userId: "user-1", documentId: "doc-1", actionType: "DOWNLOAD", resourceType: "ATTACHMENT",
      attachmentId: "att-1", fileName: "증빙.pdf", fileSize: 4096,
      requestPath: "/api/documents/attachments/att-1", ipAddress: "203.0.113.1", userAgent: "Chrome",
    } });
  });
});
