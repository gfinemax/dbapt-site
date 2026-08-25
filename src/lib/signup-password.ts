export function normalizePhoneLoginId(value: string) {
  const digits = value.replace(/\D/g, "");
  return /^010\d{8}$/.test(digits) ? digits : null;
}

export function normalizeLoginIdentifier(value: string) {
  const trimmed = value.trim();
  return normalizePhoneLoginId(trimmed) ?? trimmed;
}

export function validateSignupPassword(password: string, phone?: string) {
  void phone;

  if (!/^\d{6}$/.test(password)) {
    return { valid: false, error: "비밀번호는 숫자 6자리로 입력해 주세요." };
  }

  return { valid: true };
}
