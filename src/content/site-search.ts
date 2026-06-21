import { libraryCategories, libraryItems } from "@/content/library";
import { disclosureSearchFolders } from "@/content/disclosure-search";
import { getSearchQueryTerms, searchTextMatchesQuery } from "@/lib/search-normalization";

export type SiteSearchItem = {
  id: string;
  title: string;
  description: string;
  href: string;
  section: string;
  keywords: string[];
};

export type SearchableDocument = {
  id: string;
  title: string;
  description?: string | null;
  category: string;
  subCategory?: string | null;
  correspondenceType?: string | null;
  status?: string | null;
  fileName?: string | null;
  filePath?: string | null;
  documentDate?: string | null;
  publishedAt?: string | null;
  createdAt?: string | null;
};

const districtPlanNoticeSearch = "서울특별시 고시 제2022-291호";

const staticSearchItems: SiteSearchItem[] = [
  {
    id: "history-district-plan-notice-2022",
    title: "대방동 11-103번지 일대 지구단위계획 결정 및 지형도면 최종 고시",
    description: "2022.06.30 서울특별시 고시 제2022-291호로 결정된 지구단위계획 주요 연혁입니다.",
    href: "/about#section-history",
    section: "조합연혁",
    keywords: ["결정고시", "지구단위계획", "지형도면", "2022-291", "서울특별시 고시", "2022.06.30"],
  },
  {
    id: "about-location",
    title: "조합 사무실 찾아오시는 길",
    description: "대방동 지역주택조합 사무실 주소, 대중교통, 방문 안내를 확인합니다.",
    href: "/about#section-location",
    section: "조합소개",
    keywords: ["위치", "주소", "찾아오시는 길", "사무실", "대방역", "남부교회"],
  },
  {
    id: "business-status",
    title: "사업현황",
    description: "건축개요, 조감도, 건축계획안, 배치도, 단위세대 평면도와 동선계획을 확인합니다.",
    href: "/business",
    section: "사업현황",
    keywords: ["사업", "건축", "건축계획", "배치도", "조감도", "평면도", "차량동선", "보행동선", "추진절차"],
  },
  {
    id: "news-notice",
    title: "조합소식",
    description: "공지사항, 조합 소식지, 개발일지, FAQ, 자유게시판으로 이동합니다.",
    href: "/news",
    section: "조합소식",
    keywords: ["공지", "소식", "소식지", "개발일지", "구현요청", "FAQ", "자유게시판"],
  },
  {
    id: "news-development-log",
    title: "개발일지",
    description: "홈페이지 기능 반영, 오류 수정, 구현요청 처리 내역을 버전별로 확인합니다.",
    href: "/news?tab=development",
    section: "조합소식",
    keywords: ["개발일지", "버전", "업데이트", "기능 반영", "오류 수정", "구현요청"],
  },
  {
    id: "disclosure-materials",
    title: "공개자료",
    description: "조합원 권한에 따라 정보공개 자료와 문서함 위치를 확인합니다.",
    href: "/disclosure",
    section: "공개자료",
    keywords: ["정보공개", "공개자료", "의사록", "회계", "계약"],
  },
  {
    id: "disclosure-regular-meeting-stenographic-record-2026",
    title: "2026년 정기총회 속기록",
    description: "2026.04.18 정기총회 속기록 자료입니다. 공개자료에서 확인할 수 있습니다.",
    href: "/disclosure?tab=meetings",
    section: "공개자료",
    keywords: [
      "총회 문서함",
      "정기총회",
      "속기",
      "속기록",
      "2026.04.18",
    ],
  },
  {
    id: "login-member",
    title: "조합원 로그인",
    description: "정식 조합원, 환불 조합원, 관계자 승인 계정으로 로그인합니다.",
    href: "/login",
    section: "조합원 서비스",
    keywords: ["로그인", "가입", "환불", "조합원", "관계자"],
  },
];

const librarySearchItems: SiteSearchItem[] = libraryItems.map((item) => {
  const categoryLabel = libraryCategories.find((category) => category.id === item.category)?.label || "자료실";
  const href =
    item.id === "district-plan-notice-2022"
      ? `/library?category=permits&q=${encodeURIComponent(districtPlanNoticeSearch)}`
      : item.sourceHref;

  return {
    id: `library-${item.id}`,
    title: item.title,
    description: item.description,
    href,
    section: "자료실",
    keywords: [categoryLabel, item.source, item.updatedAt, item.sourceKind],
  };
});

const disclosureFolderSearchItems: SiteSearchItem[] = disclosureSearchFolders.map((folder) => ({
  id: `disclosure-folder-${folder.id}`,
  title: folder.title,
  description: folder.description,
  href: `/disclosure?tab=${folder.tab}`,
  section: "공개자료",
  keywords: [
    folder.tabLabel,
    folder.subCategory,
    folder.date,
    ...(folder.keywords || []),
  ],
}));

function getDocumentSearchHref(document: SearchableDocument) {
  if (document.fileName?.trim().toLowerCase().endsWith(".pdf")) {
    return `/disclosure?document=${encodeURIComponent(document.id)}`;
  }

  if (document.category === "ACCOUNTING") return "/disclosure?tab=accounting";
  if (document.category !== "DISCLOSURE") return "/disclosure";

  const subCategory = document.subCategory || "";
  if (subCategory.includes("공문")) return "/disclosure?tab=administration";
  if (subCategory.includes("의사록")) return "/disclosure?tab=meetings";
  if (subCategory.includes("규약") || subCategory.includes("연명부") || subCategory.includes("정관")) {
    return "/disclosure?tab=rules";
  }
  if (
    subCategory.includes("회계") ||
    subCategory.includes("자금") ||
    subCategory.includes("분담금") ||
    subCategory.includes("감사")
  ) {
    return "/disclosure?tab=accounting";
  }

  return "/disclosure?tab=operations";
}

function getDocumentSearchSection(document: SearchableDocument) {
  if (document.category === "ACCOUNTING") return "회계자료";
  if (document.category === "NOTICE") return "조합소식";
  return "공개자료";
}

function createDocumentSearchItems(documents: SearchableDocument[] = []): SiteSearchItem[] {
  return documents
    .filter((document) => document.status !== "PENDING")
    .map((document) => ({
      id: `document-${document.id}`,
      title: document.title,
      description: document.description || `${document.subCategory || "문서"} 등록 자료입니다.`,
      href: getDocumentSearchHref(document),
      section: getDocumentSearchSection(document),
      keywords: [
        document.category,
        document.subCategory || "",
        document.correspondenceType || "",
        document.fileName || "",
        document.documentDate || "",
        document.publishedAt || "",
        document.createdAt || "",
      ].filter(Boolean),
    }));
}

export const siteSearchItems: SiteSearchItem[] = [
  ...staticSearchItems,
  ...disclosureFolderSearchItems,
  ...librarySearchItems,
];

export function getSiteSearchItems(options: { documents?: SearchableDocument[] } = {}) {
  return [
    ...siteSearchItems,
    ...createDocumentSearchItems(options.documents),
  ];
}

export function searchSiteItems(query: string, options: { documents?: SearchableDocument[] } = {}) {
  const queryTerms = getSearchQueryTerms(query);

  if (queryTerms.length === 0) return [];

  return getSiteSearchItems(options).filter((item) => {
    const haystack = [
      item.title,
      item.description,
      item.href,
      item.section,
      ...item.keywords,
    ].join(" ");

    return searchTextMatchesQuery(haystack, query);
  });
}
