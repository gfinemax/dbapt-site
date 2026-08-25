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

    expect(validateSignupPassword("123456", "01012345678").valid).toBe(true);
    expect(validateSignupPassword("12345", "01012345678").error).toContain("숫자 6자리");
    expect(validateSignupPassword("1234567", "01012345678").error).toContain("숫자 6자리");
    expect(validateSignupPassword("abcdef", "01012345678").error).toContain("숫자 6자리");
    expect(validateSignupPassword("12345a", "01012345678").error).toContain("숫자 6자리");
  });

  it("creates a pending phone-password signup with a hashed password", async () => {
    const { signupWithPhonePasswordAction } = await import("@/lib/auth");
    const formData = new FormData();
    formData.set("signupName", "홍길동");
    formData.set("signupPhone", "010-1234-5678");
    formData.set("signupPassword", "123456");
    formData.set("signupPasswordConfirm", "123456");
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
    expect(createdData.passwordHash).not.toBe("123456");
    expect(await bcrypt.compare("123456", createdData.passwordHash)).toBe(true);
  });

  it("sets a long-lived session cookie for phone-password login", async () => {
    const { loginAction } = await import("@/lib/auth");
    const passwordHash = await bcrypt.hash("123456", 10);
    const formData = new FormData();
    formData.set("loginId", "010-1234-5678");
    formData.set("password", "123456");
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
    const existingPasswordHash = await bcrypt.hash("123456", 10);
    const formData = new FormData();
    formData.set("currentPassword", "123456");
    formData.set("newPassword", "654321");
    formData.set("newPasswordConfirm", "654321");
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
    expect(updatedPasswordHash).not.toBe("654321");
    expect(await bcrypt.compare("654321", updatedPasswordHash)).toBe(true);
  });

  it("rejects password change when the current password is wrong", async () => {
    const { changePasswordAction, createSessionToken } = await import("@/lib/auth");
    const formData = new FormData();
    formData.set("currentPassword", "000000");
    formData.set("newPassword", "654321");
    formData.set("newPasswordConfirm", "654321");
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
      passwordHash: await bcrypt.hash("123456", 10),
      isActive: true,
    });

    const result = await changePasswordAction(null, formData);

    expect(result).toEqual({ error: "현재 비밀번호가 올바르지 않습니다." });
    expect(prismaMock.user.update).not.toHaveBeenCalled();
  });

  it("rejects password change for passwordless social accounts", async () => {
    const { changePasswordAction, createSessionToken } = await import("@/lib/auth");
    const formData = new FormData();
    formData.set("currentPassword", "123456");
    formData.set("newPassword", "654321");
    formData.set("newPasswordConfirm", "654321");
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
    formData.set("currentPassword", "123456");
    formData.set("newPassword", "654321");
    formData.set("newPasswordConfirm", "654322");
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
