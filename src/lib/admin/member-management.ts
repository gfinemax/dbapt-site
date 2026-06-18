import { normalizeMemberType, type MemberType } from "@/lib/member-type";

export type PeopleOnMemberRow = {
  id: string;
  name: string;
  email?: string | null;
  phone: string | null;
  display_status: string;
  status?: string | null;
  is_registered: boolean;
  is_settlement_eligible: boolean;
  tier?: string | null;
  tiers?: string[] | null;
  settlement_remaining?: number;
  settlement_expected?: number;
};

export type HomepageMemberAccount = {
  id: string;
  name: string | null;
  signupName?: string | null;
  email: string | null;
  loginId: string | null;
  phone: string | null;
  signupPhone: string | null;
  role: string;
  memberType?: string | null;
  isActive: boolean;
  createdAt: string;
};

export type MemberMatchStatus = "MATCHED" | "PENDING" | "MISSING" | "ROLE_MISMATCH";
export type ExpectedHomepageRole = "MEMBER" | "REFUND";
export type ExpectedMemberType = MemberType;

export type MemberManagementActionRow = {
  peopleOnId: string;
  peopleOnName: string;
  peopleOnPhone: string | null;
  peopleOnStatus: string;
  expectedRole: ExpectedHomepageRole;
  expectedMemberType: ExpectedMemberType;
  matchStatus: MemberMatchStatus;
  matchedUserId: string | null;
  matchedUserName: string | null;
  matchedUserEmail: string | null;
  matchedUserRole: string | null;
  matchedUserActive: boolean | null;
  createdAt: string | null;
};

export type MemberManagementSnapshot = {
  generatedAt: string;
  stats: {
    registeredPeopleOnCount: number;
    refundPeopleOnCount: number;
    preliminaryPeopleOnCount: number;
    trackedPeopleOnCount: number;
    homepageApprovedCount: number;
    homepagePendingCount: number;
    missingHomepageCount: number;
    roleMismatchCount: number;
  };
  actionRows: MemberManagementActionRow[];
};

export type FetchPeopleOnMemberRowsResult = {
  rows: PeopleOnMemberRow[];
  generatedAt: string;
};

type MemberManagementSnapshotInput = {
  generatedAt: string;
  peopleOnRows: PeopleOnMemberRow[];
  homepageUsers: HomepageMemberAccount[];
};

type FetchPeopleOnMemberRowsInput = {
  apiUrl: string;
  apiKey: string;
  fetchImpl?: typeof fetch;
};

type PeopleOnMembersTablePayload = {
  success?: boolean;
  generated_at?: string;
  rows?: PeopleOnMemberRow[];
  pagination?: {
    page?: number;
    total_pages?: number;
  };
  error?: string;
};

function normalizeComparableText(value: string | null | undefined) {
  return (value || "").replace(/\s+/g, "").toLowerCase();
}

function getPeopleOnStatusText(row: PeopleOnMemberRow) {
  return [
    row.display_status,
    row.status,
    row.tier,
    ...(row.tiers || []),
  ].map(normalizeComparableText).join(" ");
}

function normalizePhone(value: string | null | undefined) {
  const digits = (value || "").replace(/\D/g, "");
  return digits.length >= 8 ? digits : "";
}

function getPhoneLast4(value: string | null | undefined) {
  const phone = normalizePhone(value);
  return phone.length >= 4 ? phone.slice(-4) : "";
}

function getHomepageComparableName(user: HomepageMemberAccount) {
  return normalizeComparableText(user.signupName || user.name);
}

function getHomepageDisplayName(user: HomepageMemberAccount) {
  return user.signupName?.trim() || user.name || null;
}

function isPreliminaryPeopleOnRow(row: PeopleOnMemberRow) {
  const statusText = getPeopleOnStatusText(row);
  return statusText.includes("예비조합원") || statusText.includes("예비");
}

function getExpectedMemberType(row: PeopleOnMemberRow): ExpectedMemberType | null {
  if (row.is_settlement_eligible) return "REFUND";
  if (isPreliminaryPeopleOnRow(row)) return "PRELIMINARY";
  if (row.is_registered) return "REGULAR";
  return null;
}

function getExpectedRole(row: PeopleOnMemberRow): ExpectedHomepageRole | null {
  const expectedMemberType = getExpectedMemberType(row);
  if (expectedMemberType === "REFUND") return "REFUND";
  if (expectedMemberType === "REGULAR" || expectedMemberType === "PRELIMINARY") return "MEMBER";
  return null;
}

function isTrackedPeopleOnRow(row: PeopleOnMemberRow) {
  return Boolean(getExpectedMemberType(row));
}

