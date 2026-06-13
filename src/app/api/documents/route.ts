import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { notifyDisclosureDocumentApproved } from "@/lib/notifications/disclosure-notifications";
import { upsertOpenChatAnnouncementForDocument } from "@/lib/notifications/openchat-announcements";
import {
  isAllowedDocumentUploadExtension,
  isSafeDocumentStoragePath,
  MAX_DOCUMENT_UPLOAD_SIZE,
  uploadDocumentFile,
} from "@/lib/document-storage";

type UploadedDocumentFile = {
  path?: unknown;
  name?: unknown;
  size?: unknown;
};

type DisclosureNotificationDocument = Parameters<typeof notifyDisclosureDocumentApproved>[0]["document"];
type OpenChatAnnouncementDocument = Parameters<typeof upsertOpenChatAnnouncementForDocument>[0]["document"];

const CORRESPONDENCE_TYPES = new Set(["발신", "수신", "회신", "기타"]);

function normalizeSubCategory(value: string) {
  if (value === "수신 공문" || value === "발신 공문" || value === "기타 공문" || value === "수발신 공문") {
    return "공문서";
  }
  if (value === "이사회 회의록") return "이사회 의사록";
  if (value === "대의원 회의록") return "대의원 의사록";
  return value;
}

function normalizeCorrespondenceType(value: unknown, category: string, subCategory: string, rawSubCategory = subCategory) {
  if (category !== "DISCLOSURE" || (subCategory !== "수발신 공문" && subCategory !== "공문서")) return null;
  const correspondenceType = typeof value === "string" ? value.trim() : "";
  if (CORRESPONDENCE_TYPES.has(correspondenceType)) return correspondenceType;
  if (rawSubCategory === "발신 공문") return "발신";
  if (rawSubCategory === "기타 공문") return "기타";
  return "수신";
}

function normalizeReplyToDocumentId(value: unknown, correspondenceType: string | null) {
  if (correspondenceType !== "회신") return null;
  const replyToDocumentId = typeof value === "string" ? value.trim() : "";
  return replyToDocumentId || null;
}

function normalizeReplyNotRequired(value: unknown, correspondenceType: string | null) {
  return correspondenceType === "수신" && value === true;
}

function normalizeReplyDueDate(value: unknown, correspondenceType: string | null, replyNotRequired: boolean) {
  if (correspondenceType !== "수신" || replyNotRequired) return null;
  const replyDueDateStr = typeof value === "string" ? value.trim() : "";
  if (!replyDueDateStr) return null;
  const replyDueDate = new Date(replyDueDateStr);
  return Number.isNaN(replyDueDate.getTime()) ? null : replyDueDate;
}

function validateUploadFile(file: File, label: string) {
  if (!file || file.size === 0) {
    return `${label}이 비어 있습니다.`;
  }

  if (file.size > MAX_DOCUMENT_UPLOAD_SIZE) {
    return `${label}은 20MB 이하만 업로드할 수 있습니다.`;
  }

  if (!isAllowedDocumentUploadExtension(file.name)) {
    return `${label}은 PDF, HWP, HWPX, Word 파일만 업로드할 수 있습니다.`;
  }

  return null;
}

function validateUploadedDocumentFile(file: UploadedDocumentFile, label: string) {
  const path = typeof file.path === "string" ? file.path.trim() : "";
  const name = typeof file.name === "string" ? file.name.trim() : "";
  const size = typeof file.size === "number" ? file.size : Number(file.size);

  if (!path || !name || !Number.isFinite(size) || size <= 0) {
    return { error: `${label} 정보가 올바르지 않습니다.` };
  }

  if (!isSafeDocumentStoragePath(path)) {
    return { error: `${label} 저장 경로가 올바르지 않습니다.` };
  }

  if (size > MAX_DOCUMENT_UPLOAD_SIZE) {
    return { error: `${label}은 20MB 이하만 업로드할 수 있습니다.` };
  }

  if (!isAllowedDocumentUploadExtension(name)) {
    return { error: `${label}은 PDF, HWP, HWPX, Word 파일만 업로드할 수 있습니다.` };
  }

  return { path, name, size };
}

