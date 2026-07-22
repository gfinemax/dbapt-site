import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const getSessionMock = vi.fn();
const portalShellMock = vi.fn(() => <div data-testid="admin-portal" />);
const documentFindManyMock = vi.fn();
const documentLogFindManyMock = vi.fn();
const userFindManyMock = vi.fn();
const personalDocumentBookmarkFindManyMock = vi.fn();
const personalContentBookmarkFindManyMock = vi.fn();
const coopNewsFindManyMock = vi.fn();
const freePostFindManyMock = vi.fn();

vi.mock("@/lib/auth", () => ({
  getSession: getSessionMock,
}));

vi.mock("@/components/portal/portal-shell", () => ({
  PortalShell: portalShellMock,
}));

vi.mock("@/lib/db", () => ({
  prisma: {
    document: { findMany: documentFindManyMock },
    documentLog: { findMany: documentLogFindManyMock },
    user: { findMany: userFindManyMock },
    personalDocumentBookmark: { findMany: personalDocumentBookmarkFindManyMock },
    personalContentBookmark: { findMany: personalContentBookmarkFindManyMock },
    coopNews: { findMany: coopNewsFindManyMock },
    freePost: { findMany: freePostFindManyMock },
  },
}));

vi.mock("@/lib/document-serializer", () => ({
  serializeDocuments: vi.fn(() => []),
}));

describe("admin member role management data", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    getSessionMock.mockResolvedValue({
      id: "admin-1",
      loginId: "admin",
      name: "운영자",
      role: "ADMIN",
    });
    documentFindManyMock.mockResolvedValue([]);
    personalDocumentBookmarkFindManyMock.mockResolvedValue([]);
    personalContentBookmarkFindManyMock.mockResolvedValue([]);
    coopNewsFindManyMock.mockResolvedValue([]);
    freePostFindManyMock.mockResolvedValue([]);
    documentLogFindManyMock.mockResolvedValue([
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
          title: "seed 열람 문서",
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
          title: "실제 열람 문서",
          category: "DISCLOSURE",
        },
      },
    ]);
    userFindManyMock
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
          id: "phone-refund",
          name: "전화환불",
          email: null,
          phone: "01012345678",
          signupPhone: "01012345678",
          loginId: "01012345678",
          role: "REFUND",
          memberType: "REFUND",
          createdAt: new Date("2026-06-01T00:00:00.000Z"),
        },
      ]);
  });

  it("loads all approved member, refund, and associate accounts for role conversion even when email is missing", async () => {
    const { default: AdminPortalPage } = await import("@/app/portal/admin/page");

    render(await AdminPortalPage());

    expect(userFindManyMock).toHaveBeenLastCalledWith({
      where: {
        role: { in: ["MEMBER", "REFUND", "ASSOCIATE"] },
      },
      orderBy: { updatedAt: "desc" },
    });
    expect(portalShellMock).toHaveBeenCalledWith(
      expect.objectContaining({
        approvedSocialUsers: [
          expect.objectContaining({
            id: "email-approved",
            email: "gfinemax@gmail.com",
            role: "MEMBER",
            memberType: "REGULAR",
          }),
          expect.objectContaining({
            id: "phone-refund",
            email: "010-1234-5678",
            role: "REFUND",
            memberType: "REFUND",
          }),
        ],
        logs: [
          expect.objectContaining({
            id: "real-log",
            user: expect.objectContaining({
              name: "실제조합원",
            }),
          }),
        ],
      }),
      undefined,
    );
    expect(portalShellMock).not.toHaveBeenCalledWith(
      expect.objectContaining({
        approvedSocialUsers: expect.arrayContaining([
          expect.objectContaining({
            id: "seed-approved",
          }),
        ]),
      }),
      undefined,
    );
    expect(portalShellMock).not.toHaveBeenCalledWith(
      expect.objectContaining({
        logs: expect.arrayContaining([
          expect.objectContaining({
            id: "seed-log",
          }),
        ]),
      }),
      undefined,
    );
  });
});
