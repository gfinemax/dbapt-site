import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const getSessionMock = vi.fn();
const loadPersonalLibraryDataMock = vi.fn();
const portalShellMock = vi.fn((props: { documents?: unknown[]; contentBookmarks?: unknown[]; role: string }) => (
  <div data-testid={`${props.role}-portal`}>{JSON.stringify(props)}</div>
));

vi.mock("@/lib/auth", () => ({
  getSession: getSessionMock,
}));

vi.mock("@/lib/personal-library-data", () => ({
  emptyPersonalLibraryData: () => ({
    documents: [],
    logs: [],
    refundInfo: null,
    contributionSummary: null,
    contributionDashboard: null,
    paymentNotices: [],
    pendingUsers: [],
    approvedSocialUsers: [],
    contentBookmarks: [],
  }),
  loadPersonalLibraryData: loadPersonalLibraryDataMock,
}));

vi.mock("@/components/portal/portal-shell", () => ({
  PortalShell: portalShellMock,
}));

vi.mock("@/lib/db", () => ({
  prisma: {
    document: { findMany: vi.fn().mockResolvedValue([]) },
    contributionSummary: { findUnique: vi.fn().mockResolvedValue(null) },
    paymentNotice: { findMany: vi.fn().mockResolvedValue([]) },
    refundInfo: { findUnique: vi.fn().mockResolvedValue(null) },
  },
}));

vi.mock("@/lib/contribution-dashboard-data", () => ({
  loadContributionDashboardData: vi.fn().mockResolvedValue(null),
}));

const session = {
  id: "member-1",
  loginId: "member",
  name: "이조합",
  role: "MEMBER",
};

const savedDocument = {
  id: "doc-1",
  title: "보관한 공개자료",
  isBookmarkedByCurrentUser: true,
};

describe("portal pages personal library loading", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    getSessionMock.mockResolvedValue(session);
    loadPersonalLibraryDataMock.mockResolvedValue({
      documents: [savedDocument],
      logs: [],
      refundInfo: null,
      contributionSummary: null,
      contributionDashboard: null,
      paymentNotices: [],
      pendingUsers: [],
      approvedSocialUsers: [],
      contentBookmarks: [{ id: "saved-post-1", title: "저장한 게시글" }],
    });
  });

  it("loads member portal documents through the personal library loader", async () => {
    const { default: MemberPortalPage } = await import("@/app/portal/member/page");

    render(await MemberPortalPage());

    expect(loadPersonalLibraryDataMock).toHaveBeenCalledWith(session);
    expect(screen.getByTestId("member-portal")).toHaveTextContent("isBookmarkedByCurrentUser");
    expect(screen.getByTestId("member-portal")).toHaveTextContent("저장한 게시글");
  });

  it("loads refund portal documents through the personal library loader", async () => {
    getSessionMock.mockResolvedValue({ ...session, role: "REFUND" });
    const { default: RefundPortalPage } = await import("@/app/portal/refund/page");

    render(await RefundPortalPage());

    expect(loadPersonalLibraryDataMock).toHaveBeenCalledWith({ ...session, role: "REFUND" });
    expect(screen.getByTestId("refund-portal")).toHaveTextContent("isBookmarkedByCurrentUser");
    expect(screen.getByTestId("refund-portal")).toHaveTextContent("저장한 게시글");
  });
});
