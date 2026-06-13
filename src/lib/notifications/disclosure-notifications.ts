import { sendKakaoAlimtalk } from "./kakao-provider.ts";

export const DISCLOSURE_NOTIFICATION_TRIGGER = "DOCUMENT_APPROVED";

type DisclosureDocumentInput = {
  id: string;
  title: string;
  category: string;
  subCategory: string | null;
  correspondenceType: string | null;
  status: string;
  publishedAt?: Date | null;
};

type NotificationUser = {
  id: string;
  role: string;
  isActive: boolean;
  phone: string | null;
  kakaoNotificationOptIn: boolean;
  kakaoNotificationEnabled: boolean;
};

type NotificationRule = {
  id: string;
  groupId: string;
  group: {
    id: string;
    isActive?: boolean;
    members: {
      userId: string;
      user: NotificationUser;
    }[];
  };
};

export type NotificationPrisma = {
  disclosureNotification: {
    findFirst: (args: unknown) => Promise<{ id: string } | null>;
    create: (args: unknown) => Promise<{ id: string }>;
  };
  disclosureNotificationRule: {
    findMany: (args: unknown) => Promise<NotificationRule[]>;
  };
};

type NotifyDisclosureDocumentApprovedInput = {
  document: DisclosureDocumentInput;
  prisma?: NotificationPrisma;
  force?: boolean;
};

type NotificationResult = {
  status: "SENT" | "PARTIAL_FAILED" | "FAILED" | "SKIPPED";
  skippedReason?: string;
  notificationId?: string;
  matchedRuleCount?: number;
  recipientCount?: number;
  skippedRecipientCount?: number;
};

type RecipientLogInput = {
  userId: string;
  groupId: string;
  phoneMasked: string | null;
  status: "PENDING" | "SENT" | "FAILED" | "SKIPPED";
  providerMessageId?: string | null;
  errorCode?: string | null;
  errorMessage?: string | null;
};

async function getDefaultPrisma(): Promise<NotificationPrisma> {
  const db = await import("@/lib/db");
  return db.prisma as unknown as NotificationPrisma;
}

export function normalizeDisclosureNotificationSubCategory(value: string | null | undefined) {
  const subCategory = typeof value === "string" ? value.trim() : "";
  if (subCategory === "수신 공문" || subCategory === "발신 공문" || subCategory === "기타 공문" || subCategory === "수발신 공문") {
    return "공문서";
  }
  if (subCategory === "이사회 회의록") return "이사회 의사록";
  if (subCategory === "대의원 회의록") return "대의원 의사록";
  return subCategory;
}

function isApprovedDisclosure(document: DisclosureDocumentInput) {
  return document.category === "DISCLOSURE" && document.status === "APPROVED" && Boolean(normalizeDisclosureNotificationSubCategory(document.subCategory));
}

function getNotificationMode() {
  return process.env.KAKAO_NOTIFICATION_MODE === "live" ? "live" : "dry-run";
}

function maskPhone(phone: string | null) {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 7) return "***";
  return `${digits.slice(0, 3)}-****-${digits.slice(-4)}`;
}

function getIneligibleReason(user: NotificationUser) {
  if (user.role === "PENDING") return "USER_PENDING";
  if (!user.isActive) return "USER_INACTIVE";
  if (!user.phone) return "MISSING_PHONE";
  if (!user.kakaoNotificationOptIn) return "OPT_OUT";
  if (!user.kakaoNotificationEnabled) return "NOTIFICATION_DISABLED";
  return null;
}

export function resolveDisclosureNotificationRecipients(rules: NotificationRule[]) {
  const seenEligibleUserIds = new Set<string>();
  const eligibleRecipients: RecipientLogInput[] = [];
  const skippedRecipients: RecipientLogInput[] = [];

  for (const rule of rules) {
    if (rule.group.isActive === false) continue;

    for (const member of rule.group.members) {
      const user = member.user;
      const reason = getIneligibleReason(user);

      if (reason) {
        if (reason !== "USER_PENDING") {
          skippedRecipients.push({
            userId: user.id,
            groupId: rule.groupId,
            phoneMasked: maskPhone(user.phone),
            status: "SKIPPED",
            errorCode: reason,
            errorMessage: reason,
          });
        }
        continue;
      }

      if (seenEligibleUserIds.has(user.id)) continue;
      seenEligibleUserIds.add(user.id);
      eligibleRecipients.push({
        userId: user.id,
        groupId: rule.groupId,
        phoneMasked: maskPhone(user.phone),
        status: "SKIPPED",
        errorCode: "DRY_RUN",
        errorMessage: "Dry-run mode; Kakao provider was not called.",
      });
    }
  }

  return { eligibleRecipients, skippedRecipients };
}

