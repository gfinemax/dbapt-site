type UserContactDisplayInput = {
  email?: string | null;
  phone?: string | null;
  signupPhone?: string | null;
  loginId?: string | null;
};

function formatPhone(digits: string) {
  if (/^010\d{8}$/.test(digits)) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  }

  return digits;
}

function normalizePhone(value?: string | null) {
  const digits = (value || "").replace(/\D/g, "");
  return digits.length >= 8 ? digits : "";
}

export function getUserContactDisplay({ email, phone, signupPhone, loginId }: UserContactDisplayInput) {
  const normalizedEmail = email?.trim();
  if (normalizedEmail) return normalizedEmail;

  const phoneCandidate = normalizePhone(phone) || normalizePhone(signupPhone) || normalizePhone(loginId);
  if (phoneCandidate) return formatPhone(phoneCandidate);

  return "연락처 없음";
}
