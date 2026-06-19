import { render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { NewsClient } from "@/components/news/news-client";

const mockRouterPush = vi.hoisted(() => vi.fn());
const mockSearchParams = vi.hoisted(() => ({ value: "" }));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockRouterPush }),
  useSearchParams: () => new URLSearchParams(mockSearchParams.value),
}));

const realNotice = {
  id: "notice-1",
  title: "대방동 지역주택조합 공식 홈페이지 오픈 안내",
  content: "공식 홈페이지를 오픈했습니다.",
  viewCount: 0,
  isStarred: false,
  author: { id: "admin-1", name: "사무국", loginId: "admin", role: "ADMIN" },
  createdAt: "2026-06-17T00:00:00.000Z",
  updatedAt: "2026-06-17T00:00:00.000Z",
  category: "NOTICE",
  imagePath: null,
  attachmentPath: null,
  attachmentName: null,
  attachmentSize: null,
  comments: [],
};

describe("news notice deep links", () => {
  beforeEach(() => {
    mockRouterPush.mockClear();
    mockSearchParams.value = "";
  });

  it("opens the notice detail drawer from a shared notice URL", async () => {
    mockSearchParams.value = "tab=notice&news=notice-1";

    render(
      <NewsClient
        session={null}
        initialNewsList={[realNotice]}
        initialFreePosts={[]}
        initialFaqs={[]}
      />,
    );

    const drawer = await screen.findByLabelText("공지사항 상세 드로어");

    expect(drawer).toHaveClass("left-0");
    expect(within(drawer).getByRole("heading", { name: "공지사항 열람" })).toBeInTheDocument();
    await waitFor(() => {
      expect(within(drawer).getByText("대방동 지역주택조합 공식 홈페이지 오픈 안내")).toBeInTheDocument();
    });
  });
});