export async function notifyDisclosureDocumentApproved(input: NotifyDisclosureDocumentApprovedInput): Promise<NotificationResult> {
  const { document, force = false } = input;
  if (!isApprovedDisclosure(document)) {
    return { status: "SKIPPED", skippedReason: "NOT_APPROVED_DISCLOSURE" };
  }

  const prisma = input.prisma ?? await getDefaultPrisma();
  const existing = await prisma.disclosureNotification.findFirst({
    where: {
      documentId: document.id,
      trigger: DISCLOSURE_NOTIFICATION_TRIGGER,
    },
  });

  if (existing && !force) {
    return {
      status: "SKIPPED",
      skippedReason: "DUPLICATE_TRIGGER",
      notificationId: existing.id,
    };
  }

  const subCategory = normalizeDisclosureNotificationSubCategory(document.subCategory);
  const correspondenceType = document.correspondenceType?.trim() || null;
  const rules = await prisma.disclosureNotificationRule.findMany({
    where: {
      category: "DISCLOSURE",
      subCategory,
      isActive: true,
      OR: correspondenceType
        ? [{ correspondenceType: null }, { correspondenceType }]
        : [{ correspondenceType: null }],
    },
    include: {
      group: {
        include: {
          members: {
            include: {
              user: true,
            },
          },
        },
      },
    },
  });

  if (rules.length === 0) {
    const notification = await prisma.disclosureNotification.create({
      data: {
        documentId: document.id,
        trigger: DISCLOSURE_NOTIFICATION_TRIGGER,
        status: "SKIPPED",
        matchedRuleCount: 0,
        recipientCount: 0,
        sentCount: 0,
        failedCount: 0,
        skippedReason: "NO_MATCHING_RULE",
      },
    });
    return {
      status: "SKIPPED",
      skippedReason: "NO_MATCHING_RULE",
      notificationId: notification.id,
      matchedRuleCount: 0,
      recipientCount: 0,
      skippedRecipientCount: 0,
    };
  }

  const { eligibleRecipients, skippedRecipients } = resolveDisclosureNotificationRecipients(rules);
  const mode = getNotificationMode();

  if (mode === "dry-run") {
    const notification = await prisma.disclosureNotification.create({
      data: {
        documentId: document.id,
        trigger: DISCLOSURE_NOTIFICATION_TRIGGER,
        status: "SKIPPED",
        matchedRuleCount: rules.length,
        recipientCount: eligibleRecipients.length,
        sentCount: 0,
        failedCount: 0,
        skippedReason: "DRY_RUN",
        recipients: {
          create: [...eligibleRecipients, ...skippedRecipients],
        },
      },
    });
    return {
      status: "SKIPPED",
      skippedReason: "DRY_RUN",
      notificationId: notification.id,
      matchedRuleCount: rules.length,
      recipientCount: eligibleRecipients.length,
      skippedRecipientCount: skippedRecipients.length,
    };
  }

  const liveRecipients: RecipientLogInput[] = [];
  for (const recipient of eligibleRecipients) {
    try {
      const result = await sendKakaoAlimtalk({
        to: recipient.phoneMasked ?? "",
        documentTitle: document.title,
        documentCategory: subCategory,
        publishedAt: document.publishedAt ?? null,
        siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "",
      });
      liveRecipients.push({
        ...recipient,
        status: "SENT",
        providerMessageId: result.providerMessageId,
        errorCode: null,
        errorMessage: null,
      });
    } catch (error) {
      liveRecipients.push({
        ...recipient,
        status: "FAILED",
        errorCode: "PROVIDER_ERROR",
        errorMessage: error instanceof Error ? error.message : String(error),
      });
    }
  }

  const failedCount = liveRecipients.filter((recipient) => recipient.status === "FAILED").length;
  const sentCount = liveRecipients.filter((recipient) => recipient.status === "SENT").length;
  const status = failedCount === 0 ? "SENT" : sentCount > 0 ? "PARTIAL_FAILED" : "FAILED";
  const notification = await prisma.disclosureNotification.create({
    data: {
      documentId: document.id,
      trigger: DISCLOSURE_NOTIFICATION_TRIGGER,
      status,
      matchedRuleCount: rules.length,
      recipientCount: eligibleRecipients.length,
      sentCount,
      failedCount,
      skippedReason: null,
      recipients: {
        create: [...liveRecipients, ...skippedRecipients],
      },
    },
  });

  return {
    status,
    notificationId: notification.id,
    matchedRuleCount: rules.length,
    recipientCount: eligibleRecipients.length,
    skippedRecipientCount: skippedRecipients.length,
  };
}
