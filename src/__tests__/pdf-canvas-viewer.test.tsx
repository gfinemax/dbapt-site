import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PdfCanvasViewer } from "@/components/pdf/pdf-canvas-viewer";

const { getDocumentMock, getPageMock, renderPageMock } = vi.hoisted(() => ({
  getDocumentMock: vi.fn(),
  getPageMock: vi.fn(),
  renderPageMock: vi.fn(),
}));

vi.mock("pdfjs-dist/webpack.mjs", () => ({
  getDocument: getDocumentMock,
}));

describe("PdfCanvasViewer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(HTMLElement.prototype, "clientWidth", { configurable: true, value: 390 });
    HTMLElement.prototype.scrollIntoView = vi.fn();

    renderPageMock.mockReturnValue({ promise: Promise.resolve(), cancel: vi.fn() });
    getPageMock.mockImplementation(async () => ({
      getViewport: ({ scale }: { scale: number }) => ({ width: 600 * scale, height: 840 * scale }),
      render: renderPageMock,
      cleanup: vi.fn(),
    }));
    getDocumentMock.mockReturnValue({
      onProgress: null,
      promise: Promise.resolve({ numPages: 3, getPage: getPageMock, destroy: vi.fn() }),
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders every page in one continuous scroll surface", async () => {
    render(<PdfCanvasViewer sourceUrl="/api/documents/doc-1/view" fileName="report.pdf" className="h-full" />);

    expect(await screen.findByTestId("pdf-continuous-scroll")).toBeInTheDocument();
    await waitFor(() => expect(screen.getAllByLabelText(/쪽$/)).toHaveLength(3));
    expect(screen.getByTestId("pdf-canvas-viewer")).toHaveAttribute("data-source-url", "/api/documents/doc-1/view");
  });

  it("supports direct page movement and zoom controls", async () => {
    render(<PdfCanvasViewer sourceUrl="/api/documents/doc-1/view" fileName="report.pdf" />);
    await screen.findByTestId("pdf-continuous-scroll");

    const pageInput = screen.getByRole("spinbutton");
    fireEvent.change(pageInput, { target: { value: "3" } });
    fireEvent.keyDown(pageInput, { key: "Enter" });
    expect(pageInput).toHaveValue(3);
    expect(HTMLElement.prototype.scrollIntoView).toHaveBeenCalledOnce();

    fireEvent.click(screen.getByRole("button", { name: "확대" }));
    expect(screen.getByRole("button", { name: "화면 너비에 맞춤" })).toHaveTextContent("125%");
    fireEvent.click(screen.getByRole("button", { name: "화면 너비에 맞춤" }));
    expect(screen.getByRole("button", { name: "화면 너비에 맞춤" })).toHaveTextContent("100%");
  });

  it("keeps allowing continuous zoom beyond the former 250 percent limit", async () => {
    render(<PdfCanvasViewer sourceUrl="/api/documents/doc-1/view" fileName="report.pdf" />);
    await screen.findByTestId("pdf-continuous-scroll");

    const zoomIn = screen.getByRole("button", { name: "확대" });
    for (let step = 0; step < 8; step += 1) fireEvent.click(zoomIn);

    expect(screen.getByRole("button", { name: "화면 너비에 맞춤" })).toHaveTextContent("300%");
    expect(zoomIn).toBeEnabled();
  });

  it("keeps the previous canvas visible until the sharper canvas is ready", async () => {
    const { container } = render(<PdfCanvasViewer sourceUrl="/api/documents/doc-1/view" fileName="report.pdf" />);
    await screen.findByTestId("pdf-continuous-scroll");
    await waitFor(() => expect(renderPageMock).toHaveBeenCalledTimes(3));

    const pageCanvases = container.querySelectorAll<HTMLCanvasElement>('[data-pdf-page="1"] canvas');
    const previousCanvas = Array.from(pageCanvases).find((canvas) => canvas.style.opacity === "1");
    expect(previousCanvas).toBeDefined();

    fireEvent.click(screen.getByRole("button", { name: "확대" }));

    await waitFor(() => {
      const nextCanvas = Array.from(pageCanvases).find((canvas) => canvas !== previousCanvas && canvas.style.opacity === "1");
      expect(nextCanvas).toBeDefined();
    });
    expect(previousCanvas?.style.opacity).toBe("0");
    expect(previousCanvas?.style.transition).toContain("opacity 180ms");
  });

  it("uses a two-finger gesture to enlarge the continuous document", async () => {
    render(<PdfCanvasViewer sourceUrl="/api/documents/doc-1/view" fileName="report.pdf" />);
    const scrollArea = await screen.findByTestId("pdf-continuous-scroll");
    await waitFor(() => expect(renderPageMock).toHaveBeenCalledTimes(3));

    fireEvent.touchStart(scrollArea, {
      touches: [{ clientX: 0, clientY: 0 }, { clientX: 100, clientY: 0 }],
    });
    fireEvent.touchMove(scrollArea, {
      touches: [{ clientX: 0, clientY: 0 }, { clientX: 150, clientY: 0 }],
    });
    expect(renderPageMock).toHaveBeenCalledTimes(3);
    fireEvent.touchEnd(scrollArea, { touches: [] });

    expect(screen.getByRole("button", { name: "화면 너비에 맞춤" })).toHaveTextContent("150%");
    await waitFor(() => expect(renderPageMock.mock.calls.length).toBeGreaterThan(3));
  });

  it("hides overlay controls while scrolling and reveals them when the document is tapped", async () => {
    render(<PdfCanvasViewer sourceUrl="/api/documents/doc-1/view" fileName="report.pdf" />);
    const scrollArea = await screen.findByTestId("pdf-continuous-scroll");
    const controls = screen.getByTestId("pdf-viewer-controls");

    expect(controls).toHaveAttribute("aria-hidden", "false");
    fireEvent.scroll(scrollArea);
    expect(controls).toHaveAttribute("aria-hidden", "true");
    fireEvent.click(scrollArea);
    expect(controls).toHaveAttribute("aria-hidden", "false");
  });
});
