import type { CoopNewsView } from "@/lib/news/types";

export const DEVELOPMENT_LOG_CATEGORIES = {
  published: "DEVELOPMENT_LOG",
  request: "DEVELOPMENT_REQUEST",
  draft: "DEVELOPMENT_LOG_DRAFT",
  hidden: "DEVELOPMENT_LOG_HIDDEN",
} as const;

export type DevelopmentLogCategory =
  (typeof DEVELOPMENT_LOG_CATEGORIES)[keyof typeof DEVELOPMENT_LOG_CATEGORIES];

export type DevelopmentLogType = "주간 개발일지" | "기능 반영" | "오류 수정" | "요청 반영";

export type DevelopmentLogStatus = {
  label: "게시 대기" | "게시됨" | "숨김" | "요구사항";
  tone: "draft" | "published" | "hidden" | "request";
};

export type DevelopmentLogDraftInput = {
  date?: Date;
  type?: DevelopmentLogType;
  title?: string;
  changes?: string[];
  userImpact?: string[];
  hotfixNumber?: number;
};

export type DevelopmentLogDraft = {
  title: string;
  content: string;
  version: string;
};

const DEFAULT_CHANGES = [
  "홈페이지 개선 내역을 자동 초안으로 정리했습니다.",
  "관리자 검토 후 공개 가능한 문구로 게시할 수 있습니다.",
];

const DEFAULT_USER_IMPACT = [
  "홈페이지 변경사항을 한곳에서 확인할 수 있습니다.",
  "반영된 기능과 오류 수정 내용을 더 쉽게 추적할 수 있습니다.",
];

export function isDevelopmentLogCategory(category: string): category is DevelopmentLogCategory {
  return Object.values(DEVELOPMENT_LOG_CATEGORIES).includes(category as DevelopmentLogCategory);
}

export function getDevelopmentLogVersionLabel(
  date = new Date(),
  suffix?: "hotfix",
  suffixNumber?: number,
) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const week = getSundayStartWeekOfMonth(date);
  const base = `v${year}.${String(month).padStart(2, "0")}.${week}`;

  if (suffix === "hotfix" && suffixNumber) {
    return `${base}-hotfix.${suffixNumber}`;
  }

  return base;
}

export function getDevelopmentLogStatus(category: string): DevelopmentLogStatus {
  if (category === DEVELOPMENT_LOG_CATEGORIES.published) {
    return { label: "게시됨", tone: "published" };
  }

  if (category === DEVELOPMENT_LOG_CATEGORIES.request) {
    return { label: "요구사항", tone: "request" };
  }

  if (category === DEVELOPMENT_LOG_CATEGORIES.hidden) {
    return { label: "숨김", tone: "hidden" };
  }

  return { label: "게시 대기", tone: "draft" };
}

export function buildDevelopmentLogDraft(input: DevelopmentLogDraftInput = {}): DevelopmentLogDraft {
  const date = input.date ?? new Date();
  const type = input.type ?? "주간 개발일지";
  const version = getDevelopmentLogVersionLabel(
    date,
    input.hotfixNumber ? "hotfix" : undefined,
    input.hotfixNumber,
  );
  const title = input.title ?? `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${getSundayStartWeekOfMonth(date)}주차 업데이트`;
  const changes = normalizeLines(input.changes, DEFAULT_CHANGES);
  const userImpact = normalizeLines(input.userImpact, DEFAULT_USER_IMPACT);
  const summary = buildSummary(title, changes);

  return {
    title,
    version,
    content: [
      "유형",
      type,
      "",
      "버전",
      version,
      "",
      "제목",
      title,
      "",
      "요약",
      summary,
      "",
      "반영 내용",
      ...changes.map((change) => `- ${change}`),
      "",
      "이용자에게 달라지는 점",
      ...userImpact.map((impact) => `- ${impact}`),
      "",
      "상태",
      "게시 대기",
      "",
      "작성 기준",
      "자동 생성: 커밋 및 배포 변경 내역 기준",
      "검토자: 관리자",
    ].join("\n"),
  };
}

export function buildDevelopmentLogList(
  newsList: readonly CoopNewsView[],
  options: { includeAdminOnly: boolean },
): CoopNewsView[] {
  return newsList
    .filter((item) => isDevelopmentLogCategory(item.category))
    .filter((item) => (
      options.includeAdminOnly ||
      item.category === DEVELOPMENT_LOG_CATEGORIES.published ||
      item.category === DEVELOPMENT_LOG_CATEGORIES.request
    ))
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
}

function getSundayStartWeekOfMonth(date: Date) {
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  return Math.floor((date.getDate() + firstDay) / 7) + 1;
}

function normalizeLines(lines: string[] | undefined, fallback: string[]) {
  const normalized = (lines ?? [])
    .map((line) => line.trim())
    .filter(Boolean);

  return normalized.length > 0 ? normalized : fallback;
}

function buildSummary(title: string, changes: string[]) {
  const firstChange = changes[0] ?? "홈페이지 개선 내역을 정리했습니다.";
  return `${title} 작업을 반영했습니다. ${firstChange}`;
}
