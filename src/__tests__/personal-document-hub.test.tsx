import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PersonalDocumentHub } from "@/components/portal/personal-document-hub";
import type { Document } from "@/components/portal/document-table";

const baseDoc = (overrides: Partial<Document>): Document => ({
  id: "doc",
  title: "문서",
  description: null,
  category: "DISCLOSURE",
  fileName: "document.pdf",
  fileSize: 1024,
  status: "APPROVED",
  publishedAt: "2026-06-01T00:00:00.000Z",
  documentDate: "2026-06-01T00:00:00.000Z",
  createdAt: "2026-06-01T00:00:00.000Z",
  ...overrides,
});

describe("PersonalDocumentHub", () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("shows unread starred and recent documents while hiding viewed documents from recommendations", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-14T12:00:00.000Z"));

    render(
      <PersonalDocumentHub
        documents={[
          baseDoc({
            id: "important-unread",
            title: "중요 미열람 의사록",
            isStarred: true,
            isViewedByCurrentUser: false,
            publishedAt: "2026-05-01T00:00:00.000Z",
            documentDate: "2026-05-01T00:00:00.000Z",
            createdAt: "2026-05-01T00:00:00.000Z",
          }),
          baseDoc({
            id: "recent-unread",
            title: "최근 미열람 공문",
            isViewedByCurrentUser: false,
            publishedAt: "2026-06-12T00:00:00.000Z",
            documentDate: "2026-06-12T00:00:00.000Z",
            createdAt: "2026-06-12T00:00:00.000Z",
          }),
          baseDoc({
            id: "important-viewed",
            title: "이미 본 중요 문서",
            isStarred: true,
            isViewedByCurrentUser: true,
          }),
          baseDoc({
            id: "old-unread",
            title: "오래된 일반 문서",
            isViewedByCurrentUser: false,
            publishedAt: "2026-04-01T00:00:00.000Z",
            documentDate: "2026-04-01T00:00:00.000Z",
            createdAt: "2026-04-01T00:00:00.000Z",
          }),
        ]}
        role="member"
      />,
    );

    const recommendations = screen.getByLabelText("추천자료 목록");
    expect(screen.getByText("아직 열람하지 않은 중요 문서와 최근 14일 이내 등록된 공개 문서를 보여드립니다.")).toBeInTheDocument();
    expect(within(recommendations).getByText("중요 미열람 의사록")).toBeInTheDocument();
    expect(within(recommendations).getByText("최근 미열람 공문")).toBeInTheDocument();
    expect(within(recommendations).getByRole("button", { name: "중요 미열람 의사록 열람" })).toHaveClass(
      "absolute",
      "inset-0",
    );
    expect(within(recommendations).queryByText("열람")).not.toBeInTheDocument();
    expect(screen.queryByText("이미 본 중요 문서")).not.toBeInTheDocument();
    expect(screen.queryByText("오래된 일반 문서")).not.toBeInTheDocument();
  });

  it("keeps saved documents in the personal stash even when they were already viewed", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-14T12:00:00.000Z"));

    render(
      <PersonalDocumentHub
        documents={[
          baseDoc({
            id: "saved-viewed",
            title: "보관한 실태조사 문서",
            isViewedByCurrentUser: true,
            isBookmarkedByCurrentUser: true,
          }),
        ]}
        role="member"
      />,
    );

    expect(screen.queryByText("보관한 실태조사 문서")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /보관한 문서/ }));

    expect(screen.getByText("공개자료실에서 직접 보관한 PDF·공개 문서를 모아 보여드립니다.")).toBeInTheDocument();
    const stash = screen.getByLabelText("보관한 문서 목록");
    expect(within(stash).getByText("보관한 실태조사 문서")).toBeInTheDocument();
    expect(within(stash).getByRole("button", { name: "보관한 실태조사 문서 열람" })).toHaveClass(
      "absolute",
      "inset-0",
      "rounded-xl",
    );
    expect(within(stash).getByRole("button", { name: "보관한 실태조사 문서 개인자료실 보관 해제" })).toBeInTheDocument();
    expect(within(stash).queryByText("document.pdf")).not.toBeInTheDocument();
    expect(within(stash).queryByText("1.0 KB")).not.toBeInTheDocument();
  });

  it("does not duplicate the recommendation and stash counts in the header", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-14T12:00:00.000Z"));

    render(
      <PersonalDocumentHub
        documents={[
          baseDoc({
            id: "important-unread",
            title: "중요 미열람 문서",
            isStarred: true,
            isViewedByCurrentUser: false,
          }),
          baseDoc({
            id: "saved-doc",
            title: "보관한 공개자료",
            isBookmarkedByCurrentUser: true,
          }),
        ]}
        role="member"
      />,
    );

    expect(screen.queryByText("추천자료")).not.toBeInTheDocument();
    expect(screen.queryByText("보관한 문서")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "추천자료 2" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "보관한 문서 1" })).toBeInTheDocument();
  });

  it("moves a newly bookmarked recommendation into the saved tab after the API confirms", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ bookmarked: true }),
      }),
    );

    render(
      <PersonalDocumentHub
        documents={[
          baseDoc({
            id: "bookmark-target",
            title: "보관할 공개자료",
            isStarred: true,
            isViewedByCurrentUser: false,
            isBookmarkedByCurrentUser: false,
          }),
        ]}
        role="member"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "보관" }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "보관한 문서 1" })).toHaveClass("bg-midnight");
    });

    const stash = screen.getByLabelText("보관한 문서 목록");
    expect(within(stash).getByText("보관할 공개자료")).toBeInTheDocument();
  });

  it("shows bookmarked notices and free-board posts in a separate personal content tab", () => {
    render(
      <PersonalDocumentHub
        documents={[]}
        role="member"
        contentBookmarks={[
          {
            id: "bookmark-notice",
            targetType: "COOP_NEWS",
            targetId: "notice-1",
            sourceLabel: "공지사항",
            title: "개인 보관 공지",
            description: "공지 요약",
            href: "/news?tab=notice&notice=notice-1",
            createdAt: "2026-06-20T00:00:00.000Z",
            registeredAt: "2026-06-19T00:00:00.000Z",
            isStarred: true,
          },
          {
            id: "bookmark-free",
            targetType: "FREE_POST",
            targetId: "free-1",
            sourceLabel: "자유게시판",
            title: "개인 보관 자유글",
            description: "자유글 요약",
            href: "/news?tab=free&post=free-1",
            createdAt: "2026-06-21T00:00:00.000Z",
            registeredAt: "2026-06-18T00:00:00.000Z",
            isStarred: false,
          },
        ]}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "보관한 게시글 2" }));

    expect(screen.getByText("공지사항·조합뉴스·자유게시판에서 직접 보관한 게시글을 모아 보여드립니다.")).toBeInTheDocument();
    const contentList = screen.getByLabelText("보관한 게시글 목록");
    expect(within(contentList).getByText("개인 보관 공지")).toBeInTheDocument();
    expect(within(contentList).getByText("개인 보관 자유글")).toBeInTheDocument();
    const noticeLink = within(contentList).getByRole("link", { name: "개인 보관 공지 열기" });
    expect(noticeLink).toHaveAttribute(
      "href",
      "/news?tab=notice&notice=notice-1",
    );
    expect(noticeLink).toHaveClass("rounded-xl", "px-4", "py-3");
    expect(within(contentList).queryByText("열기")).not.toBeInTheDocument();
  });

  it("shows five saved documents first and reveals the rest on request", () => {
    render(
      <PersonalDocumentHub
        documents={Array.from({ length: 6 }, (_, index) => baseDoc({
          id: `saved-${index + 1}`,
          title: `보관 문서 ${index + 1}`,
          isBookmarkedByCurrentUser: true,
        }))}
        role="member"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "보관한 문서 6" }));

    expect(screen.getByText("보관 문서 5")).toBeInTheDocument();
    expect(screen.queryByText("보관 문서 6")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "문서 더보기 (1)" }));
    expect(screen.getByText("보관 문서 6")).toBeInTheDocument();
  });

  it("shows five bookmarked posts first and reveals the rest on request", () => {
    render(
      <PersonalDocumentHub
        documents={[]}
        role="member"
        contentBookmarks={Array.from({ length: 6 }, (_, index) => ({
          id: `bookmark-${index + 1}`,
          targetType: "FREE_POST" as const,
          targetId: `free-${index + 1}`,
          sourceLabel: "자유게시판",
          title: `보관 게시글 ${index + 1}`,
          description: `보관 게시글 ${index + 1} 요약`,
          href: `/news?tab=free&post=free-${index + 1}`,
          createdAt: "2026-06-21T00:00:00.000Z",
          registeredAt: "2026-06-18T00:00:00.000Z",
          isStarred: false,
        }))}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "보관한 게시글 6" }));

    expect(screen.getByText("보관 게시글 5")).toBeInTheDocument();
    expect(screen.queryByText("보관 게시글 6")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "게시글 더보기 (1)" }));
    expect(screen.getByText("보관 게시글 6")).toBeInTheDocument();
  });
});
