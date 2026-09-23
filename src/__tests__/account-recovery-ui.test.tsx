import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AccountRecoveryClient } from "@/app/account-recovery/account-recovery-client";
import { ResetPasswordForm } from "@/app/reset-password/[token]/reset-password-form";
import { AccountRecoveryAdmin } from "@/components/portal/account-recovery-admin";

const routerMock = vi.hoisted(() => ({ refresh: vi.fn(), push: vi.fn() }));
const actionMocks = vi.hoisted(() => ({
  requestAccountRecoveryAction: vi.fn(),
  prepareAccountRecoveryMessageAction: vi.fn(),
  markAccountRecoverySentAction: vi.fn(),
  cancelAccountRecoveryAction: vi.fn(),
  resetPasswordWithTokenAction: vi.fn(),
}));

vi.mock("next/navigation", () => ({ useRouter: () => routerMock }));
vi.mock("@/lib/account-recovery-actions", () => actionMocks);

describe("account recovery UI", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    actionMocks.requestAccountRecoveryAction.mockResolvedValue({ success: true, message: "사무국에서 등록된 휴대전화로 안내해 드립니다." });
    actionMocks.prepareAccountRecoveryMessageAction.mockResolvedValue({
      success: true,
      phone: "01012345678",
      message: "[대방동지역주택조합]\n12시간 동안 한 번만 사용할 수 있습니다.",
      smsHref: "sms:01012345678?body=test",
    });
    actionMocks.markAccountRecoverySentAction.mockResolvedValue({ success: true });
    actionMocks.cancelAccountRecoveryAction.mockResolvedValue({ success: true });
    actionMocks.resetPasswordWithTokenAction.mockResolvedValue({ success: true, message: "새 비밀번호로 다시 로그인해 주세요." });
  });

  it("lets a member request ID help without exposing whether the account exists", async () => {
    render(<AccountRecoveryClient initialMode="ID_LOOKUP" />);
    fireEvent.change(screen.getByLabelText("등록된 이름"), { target: { value: "홍길동" } });
    fireEvent.change(screen.getByLabelText("등록된 휴대전화 번호"), { target: { value: "010-1234-5678" } });
    fireEvent.click(screen.getByRole("button", { name: "아이디 찾기 요청" }));

    await waitFor(() => expect(actionMocks.requestAccountRecoveryAction).toHaveBeenCalled());
    expect(await screen.findByText("요청이 접수되었습니다.")).toBeInTheDocument();
    expect(screen.queryByText(/member1001/)).not.toBeInTheDocument();
  });

  it("lets an administrator choose a personal phone and prepare a manual SMS", async () => {
    render(<AccountRecoveryAdmin requests={[{
      id: "recovery-1",
      requestType: "PASSWORD_RESET",
      status: "PENDING",
      requestPhoneLast4: "5678",
      deliveryMethod: null,
      createdAt: "2026-09-24T00:00:00.000Z",
      tokenExpiresAt: null,
      deliveryMarkedAt: null,
      completedAt: null,
      user: { name: "홍길동", phoneMasked: "010-****-5678", role: "MEMBER", isActive: true, hasSitePassword: true },
      handledByName: null,
    }]} />);

    fireEvent.click(screen.getByLabelText(/관리자 개인폰/));
    expect(screen.getByText(/회원에게 관리자 개인번호가 공개/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /12시간 링크 만들기/ }));

    await waitFor(() => expect(actionMocks.prepareAccountRecoveryMessageAction).toHaveBeenCalledWith("recovery-1", "PERSONAL_MOBILE"));
    expect(await screen.findByRole("link", { name: /문자 앱 열기/ })).toHaveAttribute("href", "sms:01012345678?body=test");
    expect(screen.getByText(/12시간 동안 한 번만/)).toBeInTheDocument();
  });

  it("shows a friendly completion state after a member resets the password", async () => {
    render(<ResetPasswordForm token="raw-reset-token" />);
    fireEvent.change(screen.getByLabelText("새 비밀번호"), { target: { value: "654321" } });
    fireEvent.change(screen.getByLabelText("새 비밀번호 확인"), { target: { value: "654321" } });
    fireEvent.click(screen.getByRole("button", { name: "새 비밀번호로 변경하기" }));

    await waitFor(() => expect(actionMocks.resetPasswordWithTokenAction).toHaveBeenCalled());
    expect(await screen.findByText("비밀번호가 안전하게 변경되었습니다.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "로그인으로 돌아가기" })).toHaveAttribute("href", "/login");
  });
});
