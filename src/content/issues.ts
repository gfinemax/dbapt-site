export type IssueCategoryId = "disclosure" | "accounting" | "contribution" | "participation";

export type IssueMaterial = {
  title: string;
  description: string;
  href: string;
};

export type IssueTopic = {
  title: string;
  description: string;
  status: string;
};

export type IssueCategory = {
  id: IssueCategoryId;
  title: string;
  dashboardLabel: string;
  eyebrow: string;
  summary: string;
  focus: string;
  materials: IssueMaterial[];
  topics: IssueTopic[];
  participationGuide: string;
};

export const issueCategories: IssueCategory[] = [
  {
    id: "disclosure",
    title: "정보공개",
    dashboardLabel: "관련 공개자료 보기",
    eyebrow: "Disclosure",
    summary: "의무공개 자료와 회의·계약 문서를 쟁점별로 확인합니다.",
    focus: "공개자료의 위치와 열람 기준을 먼저 확인하고, 필요한 질문을 주제별로 정리합니다.",
    materials: [
      {
        title: "의무공개 자료 보기",
        description: "조합규약, 의사록, 공문서 등 공개자료 위치를 확인합니다.",
        href: "/disclosure",
      },
      {
        title: "총회·회의 자료 보기",
        description: "총회 책자와 의사록 자료실 색인을 함께 확인합니다.",
        href: "/library#meetings",
      },
      {
        title: "계약·협약 자료 보기",
        description: "사업 추진 과정의 계약·협약 자료 위치를 찾습니다.",
        href: "/library#contracts",
      },
    ],
    topics: [
      {
        title: "공개 범위 확인",
        description: "어떤 문서가 공개 대상인지, 어떤 자료가 로그인 열람인지 구분합니다.",
        status: "자료 확인",
      },
      {
        title: "회의·계약 문서 질의",
        description: "의사록, 계약서, 공문서와 연결된 질문을 한 주제로 모읍니다.",
        status: "질의 정리",
      },
    ],
    participationGuide: "공개자료 확인 후 추가 질의가 필요한 사안은 조합원 전용 게시판에서 이어서 다룹니다.",
  },
  {
    id: "accounting",
    title: "회계·실적보고",
    dashboardLabel: "관련 공개자료 보기",
    eyebrow: "Accounting",
    summary: "예산·결산, 자금집행, 추진실적 자료를 한 흐름으로 확인합니다.",
    focus: "회계 자료와 사업 실적 보고를 분리하지 않고, 관련 질문을 같은 대시보드에서 연결합니다.",
    materials: [
      {
        title: "회계·감사 자료 보기",
        description: "회계감사보고서와 자금 입출금 자료의 위치를 확인합니다.",
        href: "/library#accounting",
      },
      {
        title: "회계 공개자료 보기",
        description: "공개자료 메뉴의 회계·자금 집행 항목으로 이동합니다.",
        href: "/disclosure?tab=accounting",
      },
      {
        title: "추진실적 자료 보기",
        description: "월별 공사진행 및 실적보고 자료 위치를 확인합니다.",
        href: "/disclosure?tab=operations",
      },
    ],
    topics: [
      {
        title: "자금 집행 흐름",
        description: "예산, 결산, 입출금 자료를 같은 기준으로 비교할 수 있게 정리합니다.",
        status: "검토 중",
      },
      {
        title: "실적보고 확인",
        description: "사업 추진 실적과 회계 보고가 어떤 자료에 연결되는지 확인합니다.",
        status: "자료 연결",
      },
    ],
    participationGuide: "개별 납부액과 고지 내역은 로그인 후 개인자료실에서만 확인합니다.",
  },
  {
    id: "contribution",
    title: "내 분담금",
    dashboardLabel: "관련 공개자료 보기",
    eyebrow: "Contribution",
    summary: "개인 금액이 아닌 분담금 기준과 공개 가능한 안내 자료를 확인합니다.",
    focus: "개별 납부 내역과 공개자료를 분리해 개인정보를 보호하면서 기준 자료를 먼저 보여줍니다.",
    materials: [
      {
        title: "분담금 기준 자료 보기",
        description: "분담금 산출과 납부 안내가 연결되는 공개자료 위치를 확인합니다.",
        href: "/disclosure?tab=accounting",
      },
      {
        title: "법령·제도 자료 보기",
        description: "지역주택조합 제도와 납부 관련 참고 자료를 찾습니다.",
        href: "/library#legal",
      },
      {
        title: "서식·양식 자료 보기",
        description: "납부 확인과 문의에 필요한 양식 자료 위치를 확인합니다.",
        href: "/library#forms",
      },
    ],
    topics: [
      {
        title: "산출 기준 확인",
        description: "개인별 금액 대신 산출 기준, 안내 방식, 고지 절차를 다룹니다.",
        status: "기준 정리",
      },
      {
        title: "납부 안내 질의",
        description: "개인정보가 포함되지 않는 공통 질문을 주제별로 모읍니다.",
        status: "질의 접수",
      },
    ],
    participationGuide: "개별 납부액과 고지 내역은 로그인 후 개인자료실에서만 확인합니다.",
  },
  {
    id: "participation",
    title: "이슈의 장",
    dashboardLabel: "이슈 대시보드 보기",
    eyebrow: "Participation",
    summary: "특별한 사안과 주제별 의견을 공개자료와 함께 정리합니다.",
    focus: "자유게시판이나 공지와 달리 특정 사안별 자료, 질문, 검토 상태를 한 화면에서 묶습니다.",
    materials: [
      {
        title: "소통마당 보기",
        description: "공지사항과 조합뉴스를 먼저 확인합니다.",
        href: "/news",
      },
      {
        title: "자유게시판 보기",
        description: "일반 의견과 조합원 게시글은 자유게시판에서 이어서 확인합니다.",
        href: "/news?tab=free",
      },
      {
        title: "핵심자료 보기",
        description: "논의 전 확인해야 할 핵심 자료 색인을 확인합니다.",
        href: "/library#featured",
      },
    ],
    topics: [
      {
        title: "사업 추진 현안",
        description: "주요 진행 사안을 공개자료와 함께 묶어 논의합니다.",
        status: "열린 이슈",
      },
      {
        title: "자료·회계 질의",
        description: "공개자료와 회계 보고에 대한 질문을 주제별로 정리합니다.",
        status: "질의 정리",
      },
    ],
    participationGuide: "정식 조합원 의견 등록과 답변 관리는 로그인 후 조합원 전용 영역에서 진행합니다.",
  },
];

export const defaultIssueCategoryId: IssueCategoryId = "participation";

export const issueCategoryById = issueCategories.reduce(
  (acc, category) => {
    acc[category.id] = category;
    return acc;
  },
  {} as Record<IssueCategoryId, IssueCategory>,
);

export function getIssueCategory(id?: string | null) {
  if (!id || !(id in issueCategoryById)) return issueCategoryById[defaultIssueCategoryId];
  return issueCategoryById[id as IssueCategoryId];
}
