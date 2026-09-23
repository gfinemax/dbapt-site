import { createHash, randomBytes } from "node:crypto";
import { normalizePhoneLoginId } from "@/lib/signup-password";

export const ACCOUNT_RECOVERY_TOKEN_HOURS = 12;
export const ACCOUNT_RECOVERY_GENERIC_MESSAGE =
  "요청이 접수되었습니다. 입력하신 정보와 일치하는 계정이 확인되면 사무국에서 등록된 휴대전화로 안내해 드립니다.";

export type AccountRecoveryType = "ID_LOOKUP" | "PASSWORD_RESET";
export type AccountRecoveryDeliveryMethod = "OFFICE_MOBILE" | "PERSONAL_MOBILE";

export function normalizeRecoveryName(value: string) {
  return value.replace(/[\u0000-\u001f\u007f]/g, "").trim().replace(/\s+/g, " ");
}

export function normalizeRecoveryPhone(value: string) {
  return normalizePhoneLoginId(value);
}

export function getPhoneLast4(phone: string) {
  const normalized = normalizeRecoveryPhone(phone);
  return normalized ? normalized.slice(-4) : "";
}

export function maskRecoveryPhone(phone: string) {
  const normalized = normalizeRecoveryPhone(phone);
  return normalized ? `${normalized.slice(0, 3)}-****-${normalized.slice(-4)}` : "등록 번호 확인 필요";
}

export function createAccountRecoveryToken() {
  return randomBytes(32).toString("base64url");
}

export function hashAccountRecoveryToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function getAccountRecoveryTokenExpiry(now = new Date()) {
  return new Date(now.getTime() + ACCOUNT_RECOVERY_TOKEN_HOURS * 60 * 60 * 1000);
}

export function isAccountRecoveryTokenUsable(input: {
  status: string;
  tokenExpiresAt: Date | null;
  tokenUsedAt: Date | null;
}, now = new Date()) {
  return (
    (input.status === "LINK_CREATED" || input.status === "SENT") &&
    !input.tokenUsedAt &&
    Boolean(input.tokenExpiresAt && input.tokenExpiresAt.getTime() > now.getTime())
  );
}

export function buildIdLookupSms(input: { name: string; loginId: string }) {
  return `[대방동지역주택조합]\n${input.name}님, 요청하신 로그인 아이디는 ${input.loginId}입니다.\n\n본인이 요청하지 않으셨다면 이 메시지를 삭제하시고 사무국으로 문의해 주세요.`;
}

export function buildPasswordResetSms(input: { name: string; resetUrl: string }) {
  return `[대방동지역주택조합]\n${input.name}님, 요청하신 비밀번호 재설정 안내입니다.\n\n아래 링크는 발급 후 12시간 동안 한 번만 사용할 수 있습니다.\n${input.resetUrl}\n\n직접 요청하지 않으셨다면 링크를 누르지 마시고 사무국으로 문의해 주세요.`;
}

export function buildSmsHref(phone: string, message: string) {
  const normalized = normalizeRecoveryPhone(phone);
  if (!normalized) return "";
  return `sms:${normalized}?body=${encodeURIComponent(message)}`;
}
