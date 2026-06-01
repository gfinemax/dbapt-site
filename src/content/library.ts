export type LibraryAccess = "public" | "member" | "pending";

export type LibraryItem = {
  id: string;
  title: string;
  description: string;
  category: string;
  source: string;
  sourceHref: string;
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
    sourceHref: "/news?tab=notice",
    access: "member",
    updatedAt: "총회 개최 시",
  },
  {
    id: "meeting-minutes",
    title: "회의록",
    description: "총회와 이사회 등 주요 회의 결과를 확인할 수 있는 자료입니다.",
    category: "meetings",
    source: "공개자료",
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
    sourceHref: "/disclosure?tab=operations",
    access: "member",
    updatedAt: "계약 변경 시",
  },
  {
    id: "audit-report",
    title: "회계감사보고서",
    description: "회계감사와 내부감사 등 자금 집행 확인 자료의 열람 위치를 안내합니다.",
    category: "accounting",
    source: "공개자료",
    sourceHref: "/disclosure?tab=accounting",
    access: "member",
    updatedAt: "보고서 확정 시",
  },
  {
    id: "business-briefing",
    title: "사업 설명회 자료",
    description: "2025.09.06 설명회 기준 사업현황, 조감도, 배치도, 세대계획 요약을 확인할 수 있습니다.",
    category: "business",
    source: "사업현황",
    sourceHref: "/business",
    access: "public",
    updatedAt: "2025.09.06 기준",
  },
  {
    id: "housing-law",
    title: "주택법 개정법령",
    description: "지역주택조합과 주택사업 관련 법령·제도 자료를 찾기 위한 공개 참고 자료 영역입니다.",
    category: "legal",
    source: "자료실",
    sourceHref: "/library#legal",
    access: "public",
    updatedAt: "법령 개정 시",
  },
  {
    id: "forms",
    title: "서식·양식",
    description: "조합원 제출 서류, 위임장, 신청서 등 업무 서식은 확인 후 순차 등재합니다.",
    category: "forms",
    source: "자료실",
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
