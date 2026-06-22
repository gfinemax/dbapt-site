import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DevelopmentLog } from "@/components/news/development-log";
import { DEVELOPMENT_LOG_CATEGORIES } from "@/lib/news/development-log";
import type { CoopNewsView } from "@/lib/news/types";

const author = {
  id: "admin-1",
  name: "운영자",
  loginId: "admin",
  role: "ADMIN",
};

function log(overrides: Partial<CoopNewsView>): CoopNewsView {
  return {
    id: "log-1",
    category: DEVELOPMENT_LOG_CATEGORIES.published,
    title: "사업현황 향후 추진절차 개선",
    content:
      "유형\n기능 반영\n\n버전\nv2026.06.4\n\n요약\n사업현황의 향후 추진절차 표시를 개선했습니다.\n\n반영 내용\n- 1~4단계를 완료 상태로 표시했습니다.",
    createdAt: "2026-06-21T00:00:00.000Z",
    updatedAt: "2026-06-21T00:00:00.000Z",
    author,
    comments: [],
    ...overrides,
  };
}

describe("DevelopmentLog", () => {
  it("renders only published development logs for public visitors", () => {
    render(
      <DevelopmentLog
        isAdmin={false}
        logs={[
          log({ id: "published", category: DEVELOPMENT_LOG_CATEGORIES.published }),
          log({ id: "draft", title: "초안 개발일지", category: DEVELOPMENT_LOG_CATEGORIES.draft }),
        ]}
        onRefresh={vi.fn()}
      />,
    );

    expect(within(screen.getByRole("table", { name: "개발일지 목록" })).getByText("사업현황 향후 추진절차 개선")).toBeInTheDocument();
    expect(screen.getByText("v2026.06.4")).toBeInTheDocument();
    expect(screen.getByText("게시됨")).toBeInTheDocument();
    expect(screen.queryByText("초안 개발일지")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "자동 초안 생성" })).not.toBeInTheDocument();
  });

  it("opens development log details in a left slide view from the compact list", () => {
    render(
      <DevelopmentLog
        isAdmin={false}
        logs={[
          log({ id: "published", category: DEVELOPMENT_LOG_CATEGORIES.published }),
          log({
            id: "request",
            title: "댓글 알림 요구사항",
            category: DEVELOPMENT_LOG_CATEGORIES.request,
            content: "댓글 알림이 필요합니다.",
          }),
        ]}
        onRefresh={vi.fn()}
      />,
    );

    const list = screen.getByRole("table", { name: "개발일지 목록" });
    expect(within(list).getByText("사업현황 향후 추진절차 개선")).toBeInTheDocument();
    expect(within(list).getByText("댓글 알림 요구사항")).toBeInTheDocument();
    expect(within(list).getByText("댓글")).toBeInTheDocument();
    expect(screen.queryByRole("complementary", { name: "개발일지 상세 패널" })).not.toBeInTheDocument();

    fireEvent.click(within(list).getByRole("button", { name: "댓글 알림 요구사항" }));

    const detailPanel = screen.getByRole("complementary", { name: "개발일지 상세 패널" });
    expect(within(detailPanel).getByRole("heading", { name: "댓글 알림 요구사항" })).toBeInTheDocument();
    expect(within(detailPanel).getByText("댓글 알림이 필요합니다.")).toBeInTheDocument();

    fireEvent.click(within(detailPanel).getByRole("button", { name: "목록으로" }));
    expect(screen.queryByRole("complementary", { name: "개발일지 상세 패널" })).not.toBeInTheDocument();
  });

  it("lets admins create draft logs and publish draft logs", async () => {
    const onRefresh = vi.fn().mockResolvedValue(undefined);
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, news: { id: "created-draft" } }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, news: { id: "draft" } }),
      });
    vi.stubGlobal("fetch", fetchMock);

    render(
      <DevelopmentLog
        isAdmin
        session={{ id: "admin-1", name: "관리자", loginId: "admin", role: "ADMIN" }}
        logs={[
          log({ id: "draft", title: "게시 대기 개발일지", category: DEVELOPMENT_LOG_CATEGORIES.draft }),
          log({ id: "hidden", title: "숨김 개발일지", category: DEVELOPMENT_LOG_CATEGORIES.hidden }),
        ]}
        onRefresh={onRefresh}
      />,
    );

    expect(screen.getByText("게시 대기")).toBeInTheDocument();
    expect(screen.getByText("숨김")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "자동 초안 생성" }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith(
      "/api/news/development-log/draft",
      expect.objectContaining({ method: "POST" }),
    ));

    const draftRow = within(screen.getByRole("table", { name: "개발일지 목록" })).getByText("게시 대기 개발일지").closest("tr");
    expect(draftRow).not.toBeNull();
    fireEvent.click(within(draftRow as HTMLTableRowElement).getByRole("button", { name: "게시" }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith(
      "/api/news",
      expect.objectContaining({
        method: "PATCH",
        body: expect.stringContaining(`"category":"${DEVELOPMENT_LOG_CATEGORIES.published}"`),
      }),
    ));
    expect(onRefresh).toHaveBeenCalledTimes(2);
  });

  it("lets logged-in non-admin members submit development requirements", async () => {
    const onRefresh = vi.fn().mockResolvedValue(undefined);
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, news: { id: "request-1" } }),
    });
    vi.stubGlobal("fetch", fetchMock);

    render(
      <DevelopmentLog
        isAdmin={false}
        session={{ id: "member-1", name: "조합원", loginId: "member1", role: "MEMBER" }}
        logs={[]}
        onRefresh={onRefresh}
      />,
    );

    expect(screen.queryByRole("button", { name: "새 개발일지 작성" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "요구사항 작성" }));
    fireEvent.change(screen.getByLabelText("요구사항 제목"), {
      target: { value: "개발일지 댓글 알림 요청" },
    });
    fireEvent.change(screen.getByLabelText("요구사항 내용"), {
      target: { value: "댓글이 달리면 확인하기 쉽게 표시해 주세요." },
    });
    fireEvent.click(screen.getByRole("button", { name: "요구사항 등록" }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith(
      "/api/news",
      expect.objectContaining({
        method: "POST",
        body: expect.stringContaining(`"category":"${DEVELOPMENT_LOG_CATEGORIES.request}"`),
      }),
    ));
    expect(onRefresh).toHaveBeenCalled();
  });
});
