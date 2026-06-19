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

  it("opens in full viewport mode by default", () => {
    render(
      <PdfViewerModal
        documentId="doc-1"
        documentTitle="2026년도 1분기 수입 및 지출 자금집행 실적 보고서"
        fileName="fund-report.pdf"
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByTestId("pdf-viewer-panel")).toHaveClass("h-[95vh]", "w-[95vw]", "max-w-none");
    expect(screen.getByRole("button", { name: "화면 축소" })).toBeInTheDocument();
  });

  it("keeps the viewer header readable on mobile widths", () => {
    render(
      <PdfViewerModal
        documentId="doc-1"
        documentTitle="2026년 6월 13일 열린 제2차 이사회 의사록"
        fileName="2026년 제2차 이사회 의사록.pdf"
        documentDate="2026-06-13"
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByTestId("pdf-viewer-panel")).toHaveClass("max-sm:h-[92svh]", "max-sm:w-[calc(100vw-16px)]");
    expect(screen.getByTestId("pdf-viewer-header")).toHaveClass("flex-col", "sm:flex-row");
    expect(screen.getByTestId("pdf-viewer-title")).toHaveClass("whitespace-normal", "break-keep");
    expect(screen.getByTestId("pdf-viewer-actions")).toHaveClass("grid", "grid-cols-3", "sm:flex");
  });

  it("offers a mobile direct-open link instead of relying only on an embedded PDF frame", () => {
    render(
      <PdfViewerModal
        documentId="doc-1"
        documentTitle="대의원 회의록"
        fileName="delegate-minutes.pdf"
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByTitle("문서 온라인 열람 뷰어")).toHaveClass("hidden", "sm:block");
    expect(screen.getByRole("link", { name: "스마트폰에서 바로 보기" })).toHaveAttribute(
      "href",
      "/api/documents/doc-1/view",
    );
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
