const SEARCH_SEPARATOR_PATTERN = /[\s\u00a0·ㆍ/／\\|_\-–—:;,.()[\]{}"'“”‘’]+/g;

export function normalizeSearchText(value: string) {
  return value
    .normalize("NFKC")
    .toLocaleLowerCase("ko-KR")
    .replace(SEARCH_SEPARATOR_PATTERN, "");
}

export function getSearchQueryTerms(query: string) {
  const normalizedQuery = normalizeSearchText(query);
  return normalizedQuery ? [normalizedQuery] : [];
}

export function searchTextMatchesQuery(text: string, query: string) {
  const normalizedText = normalizeSearchText(text);
  return getSearchQueryTerms(query).some((term) => normalizedText.includes(term));
}
