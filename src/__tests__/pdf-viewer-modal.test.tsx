import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PdfViewerModal } from "@/components/portal/pdf-viewer-modal";

vi.mock("@/components/pdf/pdf-canvas-viewer", () => ({
  PdfCanvasViewer: ({ sourceUrl, fileName, className }: { sourceUrl: string; fileName: string; className?: string }) => (
    <div data-testid="pdf-canvas-viewer" data-source-url={sourceUrl} data-file-name={fileName} className={className} />
  ),
}));

describe("PdfViewerModal", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });
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

    const previewViewers = screen.getAllByTestId("pdf-canvas-viewer");
    expect(previewViewers).toHaveLength(1);
    expect(previewViewers[0]).toHaveAttribute("data-source-url", "/api/documents/doc-1/merged-view");
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

  it("portals the viewer layer to the document body outside transformed ancestors", () => {
    render(
      <div data-testid="transformed-root" style={{ transform: "translateX(0)" }}>
        <PdfViewerModal
          documentId="doc-1"
          documentTitle="보관함 문서"
          fileName="saved-document.pdf"
          onClose={vi.fn()}
        />
      </div>,
    );

    const layer = screen.getByTestId("pdf-viewer-modal-layer");
    const transformedRoot = screen.getByTestId("transformed-root");

    expect(layer.parentElement).toBe(document.body);
    expect(transformedRoot.contains(layer)).toBe(false);
  });

  it("can switch to a PDF-only enlarged view and return to the detailed viewer", () => {
    render(
      <PdfViewerModal
        documentId="doc-1"
        documentTitle="2026년 제3차 이사회 의사록"
        fileName="board-minutes.pdf"
        description="2026년 6월20일 개최한 제3차 이사회 의사록"
        onClose={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "PDF만 크게" }));

    expect(screen.getByTestId("pdf-viewer-panel")).toHaveClass("h-[98vh]", "w-[98vw]");
    expect(screen.getByTestId("pdf-preview-scroll-area")).toHaveClass("p-0");
    expect(screen.getByTestId("pdf-preview-frame-area")).toHaveClass("h-full", "min-h-0");
    expect(screen.queryByTestId("pdf-viewer-header")).not.toBeInTheDocument();
    expect(screen.queryByText("본문 문서")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "상세 보기" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "상세 보기" }));

    expect(screen.getByTestId("pdf-viewer-header")).toBeInTheDocument();
    expect(screen.getByText("본문 문서")).toBeInTheDocument();
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

  it("renders the PDF with the in-app canvas viewer on mobile", () => {
    render(
      <PdfViewerModal
        documentId="doc-1"
        documentTitle="대의원 회의록"
        fileName="delegate-minutes.pdf"
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByTestId("pdf-canvas-viewer")).toHaveAttribute("data-source-url", "/api/documents/doc-1/view");
    expect(screen.queryByRole("link", { name: "스마트폰에서 바로 보기" })).not.toBeInTheDocument();
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

    expect(screen.getByTestId("pdf-canvas-viewer")).toHaveAttribute("data-source-url", "/api/documents/reply-1/view");

    fireEvent.click(screen.getByRole("button", { name: "원 수신공문 보기" }));

    expect(screen.getByText("민원 수신공문")).toBeInTheDocument();
    expect(screen.getByText("회신 대상 원문")).toBeInTheDocument();
    expect(screen.getByTestId("pdf-canvas-viewer")).toHaveAttribute("data-source-url", "/api/documents/received-1/view");

    fireEvent.click(screen.getByRole("button", { name: "원 문서 보기" }));

    expect(screen.getByText("민원 회신공문")).toBeInTheDocument();
    expect(screen.getByTestId("pdf-canvas-viewer")).toHaveAttribute("data-source-url", "/api/documents/reply-1/view");
  });

  it("does not request a download until the user confirms", async () => {
    const fetchMock = vi.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      blob: vi.fn().mockResolvedValue(new Blob(["pdf"])),
    } as unknown as Response);
    const createObjectUrl = vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:test");
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => undefined);
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => undefined);

    render(
      <PdfViewerModal
        documentId="doc-1"
        documentTitle="대용량 보고서"
        fileName="large-report.pdf"
        fileSize={5_242_880}
        onClose={vi.fn()}
      />,
    );

    fireEvent.click(screen.getAllByRole("button", { name: "다운로드" })[0]);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(screen.getByRole("dialog", { name: "이 파일을 다운로드할까?" })).toBeInTheDocument();
    expect(screen.getByText("파일 크기 5.0 MB")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "취소" }));
    expect(fetchMock).not.toHaveBeenCalled();

    fireEvent.click(screen.getAllByRole("button", { name: "다운로드" })[0]);
    fireEvent.click(within(screen.getByRole("dialog", { name: "이 파일을 다운로드할까?" })).getByRole("button", { name: "다운로드" }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith("/api/documents/doc-1/download"));
    expect(createObjectUrl).toHaveBeenCalledOnce();
  });

  it("confirms an attachment download before requesting it", async () => {
    const fetchMock = vi.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      blob: vi.fn().mockResolvedValue(new Blob(["pdf"])),
    } as unknown as Response);
    vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:attachment");
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => undefined);
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => undefined);

    render(
      <PdfViewerModal
        documentId="doc-1"
        documentTitle="첨부 문서"
        fileName="main.pdf"
        attachments={[{ id: "att-1", fileName: "appendix.docx", fileSize: 4096 }]}
        onClose={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /appendix\.docx/ }));
    expect(fetchMock).not.toHaveBeenCalled();
    fireEvent.click(within(screen.getByRole("dialog", { name: "이 파일을 다운로드할까?" })).getByRole("button", { name: "다운로드" }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith("/api/documents/attachments/att-1"));
  });
});
