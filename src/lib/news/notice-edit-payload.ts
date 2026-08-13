import type { NewsDisplayAuthorName } from "@/lib/news-display-author";

type NoticeEditPayloadInput = {
  id: string;
  title: string;
  content: string;
  attachmentPath: string | null;
  attachmentName: string | null;
  attachmentSize: number | null;
  socialImagePath: string | null;
  isStarred: boolean;
  displayAuthorName: NewsDisplayAuthorName;
  registeredAt?: string;
  youtubeUrl?: string;
};

export function buildNoticeEditPayload({
  id,
  title,
  content,
  attachmentPath,
  attachmentName,
  attachmentSize,
  socialImagePath,
  isStarred,
  displayAuthorName,
  registeredAt,
  youtubeUrl,
}: NoticeEditPayloadInput) {
  return {
    id,
    title,
    content,
    category: "NOTICE",
    ...(registeredAt !== undefined ? { registeredAt } : {}),
    attachmentPath,
    attachmentName,
    attachmentSize,
    ...(socialImagePath !== undefined ? { socialImagePath } : {}),
    isStarred,
    displayAuthorName,
    ...(youtubeUrl !== undefined ? { youtubeUrl: youtubeUrl || null } : {}),
  };
}