async function triggerDisclosureNotification(document: DisclosureNotificationDocument) {
  try {
    await notifyDisclosureDocumentApproved({ document });
  } catch (error) {
    console.error("Disclosure notification error:", error);
  }
}

async function triggerOpenChatAnnouncement(document: OpenChatAnnouncementDocument) {
  try {
    await upsertOpenChatAnnouncementForDocument({ document });
  } catch (error) {
    console.error("OpenChat announcement error:", error);
  }
}

// 1. GET: List documents (gated by session and role)
export async function GET(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "인증되지 않은 사용자입니다." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");

  try {
    const whereClause: { category?: string; status?: string } = {};

    // Category filter
    if (category) {
      whereClause.category = category;
    }

    // Role-specific visibility bounds
    if (session.role !== "ADMIN") {
      // Regular members & Refund members can only see APPROVED documents
      whereClause.status = "APPROVED";
    }

    const documents = await prisma.document.findMany({
      where: whereClause,
      include: {
        attachments: true,
      },
      orderBy: { documentDate: "desc" },
    });

    return NextResponse.json({ documents });
  } catch (e) {
    console.error("GET documents error:", e);
    return NextResponse.json({ error: "문서 목록을 가져오는 데 실패했습니다." }, { status: 500 });
  }
}

// 2. POST: Upload new document (ADMIN only)
export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "관리자 권한이 필요합니다." }, { status: 403 });
  }

  try {
    const contentType = request.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const body = await request.json();
      const title = typeof body.title === "string" ? body.title.trim() : "";
      const description = typeof body.description === "string" ? body.description : "";
      const category = typeof body.category === "string" ? body.category : "";
      const rawSubCategory = typeof body.subCategory === "string" ? body.subCategory : "";
      const subCategory = normalizeSubCategory(rawSubCategory);
      const correspondenceType = normalizeCorrespondenceType(body.correspondenceType, category, subCategory, rawSubCategory);
      const replyToDocumentId = normalizeReplyToDocumentId(body.replyToDocumentId, correspondenceType);
      const replyNotRequired = normalizeReplyNotRequired(body.replyNotRequired, correspondenceType);
      const replyDueDate = normalizeReplyDueDate(body.replyDueDate, correspondenceType, replyNotRequired);
      const documentDateStr = typeof body.documentDate === "string" ? body.documentDate : "";
      const publishedAtStr = typeof body.publishedAt === "string" ? body.publishedAt : "";
      const isStarred = body.isStarred === true;

      if (!title || !category || !body.file) {
        return NextResponse.json({ error: "필수 입력 항목(제목, 카테고리, 파일)이 누락되었습니다." }, { status: 400 });
      }

      const uploadedFile = validateUploadedDocumentFile(body.file, "문서 파일");
      if ("error" in uploadedFile) {
        return NextResponse.json({ error: uploadedFile.error }, { status: 400 });
      }

      const rawAttachments = Array.isArray(body.attachments) ? body.attachments.slice(0, 10) : [];
      const attachmentsData: { filePath: string; fileName: string; fileSize: number }[] = [];

      for (const attachment of rawAttachments) {
        const uploadedAttachment = validateUploadedDocumentFile(attachment, "추가 첨부파일");
        if ("error" in uploadedAttachment) {
          return NextResponse.json({ error: uploadedAttachment.error }, { status: 400 });
        }

        attachmentsData.push({
          filePath: uploadedAttachment.path,
          fileName: uploadedAttachment.name,
          fileSize: uploadedAttachment.size,
        });
      }

      const documentDate = documentDateStr ? new Date(documentDateStr) : new Date();
      const publishedAt = publishedAtStr ? new Date(publishedAtStr) : new Date();

      const document = await prisma.document.create({
        data: {
          title,
          description: description || null,
          category,
          subCategory: subCategory || null,
          correspondenceType,
          replyToDocumentId,
          replyNotRequired,
          replyDueDate,
          filePath: uploadedFile.path,
          fileName: uploadedFile.name,
          fileSize: uploadedFile.size,
          status: "APPROVED",
          isStarred,
          publishedAt,
          documentDate,
          attachments: {
            create: attachmentsData,
          },
        },
        include: {
          attachments: true,
        },
      });

      await triggerDisclosureNotification(document);
      await triggerOpenChatAnnouncement(document);

      return NextResponse.json({ success: true, document });
    }

    const formData = await request.formData();
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const category = formData.get("category") as string;
    const rawSubCategory = formData.get("subCategory") as string;
    const subCategory = normalizeSubCategory(rawSubCategory);
    const correspondenceType = normalizeCorrespondenceType(formData.get("correspondenceType"), category, subCategory, rawSubCategory);
    const replyToDocumentId = normalizeReplyToDocumentId(formData.get("replyToDocumentId"), correspondenceType);
    const replyNotRequired = normalizeReplyNotRequired(formData.get("replyNotRequired") === "true", correspondenceType);
    const replyDueDate = normalizeReplyDueDate(formData.get("replyDueDate"), correspondenceType, replyNotRequired);
    const documentDateStr = formData.get("documentDate") as string;
    const publishedAtStr = formData.get("publishedAt") as string;
    const file = formData.get("file") as File | null;
    const attachments = formData.getAll("attachments") as File[];
    const isStarredStr = formData.get("isStarred") as string;
    const isStarred = isStarredStr === "true";

    if (!title || !category || !file) {
      return NextResponse.json({ error: "필수 입력 항목(제목, 카테고리, 파일)이 누락되었습니다." }, { status: 400 });
    }

    const fileError = validateUploadFile(file, "문서 파일");
    if (fileError) {
      return NextResponse.json({ error: fileError }, { status: 400 });
    }

    const validAttachments = attachments.slice(0, 10);

    for (const att of validAttachments) {
      if (att && att.size > 0) {
        const attachmentError = validateUploadFile(att, "추가 첨부파일");
        if (attachmentError) {
          return NextResponse.json({ error: attachmentError }, { status: 400 });
        }
      }
    }

    const storagePath = await uploadDocumentFile(file);

    const attachmentsData: { filePath: string; fileName: string; fileSize: number }[] = [];

    for (const att of validAttachments) {
      if (att && att.size > 0) {
        const attPath = await uploadDocumentFile(att);
        attachmentsData.push({
          filePath: attPath,
          fileName: att.name,
          fileSize: att.size,
        });
      }
    }

    const documentDate = documentDateStr ? new Date(documentDateStr) : new Date();
    const publishedAt = publishedAtStr ? new Date(publishedAtStr) : new Date();

    // Save record to DB
    const document = await prisma.document.create({
      data: {
        title,
        description: description || null,
        category,
        subCategory: subCategory || null,
        correspondenceType,
        replyToDocumentId,
        replyNotRequired,
        replyDueDate,
        filePath: storagePath,
        fileName: file.name,
        fileSize: file.size,
        status: "APPROVED", // Auto-approved by default in this implementation slice
        isStarred,
        publishedAt,
        documentDate,
        attachments: {
          create: attachmentsData,
        },
      },
      include: {
        attachments: true,
      },
    });

    await triggerDisclosureNotification(document);
    await triggerOpenChatAnnouncement(document);

    return NextResponse.json({ success: true, document });
  } catch (e) {
    console.error("POST document upload error:", e);
    return NextResponse.json({ error: "문서 업로드 처리 중 문제가 발생했습니다." }, { status: 500 });
  }
}
