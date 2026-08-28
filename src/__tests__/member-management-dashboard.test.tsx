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
  window.history.replaceState(null, "", "/");
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
    expect(screen.getByRole("searchbox", { name: "확인 필요 조합원 검색" })).toBeInTheDocument();
    expect(screen.getByText("전체 2명 중 2명 표시")).toBeInTheDocument();
  });

  it("filters confirmation-needed members by name, phone, qualification, and homepage status", () => {
    render(
      <MemberManagementDashboard
        snapshot={{
          generatedAt: "2026-08-27T00:00:00.000Z",
          stats: {
            registeredPeopleOnCount: 2,
            refundPeopleOnCount: 1,
            trackedPeopleOnCount: 2,
            homepageApprovedCount: 0,
            homepagePendingCount: 0,
            missingHomepageCount: 1,
            roleMismatchCount: 1,
            preliminaryPeopleOnCount: 0,
          },
          actionRows: [
            {
              peopleOnId: "po-1",
              peopleOnName: "강광자",
              peopleOnPhone: "010-1234-5678",
              peopleOnStatus: "정상",
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
              peopleOnId: "po-2",
              peopleOnName: "이정산",
              peopleOnPhone: "010-9999-0000",
              peopleOnStatus: "환불 대상",
              expectedRole: "REFUND",
              expectedMemberType: "REFUND",
              matchStatus: "ROLE_MISMATCH",
              matchedUserId: "user-2",
              matchedUserName: "이정산",
              matchedUserEmail: "refund@example.com",
              matchedUserRole: "MEMBER",
              matchedUserActive: true,
              createdAt: "2026-08-01T00:00:00.000Z",
            },
          ],
        }}
        syncError={null}
        isConfigured
      />,
    );

    const search = screen.getByRole("searchbox", { name: "확인 필요 조합원 검색" });
    fireEvent.change(search, { target: { value: "12345678" } });
    expect(screen.getByText("강광자")).toBeInTheDocument();
    expect(screen.queryByText("이정산")).not.toBeInTheDocument();
    expect(screen.getByText("전체 2명 중 1명 표시")).toBeInTheDocument();

    fireEvent.change(search, { target: { value: "자격 불일치" } });
    expect(screen.queryByText("강광자")).not.toBeInTheDocument();
    expect(screen.getByText("이정산")).toBeInTheDocument();

    fireEvent.change(search, { target: { value: "검색없음" } });
    expect(screen.getByText("검색 조건에 맞는 확인 필요 조합원이 없습니다.")).toBeInTheDocument();
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

    fireEvent.click(screen.getByRole("tab", { name: "홈페이지 관리 회원" }));
    expect(screen.getByRole("heading", { name: "홈페이지 관리 회원 명단" })).toBeInTheDocument();
    expect(screen.getByRole("searchbox", { name: "홈페이지 관리 회원 검색" })).toBeInTheDocument();
    expect(screen.getByText("가입명")).toBeInTheDocument();
    expect(screen.getByText("표시명")).toBeInTheDocument();
    expect(screen.getByText("이메일/휴대폰")).toBeInTheDocument();
    expect(screen.getByText("가입날짜")).toBeInTheDocument();
    expect(screen.getAllByText("2026-06-01").length).toBeGreaterThan(0);
    expect(screen.getAllByText("관계자/기타 승인 계정").length).toBeGreaterThan(0);
    expect(screen.getByText("관계자/기타 승인 계정 (ASSOCIATE)")).toBeInTheDocument();
    expect(screen.getByLabelText("marie Choi 표시 명의")).toHaveValue("환불회원");
    expect(screen.getByText("marie Choi")).toBeInTheDocument();

    fireEvent.change(screen.getByRole("searchbox", { name: "홈페이지 관리 회원 검색" }), { target: { value: "관계자" } });
    expect(screen.queryByText("marie Choi")).not.toBeInTheDocument();
    expect(screen.getByText("관계자계정")).toBeInTheDocument();
    expect(screen.getByText("전체 2명 중 1명 표시")).toBeInTheDocument();
    fireEvent.change(screen.getByRole("searchbox", { name: "홈페이지 관리 회원 검색" }), { target: { value: "" } });

    fireEvent.change(screen.getByLabelText("marie Choi 표시 명의"), { target: { value: "최마리" } });
    fireEvent.click(screen.getAllByRole("button", { name: "표시 명의 저장" })[0]);

    await waitFor(() => {
      expect(updateSignupNameAction).toHaveBeenCalledWith("refund-member", "최마리");
    });
    expect(screen.getByLabelText("marie Choi 표시 명의")).toHaveValue("최마리");
    expect(screen.getByText("marie Choi")).toBeInTheDocument();

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

  it("updates an approved user's display name locally after save even when it matched the Google name before", async () => {
    vi.stubGlobal("alert", vi.fn());
    vi.mocked(updateSignupNameAction).mockResolvedValue({ success: true, signupName: "곽현숙" });

    render(
      <MemberManagementDashboard
        snapshot={{
          generatedAt: "2026-06-17T00:00:00.000Z",
          stats: {
            registeredPeopleOnCount: 0,
            refundPeopleOnCount: 0,
            trackedPeopleOnCount: 0,
            homepageApprovedCount: 1,
            homepagePendingCount: 0,
            missingHomepageCount: 0,
            roleMismatchCount: 0,
            preliminaryPeopleOnCount: 0,
          },
          actionRows: [],
        }}
        syncError={null}
        isConfigured
        approvedSocialUsers={[{
          id: "preliminary-member",
          name: "박용수대리곽현숙",
          signupName: "박용수대리곽현숙",
          email: "01037868640",
          role: "MEMBER",
          memberType: "PRELIMINARY",
          createdAt: "2026-06-01T00:00:00.000Z",
        }]}
      />,
    );

    fireEvent.click(screen.getByRole("tab", { name: "홈페이지 관리 회원" }));
    const signupNameInput = screen.getByLabelText("박용수대리곽현숙 표시 명의");
    fireEvent.change(signupNameInput, { target: { value: " 곽현숙 " } });
    fireEvent.click(screen.getByRole("button", { name: "표시 명의 저장" }));

    await waitFor(() => {
      expect(updateSignupNameAction).toHaveBeenCalledWith("preliminary-member", " 곽현숙 ");
    });
    expect(signupNameInput).toHaveValue("곽현숙");
    expect(screen.getByText("박용수대리곽현숙")).toBeInTheDocument();
  });

  it("separates the lists into tabs and paginates confirmation-needed members", () => {
    const actionRows = Array.from({ length: 21 }, (_, index) => ({
      peopleOnId: `po-${index + 1}`,
      peopleOnName: `조합원${index + 1}`,
      peopleOnPhone: `010-0000-${String(index + 1).padStart(4, "0")}`,
      peopleOnStatus: "정상",
      expectedRole: "MEMBER" as const,
      expectedMemberType: "REGULAR",
      matchStatus: "MISSING" as const,
      matchedUserId: null,
      matchedUserName: null,
      matchedUserEmail: null,
      matchedUserRole: null,
      matchedUserActive: null,
      createdAt: null,
    }));

    render(
      <MemberManagementDashboard
        snapshot={{
          generatedAt: "2026-08-28T00:00:00.000Z",
          stats: {
            registeredPeopleOnCount: 21,
            refundPeopleOnCount: 0,
            trackedPeopleOnCount: 21,
            homepageApprovedCount: 0,
            homepagePendingCount: 0,
            missingHomepageCount: 21,
            roleMismatchCount: 0,
            preliminaryPeopleOnCount: 0,
          },
          actionRows,
        }}
        syncError={null}
        isConfigured
      />,
    );

    expect(screen.getByRole("tab", { name: "확인 필요 조합원" })).toHaveAttribute("aria-selected", "true");
    expect(screen.queryByRole("heading", { name: "홈페이지 관리 회원 명단" })).not.toBeInTheDocument();
    expect(screen.getByText("1 / 2 페이지")).toBeInTheDocument();
    expect(screen.getByText("조합원1")).toBeInTheDocument();
    expect(screen.queryByText("조합원21")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "다음 페이지" }));
    expect(screen.getByText("2 / 2 페이지")).toBeInTheDocument();
    expect(screen.getByText("조합원21")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: "홈페이지 관리 회원" }));
    expect(screen.getByRole("heading", { name: "홈페이지 관리 회원 명단" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "확인 필요 조합원" })).not.toBeInTheDocument();
  });

  it("opens the homepage member tab from the sidebar deep-link hash", () => {
    window.history.replaceState(null, "", "/portal/admin/members#homepage-managed-members");

    render(
      <MemberManagementDashboard
        snapshot={{
          generatedAt: "2026-08-28T00:00:00.000Z",
          stats: {
            registeredPeopleOnCount: 0,
            refundPeopleOnCount: 0,
            trackedPeopleOnCount: 0,
            homepageApprovedCount: 0,
            homepagePendingCount: 0,
            missingHomepageCount: 0,
            roleMismatchCount: 0,
            preliminaryPeopleOnCount: 0,
          },
          actionRows: [],
        }}
        syncError={null}
        isConfigured
      />,
    );

    expect(screen.getByRole("tab", { name: "홈페이지 관리 회원" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("heading", { name: "홈페이지 관리 회원 명단" })).toBeInTheDocument();
  });
});
