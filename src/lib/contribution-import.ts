type SessionUser = {
  id: string;
  role: string;
};

export type PaymentImportInputRow = {
  loginId?: unknown;
  memberName?: unknown;
  totalDue?: unknown;
  totalPaid?: unknown;
  unpaidAmount?: unknown;
  overdueAmount?: unknown;
  lateFee?: unknown;
  nextDueDate?: unknown;
  status?: unknown;
  noticeMessage?: unknown;
};

export type MatchedContributionUser = {
  id: string;
  loginId: string | null;
  name: string | null;
  role: string;
};

export type NormalizedPaymentImportRow = {
  loginId: string;
  memberName: string | null;
  targetUserId: string | null;
  totalDue: number;
  totalPaid: number;
  unpaidAmount: number;
  overdueAmount: number;
  lateFee: number;
  nextDueDate: Date | null;
  status: string;
  noticeMessage: string | null;
  validationStatus: string;
  validationMessage: string | null;
};

export function requireAdminSession(session: SessionUser | null) {
  if (!session) {
    return { ok: false as const, status: 401, error: "로그인이 필요합니다." };
  }

  if (session.role !== "ADMIN") {
    return { ok: false as const, status: 403, error: "관리자 권한이 필요합니다." };
  }

  return { ok: true as const };
}

export function parsePaymentImportRows(rows: unknown): PaymentImportInputRow[] | null {
  if (!Array.isArray(rows) || rows.length === 0) return null;
  return rows as PaymentImportInputRow[];
}

export function collectLoginIds(rows: PaymentImportInputRow[]) {
  return Array.from(
    new Set(
      rows
        .map((row) => stringValue(row.loginId))
        .filter((loginId): loginId is string => !!loginId),
    ),
  );
}

export function normalizePaymentImportRows(
  rows: PaymentImportInputRow[],
  users: MatchedContributionUser[],
) {
  const userByLoginId = new Map(
    users
      .filter((user) => user.loginId)
      .map((user) => [user.loginId as string, user]),
  );

  const normalizedRows = rows.map((row) => {
    const errors: string[] = [];
    const loginId = stringValue(row.loginId) || "";
    const matchedUser = userByLoginId.get(loginId);
    const totalDue = nonNegativeInteger(row.totalDue, "총 고지액", errors);
    const totalPaid = nonNegativeInteger(row.totalPaid, "총 납부액", errors);
    const unpaidAmount = nonNegativeInteger(row.unpaidAmount, "미납액", errors);
    const overdueAmount = nonNegativeInteger(row.overdueAmount, "연체 미납액", errors);
    const lateFee = nonNegativeInteger(row.lateFee, "연체료", errors);
    const nextDueDate = dateValue(row.nextDueDate, "납부기한", errors);

    if (!loginId) errors.push("회원번호가 누락되었습니다.");
    if (loginId && !matchedUser) errors.push("회원번호와 일치하는 활성 계정을 찾을 수 없습니다.");
    if (matchedUser && !["MEMBER", "REFUND"].includes(matchedUser.role)) {
      errors.push("정식 조합원 또는 환불 조합원만 납부자료 반영 대상입니다.");
    }

    const inferredStatus = inferContributionStatus(unpaidAmount, overdueAmount);
    const requestedStatus = stringValue(row.status);
    const status = requestedStatus && ["NORMAL", "UNPAID", "OVERDUE"].includes(requestedStatus)
      ? requestedStatus
      : inferredStatus;

    return {
      loginId,
      memberName: stringValue(row.memberName) || matchedUser?.name || null,
      targetUserId: matchedUser?.id || null,
      totalDue,
      totalPaid,
      unpaidAmount,
      overdueAmount,
      lateFee,
      nextDueDate,
      status,
      noticeMessage: stringValue(row.noticeMessage),
      validationStatus: errors.length > 0 ? "ERROR" : "VALID",
      validationMessage: errors.length > 0 ? errors.join(" ") : null,
    };
  });

  return {
    rows: normalizedRows,
    errorCount: normalizedRows.filter((row) => row.validationStatus === "ERROR").length,
  };
}

export function inferContributionStatus(unpaidAmount: number, overdueAmount: number) {
  if (overdueAmount > 0) return "OVERDUE";
  if (unpaidAmount > 0) return "UNPAID";
  return "NORMAL";
}

export function buildNoticeDraft(row: NormalizedPaymentImportRow, sourceBatchId: string) {
  const type = row.overdueAmount > 0 ? "OVERDUE" : "UNPAID";
  const title = type === "OVERDUE" ? "연체 미납금 납부 안내" : "미납금 납부 안내";
  const message =
    row.noticeMessage ||
    `${row.memberName || row.loginId}님의 미납금 ${row.unpaidAmount.toLocaleString()}원${
      row.overdueAmount > 0 ? ` 중 연체 미납금 ${row.overdueAmount.toLocaleString()}원` : ""
    }이 확인되었습니다. 납부기한과 안내 문구를 관리자 승인 후 발송할 수 있습니다.`;

  return {
    userId: row.targetUserId as string,
    sourceBatchId,
    type,
    status: "DRAFT",
    title,
    message,
    unpaidAmount: row.unpaidAmount,
    overdueAmount: row.overdueAmount,
    lateFee: row.lateFee,
    dueDate: row.nextDueDate,
  };
}

function stringValue(value: unknown) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed || null;
}

function nonNegativeInteger(value: unknown, label: string, errors: string[]) {
  if (value === undefined || value === null || value === "") return 0;
  const numberValue = typeof value === "number" ? value : Number(value);
  if (!Number.isInteger(numberValue) || numberValue < 0) {
    errors.push(`${label}은 0 이상의 정수여야 합니다.`);
    return 0;
  }
  return numberValue;
}

function dateValue(value: unknown, label: string, errors: string[]) {
  if (value === undefined || value === null || value === "") return null;
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value;
  if (typeof value !== "string") {
    errors.push(`${label} 형식이 올바르지 않습니다.`);
    return null;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    errors.push(`${label} 형식이 올바르지 않습니다.`);
    return null;
  }
  return parsed;
}
