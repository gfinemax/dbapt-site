import { describe, expect, it } from "vitest";
import {
  DEVELOPMENT_LOG_CATEGORIES,
  buildDevelopmentLogDraft,
  buildDevelopmentLogList,
  getDevelopmentLogWeekWindow,
  getDevelopmentLogStatus,
  getDevelopmentLogVersionLabel,
} from "@/lib/news/development-log";
import type { CoopNewsView } from "@/lib/news/types";

const author = {
  id: "admin-1",
  name: "운영자",
  loginId: "admin",
  role: "ADMIN",
};

function news(overrides: Partial<CoopNewsView>): CoopNewsView {
  return {
    id: "log-1",
    category: DEVELOPMENT_LOG_CATEGORIES.published,
    title: "사업현황 화면 개선",
    content: "개발일지 본문",
    createdAt: "2026-06-21T00:00:00.000Z",
    updatedAt: "2026-06-21T00:00:00.000Z",
    author,
    comments: [],
    ...overrides,
  };
}

describe("development log helpers", () => {
  it("uses date-based weekly versions that match the public release label", () => {
    expect(getDevelopmentLogVersionLabel(new Date("2026-06-21T09:00:00+09:00"))).toBe("v2026.06.4");
    expect(getDevelopmentLogVersionLabel(new Date("2026-06-24T09:00:00+09:00"), "hotfix", 1)).toBe(
      "v2026.06.4-hotfix.1",
    );
  });

  it("uses a Monday-to-Sunday weekly window as supporting metadata", () => {
    expect(getDevelopmentLogWeekWindow(new Date("2026-06-21T09:00:00+09:00"))).toEqual({
      label: "2026년 6월 4주차",
      start: "2026.06.15",
      end: "2026.06.21",
    });
  });

  it("builds a release-centered draft with weekly grouping as supporting metadata", () => {
    const draft = buildDevelopmentLogDraft({
      date: new Date("2026-06-21T09:00:00+09:00"),
      type: "기능 반영",
      changes: [
        "feat: update business status images",
        "fix: business mobility image panel",
        "chore: add workspace verification artifacts",
      ],
    });

    expect(draft.version).toBe("v2026.06.4");
    expect(draft.title).toBe("사업현황 자료 업데이트");
    expect(draft.content).toContain("유형\n기능 반영");
    expect(draft.content).toContain("버전\nv2026.06.4");
    expect(draft.content).toContain("릴리즈 기준\n사업현황 자료 업데이트");
    expect(draft.content).toContain("주간 묶음\n2026년 6월 4주차 · 2026.06.15~2026.06.21");
    expect(draft.content).toContain("- 사업현황 화면에서 자료 이미지와 도면을 더 쉽게 확인할 수 있습니다.");
    expect(draft.content).toContain("- 사업현황 자료와 이미지 구성을 업데이트했습니다.");
    expect(draft.content).toContain("- 사업현황의 차량·보행 동선 이미지 표시를 안정화했습니다.");
    expect(draft.content).not.toContain("- 검증 결과와 화면 확인 자료를 정리했습니다.");
    expect(draft.content).toContain("개발 근거");
    expect(draft.content).toContain("- feat: update business status images");
    expect(draft.content).not.toContain("홈페이지 변경사항을 한곳에서 확인할 수 있습니다.");
    expect(draft.content).toContain("상태\n게시 대기");
    expect(draft.content).toContain("작성 기준\n자동 생성: 릴리즈 변경 묶음과 주간 커밋 기록 기준");
  });

  it("shows only published development logs publicly and includes drafts for admins", () => {
    const logs = [
      news({ id: "published", category: DEVELOPMENT_LOG_CATEGORIES.published }),
      news({ id: "request", category: DEVELOPMENT_LOG_CATEGORIES.request }),
      news({ id: "draft", category: DEVELOPMENT_LOG_CATEGORIES.draft }),
      news({ id: "hidden", category: DEVELOPMENT_LOG_CATEGORIES.hidden }),
      news({ id: "notice", category: "NOTICE" }),
    ];

    expect(buildDevelopmentLogList(logs, { includeAdminOnly: false }).map((item) => item.id)).toEqual([
      "published",
      "request",
    ]);
    expect(buildDevelopmentLogList(logs, { includeAdminOnly: true }).map((item) => item.id)).toEqual([
      "published",
      "request",
      "draft",
      "hidden",
    ]);
  });

  it("maps development log categories to review statuses", () => {
    expect(getDevelopmentLogStatus(DEVELOPMENT_LOG_CATEGORIES.draft)).toEqual({
      label: "게시 대기",
      tone: "draft",
    });
    expect(getDevelopmentLogStatus(DEVELOPMENT_LOG_CATEGORIES.published)).toEqual({
      label: "게시됨",
      tone: "published",
    });
    expect(getDevelopmentLogStatus(DEVELOPMENT_LOG_CATEGORIES.hidden)).toEqual({
      label: "숨김",
      tone: "hidden",
    });
    expect(getDevelopmentLogStatus(DEVELOPMENT_LOG_CATEGORIES.request)).toEqual({
      label: "요구사항",
      tone: "request",
    });
  });
});
