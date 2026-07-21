import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ContentShareActions } from "@/components/news/content-share-actions";
import { buildAbsoluteNewsShareUrl, buildNewsSharePath } from "@/lib/news/content-share";

describe("news content sharing", () => {
  afterEach(() => vi.restoreAllMocks());

  it("builds stable notice and free-board share links", () => {
    expect(buildNewsSharePath("notice", "notice 1")).toBe("/share/notice/notice%201");
    expect(buildAbsoluteNewsShareUrl("https://dbapt.example/", "free", "free-1")).toBe(
      "https://dbapt.example/share/free/free-1",
    );
  });

  it("opens the system share sheet so KakaoTalk can be selected", async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "share", { configurable: true, value: share });
    render(<ContentShareActions kind="notice" contentId="notice-1" title="조합 공지" />);

    fireEvent.click(screen.getByRole("button", { name: "카카오톡 공유" }));

    await waitFor(() => expect(share).toHaveBeenCalledWith({
      title: "조합 공지",
      text: "조합 공지",
      url: `${window.location.origin}/share/notice/notice-1`,
    }));
    expect(screen.getByText("공유 완료")).toBeInTheDocument();
  });

  it("copies the public share link", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });
    render(<ContentShareActions kind="free" contentId="free-1" title="자유게시글" />);

    fireEvent.click(screen.getByRole("button", { name: "링크 복사" }));

    await waitFor(() => expect(writeText).toHaveBeenCalledWith(`${window.location.origin}/share/free/free-1`));
    expect(screen.getByText("링크 복사 완료")).toBeInTheDocument();
  });
});
