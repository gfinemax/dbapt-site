import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MemberManagementDashboard } from "@/components/portal/member-management-dashboard";
import { approveUserAction, updateSignupNameAction } from "@/lib/auth";

vi.mock("next/navigation", () => ({
  useRouter() {
    return {
      refresh: vi.fn(),
    };
  },
}));

vi.mock("@/lib/auth", () => ({
  approveUserAction: vi.fn(),
  updateSignupNameAction: vi.fn(),
}));

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe("member management dashboard", () => {
  it("renders PeopleOn sync stats and prioritized member action rows", () => {
    render(
      <MemberManagementDashboard
        snapshot={{
          generatedAt: "2026-06-17T00:00:00.000Z",
          stats: {
            registeredPeopleOnCount: 2,
            refundPeopleOnCount: 1,
            trackedPeopleOnCount: 3,
            homepageApprovedCount: 1,
            homepagePendingCount: 1,
            missingHomepageCount: 1,
            roleMismatchCount: 1,
            preliminaryPeopleOnCount: 1,
          },
          actionRows: [
            {
              peopleOnId: "po-missing",
              peopleOnName: "박미가입",
              peopleOnPhone: "010-5555-6666",
              peopleOnStatus: "등기조합원",
              expectedRole: "MEMBER",
              expectedMemberType: "REGULAR",
              matchStatus: "MISSING",
              matchedUserId: null,
              matchedUserName: null,
              matchedUserEmail: null,
              matchedUserRole: null,
              matchedUserActive: null,
              createdAt: null,
            },
            {
              peopleOnId: "po-mismatch",
              peopleOnName: "이정산",
              peopleOnPhone: "010-7777-8888",
              peopleOnStatus: "환불 조합원",
              expectedRole: "REFUND",
              expectedMemberType: "REFUND",
              matchStatus: "ROLE_MISMATCH",
              matchedUserId: "user-1",
              matchedUserName: "이정산",
              matchedUserEmail: "refund@example.com",
              matchedUserRole: "MEMBER",
              matchedUserActive: true,
              createdAt: "2026-06-01T00:00:00.000Z",
            },
          ],
        }}
        syncError={null}
        isConfigured
      />,
    );

    expect(screen.getByRole("heading", { name: "조합원 관리" })).toBeInTheDocument();
    expect(screen.getByText("PeopleOn 원장과 홈페이지 계정을 비교해 미가입, 승인 대기, 자격 불일치 대상을 확인합니다.")).toBeInTheDocument();
    expect(screen.getByText("등기 조합원")).toBeInTheDocument();
    expect(screen.getByText("예비 조합원")).toBeInTheDocument();
    expect(screen.getAllByText("환불 조합원").length).toBeGreaterThan(0);
    expect(screen.getAllByText("홈페이지 미가입").length).toBeGreaterThan(0);
    expect(screen.getByText("자격 구분")).toBeInTheDocument();
    expect(screen.getByText("박미가입")).toBeInTheDocument();
    expect(screen.getByText("이정산")).toBeInTheDocument();
    expect(screen.getAllByText("자격 불일치").length).toBeGreaterThan(0);
  });

  it("shows configuration guidance when PeopleOn API settings are missing", () => {
    render(
      <MemberManagementDashboard
        snapshot={{
          generatedAt: "2026-06-17T00:00:00.000Z",
          stats: {
            registeredPeopleOnCount: 0,
            refundPeopleOnCount: 0,
            trackedPeopleOnCount: 0,
            homepageApprovedCount: 2,
            homepagePendingCount: 1,
            missingHomepageCount: 0,
            roleMismatchCount: 0,
            preliminaryPeopleOnCount: 0,
          },
          actionRows: [],
        }}
        syncError="PEOPLEON_MEMBERS_API_KEY가 설정되지 않았습니다."
        isConfigured={false}
      />,
    );

    expect(screen.getByText("PeopleOn API 연결 설정이 필요합니다.")).toBeInTheDocument();
    expect(screen.getByText("PEOPLEON_MEMBERS_API_KEY가 설정되지 않았습니다.")).toBeInTheDocument();
  });

  it("uses a dedicated conversion table to change approved users among member, refund, and associate account types", async () => {
    vi.stubGlobal("alert", vi.fn());
    vi.mocked(approveUserAction).mockResolvedValue({ success: true, role: "MEMBER" });
    vi.mocked(updateSignupNameAction).mockResolvedValue({ success: true, signupName: "최마리" });

    render(
      <MemberManagementDashboard
        snapshot={{
          generatedAt: "2026-06-17T00:00:00.000Z",
          stats: {
            registeredPeopleOnCount: 0,
            refundPeopleOnCount: 0,
            trackedPeopleOnCount: 0,
            homepageApprovedCount: 2,
            homepagePendingCount: 0,
            missingHomepageCount: 0,
            roleMismatchCount: 0,
            preliminaryPeopleOnCount: 0,
          },
          actionRows: [],
        }}
        syncError={null}
        isConfigured
        approvedSocialUsers={[
          {
            id: "refund-member",
            name: "marie Choi",
            signupName: "환불회원",
            email: "010-1111-2222",
            role: "REFUND",
            memberType: "REFUND",
            createdAt: "2026-06-01T00:00:00.000Z",
          },
          {
            id: "associate-account",
            name: "관계자계정",
            email: "010-3333-4444",
            role: "ASSOCIATE",
            memberType: "ASSOCIATE",
            createdAt: "2026-06-01T00:00:00.000Z",
          },
        ]}
      />,
    );

    expect(screen.getByRole("heading", { name: "가입 승인 회원 자격 변경 관리" })).toBeInTheDocument();
    expect(screen.getByText("이메일/휴대폰")).toBeInTheDocument();
    expect(screen.getAllByText("관계자/기타 승인 계정").length).toBeGreaterThan(0);
    expect(screen.getByText("관계자/기타 승인 계정 (ASSOCIATE)")).toBeInTheDocument();
    expect(screen.getByLabelText("marie Choi 표시 명의")).toHaveValue("환불회원");
    expect(screen.getByText("Google 이름: marie Choi")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("marie Choi 표시 명의"), { target: { value: "최마리" } });
    fireEvent.click(screen.getAllByRole("button", { name: "표시 명의 저장" })[0]);

    await waitFor(() => {
      expect(updateSignupNameAction).toHaveBeenCalledWith("refund-member", "최마리");
    });

    const refundSelect = screen.getByLabelText("환불회원 전환할 자격");
    expect(refundSelect).toHaveValue("REFUND");
    expect(screen.getAllByRole("option", { name: "정식조합원" }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("option", { name: "예비조합원" }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("option", { name: "환불조합원" }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("option", { name: "관계자/기타 승인 계정" }).length).toBeGreaterThan(0);

    fireEvent.change(refundSelect, { target: { value: "REGULAR" } });
    fireEvent.click(screen.getAllByRole("button", { name: "자격 변경" })[0]);

    await waitFor(() => {
      expect(approveUserAction).toHaveBeenCalledWith("refund-member", "MEMBER", "REGULAR");
    });

    fireEvent.change(refundSelect, { target: { value: "ASSOCIATE" } });
    fireEvent.click(screen.getAllByRole("button", { name: "자격 변경" })[0]);

    await waitFor(() => {
      expect(approveUserAction).toHaveBeenCalledWith("refund-member", "ASSOCIATE", "ASSOCIATE");
    });
  });
});
