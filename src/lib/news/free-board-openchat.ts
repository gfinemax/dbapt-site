import { copyTextToClipboard } from "@/lib/copy-to-clipboard";
import { readOpenChatAnnouncementResponse } from "@/lib/openchat-announcement-response";

type Fetcher = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

export async function copyFreeBoardOpenChatAnnouncement({
  postId,
  fetcher = fetch,
  copyText = copyTextToClipboard,
}: {
  postId: string;
  fetcher?: Fetcher;
  copyText?: (text: string) => Promise<void>;
}) {
  const res = await fetcher(`/api/openchat/announcements?freePostId=${encodeURIComponent(postId)}`);
  const data = await readOpenChatAnnouncementResponse(res);

  await copyText(data.announcement.message);
  await fetcher("/api/openchat/announcements", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ announcementId: data.announcement.id }),
  });
}
