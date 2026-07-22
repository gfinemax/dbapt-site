import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DocumentBookmarkButton } from "@/components/portal/document-bookmark-button";

describe("DocumentBookmarkButton", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("notifies every open personal-library view after bookmarking", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    const eventListener = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    window.addEventListener("dbapt:document-bookmark-changed", eventListener);

    render(
      <DocumentBookmarkButton
        document={{ id: "doc-1", title: "새 즐겨찾기 문서", isBookmarkedByCurrentUser: false }}
        includeDocumentTitleInLabel
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "새 즐겨찾기 문서 즐겨찾기" }));

    await waitFor(() => expect(eventListener).toHaveBeenCalledTimes(1));
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/me/document-bookmarks",
      expect.objectContaining({ method: "POST" }),
    );
    expect(screen.getByRole("button", { name: "새 즐겨찾기 문서 즐겨찾기 해제" })).toBeInTheDocument();
    window.removeEventListener("dbapt:document-bookmark-changed", eventListener);
  });
});
