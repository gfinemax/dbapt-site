import { getNewsDisplayAuthorName } from "@/lib/news-display-author";
import { mergeNewsCategoryRefresh } from "@/lib/news/category-refresh";
import type { CoopNewsView, NewsUserView } from "@/lib/news/types";

type EditedNoticeInput = Partial<Omit<CoopNewsView, "author">> & {
  id: string;
  author?: Partial<NewsUserView> | null;
};

export function mergeNoticeRefresh(
  currentList: readonly CoopNewsView[],
  refreshedNotices: readonly CoopNewsView[],
): CoopNewsView[] {
  return mergeNewsCategoryRefresh(currentList, refreshedNotices, "NOTICE");
}

export function replaceNoticeInList(
  currentList: readonly CoopNewsView[],
  updatedNotice: CoopNewsView,
): CoopNewsView[] {
  return currentList.map((notice) => (
    notice.id === updatedNotice.id ? updatedNotice : notice
  ));
}

export function buildEditedNoticeView(
  editedNotice: EditedNoticeInput,
  fallbackNotice: CoopNewsView,
): CoopNewsView {
  const displayAuthorName = editedNotice.displayAuthorName ?? fallbackNotice.displayAuthorName ?? null;
  const author = mergeNoticeAuthor(editedNotice.author, fallbackNotice.author, displayAuthorName);

  return {
    ...fallbackNotice,
    ...editedNotice,
    category: editedNotice.category ?? fallbackNotice.category,
    title: editedNotice.title ?? fallbackNotice.title,
    content: editedNotice.content ?? fallbackNotice.content,
    createdAt: String(editedNotice.createdAt ?? fallbackNotice.createdAt),
    updatedAt: editedNotice.updatedAt === undefined ? fallbackNotice.updatedAt : String(editedNotice.updatedAt),
    displayAuthorName,
    author,
    comments: editedNotice.comments ?? fallbackNotice.comments,
  };
}

export function buildActiveEditedNoticeView(
  editedNotice: CoopNewsView,
  displayAuthorName: string,
): CoopNewsView {
  return {
    ...editedNotice,
    createdAt: formatNoticeDate(editedNotice.createdAt),
    displayAuthorName,
    isReal: true,
  };
}

function mergeNoticeAuthor(
  editedAuthor: Partial<NewsUserView> | null | undefined,
  fallbackAuthor: NewsUserView,
  displayAuthorName: string | null,
): NewsUserView {
  const author = editedAuthor ?? {};

  return {
    id: author.id ?? fallbackAuthor.id,
    name: getNewsDisplayAuthorName({
      displayAuthorName,
      author: {
        ...fallbackAuthor,
        ...author,
      },
    }),
    signupName: author.signupName ?? fallbackAuthor.signupName ?? null,
    loginId: author.loginId ?? fallbackAuthor.loginId,
    role: author.role ?? fallbackAuthor.role ?? "ADMIN",
    displayAuthorName: author.displayAuthorName ?? fallbackAuthor.displayAuthorName ?? displayAuthorName,
  };
}

function formatNoticeDate(value: string) {
  return String(value).slice(0, 10).replace(/-/g, ".");
}
