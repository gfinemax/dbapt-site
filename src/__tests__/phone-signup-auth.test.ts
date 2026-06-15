// @vitest-environment node
import bcrypt from "bcryptjs";
import { beforeEach, describe, expect, it, vi } from "vitest";

const prismaMock = vi.hoisted(() => ({
  user: {
    findFirst: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
}));

vi.mock("@/lib/db", () => ({
  prisma: prismaMock,
}));

describe("phone password signup auth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
      },
    });
  });
});
