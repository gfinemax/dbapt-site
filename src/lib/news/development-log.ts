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

export type DevelopmentLogWeekWindow = {
  label: string;
  start: string;
  end: string;
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

export function getDevelopmentLogWeekWindow(date = new Date()): DevelopmentLogWeekWindow {
  const day = date.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() + mondayOffset);
  const endDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + 6);

  return {
    label: `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${getSundayStartWeekOfMonth(date)}주차`,
    start: formatDateDot(startDate),
    end: formatDateDot(endDate),
  };
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
  const rawChanges = normalizeLines(input.changes, DEFAULT_CHANGES);
  const release = buildReleaseDraftParts(input.title, rawChanges);
  const title = input.title ?? release.title;
  const weekWindow = getDevelopmentLogWeekWindow(date);
  const changes = normalizeLines(release.changes, DEFAULT_CHANGES);
  const userImpact = normalizeLines(input.userImpact, release.userImpact);
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
      "릴리즈 기준",
      title,
      "",
      "주간 묶음",
      `${weekWindow.label} · ${weekWindow.start}~${weekWindow.end}`,
      "",
      "요약",
      summary,
      "",
      "반영 내용",
      ...changes.map((change) => `- ${change}`),
      "",
      "조합원에게 달라지는 점",
      ...userImpact.map((impact) => `- ${impact}`),
      "",
      "의견을 받고 싶은 부분",
      ...release.feedbackPrompts.map((prompt) => `- ${prompt}`),
      "",
      "개발 근거",
      ...rawChanges.map((change) => `- ${change}`),
      "",
      "상태",
      "게시 대기",
      "",
      "작성 기준",
      "자동 생성: 릴리즈 변경 묶음과 주간 커밋 기록 기준",
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

function formatDateDot(date: Date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join(".");
}

function normalizeLines(lines: string[] | undefined, fallback: string[]) {
  const normalized = (lines ?? [])
    .map((line) => line.trim())
    .filter(Boolean);

  return normalized.length > 0 ? normalized : fallback;
}

function buildSummary(title: string, changes: string[]) {
  const firstChange = changes[0] ?? "홈페이지 개선 내역을 정리했습니다.";
  return `${title} 릴리즈에 ${firstChange}`;
}

function buildReleaseDraftParts(title: string | undefined, rawChanges: string[]) {
  const topic = getDominantReleaseTopic(rawChanges);
  const releaseTitle = title ?? getReleaseTitle(topic);

  return {
    title: releaseTitle,
    changes: buildReleaseChanges(rawChanges, topic),
    userImpact: getReleaseUserImpact(topic),
    feedbackPrompts: getReleaseFeedbackPrompts(topic),
  };
}

function getDominantReleaseTopic(rawChanges: string[]) {
  const text = rawChanges.join(" ").toLowerCase();

  if (/(business|사업현황|건축|세대|조감도|동선|mobility|overview|unit|rendering|timeline|household|plan)/.test(text)) {
    return "business";
  }

  if (/(development[- ]?log|개발일지|slide view|요구사항|request)/.test(text)) {
    return "development";
  }

  if (/(pdf|document|disclosure|library|자료실|공개자료|문서)/.test(text)) {
    return "document";
  }

  if (/(notice|news|comment|openchat|공지|조합소식|댓글)/.test(text)) {
    return "news";
  }

  return "general";
}

function getReleaseTitle(topic: string) {
  if (topic === "business") return "사업현황 자료 업데이트";
  if (topic === "development") return "개발일지 소통 개선";
  if (topic === "document") return "자료 확인 기능 개선";
  if (topic === "news") return "조합소식 소통 개선";
  return "홈페이지 개선 사항 업데이트";
}

function buildReleaseChanges(rawChanges: string[], topic: string) {
  const changes = rawChanges
    .map((change) => mapCommitSubjectToReleaseChange(change))
    .filter(Boolean);
  const uniqueChanges = Array.from(new Set(changes));

  if (uniqueChanges.length > 0) {
    return uniqueChanges;
  }

  if (topic === "business") {
    return [
      "사업현황 자료와 이미지 구성을 업데이트했습니다.",
      "사업현황 화면에서 주요 자료를 더 읽기 쉽게 정리했습니다.",
    ];
  }

  if (topic === "development") {
    return [
      "개발일지 목록과 상세 확인 흐름을 개선했습니다.",
      "요구사항과 댓글을 통해 개발 진행 상황에 의견을 남길 수 있게 정리했습니다.",
    ];
  }

  return DEFAULT_CHANGES;
}

