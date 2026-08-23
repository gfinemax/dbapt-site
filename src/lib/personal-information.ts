import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import type { Prisma } from "@prisma/client";

export const PERSONAL_INFO_FIELDS = [
  "name",
  "phone",
  "email",
  "address",
  "mailingAddress",
  "birthDate",
  "coOwner",
  "refundAccount",
  "notificationSmsOptIn",
  "notificationEmailOptIn",
  "selectedUnit",
  "buildingUnit",
  "memberStatus",
] as const;

export type PersonalInfoField = (typeof PERSONAL_INFO_FIELDS)[number];

export const personalInfoFieldLabels: Record<PersonalInfoField, string> = {
  name: "성명",
  phone: "휴대전화",
  email: "이메일",
  address: "주소",
  mailingAddress: "우편물 수령지",
  birthDate: "생년월일",
  coOwner: "공동명의 정보",
  refundAccount: "환불계좌",
  notificationSmsOptIn: "문자 수신",
  notificationEmailOptIn: "이메일 수신",
  selectedUnit: "신청 평형",
  buildingUnit: "동·호수",
  memberStatus: "조합원 자격",
};

const booleanFields = new Set<PersonalInfoField>(["notificationSmsOptIn", "notificationEmailOptIn"]);
const ledgerFields = new Set<PersonalInfoField>(["selectedUnit", "buildingUnit", "memberStatus"]);

export function isPersonalInfoField(value: unknown): value is PersonalInfoField {
  return typeof value === "string" && PERSONAL_INFO_FIELDS.includes(value as PersonalInfoField);
}

export function requiresPeopleOnReflection(field: PersonalInfoField) {
  return !booleanFields.has(field);
}

export function isLedgerCorrectionField(field: PersonalInfoField) {
  return ledgerFields.has(field);
}

export function normalizePersonalInfoValue(field: PersonalInfoField, value: unknown) {
  if (booleanFields.has(field)) {
    if (value === true || value === "true") return "true";
    if (value === false || value === "false") return "false";
    throw new Error("수신 설정 값이 올바르지 않습니다.");
  }

  if (typeof value !== "string") throw new Error("변경할 값을 입력해주세요.");
  const clean = value.replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim();
  if (!clean) throw new Error("변경할 값을 입력해주세요.");
  if (clean.length > 300) throw new Error("변경할 값은 300자 이내로 입력해주세요.");

  if (field === "phone") {
    const digits = clean.replace(/\D/g, "");
    if (!/^01[016789]\d{7,8}$/.test(digits)) throw new Error("올바른 휴대전화 번호를 입력해주세요.");
    return digits;
  }
  if (field === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) {
    throw new Error("올바른 이메일 주소를 입력해주세요.");
  }
  if (field === "birthDate" && !/^\d{4}-\d{2}-\d{2}$/.test(clean)) {
    throw new Error("생년월일은 YYYY-MM-DD 형식으로 입력해주세요.");
  }
  return clean;
}

function encryptionKey() {
  const source = process.env.PROFILE_ENCRYPTION_KEY || process.env.JWT_SECRET;
  if (!source && process.env.NODE_ENV === "production") {
    throw new Error("PROFILE_ENCRYPTION_KEY가 설정되지 않았습니다.");
  }
  return createHash("sha256").update(source || "dbapt-local-profile-key").digest();
}

export function encryptPersonalInfo(value: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return ["v1", iv.toString("base64url"), tag.toString("base64url"), encrypted.toString("base64url")].join(".");
}

export function decryptPersonalInfo(value?: string | null) {
  if (!value) return "";
  const [version, iv, tag, encrypted] = value.split(".");
  if (version !== "v1" || !iv || !tag || !encrypted) return "";
  const decipher = createDecipheriv("aes-256-gcm", encryptionKey(), Buffer.from(iv, "base64url"));
  decipher.setAuthTag(Buffer.from(tag, "base64url"));
  return Buffer.concat([decipher.update(Buffer.from(encrypted, "base64url")), decipher.final()]).toString("utf8");
}

