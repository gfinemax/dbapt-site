import { getContentAuthorLabel } from "@/lib/content-author-label";

export const NEWS_DISPLAY_AUTHOR_NAMES = ["운영자", "사무국"] as const;

export type NewsDisplayAuthorName = (typeof NEWS_DISPLAY_AUTHOR_NAMES)[number];

export function parseNewsDisplayAuthorName(value: unknown) {
  if (value === undefined || value === null || value === "") {
    return { ok: true as const, value: null };
  }

  if (
    typeof value === "string" &&
    NEWS_DISPLAY_AUTHOR_NAMES.includes(value as NewsDisplayAuthorName)
  ) {
    return { ok: true as const, value: value as NewsDisplayAuthorName };
  }

  return {
    ok: false as const,
    error: "작성자는 사무국 또는 운영자 중에서 선택해 주세요.",
  };
}

export function getNewsDisplayAuthorName(news: {
  displayAuthorName?: string | null;
  author?: {
    id?: string | null;
    name?: string | null;
    signupName?: string | null;
    loginId?: string | null;
    role?: string | null;
    memberType?: string | null;
    displayAuthorName?: string | null;
  } | null;
}) {
  return getContentAuthorLabel(
    { ...news.author, displayAuthorName: news.displayAuthorName ?? news.author?.displayAuthorName },
    null,
    { adminFallback: "운영자" },
  );
}
