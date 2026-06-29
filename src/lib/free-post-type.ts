export const FREE_POST_TYPES = ["FREE", "DISCUSSION", "QUESTION", "PROPOSAL", "NOTICE"] as const;

export type FreePostType = (typeof FREE_POST_TYPES)[number];

export const freePostTypeMeta: Record<FreePostType, { label: string; description: string; badgeClassName: string }> = {
  FREE: {
    label: "자유글",
    description: "조합원 간 일반 정보 공유, 경험 나눔, 가벼운 의견 교환에 사용합니다.",
    badgeClassName: "bg-stone-surface text-charcoal-primary",
  },
  DISCUSSION: {
    label: "의견나눔",
    description: "여러 조합원의 의견을 모아 볼 필요가 있는 주제에 사용합니다.",
    badgeClassName: "border border-meadow-green/20 bg-meadow-green/10 text-meadow-green",
  },
  QUESTION: {
    label: "질문",
    description: "사무국 또는 조합원 답변이 필요한 문의에 사용합니다.",
    badgeClassName: "border border-sunburst-yellow/30 bg-sunburst-yellow/20 text-charcoal-primary",
  },
  PROPOSAL: {
    label: "건의·제안",
    description: "홈페이지, 운영, 사업 진행과 관련한 개선 요청에 사용합니다.",
    badgeClassName: "border border-ember-orange/20 bg-ember-orange/10 text-ember-orange",
  },
  NOTICE: {
    label: "법령·운영안내",
    description: "사무국의 공식 법령 해설, 절차 안내, 운영 공지에 사용합니다.",
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

export function getFreePostTypeLabel(value: unknown) {
  return getFreePostTypeMeta(value).label;
}

export function getFreePostTypeOptions(isAdmin = false) {
  return FREE_POST_TYPES.filter((type) => isAdmin || type !== "NOTICE").map((type) => ({
    value: type,
    ...freePostTypeMeta[type],
  }));
}
