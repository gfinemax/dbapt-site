import { describe, expect, it } from "vitest";
import {
  ACCOUNT_RECOVERY_TOKEN_HOURS,
  buildIdLookupSms,
  buildPasswordResetSms,
  buildSmsHref,
  createAccountRecoveryToken,
  getAccountRecoveryTokenExpiry,
  hashAccountRecoveryToken,
  isAccountRecoveryTokenUsable,
  maskRecoveryPhone,
  normalizeRecoveryName,
  normalizeRecoveryPhone,
} from "@/lib/account-recovery";

describe("account recovery policy", () => {
  it("normalizes exact member identity inputs without matching by name alone", () => {
    expect(normalizeRecoveryName("  홍   길동 ")).toBe("홍 길동");
    expect(normalizeRecoveryPhone("010-1234-5678")).toBe("01012345678");
    expect(normalizeRecoveryPhone("02-123-4567")).toBeNull();
    expect(maskRecoveryPhone("01012345678")).toBe("010-****-5678");
  });

  it("creates opaque tokens and stores only stable hashes", () => {
    const token = createAccountRecoveryToken();
    expect(token.length).toBeGreaterThan(32);
    expect(hashAccountRecoveryToken(token)).toHaveLength(64);
    expect(hashAccountRecoveryToken(token)).not.toContain(token);
  });

  it("expires a single-use reset link after twelve hours", () => {
    const now = new Date("2026-09-24T00:00:00.000Z");
    const expiresAt = getAccountRecoveryTokenExpiry(now);
    expect(expiresAt.getTime() - now.getTime()).toBe(ACCOUNT_RECOVERY_TOKEN_HOURS * 60 * 60 * 1000);
    expect(isAccountRecoveryTokenUsable({ status: "LINK_CREATED", tokenExpiresAt: expiresAt, tokenUsedAt: null }, now)).toBe(true);
    expect(isAccountRecoveryTokenUsable({ status: "COMPLETED", tokenExpiresAt: expiresAt, tokenUsedAt: now }, now)).toBe(false);
    expect(isAccountRecoveryTokenUsable({ status: "SENT", tokenExpiresAt: expiresAt, tokenUsedAt: null }, expiresAt)).toBe(false);
  });

  it("builds friendly ID and password messages and a mobile SMS link", () => {
    const idMessage = buildIdLookupSms({ name: "홍길동", loginId: "member1001" });
    const resetMessage = buildPasswordResetSms({ name: "홍길동", resetUrl: "https://example.com/reset-password/token" });
    expect(idMessage).toContain("로그인 아이디는 member1001");
    expect(resetMessage).toContain("12시간 동안 한 번만");
    expect(resetMessage).toContain("https://example.com/reset-password/token");
    expect(buildSmsHref("010-1234-5678", resetMessage)).toMatch(/^sms:01012345678\?body=/);
  });
});
