type DemoAccountInput = {
  name?: string | null;
  loginId?: string | null;
  role?: string | null;
};

const APPROVED_ACCOUNT_ROLES = new Set(["MEMBER", "REFUND", "ASSOCIATE"]);
const DEMO_LOGIN_IDS = new Set(["member1", "refund1"]);

export function isDemoApprovedAccount(account: DemoAccountInput) {
  const role = account.role?.trim().toUpperCase();
  if (!role || !APPROVED_ACCOUNT_ROLES.has(role)) return false;

  const loginId = account.loginId?.trim() || "";

  return DEMO_LOGIN_IDS.has(loginId);
}
