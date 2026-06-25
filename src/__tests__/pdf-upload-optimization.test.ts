import { describe, expect, it, vi } from "vitest";
import { prepareDocumentUploadFile } from "@/lib/pdf-upload-optimization";

function makeFile(size: number, name = "minutes.pdf") {
  return new File([new Uint8Array(size)], name, { type: "application/pdf" });
}

describe("prepareDocumentUploadFile", () => {
  it("skips PDFs below the optimization threshold", async () => {
    const optimizePdfBytes = vi.fn();
    const file = makeFile(1024);

    const result = await prepareDocumentUploadFile(file, {
      mode: "auto",
      minBytes: 2048,
      optimizePdfBytes,
    });

    expect(optimizePdfBytes).not.toHaveBeenCalled();
    expect(result.file).toBe(file);
    expect(result.originalSize).toBe(1024);
    expect(result.storedSize).toBe(1024);
    expect(result.optimized).toBe(false);
    expect(result.reductionPercent).toBe(0);
  });

  it("uses the optimized PDF only when it saves at least the configured ratio", async () => {
    const file = makeFile(1000);
    const optimizedBytes = new Uint8Array(800);

    const result = await prepareDocumentUploadFile(file, {
      mode: "auto",
      minBytes: 1,
      minSavingsRatio: 0.15,
      optimizePdfBytes: async () => optimizedBytes,
    });

    expect(result.file).not.toBe(file);
    expect(result.file.name).toBe("minutes.pdf");
    expect(result.file.size).toBe(800);
    expect(result.originalSize).toBe(1000);
    expect(result.storedSize).toBe(800);
    expect(result.optimized).toBe(true);
    expect(result.reductionPercent).toBe(20);
  });

  it("keeps the original PDF when optimization does not save enough space", async () => {
    const file = makeFile(1000);

    const result = await prepareDocumentUploadFile(file, {
      mode: "auto",
      minBytes: 1,
      minSavingsRatio: 0.15,
      optimizePdfBytes: async () => new Uint8Array(900),
    });

    expect(result.file).toBe(file);
    expect(result.storedSize).toBe(1000);
    expect(result.optimized).toBe(false);
    expect(result.reductionPercent).toBe(0);
  });

  it("respects the original-storage mode", async () => {
    const optimizePdfBytes = vi.fn();
    const file = makeFile(1000);

    const result = await prepareDocumentUploadFile(file, {
      mode: "original",
      minBytes: 1,
      optimizePdfBytes,
    });

    expect(optimizePdfBytes).not.toHaveBeenCalled();
    expect(result.file).toBe(file);
    expect(result.optimized).toBe(false);
  });
});
