// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";

const authMock = vi.hoisted(() => ({ getSession: vi.fn() }));
const cookieSet = vi.hoisted(() => vi.fn());
const revalidatePath = vi.hoisted(() => vi.fn());

const transactionMock = vi.hoisted(() => ({
  accountRecoveryRequest: {
    updateMany: vi.fn(),
  },
  user: {
    update: vi.fn(),
  },
}));

const prismaMock = vi.hoisted(() => ({
  user: {
    findMany: vi.fn(),
  },
  accountRecoveryRequest: {
    findFirst: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    updateMany: vi.fn(),
  },
  $transaction: vi.fn(),
}));

vi.mock("@/lib/auth", () => authMock);
vi.mock("@/lib/db", () => ({ prisma: prismaMock }));
vi.mock("next/cache", () => ({ revalidatePath }));
vi.mock("next/headers", () => ({ cookies: vi.fn(async () => ({ set: cookieSet })) }));

describe("account recovery actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authMock.getSession.mockResolvedValue({ id: "admin-1", role: "ADMIN" });
    prismaMock.accountRecoveryRequest.create.mockResolvedValue({ id: "recovery-1" });
    prismaMock.accountRecoveryRequest.update.mockResolvedValue({ id: "recovery-1" });
    prismaMock.accountRecoveryRequest.updateMany.mockResolvedValue({ count: 1 });
    transactionMock.accountRecoveryRequest.updateMany.mockResolvedValue({ count: 1 });
    transactionMock.user.update.mockResolvedValue({ id: "member-1" });
    prismaMock.$transaction.mockImplementation(async (input: unknown) => {
      if (typeof input === "function") return input(transactionMock);
      return Promise.all(input as Promise<unknown>[]);
    });
  });

  it("returns the same friendly response whether an account exists or not", async () => {
    const { requestAccountRecoveryAction } = await import("@/lib/account-recovery-actions");
    const formData = new FormData();
    formData.set("requestType", "PASSWORD_RESET");
    formData.set("name", "홍길동");
    formData.set("phone", "010-1234-5678");

    prismaMock.user.findMany.mockResolvedValueOnce([{ id: "member-1" }]);
    prismaMock.accountRecoveryRequest.findFirst.mockResolvedValue(null);
    const foundResult = await requestAccountRecoveryAction(null, formData);

    prismaMock.user.findMany.mockResolvedValueOnce([]);
    const missingResult = await requestAccountRecoveryAction(null, formData);

    expect(foundResult).toEqual(missingResult);
    expect(foundResult).toEqual(expect.objectContaining({ success: true }));
    expect(foundResult.message).not.toContain("홍길동");
    expect(prismaMock.accountRecoveryRequest.create).toHaveBeenCalledWith({
      data: {
        userId: "member-1",
        requestType: "PASSWORD_RESET",
        requestPhoneLast4: "5678",
      },
    });
  });

  it("does not create duplicate recent recovery requests", async () => {
    const { requestAccountRecoveryAction } = await import("@/lib/account-recovery-actions");
    const formData = new FormData();
    formData.set("requestType", "ID_LOOKUP");
    formData.set("name", "홍길동");
    formData.set("phone", "01012345678");
    prismaMock.user.findMany.mockResolvedValue([{ id: "member-1" }]);
    prismaMock.accountRecoveryRequest.findFirst.mockResolvedValue({ id: "existing-1", status: "PENDING", tokenExpiresAt: null });

    const result = await requestAccountRecoveryAction(null, formData);

    expect(result.success).toBe(true);
    expect(prismaMock.accountRecoveryRequest.create).not.toHaveBeenCalled();
  });

  it("accepts a new password-reset request after the previous link expires", async () => {
    const { requestAccountRecoveryAction } = await import("@/lib/account-recovery-actions");
    const formData = new FormData();
    formData.set("requestType", "PASSWORD_RESET");
    formData.set("name", "홍길동");
    formData.set("phone", "01012345678");
    prismaMock.user.findMany.mockResolvedValue([{ id: "member-1" }]);
    prismaMock.accountRecoveryRequest.findFirst.mockResolvedValue({
      id: "expired-1",
      status: "SENT",
      tokenExpiresAt: new Date(Date.now() - 60_000),
    });

    const result = await requestAccountRecoveryAction(null, formData);

    expect(result.success).toBe(true);
    expect(prismaMock.accountRecoveryRequest.updateMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ id: "expired-1" }),
      data: { status: "EXPIRED", tokenHash: null },
    }));
    expect(prismaMock.accountRecoveryRequest.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ userId: "member-1", requestType: "PASSWORD_RESET" }),
    }));
  });

  it("prepares a one-time password reset message without storing the raw token", async () => {
    const { prepareAccountRecoveryMessageAction } = await import("@/lib/account-recovery-actions");
    prismaMock.accountRecoveryRequest.findUnique.mockResolvedValue({
      id: "recovery-1",
      userId: "member-1",
      requestType: "PASSWORD_RESET",
      status: "PENDING",
      requestPhoneLast4: "5678",
      user: {
        id: "member-1",
        loginId: "01012345678",
        name: "홍길동",
        signupName: "홍길동",
        phone: "01012345678",
        signupPhone: "01012345678",
        passwordHash: "hash",
        isActive: true,
      },
    });

    const result = await prepareAccountRecoveryMessageAction("recovery-1", "PERSONAL_MOBILE");

    expect(result).toEqual(expect.objectContaining({ success: true, phone: "01012345678" }));
    expect(result.message).toContain("12시간 동안 한 번만");
    expect(result.smsHref).toContain("sms:01012345678");
    const updateCall = prismaMock.accountRecoveryRequest.update.mock.calls[0][0];
    expect(updateCall.data.tokenHash).toHaveLength(64);
    expect(result.message).not.toContain(updateCall.data.tokenHash);
    expect(updateCall.data.deliveryMethod).toBe("PERSONAL_MOBILE");
  });

  it("completes password help after sending guidance for a Google-only account", async () => {
    const { markAccountRecoverySentAction } = await import("@/lib/account-recovery-actions");
    prismaMock.accountRecoveryRequest.findUnique.mockResolvedValue({
      id: "recovery-1",
      requestType: "PASSWORD_RESET",
      status: "PENDING",
      tokenExpiresAt: null,
    });

    const result = await markAccountRecoverySentAction("recovery-1", "OFFICE_MOBILE");

    expect(result.success).toBe(true);
    expect(prismaMock.accountRecoveryRequest.update).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ status: "COMPLETED", completedAt: expect.any(Date) }),
    }));
  });

  it("consumes a reset link once, changes the password, and revokes sessions", async () => {
    const { createAccountRecoveryToken, hashAccountRecoveryToken, getAccountRecoveryTokenExpiry } = await import("@/lib/account-recovery");
    const { resetPasswordWithTokenAction } = await import("@/lib/account-recovery-actions");
    const token = createAccountRecoveryToken();
    prismaMock.accountRecoveryRequest.findUnique.mockResolvedValue({
      id: "recovery-1",
      userId: "member-1",
      status: "SENT",
      tokenExpiresAt: getAccountRecoveryTokenExpiry(),
      tokenUsedAt: null,
      user: { loginId: "01012345678", phone: "01012345678", isActive: true },
    });
    const formData = new FormData();
    formData.set("token", token);
    formData.set("newPassword", "654321");
    formData.set("newPasswordConfirm", "654321");

    const result = await resetPasswordWithTokenAction(null, formData);

    expect(result).toEqual(expect.objectContaining({ success: true }));
    expect(transactionMock.accountRecoveryRequest.updateMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ tokenHash: hashAccountRecoveryToken(token), tokenUsedAt: null }),
      data: expect.objectContaining({ status: "COMPLETED", tokenHash: null }),
    }));
    expect(transactionMock.user.update).toHaveBeenCalledWith({
      where: { id: "member-1" },
      data: { passwordHash: expect.any(String), authVersion: { increment: 1 } },
    });
    expect(cookieSet).toHaveBeenCalledWith("session", "", expect.objectContaining({ path: "/" }));
  });
});
