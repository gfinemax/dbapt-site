type CorrespondenceType = "발신" | "수신" | "회신";

type RelatedDocumentSource = {
  id: string;
  title: string;
  correspondenceType?: CorrespondenceType | null;
  replyToDocumentId?: string | null;
};

export function inferCorrespondenceTypeFromDocument(
  document: Pick<RelatedDocumentSource, "title" | "correspondenceType">,
): CorrespondenceType | null {
  if (document.correspondenceType) return document.correspondenceType;
  if (document.title.includes("회신")) return "회신";
  if (document.title.includes("수신")) return "수신";
  if (document.title.includes("발신") || document.title.includes("송신")) return "발신";
  return null;
}

export function getPdfRelatedDocument<T extends RelatedDocumentSource>(
  document: T,
  documents: T[],
): { document: T; label: string } | null {
  const correspondenceType = inferCorrespondenceTypeFromDocument(document);

  if (correspondenceType === "회신" && document.replyToDocumentId) {
    const originalReceivedDocument = documents.find((candidate) => candidate.id === document.replyToDocumentId);
    return originalReceivedDocument
      ? { document: originalReceivedDocument, label: "원 수신공문 보기" }
      : null;
  }

  if (correspondenceType === "수신") {
    const replyDocument = documents.find(
      (candidate) =>
        candidate.replyToDocumentId === document.id &&
        inferCorrespondenceTypeFromDocument(candidate) === "회신",
    );
    return replyDocument ? { document: replyDocument, label: "관련 회신공문 보기" } : null;
  }

  return null;
}
