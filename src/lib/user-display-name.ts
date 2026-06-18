export type DisplayNameUser = {
  signupName?: string | null;
  name?: string | null;
};

export function getUserDisplayName(user: DisplayNameUser, fallback = "조합원") {
  return user.signupName?.trim() || user.name?.trim() || fallback;
}
