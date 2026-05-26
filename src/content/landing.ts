export const heroContent = {
  badge: "대방동 지역주택조합",
  title: ["함께 만드는 새로운 보금자리,", "투명하게 소통하는 우리 조합"],
  description:
    "사업 소식부터 공개자료와 조합원 참여까지, 필요한 정보를 한곳에서 확인하세요.",
  primaryAction: "조합원 로그인",
  secondaryAction: "사업정보 보기",
} as const;

export const publicNavigation = [
  { label: "조합소개", href: "#about" },
  { label: "사업정보", href: "#business" },
  { label: "조합소식", href: "#notices" },
  { label: "자료실", href: "#library" },
] as const;

export const featureLinks = [
  {
    title: "사업정보",
    description: "사업개요와 위치, 조감도를 확인하세요.",
    href: "#business",
    icon: "/assets/icons/business-info.png",
  },
  {
    title: "추진현황",
    description: "현재 단계와 주요 일정을 안내합니다.",
    href: "#business",
    icon: "/assets/icons/progress.png",
  },
  {
    title: "조합소식",
    description: "조합의 새 공지와 일정을 전합니다.",
    href: "#notices",
    icon: "/assets/icons/notices.png",
  },
  {
    title: "자료실",
    description: "법령과 일반 안내자료를 제공합니다.",
    href: "#library",
    icon: "/assets/icons/library.png",
  },
] as const;

export const notices = [
  { title: "대방동 지역주택조합 홈페이지 준비 안내", date: "2026.05.26" },
  { title: "조합원 전용 정보공개 서비스 운영 예정", date: "2026.05.26" },
  { title: "사업정보 및 관련 법령 자료실 안내", date: "2026.05.26" },
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
