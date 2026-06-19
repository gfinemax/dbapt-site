import { describe, expect, it, vi } from "vitest";

import { copyFreeBoardOpenChatAnnouncement } from "@/lib/news/free-board-openchat";

describe("copyFreeBoardOpenChatAnnouncement", () => {
  it("copies a free-board announcement message and marks it copied", async () => {
    const fetcher = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({
        announcement: {
          id: "announcement-1",
          message: "오픈채팅 공지문",
        },
      })))
      .mockResolvedValueOnce(new Response(JSON.stringify({ ok: true })));
    const copyText = vi.fn().mockResolvedValue(undefined);

    await copyFreeBoardOpenChatAnnouncement({
      postId: "free post 1",
      fetcher,
      copyText,
    });

    expect(fetcher).toHaveBeenNthCalledWith(1, "/api/openchat/announcements?freePostId=free%20post%201");
    expect(copyText).toHaveBeenCalledWith("오픈채팅 공지문");
    expect(fetcher).toHaveBeenNthCalledWith(2, "/api/openchat/announcements", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ announcementId: "announcement-1" }),
    });
  });
});
