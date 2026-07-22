import { prisma } from "@/lib/db";

export type DocumentAuditAction = "VIEW" | "DOWNLOAD";
export type DocumentAuditResource =
  | "MAIN_FILE"
  | "LEGACY_ATTACHMENT"
  | "ATTACHMENT"
  | "MERGED_FILE";

type AuditSession = {
  id: string;
};

type RecordDocumentAccessInput = {
  request: Request;
  session: AuditSession;
  documentId: string;
  actionType: DocumentAuditAction;
  resourceType: DocumentAuditResource;
  fileName: string;
  fileSize?: number | null;
  attachmentId?: string | null;
};

export function getClientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "127.0.0.1";
}

export async function recordDocumentAccess({
  request,
  session,
  documentId,
  actionType,
  resourceType,
  fileName,
  fileSize,
  attachmentId,
}: RecordDocumentAccessInput) {
  const requestPath = new URL(request.url).pathname;

  await prisma.documentLog.create({
    data: {
      userId: session.id,
      documentId,
      actionType,
      resourceType,
      attachmentId: attachmentId || null,
      fileName,
      fileSize: typeof fileSize === "number" ? fileSize : null,
      requestPath,
      ipAddress: getClientIp(request),
      userAgent: request.headers.get("user-agent") || "Unknown",
    },
  });
}
