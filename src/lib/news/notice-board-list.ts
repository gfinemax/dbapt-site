import { getNewsDisplayAuthorName } from "@/lib/news-display-author";
import { getNewsComments, type CoopNewsView } from "@/lib/news/types";

export type NoticeBoardListItem = CoopNewsView & {
  createdAt: string;
  isReal: boolean;
};

export function buildNoticeBoardList(
  newsList: readonly CoopNewsView[],
  searchQuery: string,
): NoticeBoardListItem[] {
  const query = searchQuery.trim().toLowerCase();

  return newsList
    .map((item) => ({
      ...item,
      id: item.id,
      title: item.title,
      content: item.content,
      viewCount: item.viewCount,
      isStarred: item.isStarred,
      author: {
        ...item.author,
        name: getNewsDisplayAuthorName(item),
      },
      displayAuthorName: item.displayAuthorName,
      createdAt: formatNoticeDate(item.registeredAt ?? item.createdAt),
      imagePath: item.imagePath,
      attachmentPath: item.attachmentPath,
      attachmentName: item.attachmentName,
      attachmentSize: item.attachmentSize,
      comments: getNewsComments(item),
      isReal: true,
    }))
    .filter((notice) => !query || notice.title.toLowerCase().includes(query))
    .sort((a, b) => {
      if (a.isStarred && !b.isStarred) return -1;
      if (!a.isStarred && b.isStarred) return 1;
      return b.createdAt.localeCompare(a.createdAt);
    });
}

function formatNoticeDate(value: string) {
  return value.slice(0, 10).replace(/-/g, ".");
}
