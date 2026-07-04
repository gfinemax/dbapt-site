import {
  NEWS_DISPLAY_AUTHOR_NAMES,
  type NewsDisplayAuthorName,
} from "@/lib/news-display-author";
import type { CoopNewsView } from "@/lib/news/types";

export type NoticeEditDraft = {
  title: string;
  content: string;
  attachmentPath: string | null;
  attachmentName: string | null;
  attachmentSize: number | null;
  socialImagePath: string | null;
  isStarred: boolean;
  displayAuthorName: NewsDisplayAuthorName;
  registeredAt: string;
};

export function buildNoticeEditDraft(notice: CoopNewsView): NoticeEditDraft {
  const content = notice.content || "";
  const displayAuthorName = notice.displayAuthorName;

  return {
    title: notice.title || "",
    content:
      notice.imagePath && !content.includes(notice.imagePath)
        ? `${legacyNoticeImageHtml(notice.imagePath)}${content}`
        : content,
    attachmentPath: notice.attachmentPath || null,
    attachmentName: notice.attachmentName || null,
    attachmentSize: notice.attachmentSize || null,
    socialImagePath: notice.socialImagePath || null,
    isStarred: !!notice.isStarred,
    registeredAt: toDateInputValue(notice.registeredAt ?? notice.createdAt),
    displayAuthorName:
      displayAuthorName && NEWS_DISPLAY_AUTHOR_NAMES.includes(displayAuthorName as NewsDisplayAuthorName)
        ? (displayAuthorName as NewsDisplayAuthorName)
        : "운영자",
  };
}

function toDateInputValue(value: string) {
  return String(value).slice(0, 16);
}

function legacyNoticeImageHtml(imagePath: string) {
  const src = imagePath.replace(/"/g, "&quot;");
  return `<p><img src="${src}" alt="본문 이미지" data-width="100" style="width:100%;max-width:100%;height:auto;" /></p>`;
}
