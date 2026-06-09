import { fireEvent, render, screen } from "@testing-library/react";
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

  it("renders one merged PDF preview when additional PDF attachments exist", () => {
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
    expect(previewFrames).toHaveLength(1);
    expect(previewFrames[0]).toHaveAttribute("src", "/api/documents/doc-1/merged-view");
    expect(screen.getByText("통합 PDF 문서")).toBeInTheDocument();
    expect(screen.getByText("appendix-3.docx")).toBeInTheDocument();
  });

  it("uses compact spacing around the PDF preview area", () => {
    render(
      <PdfViewerModal
        documentId="doc-1"
        documentTitle="운영관리규정 최신본"
        fileName="operating-rule.pdf"
        attachments={[{ id: "att-1", fileName: "appendix-1.pdf", fileSize: 1024 }]}
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByTestId("pdf-preview-scroll-area")).toHaveClass("p-1", "sm:p-2");
    expect(screen.getByTestId("pdf-preview-frame-area")).toHaveClass("h-[76vh]", "min-h-[560px]");
  });

  it("toggles between a reply document and its related received document", () => {
    render(
      <PdfViewerModal
        documentId="reply-1"
        documentTitle="민원 회신공문"
        fileName="reply.pdf"
        relatedDocument={{
          id: "received-1",
          title: "민원 수신공문",
          fileName: "received.pdf",
          description: "회신 대상 원문",
        }}
        relatedDocumentLabel="원 수신공문 보기"
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByTitle("문서 온라인 열람 뷰어")).toHaveAttribute("src", "/api/documents/reply-1/view");

    fireEvent.click(screen.getByRole("button", { name: "원 수신공문 보기" }));

    expect(screen.getByText("민원 수신공문")).toBeInTheDocument();
    expect(screen.getByText("회신 대상 원문")).toBeInTheDocument();
    expect(screen.getByTitle("문서 온라인 열람 뷰어")).toHaveAttribute("src", "/api/documents/received-1/view");

    fireEvent.click(screen.getByRole("button", { name: "원 문서 보기" }));

    expect(screen.getByText("민원 회신공문")).toBeInTheDocument();
    expect(screen.getByTitle("문서 온라인 열람 뷰어")).toHaveAttribute("src", "/api/documents/reply-1/view");
  });
});
