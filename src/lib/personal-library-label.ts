type PersonalLibrarySession = {
  name?: string | null;
  role?: string | null;
} | null | undefined;

export function getPersonalLibraryLabel(session: PersonalLibrarySession) {
  if (session?.role?.trim().toUpperCase() === "ADMIN") {
    return "운영 문서 관리실";
  }
  const name = session?.name?.trim();
  return name ? `${name} 개인 자료실` : "개인 자료실";
}

export function getPersonalLibraryActionLabel(session: PersonalLibrarySession) {
  return `${getPersonalLibraryLabel(session)} 열기`;
}
