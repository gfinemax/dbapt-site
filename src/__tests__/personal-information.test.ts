import { describe, expect, it } from "vitest";
import {
  decryptPersonalInfo,
  encryptPersonalInfo,
  getCurrentPersonalInfoValue,
  isLedgerCorrectionField,
  maskPersonalInfo,
  normalizePersonalInfoValue,
  requiresPeopleOnReflection,
} from "@/lib/personal-information";

describe("personal information policy", () => {
  it("encrypts stored history and can recover the original value", () => {
    const encrypted = encryptPersonalInfo("서울특별시 동작구 대방동 100");
    expect(encrypted).not.toContain("대방동");
    expect(decryptPersonalInfo(encrypted)).toBe("서울특별시 동작구 대방동 100");
  });

  it("normalizes and validates contact values", () => {
    expect(normalizePersonalInfoValue("phone", "010-1234-5678")).toBe("01012345678");
    expect(normalizePersonalInfoValue("email", "member@example.com")).toBe("member@example.com");
    expect(() => normalizePersonalInfoValue("phone", "02-123-4567")).toThrow("올바른 휴대전화 번호");
    expect(() => normalizePersonalInfoValue("birthDate", "2026/08/23")).toThrow("YYYY-MM-DD");
  });

  it("masks contact, address, birth date, and account history", () => {
    expect(maskPersonalInfo("phone", "01012345678")).toBe("010-****-5678");
    expect(maskPersonalInfo("email", "member@example.com")).toBe("me***@example.com");
    expect(maskPersonalInfo("birthDate", "1980-03-04")).toBe("1980-**-**");
    expect(maskPersonalInfo("refundAccount", "국민 1234567890")).toBe("계좌 등록됨 · 끝 7890");
    expect(maskPersonalInfo("address", "서울특별시 동작구 대방동 100")).toContain("…");
    expect(maskPersonalInfo("memberStatus", "MEMBER")).toBe("정식 조합원");
  });

  it("separates ledger corrections and notification-only changes", () => {
    expect(isLedgerCorrectionField("selectedUnit")).toBe(true);
    expect(isLedgerCorrectionField("memberStatus")).toBe(true);
    expect(requiresPeopleOnReflection("phone")).toBe(true);
    expect(requiresPeopleOnReflection("notificationSmsOptIn")).toBe(false);
  });

  it("does not return a selected unit for refund members", () => {
    expect(getCurrentPersonalInfoValue("selectedUnit", {
      user: { name: "환불 조합원", phone: null, email: null, role: "REFUND" },
      profile: null,
      selectedUnit: "84㎡",
    })).toBe("");
  });
});
