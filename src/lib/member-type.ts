export type MemberType = "REGULAR" | "PRELIMINARY" | "REFUND" | "ASSOCIATE";

export function normalizeMemberType(memberType?: string | null, role?: string | null): MemberType {
  const normalized = (memberType || "").trim().toUpperCase();
  if (normalized === "PRELIMINARY") return "PRELIMINARY";
  if (normalized === "ASSOCIATE" || role === "ASSOCIATE") return "ASSOCIATE";
  if (normalized === "REFUND" || role === "REFUND") return "REFUND";
  return "REGULAR";
}

export function getMemberTypeLabel(memberType?: string | null, role?: string | null) {
  switch (normalizeMemberType(memberType, role)) {
    case "PRELIMINARY":
      return "예비조합원";
    case "REFUND":
      return "환불조합원";
    case "ASSOCIATE":
      return "관계자/기타 승인 계정";
    default:
      return "정식조합원";
  }
}
