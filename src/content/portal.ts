export type PortalRole = "member" | "refund" | "admin";
export type PortalAccent = "orange" | "green" | "blue" | "yellow";

export type PortalCard = {
  title: string;
  description: string;
  status: string;
  accent: PortalAccent;
};

export type PortalProfile = {
  role: PortalRole;
  navLabel: string;
  href: string;
  title: string;
  description: string;
  cards: PortalCard[];
  emptyTitle: string;
  emptyDescription: string;
};

export const portalRoleOrder: PortalRole[] = ["member", "refund", "admin"];

export const portalProfiles: Record<PortalRole, PortalProfile> = {
  member: {
    role: "member",
    navLabel: "정식 조합원",
    href: "/portal/member",
    title: "정식 조합원 포털 미리보기",
    description:
      "조합 운영 정보와 본인 확인 항목, 참여 서비스를 한곳에서 확인하게 될 화면입니다.",
    cards: [
      {
        title: "확인 필요 알림",
        description: "중요공지와 확인 요청이 표시될 영역입니다.",
        status: "알림 연동 준비 중",
        accent: "orange",
      },
      {
        title: "내 분담금",
        description: "본인의 납부·미납 현황이 표시될 영역입니다.",
        status: "개인별 자료 제공 예정",
        accent: "yellow",
      },
      {
        title: "새 정보공개",
        description: "권한이 있는 공개자료가 표시될 영역입니다.",
        status: "게시 기능 준비 중",
        accent: "blue",
      },
      {
        title: "회계·실적보고",
        description: "허용된 예산·결산 및 추진실적을 확인할 영역입니다.",
        status: "열람 기능 준비 중",
        accent: "green",
      },
      {
        title: "이슈의 장",
        description: "현안 토론과 공식답변이 표시될 영역입니다.",
        status: "참여 기능 준비 중",
        accent: "orange",
      },
      {
        title: "투표·설문",
        description: "의견수렴과 투표가 표시될 영역입니다.",
        status: "투표 기능 준비 중",
        accent: "blue",
      },
    ],
    emptyTitle: "표시할 조합원 자료가 아직 없습니다",
    emptyDescription:
      "실제 인증과 자료 공개 정책이 확정된 뒤 허용된 정보만 이 화면에서 제공됩니다.",
  },
  refund: {
    role: "refund",
    navLabel: "환불조합원",
    href: "/portal/refund",
    title: "환불조합원 포털 미리보기",
    description:
      "환불 완료 전 허용된 자료와 본인 처리현황을 확인하게 될 화면입니다.",
    cards: [
      {
        title: "공개자료",
        description: "환불조합원에게 허용된 자료가 표시될 영역입니다.",
        status: "권한 확인 후 제공 예정",
        accent: "blue",
      },
      {
        title: "회계·실적보고",
        description: "허용 범위의 회계·실적자료가 표시될 영역입니다.",
        status: "제공 범위 확정 예정",
        accent: "green",
      },
      {
        title: "내 환불현황",
        description: "본인의 정산 통지와 처리현황이 표시될 영역입니다.",
        status: "개인별 자료 제공 예정",
        accent: "yellow",
      },
      {
        title: "통지 알림",
        description: "본인 대상 통지와 확인 안내가 표시될 영역입니다.",
        status: "알림 연동 준비 중",
        accent: "orange",
      },
    ],
    emptyTitle: "표시할 환불 처리 자료가 아직 없습니다",
    emptyDescription:
      "향후 허용 범위가 확정되면 본인 대상 자료와 통지만 제공됩니다.",
  },
  admin: {
    role: "admin",
    navLabel: "관리자",
    href: "/portal/admin",
    title: "관리자 포털 미리보기",
    description:
      "공개와 알림 운영을 검토하게 될 관리자 준비 화면입니다.",
    cards: [
      {
        title: "공개기한",
        description: "정보공개 대상과 마감일을 점검할 영역입니다.",
        status: "관리 기능 준비 중",
        accent: "orange",
      },
      {
        title: "문서 승인",
        description: "공개 또는 회계자료의 검토 대기를 확인할 영역입니다.",
        status: "승인 절차 준비 중",
        accent: "blue",
      },
      {
        title: "납부자료 검증",
        description: "향후 업로드된 납부자료를 확인할 영역입니다.",
        status: "업로드 연동 준비 중",
        accent: "green",
      },
      {
        title: "독촉 승인",
        description: "발송 전 검토와 승인을 확인할 영역입니다.",
        status: "발송 연동 준비 중",
        accent: "yellow",
      },
      {
        title: "알림 결과",
        description: "발송 결과와 오류를 확인할 영역입니다.",
        status: "결과 조회 준비 중",
        accent: "blue",
      },
      {
        title: "권한·감사로그",
        description: "역할 변경과 기록을 확인할 영역입니다.",
        status: "감사 기능 준비 중",
        accent: "orange",
      },
    ],
    emptyTitle: "처리할 운영 작업이 아직 없습니다",
    emptyDescription:
      "실제 관리 기능이 연결되기 전에는 승인이나 발송 동작을 제공하지 않습니다.",
  },
};
