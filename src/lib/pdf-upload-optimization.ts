export type PdfUploadOptimizationMode = "auto" | "original";

export type PreparedDocumentUploadFile = {
  file: File;
  originalFile: File;
  originalSize: number;
  storedSize: number;
  optimized: boolean;
  reductionPercent: number;
};

type PrepareDocumentUploadFileOptions = {
  mode?: PdfUploadOptimizationMode;
  minBytes?: number;
  minSavingsRatio?: number;
  optimizePdfBytes?: (file: File) => Promise<Uint8Array>;
};

export const PDF_AUTO_OPTIMIZATION_MIN_BYTES = 5 * 1024 * 1024;
export const PDF_AUTO_OPTIMIZATION_MIN_SAVINGS_RATIO = 0.15;

function isPdfFile(file: File) {
  return file.type === "application/pdf" || file.name.trim().toLowerCase().endsWith(".pdf");
}

function calculateReductionPercent(originalSize: number, storedSize: number) {
  if (originalSize <= 0 || storedSize >= originalSize) return 0;
  return Math.round((1 - storedSize / originalSize) * 100);
}

async function optimizePdfWithPdfLib(file: File) {
  const { PDFDocument } = await import("pdf-lib");
  const pdf = await PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: true });
  return pdf.save({ useObjectStreams: true });
}

function originalResult(file: File): PreparedDocumentUploadFile {
  return {
    file,
    originalFile: file,
    originalSize: file.size,
    storedSize: file.size,
    optimized: false,
    reductionPercent: 0,
  };
}

export async function prepareDocumentUploadFile(
  file: File,
  options: PrepareDocumentUploadFileOptions = {},
): Promise<PreparedDocumentUploadFile> {
  const mode = options.mode || "auto";
  const minBytes = options.minBytes ?? PDF_AUTO_OPTIMIZATION_MIN_BYTES;
  const minSavingsRatio = options.minSavingsRatio ?? PDF_AUTO_OPTIMIZATION_MIN_SAVINGS_RATIO;
  const optimizePdfBytes = options.optimizePdfBytes || optimizePdfWithPdfLib;

  if (mode === "original" || !isPdfFile(file) || file.size <= minBytes) {
    return originalResult(file);
  }

  try {
    const optimizedBytes = await optimizePdfBytes(file);
    const optimizedSize = optimizedBytes.byteLength;
    const savingsRatio = file.size > 0 ? (file.size - optimizedSize) / file.size : 0;

    if (optimizedSize > 0 && savingsRatio >= minSavingsRatio) {
      const optimizedArrayBuffer = optimizedBytes.buffer.slice(
        optimizedBytes.byteOffset,
        optimizedBytes.byteOffset + optimizedBytes.byteLength,
      ) as ArrayBuffer;
      const optimizedFile = new File([optimizedArrayBuffer], file.name, {
        type: file.type || "application/pdf",
        lastModified: file.lastModified,
      });

      return {
        file: optimizedFile,
        originalFile: file,
        originalSize: file.size,
        storedSize: optimizedFile.size,
        optimized: true,
        reductionPercent: calculateReductionPercent(file.size, optimizedFile.size),
      };
    }
  } catch (error) {
    console.warn("PDF upload optimization skipped:", error);
  }

  return originalResult(file);
}
