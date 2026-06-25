// @vitest-environment node
import bcrypt from "bcryptjs";
import { beforeEach, describe, expect, it, vi } from "vitest";

const prismaMock = vi.hoisted(() => ({
  user: {
    findFirst: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    updateMany: vi.fn(),
  },
}));

const mockSessionCookie = vi.hoisted(() => ({
  value: "",
}));
const mockCookieSet = vi.hoisted(() => vi.fn());

vi.mock("@/lib/db", () => ({
  prisma: prismaMock,
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({
    get: vi.fn(() => (mockSessionCookie.value ? { value: mockSessionCookie.value } : undefined)),
    set: mockCookieSet,
    delete: vi.fn(),
  })),
}));

describe("phone password signup auth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSessionCookie.value = "";
  });

  it("validates the approved password rules", async () => {
    const { validateSignupPassword } = await import("@/lib/signup-password");

    expect(validateSignupPassword("safe7821", "01012345678").valid).toBe(true);
    expect(validateSignupPassword("safe7821!", "01012345678").valid).toBe(true);
    expect(validateSignupPassword("abc1234", "01012345678").error).toContain("8자 이상");
    expect(validateSignupPassword("abcdefgh", "01012345678").error).toContain("영문과 숫자");
    expect(validateSignupPassword("12345678", "01012345678").error).toContain("영문과 숫자");
    expect(validateSignupPassword("abcd1234", "01012345678").error).toContain("연속된 숫자");
    expect(validateSignupPassword("aaaa1111", "01012345678").error).toContain("반복된 문자");
    expect(validateSignupPassword("abc5678x", "01012345678").error).toContain("휴대폰 번호");
    expect(validateSignupPassword("safe900101", "01012345678").error).toContain("생년월일");
    expect(validateSignupPassword("safe19900101", "01012345678").error).toContain("생년월일");
  });

  it("creates a pending phone-password signup with a hashed password", async () => {
    const { signupWithPhonePasswordAction } = await import("@/lib/auth");
    const formData = new FormData();
    formData.set("signupName", "홍길동");
    formData.set("signupPhone", "010-1234-5678");
    formData.set("signupPassword", "safe7821");
    formData.set("signupPasswordConfirm", "safe7821");
    formData.set("signupMemo", "101동 확인 요청");
    prismaMock.user.findFirst.mockResolvedValue(null);
    prismaMock.user.create.mockImplementation(async ({ data }) => ({ id: "pending-1", ...data }));

    const result = await signupWithPhonePasswordAction(null, formData);
    const createdData = prismaMock.user.create.mock.calls[0][0].data;

    expect(result).toEqual({
      success: true,
      message: "가입 신청이 접수되었습니다. 사무국 확인 후 승인됩니다.",
    });
    expect(createdData).toEqual(
      expect.objectContaining({
        loginId: "01012345678",
        name: "홍길동",
        signupName: "홍길동",
        signupPhone: "01012345678",
        phone: "01012345678",
        signupMemo: "101동 확인 요청",
        role: "PENDING",
        isActive: true,
      }),
    );
    expect(createdData.passwordHash).not.toBe("safe7821");
    expect(await bcrypt.compare("safe7821", createdData.passwordHash)).toBe(true);
  });

  it("sets a long-lived session cookie for phone-password login", async () => {
    const { loginAction } = await import("@/lib/auth");
    const passwordHash = await bcrypt.hash("safe7821", 10);
    const formData = new FormData();
    formData.set("loginId", "010-1234-5678");
    formData.set("password", "safe7821");
    prismaMock.user.findUnique.mockResolvedValue({
      id: "member-1",
      loginId: "01012345678",
      name: "홍길동",
      role: "MEMBER",
      email: null,
      image: null,
      isActive: true,
      passwordHash,
    });

    const beforeLogin = Date.now();
    const result = await loginAction(null, formData);
    const sessionCookieCall = mockCookieSet.mock.calls.find(([name]) => name === "session");

    expect(result).toEqual({ success: true, role: "MEMBER" });
    expect(sessionCookieCall).toBeDefined();
    expect(sessionCookieCall?.[2]).toEqual(
      expect.objectContaining({
        httpOnly: true,
        sameSite: "lax",
        path: "/",
      }),
    );
    expect(sessionCookieCall?.[2].expires.getTime() - beforeLogin).toBeGreaterThanOrEqual(
      29 * 24 * 60 * 60 * 1000,
    );
  });

  it("changes the current password when the current password is correct", async () => {
    const { changePasswordAction, createSessionToken } = await import("@/lib/auth");
    const existingPasswordHash = await bcrypt.hash("safe7821", 10);
    const formData = new FormData();
    formData.set("currentPassword", "safe7821");
    formData.set("newPassword", "fresh9081");
    formData.set("newPasswordConfirm", "fresh9081");
    mockSessionCookie.value = await createSessionToken({
      id: "member-1",
      loginId: "01012345678",
      name: "홍길동",
      role: "MEMBER",
    });
    prismaMock.user.findUnique.mockResolvedValue({
      id: "member-1",
      loginId: "01012345678",
      phone: "01012345678",
      passwordHash: existingPasswordHash,
      isActive: true,
    });
    prismaMock.user.update.mockResolvedValue({
      id: "member-1",
      loginId: "01012345678",
    });

    const result = await changePasswordAction(null, formData);
    expect(result).toEqual({ success: true, message: "비밀번호가 변경되었습니다." });
    const updatedPasswordHash = prismaMock.user.update.mock.calls[0][0].data.passwordHash;

    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
      where: { id: "member-1" },
      select: {
        id: true,
        loginId: true,
        phone: true,
        passwordHash: true,
        isActive: true,
      },
    });
    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: { id: "member-1" },
      data: { passwordHash: updatedPasswordHash },
    });
    expect(updatedPasswordHash).not.toBe("fresh9081");
    expect(await bcrypt.compare("fresh9081", updatedPasswordHash)).toBe(true);
  });

  it("rejects password change when the current password is wrong", async () => {
    const { changePasswordAction, createSessionToken } = await import("@/lib/auth");
    const formData = new FormData();
    formData.set("currentPassword", "wrong-password");
    formData.set("newPassword", "fresh9081");
    formData.set("newPasswordConfirm", "fresh9081");
    mockSessionCookie.value = await createSessionToken({
      id: "member-1",
      loginId: "01012345678",
      name: "홍길동",
      role: "MEMBER",
    });
    prismaMock.user.findUnique.mockResolvedValue({
      id: "member-1",
      loginId: "01012345678",
      phone: "01012345678",
      passwordHash: await bcrypt.hash("safe7821", 10),
      isActive: true,
    });

    const result = await changePasswordAction(null, formData);

    expect(result).toEqual({ error: "현재 비밀번호가 올바르지 않습니다." });
    expect(prismaMock.user.update).not.toHaveBeenCalled();
  });

  it("rejects password change for passwordless social accounts", async () => {
    const { changePasswordAction, createSessionToken } = await import("@/lib/auth");
    const formData = new FormData();
    formData.set("currentPassword", "safe7821");
    formData.set("newPassword", "fresh9081");
    formData.set("newPasswordConfirm", "fresh9081");
    mockSessionCookie.value = await createSessionToken({
      id: "google-1",
      loginId: null,
      name: "소셜회원",
      role: "MEMBER",
    });
    prismaMock.user.findUnique.mockResolvedValue({
      id: "google-1",
      loginId: null,
      phone: null,
      passwordHash: null,
      isActive: true,
    });

    const result = await changePasswordAction(null, formData);

    expect(result).toEqual({ error: "사이트 비밀번호가 없는 계정입니다. Google 계정에서 비밀번호를 관리해 주세요." });
    expect(prismaMock.user.update).not.toHaveBeenCalled();
  });

  it("rejects password change when the new password confirmation does not match", async () => {
    const { changePasswordAction, createSessionToken } = await import("@/lib/auth");
    const formData = new FormData();
    formData.set("currentPassword", "safe7821");
    formData.set("newPassword", "fresh9081");
    formData.set("newPasswordConfirm", "fresh9082");
    mockSessionCookie.value = await createSessionToken({
      id: "member-1",
      loginId: "01012345678",
      name: "홍길동",
      role: "MEMBER",
    });

    const result = await changePasswordAction(null, formData);

    expect(result).toEqual({ error: "새 비밀번호 확인이 일치하지 않습니다." });
    expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
    expect(prismaMock.user.update).not.toHaveBeenCalled();
  });

  it("keeps a phone login id when approving a pending phone signup", async () => {
    const { approveUserAction } = await import("@/lib/auth");
    prismaMock.user.findUnique.mockResolvedValue({
      id: "pending-1",
      loginId: "01012345678",
    });
    prismaMock.user.update.mockResolvedValue({
      id: "pending-1",
      loginId: "01012345678",
      role: "MEMBER",
    });

    const result = await approveUserAction("pending-1", "MEMBER");

    expect(result).toEqual({ success: true, role: "MEMBER" });
    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: { id: "pending-1" },
      data: {
        role: "MEMBER",
        memberType: "REGULAR",
      },
    });
  });

  it("can approve a member account as preliminary while keeping MEMBER access", async () => {
    const { approveUserAction } = await import("@/lib/auth");
    prismaMock.user.findUnique.mockResolvedValue({
      id: "pending-1",
      loginId: "01012345678",
    });
    prismaMock.user.update.mockResolvedValue({
      id: "pending-1",
      loginId: "01012345678",
      role: "MEMBER",
      memberType: "PRELIMINARY",
    });

    const result = await approveUserAction("pending-1", "MEMBER", "PRELIMINARY");

    expect(result).toEqual({ success: true, role: "MEMBER" });
    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: { id: "pending-1" },
      data: {
        role: "MEMBER",
        memberType: "PRELIMINARY",
      },
    });
  });

  it("can approve an account as an associate or other approved account", async () => {
    const { approveUserAction } = await import("@/lib/auth");
    prismaMock.user.findUnique.mockResolvedValue({
      id: "pending-1",
      loginId: "01012345678",
    });
    prismaMock.user.update.mockResolvedValue({
      id: "pending-1",
      loginId: "01012345678",
      role: "ASSOCIATE",
      memberType: "ASSOCIATE",
    });

    const result = await approveUserAction("pending-1", "ASSOCIATE", "ASSOCIATE");

    expect(result).toEqual({ success: true, role: "ASSOCIATE" });
    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: { id: "pending-1" },
      data: {
        role: "ASSOCIATE",
        memberType: "ASSOCIATE",
      },
    });
  });

  it("lets administrators update the display name for approved Google accounts", async () => {
    const { createSessionToken, updateSignupNameAction } = await import("@/lib/auth");
    mockSessionCookie.value = await createSessionToken({
      id: "admin-1",
      loginId: "admin",
      name: "운영자",
      role: "ADMIN",
    });
    prismaMock.user.updateMany.mockResolvedValue({ count: 1 });

    const result = await updateSignupNameAction("approved-google-1", "최마리");

    expect(result).toEqual({ success: true, signupName: "최마리" });
    expect(prismaMock.user.updateMany).toHaveBeenCalledWith({
      where: {
        id: "approved-google-1",
        role: { in: ["PENDING", "MEMBER", "REFUND", "ASSOCIATE"] },
      },
      data: {
        signupName: "최마리",
      },
    });
  });
});
