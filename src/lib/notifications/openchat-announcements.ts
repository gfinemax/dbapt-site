type OpenChatAnnouncementDocument = {
  id: string;
  title: string;
  category: string;
  subCategory: string | null;
  status: string;
  publishedAt?: Date | null;
  createdAt?: Date | null;
};

type OpenChatAnnouncementRecord = {
  id: string;
  status: string;
  message: string;
  copiedAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
};

export type OpenChatAnnouncementPrisma = {
  openChatAnnouncement: {
    findFirst: (args: unknown) => Promise<OpenChatAnnouncementRecord | null>;
    create: (args: unknown) => Promise<OpenChatAnnouncementRecord>;
    update: (args: unknown) => Promise<OpenChatAnnouncementRecord>;
  };
};

type UpsertOpenChatAnnouncementInput = {
  prisma?: OpenChatAnnouncementPrisma;
  document: OpenChatAnnouncementDocument;
  siteUrl?: string;
  force?: boolean;
};

type MarkOpenChatAnnouncementCopiedInput = {
  prisma?: OpenChatAnnouncementPrisma;
  announcementId: string;
  now?: Date;
};

type OpenChatAnnouncementResult = {
  status: "CREATED" | "UPDATED" | "COPIED" | "SKIPPED";
  announcementId?: string;
  skippedReason?: string;
  message?: string;
};

export type FormattedOpenChatAnnouncement = {
  id: string;
  status: string;
  message: string;
  copiedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  document: {
    id: string;
    title: string;
  };
};

async function getDefaultPrisma(): Promise<OpenChatAnnouncementPrisma> {
  const db = await import("@/lib/db");
  return db.prisma as unknown as OpenChatAnnouncementPrisma;
}

function normalizeSubCategory(value: string | null | undefined) {
  const subCategory = typeof value === "string" ? value.trim() : "";
  if (subCategory === "수신 공문" || subCategory === "발신 공문" || subCategory === "기타 공문" || subCategory === "수발신 공문") {
    return "공문서";
  }
  if (subCategory === "이사회 회의록") return "이사회 의사록";
  if (subCategory === "대의원 회의록") return "대의원 의사록";
  return subCategory;
}

function isApprovedDisclosure(document: OpenChatAnnouncementDocument) {
  return document.category === "DISCLOSURE" && document.status === "APPROVED" && Boolean(normalizeSubCategory(document.subCategory));
}

function normalizeOneLine(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function normalizeSiteUrl(siteUrl?: string) {
  const value = siteUrl || process.env.OPENCHAT_SITE_URL || "https://dbapt-site.vercel.app";
  return value.replace(/\/+$/, "");
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function buildOpenChatAnnouncementMessage(params: {
  document: OpenChatAnnouncementDocument;
  siteUrl?: string;
  now?: Date;
}) {
  const { document } = params;
  const subCategory = normalizeOneLine(normalizeSubCategory(document.subCategory));
  const title = normalizeOneLine(document.title);
  const publishedAt = document.publishedAt ?? document.createdAt ?? params.now ?? new Date();
  const disclosureUrl = `${normalizeSiteUrl(params.siteUrl)}/disclosure`;

  return [
    "[대방동 지역주택조합 공개자료 안내]",
    "",
    "새 공개자료가 등록되었습니다.",
    `- 분류: ${subCategory}`,
    `- 제목: ${title}`,
    `- 등록일: ${formatDate(publishedAt)}`,
    "",
    "홈페이지 로그인 후 공개자료 메뉴에서 확인해 주세요.",
    disclosureUrl,
  ].join("\n");
}

export async function upsertOpenChatAnnouncementForDocument(input: UpsertOpenChatAnnouncementInput): Promise<OpenChatAnnouncementResult> {
  const { document, force = false } = input;
  if (!isApprovedDisclosure(document)) {
    return { status: "SKIPPED", skippedReason: "NOT_APPROVED_DISCLOSURE" };
  }

  const prisma = input.prisma ?? await getDefaultPrisma();
  const existing = await prisma.openChatAnnouncement.findFirst({
    where: {
      documentId: document.id,
      status: {
        in: ["DRAFT", "COPIED"],
      },
    },
    orderBy: { createdAt: "desc" },
  });
  const message = buildOpenChatAnnouncementMessage({
    document,
    siteUrl: input.siteUrl,
  });

  if (existing?.status === "DRAFT" && !force) {
    const updated = await prisma.openChatAnnouncement.update({
      where: { id: existing.id },
      data: {
        message,
        status: "DRAFT",
        copiedAt: null,
      },
    });
    return {
      status: "UPDATED",
      announcementId: updated.id,
      message: updated.message,
    };
  }

  if (existing?.status === "COPIED" && !force) {
    return {
      status: "SKIPPED",
      announcementId: existing.id,
      skippedReason: "ALREADY_COPIED",
      message: existing.message,
    };
  }

  const created = await prisma.openChatAnnouncement.create({
    data: {
      documentId: document.id,
      status: "DRAFT",
      message,
    },
  });

  return {
    status: "CREATED",
    announcementId: created.id,
    message: created.message,
  };
}

export async function markOpenChatAnnouncementCopied(input: MarkOpenChatAnnouncementCopiedInput): Promise<OpenChatAnnouncementResult> {
  const prisma = input.prisma ?? await getDefaultPrisma();
  const copiedAt = input.now ?? new Date();
  const updated = await prisma.openChatAnnouncement.update({
    where: { id: input.announcementId },
    data: {
      status: "COPIED",
      copiedAt,
    },
  });

  return {
    status: "COPIED",
    announcementId: updated.id,
    message: updated.message,
  };
}

export function formatOpenChatAnnouncement(announcement: FormattedOpenChatAnnouncement) {
  const copiedAt = announcement.copiedAt ? announcement.copiedAt.toISOString() : "none";
  return `OPENCHAT ${announcement.id} status=${announcement.status} document=${announcement.document.id} title="${announcement.document.title}" copiedAt=${copiedAt} updatedAt=${announcement.updatedAt.toISOString()}`;
}
