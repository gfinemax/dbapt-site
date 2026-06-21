export type LibraryAccess = "public" | "member" | "pending";
export type LibrarySourceKind =
  | "disclosure"
  | "library-reference"
  | "site-reference"
  | "news";

export type LibraryItem = {
  id: string;
  title: string;
  description: string;
  category: string;
  source: string;
  sourceKind: LibrarySourceKind;
  sourceHref: string;
  actionLabel?: string;
  access: LibraryAccess;
  updatedAt: string;
};

export const libraryCategories = [
  { id: "all", label: "전체" },
  { id: "featured", label: "핵심자료" },
  { id: "meetings", label: "총회·회의" },
  { id: "contracts", label: "계약·협약" },
  { id: "accounting", label: "회계·감사" },
  { id: "business", label: "사업·설계" },
  { id: "permits", label: "인허가·고시" },
  { id: "legal", label: "법령·제도" },
  { id: "forms", label: "서식·양식" },
] as const;

export const libraryItems: LibraryItem[] = [
  {
    id: "cooperative-rules",
    title: "조합규약",
    description: "조합원의 권리와 의무, 총회·이사회 의결 절차 등 조합 운영 기준을 확인하는 핵심 문서입니다.",
    category: "featured",
    source: "공개자료",
    sourceKind: "disclosure",
    sourceHref: "/disclosure?tab=rules",
    access: "member",
    updatedAt: "수시 업데이트",
  },
  {
    id: "assembly-book",
    title: "총회 책자 / 안내문",
    description: "총회 안건, 의결 안내, 참석 안내문 등 조합원이 자주 찾는 총회 관련 자료입니다.",
    category: "meetings",
    source: "조합소식",
    sourceKind: "news",
    sourceHref: "/news?tab=notice",
    access: "member",
    updatedAt: "총회 개최 시",
  },
  {
    id: "meeting-minutes",
    title: "의사록",
    description: "총회와 이사회 등 주요 회의 결과를 확인할 수 있는 자료입니다.",
    category: "meetings",
    source: "공개자료",
    sourceKind: "disclosure",
    sourceHref: "/disclosure?tab=meetings",
    access: "member",
    updatedAt: "회의 후 등재",
  },
  {
    id: "service-contracts",
    title: "각종 계약서",
    description: "설계, 용역, 행정, 법률 등 사업 추진 과정의 계약·협약 자료 위치를 안내합니다.",
    category: "contracts",
    source: "공개자료",
    sourceKind: "disclosure",
    sourceHref: "/disclosure?tab=operations",
    access: "member",
    updatedAt: "계약 변경 시",
  },
  {
    id: "audit-report",
    title: "회계감사보고서",
    description: "회계감사보고서와 월별 자금 입출금 등 자금 집행 확인 자료의 열람 위치를 안내합니다.",
    category: "accounting",
    source: "공개자료",
    sourceKind: "disclosure",
    sourceHref: "/disclosure?tab=accounting",
    access: "member",
    updatedAt: "보고서 확정 시",
  },
  {
    id: "business-briefing",
    title: "사업계획서 기준 사업현황",
    description: "2025.10.30 사업계획서 기준 건축개요, 배치도, 단위세대 평면도, 동선계획, 조감도 요약을 확인할 수 있습니다.",
    category: "business",
    source: "사업현황",
    sourceKind: "site-reference",
    sourceHref: "/business",
    actionLabel: "사업현황 보기",
    access: "public",
    updatedAt: "2025.10.30 기준",
  },
  {
    id: "housing-law",
    title: "주택법 개정법령",
    description: "지역주택조합과 주택사업 관련 법령·제도 자료를 찾기 위한 공개 참고 자료 영역입니다.",
    category: "legal",
    source: "자료실",
    sourceKind: "library-reference",
    sourceHref: "/library#legal",
    actionLabel: "관련 법령 보기",
    access: "public",
    updatedAt: "법령 개정 시",
  },
  {
    id: "district-plan-notice-2022",
    title: "서울특별시 고시 제2022-291호 지구단위계획 결정고시",
    description: "2022.06.30 대방동 11-103번지 일대 도시관리계획 결정 및 지형도면 고시 자료를 찾기 위한 공개 참고 자료입니다.",
    category: "permits",
    source: "공개자료 > 인허가·고시자료",
    sourceKind: "library-reference",
    sourceHref: "/library#permits",
    actionLabel: "고시자료 보기",
    access: "public",
    updatedAt: "2022.06.30",
  },
  {
    id: "forms",
    title: "서식·양식",
    description: "조합원 제출 서류, 위임장, 신청서 등 업무 서식은 확인 후 순차 등재합니다.",
    category: "forms",
    source: "자료실",
    sourceKind: "library-reference",
    sourceHref: "/library#forms",
    access: "pending",
    updatedAt: "준비 중",
  },
];

export const featuredLibraryItemIds = [
  "cooperative-rules",
  "assembly-book",
  "meeting-minutes",
  "service-contracts",
  "audit-report",
  "forms",
] as const;
