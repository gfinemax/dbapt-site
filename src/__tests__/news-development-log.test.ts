import { describe, expect, it } from "vitest";
import {
  DEVELOPMENT_LOG_CATEGORIES,
  buildDevelopmentLogDraft,
  buildDevelopmentLogList,
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

  it("builds a public-facing draft from commit-like change records", () => {
    const draft = buildDevelopmentLogDraft({
      date: new Date("2026-06-21T09:00:00+09:00"),
      type: "기능 반영",
      title: "사업현황 향후 추진절차 개선",
      changes: [
        "향후 추진절차 1~4단계를 완료 상태로 표시했습니다.",
        "건축심의 일정을 2027.3 예정으로 수정했습니다.",
      ],
    });

    expect(draft.version).toBe("v2026.06.4");
    expect(draft.title).toBe("사업현황 향후 추진절차 개선");
    expect(draft.content).toContain("유형\n기능 반영");
    expect(draft.content).toContain("버전\nv2026.06.4");
    expect(draft.content).toContain("- 향후 추진절차 1~4단계를 완료 상태로 표시했습니다.");
    expect(draft.content).toContain("상태\n게시 대기");
    expect(draft.content).toContain("작성 기준\n자동 생성: 커밋 및 배포 변경 내역 기준");
  });

  it("shows only published development logs publicly and includes drafts for admins", () => {
    const logs = [
      news({ id: "published", category: DEVELOPMENT_LOG_CATEGORIES.published }),
      news({ id: "draft", category: DEVELOPMENT_LOG_CATEGORIES.draft }),
      news({ id: "hidden", category: DEVELOPMENT_LOG_CATEGORIES.hidden }),
      news({ id: "notice", category: "NOTICE" }),
    ];

    expect(buildDevelopmentLogList(logs, { includeAdminOnly: false }).map((item) => item.id)).toEqual([
      "published",
    ]);
    expect(buildDevelopmentLogList(logs, { includeAdminOnly: true }).map((item) => item.id)).toEqual([
      "published",
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
  });
});
