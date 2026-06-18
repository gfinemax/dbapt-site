export const FREE_POST_TYPES = ["FREE", "DISCUSSION", "QUESTION", "PROPOSAL", "NOTICE"] as const;

export type FreePostType = (typeof FREE_POST_TYPES)[number];

export const freePostTypeMeta: Record<FreePostType, { label: string; badgeClassName: string }> = {
  FREE: {
    label: "자유글",
    badgeClassName: "bg-stone-surface text-charcoal-primary",
  },
  DISCUSSION: {
    label: "토론글",
    badgeClassName: "border border-meadow-green/20 bg-meadow-green/10 text-meadow-green",
  },
  QUESTION: {
    label: "질문",
    badgeClassName: "border border-sunburst-yellow/30 bg-sunburst-yellow/20 text-charcoal-primary",
  },
  PROPOSAL: {
    label: "제안",
    badgeClassName: "border border-ember-orange/20 bg-ember-orange/10 text-ember-orange",
  },
  NOTICE: {
    label: "운영안내",
    badgeClassName: "border border-sky-blue/20 bg-sky-blue/10 text-sky-blue",
  },
};

export function normalizeFreePostType(value: unknown, isAdmin = false): FreePostType {
  const raw = typeof value === "string" ? value.trim().toUpperCase() : "";
  const nextType = FREE_POST_TYPES.includes(raw as FreePostType) ? (raw as FreePostType) : "FREE";

  if (nextType === "NOTICE" && !isAdmin) {
    return "FREE";
  }

  return nextType;
}

export function getFreePostTypeMeta(value: unknown) {
  return freePostTypeMeta[normalizeFreePostType(value, true)];
}

export function getFreePostTypeOptions(isAdmin = false) {
  return FREE_POST_TYPES.filter((type) => isAdmin || type !== "NOTICE").map((type) => ({
    value: type,
    ...freePostTypeMeta[type],
  }));
}
