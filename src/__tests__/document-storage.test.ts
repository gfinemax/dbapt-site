import { describe, expect, it } from "vitest";
import {
  DOCUMENT_UPLOAD_MIME_TYPES,
  getDocumentUploadContentType,
  isAllowedDocumentUploadExtension,
} from "@/lib/document-storage";

describe("document storage upload metadata", () => {
  it("infers PDF content type from the extension when browsers send octet-stream", () => {
    const file = new File(["pdf"], "scan.pdf", { type: "application/octet-stream" });

    expect(getDocumentUploadContentType(file)).toBe("application/pdf");
  });

  it("keeps HWP and Word formats aligned with the upload form allowlist", () => {
    expect(isAllowedDocumentUploadExtension("rules.hwp")).toBe(true);
    expect(isAllowedDocumentUploadExtension("rules.hwpx")).toBe(true);
    expect(isAllowedDocumentUploadExtension("rules.doc")).toBe(true);
    expect(isAllowedDocumentUploadExtension("rules.docx")).toBe(true);
    expect(DOCUMENT_UPLOAD_MIME_TYPES).toEqual(expect.arrayContaining([
      "application/pdf",
      "application/x-hwp",
      "application/vnd.hancom.hwpx",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ]));
  });
});
