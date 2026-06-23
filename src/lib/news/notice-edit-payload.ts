import type { NewsDisplayAuthorName } from "@/lib/news-display-author";

type NoticeEditPayloadInput = {
  id: string;
  title: string;
  content: string;
  attachmentPath: string | null;
  attachmentName: string | null;
  attachmentSize: number | null;
  isStarred: boolean;
  displayAuthorName: NewsDisplayAuthorName;
  registeredAt?: string;
};

export function buildNoticeEditPayload({
  id,
  title,
  content,
  attachmentPath,
  attachmentName,
  attachmentSize,
  isStarred,
  displayAuthorName,
  registeredAt,
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
    isStarred,
    displayAuthorName,
  };
}
