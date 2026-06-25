import type { CoopNewsView, NewsUserView } from "@/lib/news/types";

export type NewsletterListItem = {
  id: string;
  title: string;
  content: string;
  viewCount?: number;
  isStarred: boolean;
  author: Pick<NewsUserView, "name">;
  createdAt: string;
  registeredAt?: string;
  createdAtRaw?: string;
  imagePath: string | null;
  attachmentPath: string | null;
  attachmentName: string | null;
  attachmentSize: number | null;
  isReal: boolean;
  isPreview: boolean;
  isBookmarkedByCurrentUser: boolean;
};

const UPCOMING_NEWSLETTER_PREVIEW: NewsletterListItem = {
  id: "upcoming-newsletter-2026-07-issue-1",
  title: "대방동 지주택 2026년 7월 조합 월간 소식지 (제1호) 오픈 예정",
  content:
    "대방동 지역주택조합은 2026년 7월부터 조합 월간 소식지 제1호를 준비해 조합원께 정기적으로 안내드릴 예정입니다.\n\n제1호에서는 조합 운영 일정, 공개자료 등록 현황, 인허가 진행 기준, 조합비와 계약 관리 원칙, 조합원 주요 질의응답, 다음 달 확인 예정 사항을 한눈에 볼 수 있도록 구성하겠습니다.\n\n확정되지 않은 사안은 확정 표현 없이 현재 확인 가능한 기준과 향후 확인 절차로 구분해 전달하고, 조합원께 필요한 자료 위치와 열람 방법도 함께 안내하겠습니다.",
  author: { name: "사무국" },
  createdAt: "2026.07 예정",
  registeredAt: undefined,
  createdAtRaw: undefined,
  imagePath: null,
  attachmentPath: null,
  attachmentName: null,
  attachmentSize: null,
  isStarred: false,
  isReal: false,
  isPreview: true,
  isBookmarkedByCurrentUser: false,
};

const UPCOMING_NEWSLETTER_PREVIEWS = [
  UPCOMING_NEWSLETTER_PREVIEW,
];

export function buildNewsletterList(
  newsList: readonly CoopNewsView[],
  searchQuery: string,
): NewsletterListItem[] {
  const realNews = newsList.map((item) => ({
    id: item.id,
    title: item.title,
    content: item.content,
    viewCount: item.viewCount,
    isStarred: !!item.isStarred,
    isBookmarkedByCurrentUser: !!item.isBookmarkedByCurrentUser,
    author: { name: item.author.name || "사무국" },
    createdAt: formatNewsletterDate(item.registeredAt ?? item.createdAt),
    registeredAt: item.registeredAt,
    createdAtRaw: item.createdAt,
    imagePath: item.imagePath ?? null,
    attachmentPath: item.attachmentPath ?? null,
    attachmentName: item.attachmentName ?? null,
    attachmentSize: item.attachmentSize ?? null,
    isReal: true,
    isPreview: false,
  }));

  const query = searchQuery.trim().toLowerCase();
  if (!query) {
    return [...realNews, ...UPCOMING_NEWSLETTER_PREVIEWS];
  }

  return [
    ...realNews.filter((item) => item.title.toLowerCase().includes(query)),
    ...UPCOMING_NEWSLETTER_PREVIEWS.filter((item) => item.title.toLowerCase().includes(query)),
  ];
}

function formatNewsletterDate(value: string) {
  return value.slice(0, 10).replace(/-/g, ".");
}
