export const heroContent = {
  badge: "대방동 지역주택조합",
  title: ["함께 만드는 새로운 보금자리", "투명하게 소통하는 우리 조합"],
  description:
    "사업 소식부터 공개자료와 조합원 참여까지, 필요한 정보를 한곳에서 확인하세요.",
  primaryAction: "조합원 로그인",
  secondaryAction: "사업정보 보기",
} as const;

export const publicNavigation = [
  { label: "조합소개", href: "/about" },
  { label: "사업현황", href: "/business" },
  { label: "공개자료", href: "/disclosure" },
  { label: "조합소식", href: "/news" },
  { label: "자료실", href: "/library" },
] as const;

export const megaMenuNavigation = [
  {
    title: "조합소개",
    href: "/about",
    subItems: [
      { label: "인사말", href: "/about?tab=greetings" },
      { label: "연혁", href: "/about?tab=history" },
      { label: "조합조직도", href: "/about?tab=organization" },
      { label: "오시는 길", href: "/about?tab=location" },
    ],
  },
  {
    title: "사업현황",
    href: "/business",
    subItems: [
      { label: "건축개요", href: "/business#overview" },
      { label: "조감도 / 배치도", href: "/business#plan" },
      { label: "평형별 평면도", href: "/business#unit" },
      { label: "추진절차", href: "/business#timeline" },
    ],
  },
  {
    title: "공개자료",
    href: "/disclosure",
    subItems: [
      { label: "조합규약", href: "/disclosure?tab=rules", isPortalGated: true },
      { label: "조합연명부", href: "/disclosure?tab=rules", isPortalGated: true },
      { label: "의사록", href: "/disclosure?tab=meetings", isPortalGated: true },
      { label: "공문서", href: "/disclosure?tab=administration", isPortalGated: true },
      { label: "사업시행계획서", href: "/disclosure?tab=operations", isPortalGated: true },
      { label: "회계감사보고서", href: "/disclosure?tab=accounting", isPortalGated: true },
      { label: "연간자금운용계획", href: "/disclosure?tab=accounting", isPortalGated: true },
      { label: "월별 자금 입출금", href: "/disclosure?tab=accounting", isPortalGated: true },
      { label: "분담금 납부", href: "/disclosure?tab=accounting", isPortalGated: true },
      { label: "추가 분담금 산출", href: "/disclosure?tab=accounting", isPortalGated: true },
      { label: "계약서", href: "/disclosure?tab=operations", isPortalGated: true },
      { label: "월별 공사진행 상황", href: "/disclosure?tab=operations", isPortalGated: true },
      { label: "실적보고서", href: "/disclosure?tab=operations", isPortalGated: true },
      { label: "월간감리업무실적보고", href: "/disclosure?tab=operations", isPortalGated: true },
    ],
  },
  {
    title: "조합소식",
    href: "/news",
    subItems: [
      { label: "공지사항", href: "/news?tab=notice" },
      { label: "조합뉴스 (주/월간소식)", href: "/news?tab=newsletter" },
      { label: "자유게시판", href: "/news?tab=free" },
      { label: "FAQ", href: "/news?tab=faq" },
    ],
  },
  {
    title: "자료실",
    href: "/library",
    subItems: [
      { label: "핵심자료", href: "/library#featured" },
      { label: "총회·회의", href: "/library#meetings" },
      { label: "계약·협약", href: "/library#contracts" },
      { label: "회계·감사", href: "/library#accounting" },
      { label: "법령·제도", href: "/library#legal" },
      { label: "서식·양식", href: "/library#forms" },
    ],
  },
] as const;

export const featureLinks = [
  {
    title: "사업정보",
    description: "사업현황과 위치, 조감도를 확인하세요.",
    href: "/business#overview",
    icon: "/assets/icons/business-info.png",
  },
  {
    title: "추진현황",
    description: "현재 단계와 주요 일정을 안내합니다.",
    href: "/business#timeline",
    icon: "/assets/icons/progress.png",
  },
  {
    title: "조합소식",
    description: "조합의 새 공지와 일정을 전합니다.",
    href: "/news",
    icon: "/assets/icons/notices.png",
  },
  {
    title: "자료실",
    description: "법령, 계약, 총회, 서식 자료를 한곳에서 찾습니다.",
    href: "/library",
    icon: "/assets/icons/library.png",
  },
] as const;

export const memberServices = [
  {
    title: "정보공개",
    description: "의무공개 자료와 회의·계약 문서를 확인합니다.",
  },
  {
    title: "회계·실적보고",
    description: "예산·결산과 자금집행, 추진실적을 확인합니다.",
  },
  {
    title: "내 분담금",
    description: "본인의 납부 및 고지 내역을 확인합니다.",
  },
  {
    title: "이슈의 장",
    description: "정식 조합원이 현안에 참여하는 공간입니다.",
  },
] as const;
