import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PdfViewerModal } from "@/components/portal/pdf-viewer-modal";

describe("PdfViewerModal", () => {
  it("shows the document description in the viewer header", () => {
    render(
      <PdfViewerModal
        documentId="doc-1"
        documentTitle="운영관리규정 최신본"
        fileName="operating-rule.pdf"
        description="사무국 운영 및 문서 보존 절차"
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByText("문서 설명")).toBeInTheDocument();
    expect(screen.getByText("사무국 운영 및 문서 보존 절차")).toBeInTheDocument();
  });

  it("renders additional PDF attachments in sequence under the main PDF preview", () => {
    render(
      <PdfViewerModal
        documentId="doc-1"
        documentTitle="운영관리규정 최신본"
        fileName="operating-rule.pdf"
        description="사무국 운영 및 문서 보존 절차"
        attachments={[
          { id: "att-1", fileName: "appendix-1.pdf", fileSize: 1024 },
          { id: "att-2", fileName: "appendix-2.pdf", fileSize: 2048 },
          { id: "att-3", fileName: "appendix-3.docx", fileSize: 4096 },
        ]}
        onClose={vi.fn()}
      />,
    );

    const previewFrames = screen.getAllByTitle(/열람 뷰어/);
    expect(previewFrames).toHaveLength(3);
    expect(previewFrames[0]).toHaveAttribute("src", "/api/documents/doc-1/view");
    expect(previewFrames[1]).toHaveAttribute("src", "/api/documents/attachments/att-1/view");
    expect(previewFrames[2]).toHaveAttribute("src", "/api/documents/attachments/att-2/view");
    expect(screen.getByText("appendix-3.docx")).toBeInTheDocument();
  });
});
