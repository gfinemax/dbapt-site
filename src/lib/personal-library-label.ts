type PersonalLibrarySession = {
  name?: string | null;
} | null | undefined;

export function getPersonalLibraryLabel(session: PersonalLibrarySession) {
  const name = session?.name?.trim();
  return name ? `${name} 개인 자료실` : "개인 자료실";
}

export function getPersonalLibraryActionLabel(session: PersonalLibrarySession) {
  return `${getPersonalLibraryLabel(session)} 열기`;
}
