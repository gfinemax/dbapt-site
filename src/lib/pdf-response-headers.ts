function getAsciiFallbackFileName(fileName: string) {
  const fallback = fileName
    .replace(/[^\x20-\x7E]/g, "_")
    .replace(/["\\]/g, "_")
    .trim();

  return fallback || "document.pdf";
}

export function getInlinePdfResponseHeaders(fileName: string) {
  const encodedFileName = encodeURIComponent(fileName);

  return {
    "Content-Type": "application/pdf",
    "Content-Disposition": `inline; filename="${getAsciiFallbackFileName(fileName)}"; filename*=UTF-8''${encodedFileName}`,
    "X-Content-Type-Options": "nosniff",
  };
}
