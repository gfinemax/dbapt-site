import { describe, expect, it } from "vitest";
import { serializeDocuments } from "@/lib/document-serializer";

describe("document serializer", () => {
  it("preserves correspondence reply metadata for disclosure status badges", () => {
    const now = new Date("2026-06-09T10:00:00.000Z");

    const [document] = serializeDocuments([
      {
        id: "received-doc-1",
        title: "수신 공문",
        description: null,
        category: "DISCLOSURE",
        subCategory: "수발신 공문",
        correspondenceType: "수신",
        replyToDocumentId: "received-parent-1",
        replyNotRequired: true,
        replyDueDate: new Date("2026-06-20T00:00:00.000Z"),
        filePath: "/secure/received.pdf",
        fileName: "received.pdf",
        fileSize: 1024,
        attachmentPath: null,
        attachmentName: null,
        attachmentSize: null,
        isStarred: false,
        status: "APPROVED",
        publishedAt: null,
        documentDate: now,
        createdAt: now,
        updatedAt: now,
      },
    ]);

    expect(document.replyToDocumentId).toBe("received-parent-1");
    expect(document.replyNotRequired).toBe(true);
    expect(document.replyDueDate).toBe("2026-06-20T00:00:00.000Z");
  });
});
