import { describe, expect, it, vi, beforeEach } from "vitest";

type MockUser = {
  id: string;
  role: string;
  isActive: boolean;
  phone: string | null;
  kakaoNotificationOptIn: boolean;
  kakaoNotificationEnabled: boolean;
};

type MockRule = {
  id: string;
  groupId: string;
  group: {
    id: string;
    members: { userId: string; user: MockUser }[];
  };
};

function createMockPrisma(params?: {
  existingNotification?: { id: string } | null;
  rules?: MockRule[];
}) {
  return {
    disclosureNotification: {
      findFirst: vi.fn().mockResolvedValue(params?.existingNotification ?? null),
      create: vi.fn().mockImplementation(async (input) => ({
        id: "notification-1",
        ...input.data,
      })),
    },
    disclosureNotificationRule: {
      findMany: vi.fn().mockResolvedValue(params?.rules ?? []),
    },
  };
}

const approvedDisclosure = {
  id: "doc-1",
  title: "대의원 회의록",
  category: "DISCLOSURE",
  subCategory: "대의원 회의록",
  correspondenceType: null,
  status: "APPROVED",
  publishedAt: new Date("2026-06-13T00:00:00.000Z"),
};

describe("disclosure notification coordinator", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("skips documents that are not approved disclosure documents", async () => {
    const { notifyDisclosureDocumentApproved } = await import("@/lib/notifications/disclosure-notifications");
    const prisma = createMockPrisma();

    const result = await notifyDisclosureDocumentApproved({
      prisma,
      document: {
        ...approvedDisclosure,
        category: "NOTICE",
      },
    });

    expect(result.status).toBe("SKIPPED");
    expect(result.skippedReason).toBe("NOT_APPROVED_DISCLOSURE");
    expect(prisma.disclosureNotificationRule.findMany).not.toHaveBeenCalled();
    expect(prisma.disclosureNotification.create).not.toHaveBeenCalled();
  });

  it("creates a skipped log when no notification rule matches", async () => {
    const { notifyDisclosureDocumentApproved } = await import("@/lib/notifications/disclosure-notifications");
    const prisma = createMockPrisma({ rules: [] });

    const result = await notifyDisclosureDocumentApproved({
      prisma,
      document: approvedDisclosure,
    });

    expect(result.status).toBe("SKIPPED");
    expect(result.skippedReason).toBe("NO_MATCHING_RULE");
    expect(prisma.disclosureNotification.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        documentId: "doc-1",
        trigger: "DOCUMENT_APPROVED",
        status: "SKIPPED",
        matchedRuleCount: 0,
        recipientCount: 0,
        skippedReason: "NO_MATCHING_RULE",
      }),
    });
  });

  it("deduplicates eligible users across matching groups and records dry-run recipients", async () => {
    const { notifyDisclosureDocumentApproved } = await import("@/lib/notifications/disclosure-notifications");
    const eligibleUser: MockUser = {
      id: "user-1",
      role: "MEMBER",
      isActive: true,
      phone: "010-1234-5678",
      kakaoNotificationOptIn: true,
      kakaoNotificationEnabled: true,
    };
    const inactiveUser: MockUser = {
      id: "user-2",
      role: "MEMBER",
      isActive: false,
      phone: "010-0000-0000",
      kakaoNotificationOptIn: true,
      kakaoNotificationEnabled: true,
    };
    const pendingUser: MockUser = {
      id: "user-3",
      role: "PENDING",
      isActive: true,
      phone: "010-0000-0001",
      kakaoNotificationOptIn: true,
      kakaoNotificationEnabled: true,
    };
    const missingPhoneUser: MockUser = {
      id: "user-4",
      role: "MEMBER",
      isActive: true,
      phone: null,
      kakaoNotificationOptIn: true,
      kakaoNotificationEnabled: true,
    };
    const disabledUser: MockUser = {
      id: "user-5",
      role: "MEMBER",
      isActive: true,
      phone: "010-0000-0002",
      kakaoNotificationOptIn: true,
      kakaoNotificationEnabled: false,
    };
    const optOutUser: MockUser = {
      id: "user-6",
      role: "MEMBER",
      isActive: true,
      phone: "010-0000-0003",
      kakaoNotificationOptIn: false,
      kakaoNotificationEnabled: true,
    };
    const rules: MockRule[] = [
      {
        id: "rule-1",
        groupId: "group-a",
        group: {
          id: "group-a",
          members: [
            { userId: "user-1", user: eligibleUser },
            { userId: "user-2", user: inactiveUser },
            { userId: "user-3", user: pendingUser },
          ],
        },
      },
      {
        id: "rule-2",
        groupId: "group-b",
        group: {
          id: "group-b",
          members: [
            { userId: "user-1", user: eligibleUser },
            { userId: "user-4", user: missingPhoneUser },
            { userId: "user-5", user: disabledUser },
            { userId: "user-6", user: optOutUser },
          ],
        },
      },
    ];
    const prisma = createMockPrisma({ rules });

    const result = await notifyDisclosureDocumentApproved({
      prisma,
      document: approvedDisclosure,
    });

    expect(result.status).toBe("SKIPPED");
    expect(result.skippedReason).toBe("DRY_RUN");
    expect(result.recipientCount).toBe(1);
    expect(result.skippedRecipientCount).toBe(4);
    expect(prisma.disclosureNotification.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        documentId: "doc-1",
        status: "SKIPPED",
        matchedRuleCount: 2,
        recipientCount: 1,
        sentCount: 0,
        failedCount: 0,
        skippedReason: "DRY_RUN",
        recipients: {
          create: expect.arrayContaining([
            expect.objectContaining({
              userId: "user-1",
              groupId: "group-a",
              phoneMasked: "010-****-5678",
              status: "SKIPPED",
              errorCode: "DRY_RUN",
            }),
            expect.objectContaining({
              userId: "user-4",
              groupId: "group-b",
              status: "SKIPPED",
              errorCode: "MISSING_PHONE",
            }),
          ]),
        },
      }),
    });
    const createCall = prisma.disclosureNotification.create.mock.calls[0][0];
    expect(createCall.data.recipients.create.filter((recipient: { userId: string }) => recipient.userId === "user-1")).toHaveLength(1);
  });

  it("skips duplicate document triggers unless forced", async () => {
    const { notifyDisclosureDocumentApproved } = await import("@/lib/notifications/disclosure-notifications");
    const prisma = createMockPrisma({ existingNotification: { id: "notification-existing" } });

    const result = await notifyDisclosureDocumentApproved({
      prisma,
      document: approvedDisclosure,
    });

    expect(result.status).toBe("SKIPPED");
    expect(result.skippedReason).toBe("DUPLICATE_TRIGGER");
    expect(prisma.disclosureNotificationRule.findMany).not.toHaveBeenCalled();
    expect(prisma.disclosureNotification.create).not.toHaveBeenCalled();
  });
});
