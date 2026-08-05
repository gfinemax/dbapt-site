import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { FreePostPdfViewer } from "@/components/news/free-post-pdf-viewer";

vi.mock("@/components/pdf/pdf-canvas-viewer", () => ({
  PdfCanvasViewer: () => <div data-testid="mock-pdf-canvas" />,
}));

describe("FreePostPdfViewer", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    Reflect.deleteProperty(HTMLElement.prototype, "requestFullscreen");
  });

  it("auto-hides the document header and reveals it on viewer interaction", () => {
    render(<FreePostPdfViewer postId="post-1" title="회의자료" fileName="회의자료.pdf" fileSize={815 * 1024} />);
    const viewer = screen.getByTestId("free-post-pdf-viewer");
    const header = screen.getByTestId("free-post-pdf-header");

    expect(header).toHaveAttribute("aria-hidden", "false");
    act(() => vi.advanceTimersByTime(1800));
    expect(header).toHaveAttribute("aria-hidden", "true");
    fireEvent.pointerDown(viewer);
    expect(header).toHaveAttribute("aria-hidden", "false");
  });

  it("uses native fullscreen when the browser supports it", async () => {
    const requestFullscreen = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(HTMLElement.prototype, "requestFullscreen", { configurable: true, value: requestFullscreen });
    render(<FreePostPdfViewer postId="post-1" title="회의자료" fileName="회의자료.pdf" fileSize={null} />);

    fireEvent.click(screen.getByRole("button", { name: "전체화면" }));
    await act(async () => Promise.resolve());
    expect(requestFullscreen).toHaveBeenCalledOnce();
  });

  it("falls back to an in-page immersive mode when fullscreen is blocked", async () => {
    Object.defineProperty(HTMLElement.prototype, "requestFullscreen", {
      configurable: true,
      value: vi.fn().mockRejectedValue(new Error("blocked")),
    });
    render(<FreePostPdfViewer postId="post-1" title="회의자료" fileName="회의자료.pdf" fileSize={null} />);

    fireEvent.click(screen.getByRole("button", { name: "전체화면" }));
    await act(async () => Promise.resolve());
    expect(screen.getByTestId("free-post-pdf-viewer")).toHaveAttribute("data-immersive", "true");
    expect(screen.getByRole("button", { name: "전체화면 종료" })).toBeInTheDocument();
  });
});
