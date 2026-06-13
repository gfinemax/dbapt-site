import { describe, expect, it } from "vitest";

import {
  buildNotificationContactUpdate,
  formatDisclosureNotificationLog,
  normalizeNotificationPhone,
} from "@/lib/notifications/notification-operations";

describe("notification operations helpers", () => {
  it("normalizes Korean mobile phone values to digits only", () => {
    expect(normalizeNotificationPhone("010-1234-5678")).toBe("01012345678");
    expect(normalizeNotificationPhone("010 9876 5432")).toBe("01098765432");
  });

  it("rejects invalid phone values before updating users", () => {
    expect(() => normalizeNotificationPhone("02-123-4567")).toThrow("phone must be a Korean mobile number");
    expect(() => normalizeNotificationPhone("010-123-456")).toThrow("phone must be a Korean mobile number");
  });

  it("builds a precise notification contact update payload", () => {
    expect(buildNotificationContactUpdate({
      phone: "010-1234-5678",
      optIn: true,
      enabled: true,
    })).toEqual({
      phone: "01012345678",
      kakaoNotificationOptIn: true,
      kakaoNotificationEnabled: true,
    });
  });

  it("formats notification log summaries with masked recipient phones", () => {
    const output = formatDisclosureNotificationLog({
      id: "notification-1",
      status: "SKIPPED",
      skippedReason: "DRY_RUN",
      recipientCount: 1,
      sentCount: 0,
      failedCount: 0,
      createdAt: new Date("2026-06-13T12:00:00.000Z"),
      document: {
        id: "doc-1",
        title: "대의원 회의록",
      },
      recipients: [
        {
          status: "SKIPPED",
          phoneMasked: "010-****-5678",
          errorCode: "DRY_RUN",
          user: {
            loginId: "member1",
            name: "홍길동",
          },
          group: {
            key: "delegates",
            name: "대의원",
          },
        },
      ],
    });

    expect(output).toContain("notification-1");
    expect(output).toContain("대의원 회의록");
    expect(output).toContain("status=SKIPPED");
    expect(output).toContain("reason=DRY_RUN");
    expect(output).toContain("010-****-5678");
    expect(output).toContain("group=delegates");
  });
});