export function maskPersonalInfo(field: PersonalInfoField, value: string) {
  if (!value) return "등록되지 않음";
  if (booleanFields.has(field)) return value === "true" ? "수신" : "수신 안 함";
  if (field === "phone") {
    const digits = value.replace(/\D/g, "");
    return digits.length >= 8 ? `${digits.slice(0, 3)}-****-${digits.slice(-4)}` : "연락처 등록됨";
  }
  if (field === "email") {
    const [name, domain] = value.split("@");
    return domain ? `${name.slice(0, 2)}***@${domain}` : "이메일 등록됨";
  }
  if (field === "birthDate") return `${value.slice(0, 4)}-**-**`;
  if (field === "refundAccount") return `계좌 등록됨 · 끝 ${value.replace(/\D/g, "").slice(-4) || "****"}`;
  if (["address", "mailingAddress"].includes(field)) return value.length > 8 ? `${value.slice(0, 8)}…` : "주소 등록됨";
  if (field === "coOwner") return "공동명의 정보 등록됨";
  if (field === "memberStatus") {
    return ({ MEMBER: "정식 조합원", REFUND: "환불 조합원", ASSOCIATE: "관계자/기타", PENDING: "승인 대기" } as Record<string, string>)[value] || value;
  }
  return value;
}

type CurrentProfileSource = {
  user: { name: string | null; phone: string | null; email: string | null; role: string };
  profile: {
    addressEncrypted: string | null;
    mailingAddressEncrypted: string | null;
    birthDateEncrypted: string | null;
    coOwnerEncrypted: string | null;
    refundAccountEncrypted: string | null;
    notificationSmsOptIn: boolean;
    notificationEmailOptIn: boolean;
    buildingUnitLabel: string | null;
  } | null;
  selectedUnit: string | null;
};

export function getCurrentPersonalInfoValue(field: PersonalInfoField, source: CurrentProfileSource) {
  switch (field) {
    case "name": return (source.user.name || "").replace(/\s*\((?:정식조합원|환불조합원|탈퇴조합원)\)\s*$/, "");
    case "phone": return source.user.phone || "";
    case "email": return source.user.email || "";
    case "address": return decryptPersonalInfo(source.profile?.addressEncrypted);
    case "mailingAddress": return decryptPersonalInfo(source.profile?.mailingAddressEncrypted);
    case "birthDate": return decryptPersonalInfo(source.profile?.birthDateEncrypted);
    case "coOwner": return decryptPersonalInfo(source.profile?.coOwnerEncrypted);
    case "refundAccount": return decryptPersonalInfo(source.profile?.refundAccountEncrypted);
    case "notificationSmsOptIn": return String(source.profile?.notificationSmsOptIn || false);
    case "notificationEmailOptIn": return String(source.profile?.notificationEmailOptIn || false);
    case "selectedUnit": return source.user.role === "REFUND" ? "" : source.selectedUnit || "";
    case "buildingUnit": return source.profile?.buildingUnitLabel || "";
    case "memberStatus": return source.user.role;
  }
}

export async function applyApprovedPersonalInfo(
  tx: Prisma.TransactionClient,
  userId: string,
  field: PersonalInfoField,
  value: string,
) {
  if (isLedgerCorrectionField(field)) return;
  if (field === "name" || field === "phone" || field === "email") {
    await tx.user.update({ where: { id: userId }, data: { [field]: value } });
    return;
  }

  const data: {
    addressEncrypted?: string;
    mailingAddressEncrypted?: string;
    birthDateEncrypted?: string;
    coOwnerEncrypted?: string;
    refundAccountEncrypted?: string;
    notificationSmsOptIn?: boolean;
    notificationEmailOptIn?: boolean;
  } = {};
  if (field === "address") data.addressEncrypted = encryptPersonalInfo(value);
  if (field === "mailingAddress") data.mailingAddressEncrypted = encryptPersonalInfo(value);
  if (field === "birthDate") data.birthDateEncrypted = encryptPersonalInfo(value);
  if (field === "coOwner") data.coOwnerEncrypted = encryptPersonalInfo(value);
  if (field === "refundAccount") data.refundAccountEncrypted = encryptPersonalInfo(value);
  if (field === "notificationSmsOptIn") data.notificationSmsOptIn = value === "true";
  if (field === "notificationEmailOptIn") data.notificationEmailOptIn = value === "true";
  await tx.memberPersonalProfile.upsert({
    where: { userId },
    create: { userId, ...data },
    update: data,
  });
}
