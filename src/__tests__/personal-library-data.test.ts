import { beforeEach, describe, expect, it, vi } from "vitest";

const prismaMock = vi.hoisted(() => ({
  document: { findMany: vi.fn() },
  contributionSummary: { findUnique: vi.fn() },
  paymentNotice: { findMany: vi.fn() },
  documentLog: { findMany: vi.fn() },
  personalDocumentBookmark: { findMany: vi.fn() },
  refundInfo: { findUnique: vi.fn() },
  user: { findMany: vi.fn() },
}));

vi.mock("@/lib/db", () => ({
  prisma: prismaMock,
}));

vi.mock("@/lib/document-serializer", () => ({
  serializeDocuments: vi.fn(() => []),
}));

vi.mock("@/lib/contribution-serializer", () => ({
  serializeContributionSummary: vi.fn(() => null),
  serializePaymentNotices: vi.fn(() => []),
}));

vi.mock("@/lib/contribution-dashboard-data", () => ({
  loadContributionDashboardData: vi.fn(() => null),
}));

describe("personal library data", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.document.findMany.mockResolvedValue([]);
    prismaMock.contributionSummary.findUnique.mockResolvedValue(null);
    prismaMock.paymentNotice.findMany.mockResolvedValue([]);
    prismaMock.documentLog.findMany.mockResolvedValue([]);
    prismaMock.personalDocumentBookmark.findMany.mockResolvedValue([]);
    prismaMock.refundInfo.findUnique.mockResolvedValue(null);
    prismaMock.user.findMany.mockReset();
  });

  it("keeps email approved accounts visible while excluding seed demo accounts from administrator data", async () => {
    prismaMock.documentLog.findMany.mockResolvedValue([
      {
        id: "seed-log",
        actionType: "VIEW",
        ipAddress: "::1",
        userAgent: "Playwright",
        createdAt: new Date("2026-06-17T00:00:00.000Z"),
        user: {
          name: "이조합 (정식조합원)",
          loginId: "member1",
          role: "MEMBER",
        },
        document: {
          title: "seed 문서",
          category: "DISCLOSURE",
        },
      },
      {
        id: "real-log",
        actionType: "VIEW",
        ipAddress: "127.0.0.1",
        userAgent: "Chrome",
        createdAt: new Date("2026-06-17T00:01:00.000Z"),
        user: {
          name: "실제조합원",
          loginId: "01012345678",
          role: "MEMBER",
        },
        document: {
          title: "실제 문서",
          category: "DISCLOSURE",
        },
      },
    ]);
    prismaMock.user.findMany
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([
        {
          id: "email-approved",
          name: "OH Hakdong",
          email: "gfinemax@gmail.com",
          phone: null,
          signupPhone: null,
          loginId: "g_member_7642",
          role: "MEMBER",
          memberType: "REGULAR",
          createdAt: new Date("2026-06-01T00:00:00.000Z"),
        },
        {
          id: "seed-approved",
          name: "이조합 (정식조합원)",
          email: null,
          phone: null,
          signupPhone: null,
          loginId: "member1",
          role: "MEMBER",
          memberType: "REGULAR",
          createdAt: new Date("2026-06-01T00:00:00.000Z"),
        },
        {
          id: "real-approved",
          name: "실제조합원",
          email: null,
          phone: "01012345678",
          signupPhone: "01012345678",
          loginId: "01012345678",
          role: "MEMBER",
          memberType: "REGULAR",
          createdAt: new Date("2026-06-01T00:00:00.000Z"),
        },
      ]);

    const { loadPersonalLibraryData } = await import("@/lib/personal-library-data");
    const data = await loadPersonalLibraryData({
      id: "admin-1",
      loginId: "admin",
      name: "운영자",
      role: "ADMIN",
    });

    expect(data.logs).toHaveLength(1);
    expect(data.logs[0].id).toBe("real-log");
    expect(data.approvedSocialUsers).toHaveLength(2);
    expect(data.approvedSocialUsers).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "email-approved",
          email: "gfinemax@gmail.com",
        }),
      ]),
    );
    expect(data.approvedSocialUsers).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "real-approved",
          email: "010-1234-5678",
        }),
      ]),
    );
    expect(data.approvedSocialUsers).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "seed-approved",
        }),
      ]),
    );
    expect(data.logs).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "seed-log",
        }),
      ]),
    );
    expect(data.approvedSocialUsers[0]).toEqual(
      expect.objectContaining({
        id: expect.any(String),
      }),
    );
  });
});
