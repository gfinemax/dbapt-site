import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PortalShell } from "@/components/portal/portal-shell";
import { updateSignupNameAction } from "@/lib/auth";

vi.mock("next/navigation", () => ({
  useRouter() {
    return {
      push: vi.fn(),
      refresh: vi.fn(),
    };
  },
}));

vi.mock("@/lib/auth", () => ({
  logoutAction: vi.fn(),
  approveUserAction: vi.fn(),
  updateSignupNameAction: vi.fn(),
}));

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  localStorage.clear();
  sessionStorage.clear();
});

describe("portal shell", () => {
  it("shows the login announcement popup after administrator login lands on the portal", async () => {
    vi.useFakeTimers();

    render(
      <PortalShell
        role="admin"
        session={{
          id: "admin-1",
          loginId: "admin",
          name: "운영자",
          role: "ADMIN",
        }}
      />,
    );

    expect(screen.queryByText("조합원 개인 자료실 등록 알림")).not.toBeInTheDocument();

    await act(async () => {
      vi.advanceTimersByTime(450);
    });

    expect(screen.getByText("조합원 개인 자료실 등록 알림")).toBeInTheDocument();
  });

  it("renders supplied contribution payment status for member sessions", () => {
    render(
      <PortalShell
        role="member"
        session={{
          id: "member-1",
          loginId: "member1",
          name: "이조합",
          role: "MEMBER",
        }}
        contributionSummary={{
          totalDue: 120000000,
          totalPaid: 95000000,
          unpaidAmount: 25000000,
          overdueAmount: 5000000,
          lateFee: 120000,
          nextDueDate: "2026-06-30T00:00:00.000Z",
          status: "OVERDUE",
          noticeMessage: "연체 미납금 납부 안내 대상입니다.",
          updatedAt: "2026-06-01T00:00:00.000Z",
        }}
        paymentNotices={[
          {
            id: "notice-1",
            type: "OVERDUE",
            status: "DRAFT",
            title: "연체 미납금 납부 안내",
            message: "연체 미납금 5,000,000원이 있습니다.",
            unpaidAmount: 25000000,
            overdueAmount: 5000000,
            lateFee: 120000,
            dueDate: "2026-06-30T00:00:00.000Z",
            createdAt: "2026-06-01T00:00:00.000Z",
          },
        ]}
      />,
    );

    expect(screen.getByText("연체 주의")).toBeInTheDocument();
    expect(screen.getByText("120,000,000 원")).toBeInTheDocument();
    expect(screen.getByText("25,000,000 원")).toBeInTheDocument();
    expect(screen.getByText("연체 미납금 납부 안내")).toBeInTheDocument();
  });

  it("opens member document recommendations in a viewer when the portal is rendered directly", () => {
    render(
      <PortalShell
        role="member"
        session={{
          id: "member-1",
          loginId: "member1",
          name: "이조합",
          role: "MEMBER",
        }}
        documents={[
          {
            id: "doc-1",
            title: "2026년도 1분기 수입 및 지출 자금집행 실적 보고서",
            description: "1분기 수입/지출 세부 내역 및 이사회 승인 보고서입니다.",
            category: "ACCOUNTING",
            fileName: "2026_1분기_자금집행보고서.pdf",
            fileSize: 2048,
            status: "APPROVED",
            isStarred: true,
            isViewedByCurrentUser: false,
            publishedAt: "2026-06-10T00:00:00.000Z",
            documentDate: "2026-06-10T00:00:00.000Z",
            createdAt: "2026-06-10T00:00:00.000Z",
          },
        ]}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "열람" }));

    expect(screen.getByTestId("pdf-viewer-panel")).toBeInTheDocument();
    expect(screen.getByTitle("문서 온라인 열람 뷰어")).toHaveAttribute("src", "/api/documents/doc-1/view");
  });

  it("shows supplied contribution payment status in the portal login announcement", async () => {
    vi.useFakeTimers();

    render(
      <PortalShell
        role="member"
        session={{
          id: "member-1",
          loginId: "member1",
          name: "이조합",
          role: "MEMBER",
        }}
        contributionSummary={{
          totalDue: 120000000,
          totalPaid: 95000000,
          unpaidAmount: 25000000,
          overdueAmount: 5000000,
          lateFee: 120000,
          nextDueDate: "2026-06-30T00:00:00.000Z",
          status: "OVERDUE",
          noticeMessage: "연체 미납금 납부 안내 대상입니다.",
          updatedAt: "2026-06-01T00:00:00.000Z",
        }}
        paymentNotices={[
          {
            id: "notice-1",
            type: "OVERDUE",
            status: "DRAFT",
            title: "연체 미납금 납부 안내",
            message: "연체 미납금 5,000,000원이 있습니다.",
            unpaidAmount: 25000000,
            overdueAmount: 5000000,
            lateFee: 120000,
            dueDate: "2026-06-30T00:00:00.000Z",
            createdAt: "2026-06-01T00:00:00.000Z",
          },
        ]}
      />,
    );

    await act(async () => {
      vi.advanceTimersByTime(450);
    });

    expect(screen.getByText("내 분담금 요약")).toBeInTheDocument();
    expect(screen.getAllByText("25,000,000 원").length).toBeGreaterThan(0);
  });

  it("lets administrators update a pending user's signup name while keeping the Google name visible", async () => {
    vi.stubGlobal("alert", vi.fn());
    vi.mocked(updateSignupNameAction).mockResolvedValue({
      success: true,
      signupName: "오하동",
    });

    render(
      <PortalShell
        role="admin"
        session={{
          id: "admin-1",
          loginId: "admin",
          name: "운영자",
          role: "ADMIN",
        }}
        pendingUsers={[
          {
            id: "pending-1",
            name: "OH Hakdong",
            email: "gfinemax@gmail.com",
            signupName: "오학동",
            signupPhone: "010-1234-5678",
            signupMemo: "101동 신청",
            createdAt: "2026-06-03T00:00:00.000Z",
          },
        ]}
      />,
    );

    const signupNameInput = screen.getByLabelText("OH Hakdong 신청 이름");
    expect(signupNameInput).toHaveValue("오학동");
    expect(screen.getByText("Google 이름: OH Hakdong")).toBeInTheDocument();

    fireEvent.change(signupNameInput, { target: { value: "오하동" } });
    fireEvent.click(screen.getByRole("button", { name: "신청 이름 저장" }));

    await waitFor(() => {
      expect(updateSignupNameAction).toHaveBeenCalledWith("pending-1", "오하동");
    });
  });
});
