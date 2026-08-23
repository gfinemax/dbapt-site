export const DEFAULT_PEOPLEON_PROFILE_API_URL = "https://people-on.vercel.app/api/integrations/ledger/members";

export type PeopleOnMemberProfile = {
  peopleon_id: string;
  member_id: string | null;
  name: string;
  phone: string | null;
  address: string | null;
  status: string | null;
  display_status: string;
  unit_group: string | null;
  birth_date: string | null;
  joined_at: string | null;
  certificate_numbers: string[];
  certificate_display: string | null;
  is_registered: boolean;
  tier: string | null;
  related_names: Array<{ name: string; relation: string; phone: string | null }>;
  refund_account: {
    bank_name: string;
    account_number: string;
    account_holder: string;
    purpose: string;
    updated_at: string;
  } | null;
};

type PeopleOnProfilePayload = {
  success?: boolean;
  generated_at?: string;
  members?: PeopleOnMemberProfile[];
  error?: string;
};

export function getPeopleOnApiKey() {
  const multipleKeys = process.env.PEOPLEON_MEMBERS_API_KEYS?.split(",").map((key) => key.trim()).filter(Boolean);
  if (multipleKeys?.length) return multipleKeys[0];
  return process.env.PEOPLEON_MEMBERS_API_KEY?.trim() || "";
}

export async function fetchPeopleOnMemberProfile({
  externalMemberId,
  apiUrl = process.env.PEOPLEON_PROFILE_API_URL?.trim() || DEFAULT_PEOPLEON_PROFILE_API_URL,
  apiKey = getPeopleOnApiKey(),
  fetchImpl = fetch,
}: {
  externalMemberId: string;
  apiUrl?: string;
  apiKey?: string;
  fetchImpl?: typeof fetch;
}) {
  if (!externalMemberId || !apiKey) return { member: null, generatedAt: null, status: "NOT_CONFIGURED" as const };

  const response = await fetchImpl(apiUrl, {
    headers: { "X-API-Key": apiKey },
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`PeopleON API request failed with status ${response.status}.`);

  const payload = (await response.json()) as PeopleOnProfilePayload;
  if (payload.success === false) throw new Error(payload.error || "PeopleON API request failed.");

  const id = String(externalMemberId);
  const members = payload.members || [];
  const directMatch = members.find((member) => String(member.peopleon_id) === id);
  const legacyMatches = members.filter((member) => member.member_id != null && String(member.member_id) === id);
  const member = directMatch || (legacyMatches.length === 1 ? legacyMatches[0] : null);

  return {
    member,
    generatedAt: payload.generated_at || null,
    status: member ? "CONNECTED" as const : "NOT_FOUND" as const,
  };
}