function mapCommitSubjectToReleaseChange(subject: string) {
  const normalized = subject.trim();
  const text = normalized.toLowerCase();

  if (!normalized) return "";
  if (/^(chore|build|ci|test)(\(.+\))?:/i.test(normalized)) {
    return "";
  }
  if (/business.*status.*image|business.*images|사업현황.*이미지|사업현황.*자료/.test(text)) {
    return "사업현황 자료와 이미지 구성을 업데이트했습니다.";
  }
  if (/business.*mobility|mobility.*image|차량|보행|동선/.test(text)) {
    return "사업현황의 차량·보행 동선 이미지 표시를 안정화했습니다.";
  }
  if (/household|세대/.test(text)) {
    return "평형별 세대계획을 조합원이 읽기 쉬운 형태로 정리했습니다.";
  }
  if (/timeline|추진절차|건축심의/.test(text)) {
    return "향후 추진절차와 일정 표기를 최신 기준에 맞게 정리했습니다.";
  }
  if (/development[- ]?log|개발일지|slide view/.test(text)) {
    return "개발일지 상세 보기를 좌측 슬라이드뷰로 개선했습니다.";
  }
  if (/request|요구사항/.test(text)) {
    return "조합원 요구사항을 개발일지 안에서 함께 확인할 수 있게 했습니다.";
  }
  if (/pdf|document|자료실|공개자료/.test(text)) {
    return "자료와 문서 확인 흐름을 개선했습니다.";
  }
  if (/comment|댓글/.test(text)) {
    return "댓글과 답글을 통한 의견 교환 흐름을 개선했습니다.";
  }
  if (/verification|workspace verification|검증/.test(text)) {
    return "검증 결과와 화면 확인 자료를 정리했습니다.";
  }

  return stripCommitPrefix(normalized);
}

function stripCommitPrefix(subject: string) {
  const stripped = subject.replace(/^(feat|fix|chore|docs|style|refactor|test|build|ci)(\(.+\))?:\s*/i, "");
  return stripped.endsWith(".") || stripped.endsWith("다.") ? stripped : `${stripped}`;
}

function getReleaseUserImpact(topic: string) {
  if (topic === "business") {
    return [
      "사업현황 화면에서 자료 이미지와 도면을 더 쉽게 확인할 수 있습니다.",
      "모바일에서도 주요 사업 자료를 가로 넘침 없이 확인할 수 있습니다.",
      "사업 진행 상황을 최신 정리 기준으로 비교해 볼 수 있습니다.",
    ];
  }

  if (topic === "development") {
    return [
      "개발 반영 내용을 목록에서 고르고 상세 내용을 바로 확인할 수 있습니다.",
      "요구사항과 댓글 흐름을 통해 개발 방향에 의견을 남기기 쉬워집니다.",
    ];
  }

  if (topic === "document") {
    return [
      "자료실과 공개자료 화면에서 문서를 더 안정적으로 확인할 수 있습니다.",
      "모바일 환경에서도 자료 확인 과정의 불편을 줄일 수 있습니다.",
    ];
  }

  if (topic === "news") {
    return [
      "공지와 댓글 흐름을 통해 조합 소식을 더 쉽게 따라갈 수 있습니다.",
      "필요한 안내와 의견 교환 내용을 한 화면에서 확인할 수 있습니다.",
    ];
  }

  return DEFAULT_USER_IMPACT;
}

function getReleaseFeedbackPrompts(topic: string) {
  if (topic === "business") {
    return [
      "사업현황에서 더 자세히 보고 싶은 자료가 있는지 알려주세요.",
      "모바일에서 도면이나 표가 충분히 읽기 쉬운지 의견을 남겨주세요.",
    ];
  }

  if (topic === "development") {
    return [
      "개발일지에서 더 자세히 설명했으면 하는 항목을 댓글로 남겨주세요.",
      "요구사항 처리 상태가 이해하기 쉬운지 의견을 남겨주세요.",
    ];
  }

  return [
    "이번 변경에서 더 설명이 필요한 부분이 있으면 댓글로 남겨주세요.",
    "다음 개선 우선순위에 대한 의견을 남겨주세요.",
  ];
}
