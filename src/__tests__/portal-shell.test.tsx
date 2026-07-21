import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PortalShell } from "@/components/portal/portal-shell";
import { changePasswordAction, updateSignupNameAction } from "@/lib/auth";

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
  changePasswordAction: vi.fn(),
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

  it("links administrators to the PeopleOn member management page", () => {
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

    expect(screen.getByRole("link", { name: /PeopleOn 조합원 관리/ })).toHaveAttribute(
      "href",
      "/portal/admin/members",
    );
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

  it("changes the logged-in user's password from the profile menu", async () => {
    vi.mocked(changePasswordAction).mockResolvedValue({
      success: true,
      message: "비밀번호가 변경되었습니다.",
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
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /운영자님/ }));
    fireEvent.change(screen.getByLabelText("현재 비밀번호"), { target: { value: "oldPass9081" } });
    fireEvent.change(screen.getByLabelText("새 비밀번호"), { target: { value: "newPass9081" } });
    fireEvent.change(screen.getByLabelText("새 비밀번호 확인"), { target: { value: "newPass9081" } });
    fireEvent.click(screen.getByRole("button", { name: "비밀번호 변경" }));

    await waitFor(() => {
      expect(changePasswordAction).toHaveBeenCalled();
    });

    const submittedFormData = vi.mocked(changePasswordAction).mock.calls[0][1] as FormData;
    expect(submittedFormData.get("currentPassword")).toBe("oldPass9081");
    expect(submittedFormData.get("newPassword")).toBe("newPass9081");
    expect(submittedFormData.get("newPasswordConfirm")).toBe("newPass9081");
    expect(await screen.findByText("비밀번호가 변경되었습니다.")).toBeInTheDocument();
    expect(screen.getByLabelText("현재 비밀번호")).toHaveValue("");
  });

  it("uses a full-width refund status card with ERP-sync guidance", () => {
    render(
      <PortalShell
        role="refund"
        session={{
          id: "refund-1",
          loginId: "refund1",
          name: "박정산",
          role: "REFUND",
        }}
        refundInfo={{
          totalPaid: 45000000,
          refundAmount: 38000000,
          processedState: "정산 서류 검토 완료 (지급 대기)",
          targetDate: "2026-06-30T00:00:00.000Z",
        }}
        contributionSummary={{
          totalDue: 45000000,
          totalPaid: 45000000,
          unpaidAmount: 0,
          overdueAmount: 0,
          lateFee: 0,
          nextDueDate: null,
          status: "PAID",
          noticeMessage: "납부 정상",
          updatedAt: "2026-06-01T00:00:00.000Z",
        }}
      />,
    );

    const statusCard = screen.getByRole("heading", { name: "내 환불/정산 및 납부 현황" }).closest("article");

    expect(statusCard).toHaveClass("md:col-span-2");
    expect(
      screen.getByText("환불조합원 환불/정산 및 납부 현황은 ERP 프로그램과 연동되면 본인 화면에 순차적으로 반영하겠습니다."),
    ).toBeInTheDocument();
    expect(screen.getByText("45,000,000 원")).toBeInTheDocument();
    expect(screen.getByText("38,000,000 원")).toBeInTheDocument();
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

    fireEvent.click(screen.getByRole("button", { name: "2026년도 1분기 수입 및 지출 자금집행 실적 보고서 열람" }));

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

    expect(screen.getByText("가입명")).toBeInTheDocument();
    expect(screen.getByText("표시명")).toBeInTheDocument();
    const signupNameInput = screen.getByLabelText("OH Hakdong 표시 명의");
    expect(signupNameInput).toHaveValue("오학동");
    expect(screen.getByText("OH Hakdong")).toBeInTheDocument();

    fireEvent.change(signupNameInput, { target: { value: "오하동" } });
    fireEvent.click(screen.getByRole("button", { name: "표시 명의 저장" }));

    await waitFor(() => {
      expect(updateSignupNameAction).toHaveBeenCalledWith("pending-1", "오하동");
    });
    expect(signupNameInput).toHaveValue("오하동");
    expect(screen.getByText("OH Hakdong")).toBeInTheDocument();
  });

  it("updates a pending user's display name locally after save when it matched the Google name before", async () => {
    vi.stubGlobal("alert", vi.fn());
    vi.mocked(updateSignupNameAction).mockResolvedValue({
      success: true,
      signupName: "곽현숙",
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
        pendingUsers={[{
          id: "pending-1",
          name: "박용수대리곽현숙",
          email: "01037868640",
          signupName: "박용수대리곽현숙",
          createdAt: "2026-06-03T00:00:00.000Z",
        }]}
      />,
    );

    const signupNameInput = screen.getByLabelText("박용수대리곽현숙 표시 명의");
    fireEvent.change(signupNameInput, { target: { value: " 곽현숙 " } });
    fireEvent.click(screen.getByRole("button", { name: "표시 명의 저장" }));

    await waitFor(() => {
      expect(updateSignupNameAction).toHaveBeenCalledWith("pending-1", " 곽현숙 ");
    });
    expect(signupNameInput).toHaveValue("곽현숙");
    expect(screen.getByText("박용수대리곽현숙")).toBeInTheDocument();
  });

  it("summarizes approved account conversion on the admin home without rendering the full list", () => {
    render(
      <PortalShell
        role="admin"
        session={{
          id: "admin-1",
          loginId: "admin",
          name: "운영자",
          role: "ADMIN",
        }}
        approvedSocialUsers={[
          {
            id: "phone-refund",
            name: "전화환불",
            email: "010-1234-5678",
            role: "REFUND",
            memberType: "REFUND",
            createdAt: "2026-06-01T00:00:00.000Z",
          },
        ]}
      />,
    );

    expect(screen.getByText("총 1명")).toBeInTheDocument();
    expect(screen.getByText("환불조합원 1명")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "회원 자격 관리로 이동" })).toHaveAttribute(
      "href",
      "/portal/admin/members#approved-member-conversion",
    );
    expect(screen.queryByText("이메일/휴대폰")).not.toBeInTheDocument();
    expect(screen.queryByText("010-1234-5678")).not.toBeInTheDocument();
  });

  it("shows approved-account membership type counts on the admin home", () => {
    render(
      <PortalShell
        role="admin"
        session={{
          id: "admin-1",
          loginId: "admin",
          name: "운영자",
          role: "ADMIN",
        }}
        approvedSocialUsers={[
          {
            id: "pre-member",
            name: "예비회원",
            email: "010-2222-3333",
            role: "MEMBER",
            memberType: "PRELIMINARY",
            createdAt: "2026-06-01T00:00:00.000Z",
          },
        ]}
      />,
    );

    expect(screen.getByText("예비조합원 1명")).toBeInTheDocument();
    expect(screen.queryByText("자격 구분")).not.toBeInTheDocument();
    expect(screen.queryByText("정식 조합원 (MEMBER)")).not.toBeInTheDocument();
    expect(
      screen.getByText("자격별 현황만 요약하고, 실제 변경 작업은 전용 관리 페이지에서 처리합니다."),
    ).toBeInTheDocument();
  });
});