function findMatchedHomepageUser(row: PeopleOnMemberRow, homepageUsers: HomepageMemberAccount[]) {
  const rowEmail = normalizeComparableText(row.email);
  if (rowEmail) {
    const emailMatch = homepageUsers.find((user) => normalizeComparableText(user.email) === rowEmail);
    if (emailMatch) return emailMatch;
  }

  const rowPhone = normalizePhone(row.phone);
  if (rowPhone) {
    const phoneMatch = homepageUsers.find((user) => {
      const candidates = [user.phone, user.signupPhone, user.loginId].map(normalizePhone);
      return candidates.includes(rowPhone);
    });
    if (phoneMatch) return phoneMatch;
  }

  const rowName = normalizeComparableText(row.name);
  const rowLast4 = getPhoneLast4(row.phone);
  if (rowName && rowLast4) {
    return homepageUsers.find((user) => {
      if (getHomepageComparableName(user) !== rowName) return false;
      return [user.phone, user.signupPhone, user.loginId].map(getPhoneLast4).includes(rowLast4);
    }) || null;
  }

  return null;
}

function getMatchStatus(
  expectedRole: ExpectedHomepageRole,
  expectedMemberType: ExpectedMemberType,
  matchedUser: HomepageMemberAccount | null,
): MemberMatchStatus {
  if (!matchedUser) return "MISSING";
  if (matchedUser.role === "PENDING") return "PENDING";
  if (matchedUser.role !== expectedRole) return "ROLE_MISMATCH";
  if (normalizeMemberType(matchedUser.memberType, matchedUser.role) !== expectedMemberType) return "ROLE_MISMATCH";
  return "MATCHED";
}

export function buildMemberManagementSnapshot({
  generatedAt,
  peopleOnRows,
  homepageUsers,
}: MemberManagementSnapshotInput): MemberManagementSnapshot {
  const trackedRows = peopleOnRows.filter(isTrackedPeopleOnRow);
  const actionRows: MemberManagementActionRow[] = [];

  for (const row of trackedRows) {
    const expectedRole = getExpectedRole(row);
    const expectedMemberType = getExpectedMemberType(row);
    if (!expectedRole || !expectedMemberType) continue;

    const matchedUser = findMatchedHomepageUser(row, homepageUsers);
    const matchStatus = getMatchStatus(expectedRole, expectedMemberType, matchedUser);

    if (matchStatus === "MATCHED") continue;

    actionRows.push({
      peopleOnId: row.id,
      peopleOnName: row.name,
      peopleOnPhone: row.phone,
      peopleOnStatus: row.display_status,
      expectedRole,
      expectedMemberType,
      matchStatus,
      matchedUserId: matchedUser?.id || null,
      matchedUserName: matchedUser ? getHomepageDisplayName(matchedUser) : null,
      matchedUserEmail: matchedUser?.email || null,
      matchedUserRole: matchedUser?.role || null,
      matchedUserActive: typeof matchedUser?.isActive === "boolean" ? matchedUser.isActive : null,
      createdAt: matchedUser?.createdAt || null,
    });
  }

  return {
    generatedAt,
    stats: {
      registeredPeopleOnCount: peopleOnRows.filter((row) => row.is_registered).length,
      refundPeopleOnCount: peopleOnRows.filter((row) => row.is_settlement_eligible).length,
      preliminaryPeopleOnCount: peopleOnRows.filter(isPreliminaryPeopleOnRow).length,
      trackedPeopleOnCount: trackedRows.length,
      homepageApprovedCount: homepageUsers.filter((user) => ["MEMBER", "REFUND", "ASSOCIATE"].includes(user.role)).length,
      homepagePendingCount: homepageUsers.filter((user) => user.role === "PENDING").length,
      missingHomepageCount: actionRows.filter((row) => row.matchStatus === "MISSING").length,
      roleMismatchCount: actionRows.filter((row) => row.matchStatus === "ROLE_MISMATCH").length,
    },
    actionRows,
  };
}

export async function fetchPeopleOnMemberRows({
  apiUrl,
  apiKey,
  fetchImpl = fetch,
}: FetchPeopleOnMemberRowsInput): Promise<FetchPeopleOnMemberRowsResult> {
  const rows: PeopleOnMemberRow[] = [];
  let page = 1;
  let totalPages = 1;
  let generatedAt = new Date().toISOString();

  do {
    const url = new URL(apiUrl);
    url.searchParams.set("page", String(page));
    url.searchParams.set("pageSize", "200");

    const response = await fetchImpl(url, {
      headers: {
        "X-API-Key": apiKey,
      },
    });

    if (!response.ok) {
      throw new Error(`PeopleOn API request failed with status ${response.status}.`);
    }

    const payload = (await response.json()) as PeopleOnMembersTablePayload;
    if (payload.success === false) {
      throw new Error(payload.error || "PeopleOn API request failed.");
    }

    rows.push(...(payload.rows || []));
    generatedAt = payload.generated_at || generatedAt;
    totalPages = Math.max(1, Number(payload.pagination?.total_pages || 1));
    page += 1;
  } while (page <= totalPages);

  return { rows, generatedAt };
}
