"use client";

import { useState, useEffect, useRef, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { MeetingsTable, type MeetingCategory, type CorrespondenceType } from "./meetings-table";
import { type Document } from "@/components/portal/document-table";

type DisclosureClientProps = {
  onOpenPortal?: (category?: string, search?: string) => void;
  session?: {
    id: string;
    loginId: string | null;
    name: string;
    role: string;
    email?: string;
  } | null;
  documents?: Document[];
  onViewDocument?: (document: Document) => void;
  emptyMessages?: DisclosureEmptyMessage[];
  cardContents?: DisclosureCardContent[];
};

export type DisclosureEmptyMessage = {
  subCategory: string;
  title: string;
  message: string;
};

export type DisclosureCardContent = {
  itemId: string;
  title: string;
  description: string;
};

type EmptyMessageEditState = {
  subCategory: string;
  title: string;
  message: string;
};

type CardContentEditState = {
  itemId: string;
  title: string;
  description: string;
};

const DEFAULT_EMPTY_MESSAGES: DisclosureEmptyMessage[] = [];
const DEFAULT_CARD_CONTENTS: DisclosureCardContent[] = [];

type TabId = "rules" | "meetings" | "administration" | "accounting" | "operations";

type DisclosureDocumentFolder = {
  id: string;
  title: string;
  desc: string;
  date: string;
  count: number;
  searchKey: string;
  categoryKey: "DISCLOSURE";
  bbsCategory: MeetingCategory;
  preview: string[];
  correspondenceTypes?: string[];
};

const tabs = [
  { id: "rules", label: "1. 규약 및 연명부" },
  { id: "meetings", label: "2. 의사록" },
  { id: "administration", label: "3. 공문서" },
  { id: "accounting", label: "4. 회계 및 감사" },
  { id: "operations", label: "5. 사업 및 감리" },
] as const;

// 각 카테고리별 자료 리스트 정의
const disclosureData = {
  rules: {
    title: "규약 및 연명부",
    subtitle: "조합의 헌법인 규약, 운영·회계·선거관리규정, 공인된 조합원 소속 명부입니다.",
    badge: "Regulations & Agreements",
    items: [
      {
        id: "rules-1",
        title: "대방동 지역주택조합 정관 및 조합규약",
        desc: "조합원의 의무와 권리, 총회·이사회 의결 절차 등 조합의 법적 운영 기준을 명세한 정관 문서입니다.",
        date: "2026.02",
        subCategory: "정관 및 조합규약",
        guide: ["조합원 권리·의무", "총회·이사회 의결", "분담금·탈퇴 기준"],
      },
      {
        id: "rules-3",
        title: "운영관리규정",
        desc: "사무국 운영, 민원 응대, 문서 접수·보존, 내부 결재와 정보공개 절차를 정리한 운영 기준입니다.",
        date: "2026.02",
        subCategory: "운영관리규정",
        guide: ["사무국 업무 범위", "문서 접수·보존", "민원·열람 처리"],
      },
      {
        id: "rules-4",
        title: "회계관리규정",
        desc: "예산 편성, 자금 집행, 증빙 보관, 회계 보고와 감사 대응 절차를 정리한 회계 운영 기준입니다.",
        date: "2026.02",
        subCategory: "회계관리규정",
        guide: ["예산·집행 절차", "증빙 보관", "회계 보고·감사"],
      },
      {
        id: "rules-5",
        title: "선거관리규정",
        desc: "임원 선출, 후보 등록, 투표·개표, 이의신청 절차를 공정하게 관리하기 위한 선거 기준입니다.",
        date: "2026.02",
        subCategory: "선거관리규정",
        guide: ["후보 등록", "투표·개표", "이의신청 절차"],
      },
      {
        id: "rules-6",
        title: "기타 내부 운영규정",
        desc: "조합 운영 중 별도 제정되는 보안, 개인정보, 협력사 관리 등 내부 규정을 한곳에서 관리합니다.",
        date: "수시 업데이트",
        subCategory: "기타 내부 운영규정",
        guide: ["보안·개인정보", "협력사 관리", "개정 이력"],
      },
      {
        id: "rules-2",
        title: "대방동지역주택조합 정식 조합원 연명부",
        desc: "동작구청 설립인가 및 정식 등재 완료된 입주 예정 조합원 연명 목록입니다. (개인정보 비식별 조치)",
        date: "2025.12",
        subCategory: "조합원 연명부",
        guide: ["등재 기준", "비식별 처리", "열람 권한"],
      },
    ]
  },
  meetings: {
    title: "의사록",
    subtitle: "총회, 이사회, 대의원회 의결록을 별도 문서함으로 보관합니다.",
    badge: "Meetings",
    items: [
      { 
        id: "meetings-1", 
        title: "총회의사록 문서함", 
        desc: "창립총회 및 최근 임시총회 안건 의결 결과, 조합원 서명 날인 등이 기재된 정식 공증 의사록 문서 보존 문서함입니다.", 
        date: "최근 업데이트: 2026.01", 
        subCategory: "총회 의사록",
        count: 0,
        searchKey: "총회",
        categoryKey: "DISCLOSURE",
        bbsCategory: "총회 의사록",
        preview: []
      },
      { 
        id: "meetings-2", 
        title: "이사회 의사록 문서함", 
        desc: "사무국 예산 조율, 협력사 계약 심의 등 이사회 및 감사 정례 의결 의사록이 안전하게 일괄 보관되어 있습니다.", 
        date: "최근 업데이트: 2026.01", 
        subCategory: "이사회 의사록",
        count: 0,
        searchKey: "이사회",
        categoryKey: "DISCLOSURE",
        bbsCategory: "이사회 의사록",
        preview: []
      },
      {
        id: "meetings-3",
        title: "대의원 의사록 문서함",
        desc: "대의원회 안건 보고, 의결 결과, 참석자 확인 등 대의원 회의 관련 기록을 별도 보관하는 문서함입니다.",
        date: "최근 업데이트: 2026.01",
        subCategory: "대의원 의사록",
        count: 0,
        searchKey: "대의원",
        categoryKey: "DISCLOSURE",
        bbsCategory: "대의원 의사록",
        preview: []
      },
    ]
  },
  administration: {
    title: "공문서",
    subtitle: "구청, 서울시 등 유관기관 공문서와 사업시행 관련 행정 문서를 보관합니다.",
    badge: "Administration",
    items: [
      { 
        id: "administration-1", 
        title: "수신 공문서 문서함", 
        desc: "동작구청, 서울시 등 관청에서 조합으로 접수된 공식 수신 공문과 행정 실태조사 관련 수신자료를 보관합니다.", 
        date: "최근 업데이트: 2026.01", 
        subCategory: "공문서",
        count: 0,
        searchKey: "수신",
        categoryKey: "DISCLOSURE",
        bbsCategory: "공문서",
        correspondenceTypes: ["수신"],
        preview: []
      },
      { 
        id: "administration-2", 
        title: "발신 공문서 문서함", 
        desc: "조합에서 동작구청, 서울시 등 유관기관으로 제출한 발신 공문과 회신·조치결과 보고 문서를 보관합니다.", 
        date: "최근 업데이트: 2026.01", 
        subCategory: "공문서",
        count: 0,
        searchKey: "발신",
        categoryKey: "DISCLOSURE",
        bbsCategory: "공문서",
        correspondenceTypes: ["발신", "회신"],
        preview: []
      },
      { 
        id: "administration-4", 
        title: "기타 공문서 문서함", 
        desc: "수신 및 발신 분류에 속하지 않는 협조전, 보고서 및 기타 행정 서류를 보관합니다.", 
        date: "최근 업데이트: 2026.01", 
        subCategory: "공문서",
        count: 0,
        searchKey: "기타",
        categoryKey: "DISCLOSURE",
        bbsCategory: "공문서",
        correspondenceTypes: ["기타"],
        preview: []
      }
    ]
  },
  accounting: {
    title: "회계 및 감사",
    subtitle: "자금관리 신탁사의 에스크로 입출금 내역과 외부감사인의 투명한 회계보고서입니다.",
    badge: "Accounting & Audit",
    items: [
      { id: "acc-1", title: "정기 외부회계감사 보고서", desc: "독립된 공인회계법인으로부터 분담금 집행 일체를 정밀 감사받은 결과보고서입니다. (의무공개 대상)", date: "2026.02", subCategory: "회계감사보고서" },
      { id: "acc-3", title: "연간 자금운용계획", desc: "조합의 사업비 조달 및 집행, 예산 수립 관련 연간 전체 자금 운용 계획입니다. (의무공개 대상)", date: "2026.01", subCategory: "연간자금운용계획" },
      { id: "acc-4", title: "월별 자금 입출금 명세서", desc: "신탁사 수탁 계좌를 통해 안전하게 집행된 월별 자금 입출금 세부 명세서입니다. (의무공개 대상)", date: "2026.02", subCategory: "월별 자금 입출금" },
      { id: "acc-5", title: "조합원 분담금 납부 현황", desc: "전체 조합원의 분담금 납부 현황 및 미납금 관리 내역입니다. (의무공개 대상)", date: "수시 업데이트", subCategory: "분담금 납부" },
      { id: "acc-6", title: "추가 분담금 산출 명세서", desc: "사업비 변경 등에 따른 추가 분담금 발생 여부 및 산출 근거 자료입니다. (의무공개 대상)", date: "수시 업데이트", subCategory: "추가 분담금 산출" },
    ]
  },
  operations: {
    title: "사업, 계약 및 감리",
    subtitle: "조합이 체결한 정식 용역 계약 원본과 감리전문가의 월간 실적서입니다.",
    badge: "Operations, Contracts & Supervision",
    items: [
      { id: "ops-6", title: "토지 사용권원 및 소유권 확보 비율 명세서", desc: "토지 사용권원 및 소유권 확보 비율을 공개합니다. (의무공개 대상)", date: "수시 업데이트", subCategory: "토지확보" },
      { id: "ops-1", title: "설계·용역·부동산 대행사별 정식 계약서 원본 일람", desc: "하우드엔지니어링(설계), 솔롱고스(매입), 월드(법률) 등 조합이 정식 체결하고 공증한 일체의 계약서 모음입니다.", date: "2025.07", subCategory: "용역 계약서" },
      { id: "ops-7", title: "사업시행계획서 문서함", desc: "대방동 11-103 일대 주택건설 사업계획서(안) 및 지구단위계획 결정 고시(서울시 고시 제2022-291호) 등 인허가 원본 문서입니다.", date: "최근 업데이트: 2025.08", subCategory: "사업시행계획" },
      { id: "ops-2", title: "공사시행 및 월별 공사진행 보고서", desc: "월별 공사진행 상황에 관한 서류 (의무공개 대상)", date: "2026.02", subCategory: "공사시행" },
      { id: "ops-3", title: "분기별 사업실적보고서", desc: "지구단위계획 완수 이후 소방·설비 설계 용역사 발주 등 단계별 마일스톤 도달 실적에 대한 조합 공식 보고입니다.", date: "2025.09", subCategory: "실적보고서" },
      { id: "ops-4", title: "건축·소방 감리원 안전점검 및 월간 감리보고서", desc: "인허가 관련 정밀 안전 확보와 법령 준수를 위해 감리 기술자가 정밀 점검하고 관청에 제출한 공식 실적서입니다.", date: "2025.11", subCategory: "감리 보고서" },
      { id: "ops-8", title: "분양신청 및 관련 자료 문서함", desc: "분양신청에 관한 서류 및 관련 자료로 구성되어 있습니다.", date: "수시 업데이트", subCategory: "분양" },
    ]
  }
};

// 각 탭메뉴별 서브메뉴(세부 분류) 정의
const subMenus = {
  rules: [
    { label: "조합규약", id: "rules-1" },
    { label: "운영관리규정", id: "rules-3" },
    { label: "회계관리규정", id: "rules-4" },
    { label: "선거관리규정", id: "rules-5" },
    { label: "기타 운영규정", id: "rules-6" },
    { label: "조합연명부", id: "rules-2" },
  ],
  meetings: [
    { label: "총회 의사록", id: "meetings-1" },
    { label: "이사회 의사록", id: "meetings-2" },
    { label: "대의원 의사록", id: "meetings-3" },
  ],
  administration: [
    { label: "수신 공문", id: "administration-1" },
    { label: "발신 공문", id: "administration-2" },
    { label: "기타 공문", id: "administration-4" },
  ],
  accounting: [
    { label: "회계감사보고서", id: "acc-1" },
    { label: "연간자금운용계획", id: "acc-3" },
    { label: "월별 자금 입출금", id: "acc-4" },
    { label: "분담금 납부", id: "acc-5" },
    { label: "추가 분담금 산출", id: "acc-6" },
  ],
  operations: [
    { label: "토지확보", id: "ops-6" },
    { label: "용역 계약서", id: "ops-1" },
    { label: "사업시행계획서", id: "ops-7" },
    { label: "공사시행", id: "ops-2" },
    { label: "실적보고서", id: "ops-3" },
    { label: "감리 보고서", id: "ops-4" },
    { label: "분양", id: "ops-8" },
  ],
} as const;

function formatDisclosureDate(dateStr?: string | null) {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return dateStr;
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")}`;
}

function getSubCategoryAliases(subCategory: string) {
  if (subCategory === "실적보고서") return ["실적보고서", "추진실적"];
  if (subCategory === "공문서") return ["공문서", "수발신 공문"];
  if (subCategory === "이사회 의사록") return ["이사회 의사록", "이사회 회의록"];
  if (subCategory === "대의원 의사록") return ["대의원 의사록", "대의원 회의록"];
  return [subCategory];
}

function normalizeDisclosureSubCategory(subCategory: string) {
  if (subCategory === "수발신 공문") return "공문서";
  if (subCategory === "이사회 회의록") return "이사회 의사록";
  if (subCategory === "대의원 회의록") return "대의원 의사록";
  return subCategory;
}

function renderEmptyMessageBody(message: string) {
  return message.split(/(\([^()]+\))/g).map((part, index) => {
    const emphasized = part.match(/^\(([^()]+)\)$/);
    if (emphasized) {
      const label = emphasized[1].trim();
      const isCorrectiveAction = label.includes("시정조치");
      return (
        <span
          key={`${part}-${index}`}
          className={cn(
            "mx-0.5 inline-flex rounded-full border px-1.5 py-0.5 text-[9px] font-bold",
            isCorrectiveAction
              ? "border-ember-orange/25 bg-ember-orange/10 text-ember-orange"
              : "border-sky-blue/20 bg-sky-blue/10 text-sky-blue",
          )}
        >
          {label}
        </span>
      );
    }

    return <span key={`${part}-${index}`}>{part}</span>;
  });
}

export function DisclosureClient({
  onOpenPortal,
  session,
  documents = [],
  onViewDocument,
  emptyMessages,
  cardContents,
}: DisclosureClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isLoggedIn = !!session;
  const isAdmin = session?.role === "ADMIN";
  
  const [activeTab, setActiveTab] = useState<TabId>("rules");
  const [activeSubTab, setActiveSubTab] = useState<string>("all");
  const [isLeftDrawerOpen, setIsLeftDrawerOpen] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<DisclosureDocumentFolder | null>(null);
  const [mounted, setMounted] = useState(false);
  const [managedEmptyMessages, setManagedEmptyMessages] = useState<DisclosureEmptyMessage[]>(emptyMessages || DEFAULT_EMPTY_MESSAGES);
  const [managedCardContents, setManagedCardContents] = useState<DisclosureCardContent[]>(cardContents || DEFAULT_CARD_CONTENTS);
  const [editingEmptyMessage, setEditingEmptyMessage] = useState<EmptyMessageEditState | null>(null);
  const [editingCardContent, setEditingCardContent] = useState<CardContentEditState | null>(null);
  const [emptyMessageError, setEmptyMessageError] = useState("");
  const [cardContentError, setCardContentError] = useState("");
  const [emptyMessageSaving, setEmptyMessageSaving] = useState(false);
  const [cardContentSaving, setCardContentSaving] = useState(false);
  const isScrollingRef = useRef(false);
  const isSubTabClickRef = useRef(false);

  const openDocumentFolder = (folder: DisclosureDocumentFolder) => {
    setSelectedFolder(folder);
    setIsLeftDrawerOpen(true);
  };

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setMounted(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setManagedEmptyMessages(emptyMessages || DEFAULT_EMPTY_MESSAGES);
  }, [emptyMessages]);
  /* eslint-enable react-hooks/set-state-in-effect */

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setManagedCardContents(cardContents || DEFAULT_CARD_CONTENTS);
  }, [cardContents]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const getCardContent = (item: { id: string; title: string; desc: string }) =>
    managedCardContents.find((content) => content.itemId === item.id) || {
      itemId: item.id,
      title: item.title,
      description: item.desc,
    };

  const openCardContentEditor = (content: DisclosureCardContent) => {
    setCardContentError("");
    setEditingCardContent({ ...content });
  };

  const getDefaultEmptyMessage = (subCategory: string) => ({
    subCategory,
    title: "아직 업로드된 자료가 없습니다.",
    message: `관리자 포털에서 \`의무 정보 공개 자료\`의 세부 분류를 \`${subCategory}\`로 선택해 등록하면 이 카드에 최신 자료가 표시됩니다.`,
  });

  const getEmptyMessage = (subCategory: string) =>
    managedEmptyMessages.find((message) => message.subCategory === subCategory) ||
    getDefaultEmptyMessage(subCategory);

  const openEmptyMessageEditor = (subCategory: string) => {
    setEmptyMessageError("");
    setEditingEmptyMessage(getEmptyMessage(subCategory));
  };

  const handleEmptyMessageSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingEmptyMessage) return;

    if (!editingEmptyMessage.title.trim() || !editingEmptyMessage.message.trim()) {
      setEmptyMessageError("안내 제목과 본문을 모두 입력해 주세요.");
      return;
    }

    setEmptyMessageSaving(true);
    setEmptyMessageError("");
    try {
      const res = await fetch("/api/disclosure-empty-messages", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingEmptyMessage),
      });
      const data = await res.json();

      if (!res.ok) {
        setEmptyMessageError(data.error || "안내문 저장에 실패했습니다.");
        return;
      }

      const savedMessage = data.emptyMessage as DisclosureEmptyMessage;
      setManagedEmptyMessages((prev) => [
        savedMessage,
        ...prev.filter((message) => message.subCategory !== savedMessage.subCategory),
      ]);
      setEditingEmptyMessage(null);
      router.refresh();
    } catch (e) {
      console.error(e);
      setEmptyMessageError("안내문 저장 중 오류가 발생했습니다.");
    } finally {
      setEmptyMessageSaving(false);
    }
  };

  const handleCardContentSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingCardContent) return;

    if (!editingCardContent.title.trim() || !editingCardContent.description.trim()) {
      setCardContentError("카드 제목과 내용을 모두 입력해 주세요.");
      return;
    }

    setCardContentSaving(true);
    setCardContentError("");
    try {
      const res = await fetch("/api/disclosure-card-contents", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingCardContent),
      });
      const data = await res.json();

      if (!res.ok) {
        setCardContentError(data.error || "카드 문구 저장에 실패했습니다.");
        return;
      }

      const savedContent = data.cardContent as DisclosureCardContent;
      setManagedCardContents((prev) => [
        savedContent,
        ...prev.filter((content) => content.itemId !== savedContent.itemId),
      ]);
      setEditingCardContent(null);
      router.refresh();
    } catch (e) {
      console.error(e);
      setCardContentError("카드 문구 저장 중 오류가 발생했습니다.");
    } finally {
      setCardContentSaving(false);
    }
  };

  // 메인 탭 변경 시 서브 탭을 '전체 보기'("all")로 리셋
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setActiveSubTab("all");
  }, [activeTab]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // 좌측 문서함 드로어 활성화 시 본문 스크롤 차단 처리
  useEffect(() => {
    if (isLeftDrawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isLeftDrawerOpen]);

  // URL에서 탭 정보를 읽어와 초기 활성화 탭 설정
  useEffect(() => {
    const tabParam = searchParams.get("tab") as TabId;
    if (tabParam && ["rules", "meetings", "administration", "accounting", "operations"].includes(tabParam)) {
      // 탭 파라미터가 있을 경우 비동기 상태 업데이트 및 지연 스크롤
      const timer = setTimeout(() => {
        setActiveTab(tabParam);
        const element = document.getElementById(`section-${tabParam}`);
        if (element) {
          const offsetTop = element.offsetTop - 200;
          window.scrollTo({ top: offsetTop, behavior: "smooth" });
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  // 서브 탭 변경 완료 후, 레이아웃 변경이 반영된 시점에 정확한 위치로 스무스 스크롤 이동
  useEffect(() => {
    if (!isSubTabClickRef.current) return;
    isSubTabClickRef.current = false;

    const timer = setTimeout(() => {
      if (activeSubTab !== "all") {
        const cardElement = document.getElementById(`card-${activeSubTab}`);
        if (cardElement) {
          isScrollingRef.current = true;
          cardElement.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
          setTimeout(() => {
            isScrollingRef.current = false;
          }, 850);
          return;
        }
      }

      const element = document.getElementById(`section-${activeTab}`);
      if (!element) return;

      isScrollingRef.current = true;
      const offsetTop = element.offsetTop - 200;

      window.scrollTo({
        top: offsetTop,
        behavior: "smooth",
      });

      setTimeout(() => {
        isScrollingRef.current = false;
      }, 850);
    }, 100);

    return () => clearTimeout(timer);
  }, [activeSubTab, activeTab]);

  // 스크롤 감지 및 현재 보고 있는 섹션 활성화 (Scroll Spy)
  useEffect(() => {
    const handleScroll = () => {
      if (isScrollingRef.current) return;

      // 서브 탭 필터링이 활성화된 경우 스크롤 스파이에 의한 탭 자동 전환을 유예합니다.
      // (섹션 크기가 극도로 작아지면서 탭이 잘못 변경되어 레이아웃이 꼬이는 현상 완전 차단)
      if (activeSubTab !== "all") return;

      const scrollPosition = window.scrollY + 220; // 상단 보정

      for (const tab of tabs) {
        const element = document.getElementById(`section-${tab.id}`);
        if (!element) continue;

        const offsetTop = element.offsetTop;
        const offsetHeight = element.offsetHeight;

        if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
          setActiveTab(tab.id);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [activeSubTab]);

  // 탭 클릭 시 스무스 스크롤 이동
  const handleTabClick = (tabId: TabId) => {
    setActiveTab(tabId);
    const element = document.getElementById(`section-${tabId}`);
    if (!element) return;

    isScrollingRef.current = true;
    const offsetTop = element.offsetTop - 200;

    window.scrollTo({
      top: offsetTop,
      behavior: "smooth",
    });

    setTimeout(() => {
      isScrollingRef.current = false;
    }, 850);
  };

  return (
    <div className="w-full">
      {/* 1. 공개자료 대형 배너 (Hero Section) - 조합소개 감성 계승 */}
      <section className="bg-gradient-to-br from-warm-canvas via-parchment-card to-stone-surface/30 pt-16 pb-20 border-b border-stone-surface text-center">
        <div className="site-container max-w-4xl px-4">
          <span className="inline-flex rounded-full bg-sky-blue/10 px-4 py-1.5 text-xs font-bold text-sky-blue uppercase tracking-wider">
            Disclosures
          </span>
          <h1 className="mt-6 text-4xl sm:text-5xl font-black text-charcoal-primary leading-tight tracking-tight">
            투명하게 밝히는<br />
            <span className="text-sky-blue">대방동의 정직한 지표</span>
          </h1>
          <p className="mt-6 text-base sm:text-lg text-graphite/90 max-w-2xl mx-auto leading-relaxed">
            당 조합은 주택법령의 의무 정보공개 대상인 14개 핵심 자료 일체를 온·오프라인 보안망 내에 100% 개방하여, 어떠한 밀실 의사결정도 방지하고 조합원들의 자산 권익을 투명하게 수호합니다.
          </p>
        </div>
      </section>

      {/* 2. 스티키 서브 내비게이션 탭 바 (Sticky Sub Nav) */}
      <nav className="sticky top-18 z-10 bg-warm-canvas/90 backdrop-blur border-b border-stone-surface shadow-xs transition-all duration-200 py-2 space-y-2">
        <div className="site-container max-w-4xl px-4 relative">
          {/* 우측 페이드 아웃 그라데이션 오버레이 (모바일용 가로 스크롤 시각 유도) */}
          <div className="absolute right-4 top-0 bottom-0 w-12 bg-gradient-to-l from-warm-canvas via-warm-canvas/60 to-transparent pointer-events-none z-10 md:hidden animate-in fade-in" />
          
          <div className="flex justify-start md:justify-center items-center gap-1 sm:gap-4 overflow-x-auto whitespace-nowrap scrollbar-none py-1.5 text-sm font-semibold pr-12 md:pr-0">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    handleTabClick(tab.id);
                    setActiveSubTab("all");
                  }}
                  className={cn(
                    "px-4 py-2 rounded-full text-xs sm:text-sm transition-all duration-200 cursor-pointer font-bold",
                    isActive
                      ? "bg-midnight text-white shadow-sm"
                      : "text-graphite hover:text-charcoal-primary hover:bg-stone-surface/50"
                  )}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 서브메뉴 피처 라인 (Submenu Feature Row) */}
        <div className="site-container max-w-4xl px-4 border-t border-stone-surface/50 pt-2 relative">
          {/* 우측 페이드 아웃 그라데이션 오버레이 (모바일용 가로 스크롤 시각 유도) */}
          <div className="absolute right-4 top-2 bottom-0 w-12 bg-gradient-to-l from-warm-canvas via-warm-canvas/60 to-transparent pointer-events-none z-10 md:hidden animate-in fade-in" />
          
          <div className="flex justify-start md:justify-center items-center gap-1.5 sm:gap-2 overflow-x-auto whitespace-nowrap scrollbar-none py-1 text-xs pr-12 md:pr-0">
            {subMenus[activeTab].map((sub) => {
              const isActive = activeSubTab === sub.id;
              return (
                <button
                  key={sub.id}
                  onClick={() => {
                    isSubTabClickRef.current = true;
                    const nextSubTab = isActive ? "all" : sub.id;
                    setActiveSubTab(nextSubTab);
                  }}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-[11px] font-bold border transition-all duration-150 cursor-pointer",
                    isActive
                      ? "bg-[#f8f7f4] border-midnight text-midnight font-extrabold shadow-2xs"
                      : "bg-white border-stone-surface text-ash hover:text-graphite hover:border-ash"
                  )}
                >
                  {sub.label}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* 3. 본문 통합 내용 영역 (Sections) */}
      <div className="site-container max-w-4xl px-4 py-16 sm:py-24 space-y-24 sm:space-y-36">
        {Object.entries(disclosureData).map(([key, data]) => {
          const tabKey = key as TabId;
          return (
            <section key={tabKey} id={`section-${tabKey}`} className="scroll-mt-52 min-h-[480px]">
              <div className="max-w-xl mb-10 mx-auto text-center">
                <span className="inline-flex rounded-full bg-ember-orange/10 px-3 py-1 text-[10px] font-bold text-ember-orange uppercase tracking-wider">
                  {data.badge}
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-charcoal-primary tracking-tight leading-tight mt-3">
                  {data.title}
                </h2>
                <p className="text-xs sm:text-sm text-graphite mt-2 leading-relaxed">
                  {data.subtitle}
                </p>
              </div>

              {/* 개별 자료 목록 */}
              {/* 개별 자료 목록 */}
              {false ? (
                <div className="grid gap-6 md:grid-cols-2">
                  {data.items
                    .map((item) => {
                      const folderItem = item as DisclosureDocumentFolder;

                      // 1. 실제 DB 문서 중 해당 카테고리의 문서 필터링
                      const realDocs = documents.filter(
                        (d) => {
                          const normalizedSub = d.subCategory === "수발신 공문" ? "공문서" :
                                                d.subCategory === "이사회 회의록" ? "이사회 의사록" :
                                                d.subCategory === "대의원 회의록" ? "대의원 의사록" :
                                                d.subCategory;
                          return d.category === "DISCLOSURE" &&
                                 normalizedSub === folderItem.bbsCategory &&
                                 (!folderItem.correspondenceTypes ||
                                   (d.correspondenceType && folderItem.correspondenceTypes.includes(d.correspondenceType)));
                        }
                      );

                      // 2. 중요 표시 문서가 있는지 계산
                      const hasStarred = realDocs.some(d => d.isStarred);

                      // 3. 총 보관 건수 = 기본 목 데이터 개수 + 실제 업로드 개수
                      const totalCount = folderItem.count + realDocs.length;

                      // 4. 미리보기 프리뷰 구성 (실제 DB 문서 최신순 우선 -> mock previews 보완)
                      const displayPreviews = [
                        ...realDocs.map(d => ({ title: d.title, isStarred: !!d.isStarred, isReal: true })),
                        ...folderItem.preview.map(p => ({ title: p, isStarred: false, isReal: false }))
                      ].slice(0, 3);

                      // 5. 최근 업로드 문서 발생일 포맷팅
                      const latestDocDate = realDocs.length > 0 
                        ? realDocs[0].documentDate?.slice(0, 10).replace(/-/g, ".") || realDocs[0].createdAt.slice(0, 10).replace(/-/g, ".")
                        : null;

                      const isSelected = activeSubTab === folderItem.id;
                      const isAnySelectedInThisSection = subMenus[tabKey].some((sub) => sub.id === activeSubTab);
                      
                      return (
                        <div 
                          id={`card-${folderItem.id}`}
                          key={folderItem.id}
                          onClick={(e) => {
                            const target = e.target as HTMLElement;
                            if (target.closest("button, a, input, label, select, textarea, form")) {
                              return;
                            }
                            isSubTabClickRef.current = true;
                            setActiveSubTab(folderItem.id);
                          }}
                          className={cn(
                            "stone-card bg-white p-5 rounded-2xl border flex flex-col justify-between transition-all duration-500 relative group cursor-pointer",
                            isAnySelectedInThisSection
                              ? isSelected
                                ? "border-sky-blue ring-1 ring-sky-blue/30 shadow-lg scale-[1.02] z-2 opacity-100 bg-[#fdfdfc]"
                                : "opacity-45 scale-[0.98] blur-[0.2px] border-stone-surface"
                              : "border-stone-surface hover:shadow-md hover:scale-[1.01] opacity-100"
                          )}
                        >
                          <div>
                            {/* Folder Top Meta */}
                            {hasStarred && (
                              <div className="flex items-center justify-end text-[10px] font-bold text-ash font-mono mb-2">
                                <span className="bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full text-[9px] font-extrabold text-amber-600 flex items-center gap-0.5 select-none shadow-2xs">
                                  ⭐ 중요 자료 보유
                                </span>
                              </div>
                            )}

                            <h3 className="text-[14.5px] font-bold text-charcoal-primary mt-3.5 leading-snug">
                              {folderItem.title}
                            </h3>
                            <p className="text-xs text-graphite mt-2 leading-5 font-normal">
                              {folderItem.desc}
                            </p>

                            {/* 문서함 미리보기 리스트 */}
                            <div className="mt-4 p-4 rounded-xl bg-parchment-card border border-stone-surface/60 border-dashed relative overflow-hidden">
                              <p className="text-[10px] font-bold text-ash uppercase tracking-wider mb-2 font-mono flex items-center justify-between select-none">
                                <span className="flex items-center gap-1.5">
                                  <span className="size-1.5 rounded-full bg-sky-blue animate-pulse"></span>
                                  문서함 내부 수납 목록
                                </span>
                                {latestDocDate && (
                                  <span className="text-[9px] text-graphite/60 font-mono font-normal">
                                    최근 업로드: {latestDocDate}
                                  </span>
                                )}
                              </p>
                              <ul className="space-y-1.5 text-[11px] text-graphite/90 font-medium">
                                {displayPreviews.map((p, idx) => (
                                  <li key={idx} className="flex items-center gap-1.5 truncate">
                                    <span className="text-[10px] text-sky-blue">•</span>
                                    {p.isReal && p.isStarred && (
                                      <span className="text-amber-500 font-bold select-none shrink-0" title="중요 문서">★</span>
                                    )}
                                    <span className={cn("truncate", p.isReal ? "font-semibold text-charcoal-primary" : "text-graphite/85")}>
                                      {p.title}
                                    </span>
                                    {p.isReal && (
                                      <span className="bg-sky-blue/10 border border-sky-blue/20 text-sky-blue text-[8px] font-black scale-90 rounded px-1 shrink-0 select-none">실제자료</span>
                                    )}
                                  </li>
                                ))}
                              </ul>
                              
                              {/* 비로그인 시 블러 및 락 처리 */}
                              {!isLoggedIn && (
                                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-parchment-card/30 to-parchment-card backdrop-blur-[1.5px] flex items-center justify-center">
                                  <span className="text-[10px] text-ember-orange font-bold bg-white/95 border border-stone-surface px-3 py-1.5 rounded-full shadow-xs flex items-center gap-1 select-none">
                                    <span>🔒</span> 로그인 후 {totalCount}건 전체 조회
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* 문서함 열기 클릭 시 좌측 드로어 열고 세부 데이터 세팅 */}
                          <div className="mt-6 pt-4 border-t border-stone-surface/60">
                            <div className="flex items-center justify-between">
                              <span className={cn(
                                "text-[10px] font-bold flex items-center gap-1",
                                isLoggedIn ? "text-meadow-green" : "text-ember-orange"
                              )}>
                                {isLoggedIn ? (
                                  <><span>🔓</span> 자료실 연동 가동 중</>
                                ) : (
                                  <><span>🔒</span> 기밀 보안 그룹</>
                                )}
                              </span>
                              <Button
                                onClick={() => {
                                  openDocumentFolder(folderItem);
                                }}
                                size="sm"
                                className="rounded-full text-[11px] font-bold bg-midnight hover:bg-midnight/90 text-white cursor-pointer h-8 px-4"
                              >
                                문서함 열기
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2">
                  {data.items
                    .map((item) => {
                      const isSelected = activeSubTab === item.id;
                      const isAnySelectedInThisSection = subMenus[tabKey].some((sub) => sub.id === activeSubTab);
                      const itemSubCategory = item.subCategory;
                      const itemSubCategoryAliases = getSubCategoryAliases(itemSubCategory).map(normalizeDisclosureSubCategory);
                      const cardContent = getCardContent(item);
                      const isEditingThisCardContent = editingCardContent?.itemId === item.id;
                      const realDocs = documents
                        .filter((doc) => {
                          const normalizedSubCategory = normalizeDisclosureSubCategory(doc.subCategory || "");
                          const itemCorrespondenceTypes =
                            "correspondenceTypes" in item ? item.correspondenceTypes : undefined;

                          return (
                            doc.category === "DISCLOSURE" &&
                            itemSubCategoryAliases.includes(normalizedSubCategory) &&
                            (!itemCorrespondenceTypes ||
                              (doc.correspondenceType && itemCorrespondenceTypes.includes(doc.correspondenceType)))
                          );
                        })
                        .sort((a, b) => {
                          const aTime = new Date(a.documentDate || a.publishedAt || a.createdAt).getTime();
                          const bTime = new Date(b.documentDate || b.publishedAt || b.createdAt).getTime();
                          return bTime - aTime;
                        });
                      const latestDoc = realDocs[0];
                      const displayDocs = realDocs.slice(0, 3);
                      const emptyMessage = getEmptyMessage(itemSubCategory);
                      const isEditingThisEmptyMessage = editingEmptyMessage?.subCategory === itemSubCategory;
                      const documentFolder: DisclosureDocumentFolder = {
                        id: `${item.id}-folder`,
                        title: `${itemSubCategory} 문서함`,
                        desc: cardContent.description,
                        date: item.date,
                        count: realDocs.length,
                        searchKey: cardContent.title,
                        categoryKey: "DISCLOSURE",
                        bbsCategory: itemSubCategory as MeetingCategory,
                        correspondenceTypes:
                          "correspondenceTypes" in item ? item.correspondenceTypes : undefined,
                        preview:
                          displayDocs.length > 0
                            ? displayDocs.map((doc) => doc.title)
                            : [cardContent.title],
                      };
                      
                      return (
                        <div 
                          id={`card-${item.id}`}
                          key={item.id}
                          onClick={(e) => {
                            const target = e.target as HTMLElement;
                            if (target.closest("button, a, input, label, select, textarea, form")) {
                              return;
                            }
                            isSubTabClickRef.current = true;
                            setActiveSubTab(item.id);
                          }}
                          className={cn(
                            "stone-card bg-white p-5 rounded-2xl border flex flex-col justify-start transition-all duration-500 relative group cursor-pointer",
                            isAnySelectedInThisSection
                              ? isSelected
                                ? "border-sky-blue ring-1 ring-sky-blue/30 shadow-lg scale-[1.02] z-2 opacity-100 bg-[#fdfdfc]"
                                : "opacity-45 scale-[0.98] blur-[0.2px] border-stone-surface"
                              : "border-stone-surface hover:shadow-md hover:scale-[1.01] opacity-100"
                          )}
                        >
                      <div>
                        {isEditingThisCardContent && editingCardContent ? (
                          <form onSubmit={handleCardContentSubmit} className="rounded-xl border border-stone-surface bg-[#f8f7f4] p-3">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <h3 className="text-[11px] font-bold text-charcoal-primary">공개자료 카드 문구 수정</h3>
                                <p className="mt-0.5 text-[9px] font-semibold text-ash">
                                  {itemSubCategory} 카드 문구를 수정합니다.
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingCardContent(null);
                                  setCardContentError("");
                                }}
                                className="shrink-0 rounded-full border border-stone-surface bg-white px-2.5 py-1 text-[9px] font-bold text-graphite hover:bg-stone-surface"
                              >
                                닫기
                              </button>
                            </div>

                            {cardContentError && (
                              <div className="mt-3 rounded-lg bg-red-50 p-2 text-[10px] font-semibold text-red-600">
                                {cardContentError}
                              </div>
                            )}

                            <div className="mt-3">
                              <label className="mb-1 block text-[10px] font-bold text-charcoal-primary" htmlFor={`card-title-${item.id}`}>
                                카드 제목 *
                              </label>
                              <input
                                id={`card-title-${item.id}`}
                                type="text"
                                value={editingCardContent.title}
                                onChange={(e) => setEditingCardContent((prev) => prev ? { ...prev, title: e.target.value } : prev)}
                                required
                                className="w-full rounded-lg border border-[#f2f0ed] bg-white px-3 py-2 text-xs outline-none transition focus:border-ember-orange focus:ring-1 focus:ring-ember-orange"
                              />
                            </div>

                            <div className="mt-3">
                              <label className="mb-1 block text-[10px] font-bold text-charcoal-primary" htmlFor={`card-description-${item.id}`}>
                                카드 내용 *
                              </label>
                              <textarea
                                id={`card-description-${item.id}`}
                                value={editingCardContent.description}
                                onChange={(e) => setEditingCardContent((prev) => prev ? { ...prev, description: e.target.value } : prev)}
                                required
                                rows={3}
                                className="w-full resize-none rounded-lg border border-[#f2f0ed] bg-white px-3 py-2 text-xs leading-relaxed outline-none transition focus:border-ember-orange focus:ring-1 focus:ring-ember-orange"
                              />
                            </div>

                            <div className="mt-3 flex items-center justify-end gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                  setEditingCardContent(null);
                                  setCardContentError("");
                                }}
                                className="h-7 rounded-full border-stone-surface px-3 text-[10px] font-bold text-graphite hover:bg-stone-surface"
                              >
                                취소
                              </Button>
                              <Button
                                type="submit"
                                disabled={cardContentSaving}
                                className="h-7 rounded-full bg-midnight px-3 text-[10px] font-bold text-white hover:bg-black disabled:opacity-60"
                              >
                                {cardContentSaving ? "저장 중..." : "저장"}
                              </Button>
                            </div>
                          </form>
                        ) : isAdmin ? (
                          <button
                            type="button"
                            onClick={() => openCardContentEditor(cardContent)}
                            aria-label={`${cardContent.title} 카드 제목과 내용 수정`}
                            className="block w-full rounded-xl text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-blue/35"
                          >
                            <h3 className="text-[14.5px] font-bold text-charcoal-primary leading-snug">
                              {cardContent.title}
                            </h3>
                            <p className="mt-2 text-xs font-normal leading-5 text-graphite">
                              {cardContent.description}
                            </p>
                          </button>
                        ) : (
                          <>
                            <h3 className="text-[14.5px] font-bold text-charcoal-primary leading-snug">
                              {cardContent.title}
                            </h3>
                            <p className="mt-2 text-xs text-graphite leading-5 font-normal">
                              {cardContent.description}
                            </p>
                          </>
                        )}
                      </div>

                      {/* 로그인 유도 & 프리뷰 (비로그인 상태) vs 정식 자료실 액션 (로그인 상태) */}
                      <div className="mt-4 pt-3 border-t border-stone-surface/60">
                        {isLoggedIn ? (
                          <div className="space-y-3">
                            {displayDocs.length > 0 ? (
                              <div className="flex min-h-[188px] flex-col justify-start rounded-xl border border-stone-surface bg-[#f8f7f4] p-3">
                                <div className="flex items-center justify-between gap-3">
                                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-ash">
                                    등록 자료
                                  </span>
                                  <span className="text-[10px] font-bold text-meadow-green">
                                    최신 {formatDisclosureDate(latestDoc?.documentDate || latestDoc?.publishedAt || latestDoc?.createdAt)}
                                  </span>
                                </div>
                                <ul className="mt-2 space-y-1.5">
                                  {displayDocs.map((doc) => (
                                    <li key={doc.id} className="flex items-center justify-between gap-3 rounded-lg bg-white px-3 py-1.5">
                                      <div className="min-w-0">
                                        <p className="truncate text-[11px] font-bold text-charcoal-primary">
                                          {doc.title}
                                        </p>
                                        <p className="mt-0.5 text-[9px] font-mono text-ash">
                                          {formatDisclosureDate(doc.documentDate || doc.publishedAt || doc.createdAt)}
                                          {doc.isStarred ? " · 중요" : ""}
                                        </p>
                                      </div>
                                      <Button
                                        onClick={() => {
                                          if (onViewDocument) onViewDocument(doc);
                                          else if (onOpenPortal) onOpenPortal("DISCLOSURE", doc.title);
                                          else window.dispatchEvent(new CustomEvent('open-portal', { detail: { category: "DISCLOSURE", search: doc.title } }));
                                        }}
                                        variant="outline"
                                        size="sm"
                                        className="h-7 shrink-0 rounded-full border-sky-blue/30 px-2.5 text-[10px] font-bold text-sky-blue hover:bg-sky-blue/5"
                                      >
                                        문서 보기
                                      </Button>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ) : (
                              <div className="rounded-xl border border-dashed border-stone-surface bg-[#f8f7f4] p-3">
                                {isEditingThisEmptyMessage && editingEmptyMessage ? (
                                  <form onSubmit={handleEmptyMessageSubmit} className="space-y-3">
                                    <div className="flex items-start justify-between gap-3">
                                      <div>
                                        <h4 className="text-[11px] font-bold text-charcoal-primary">빈 자료 안내문 수정</h4>
                                        <p className="mt-0.5 text-[9px] font-semibold text-ash">
                                          {editingEmptyMessage.subCategory} 카드 안에서 바로 수정합니다.
                                        </p>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setEditingEmptyMessage(null);
                                          setEmptyMessageError("");
                                        }}
                                        className="shrink-0 rounded-full border border-stone-surface bg-white px-2.5 py-1 text-[9px] font-bold text-graphite hover:bg-stone-surface"
                                      >
                                        닫기
                                      </button>
                                    </div>

                                    {emptyMessageError && (
                                      <div className="rounded-lg bg-red-50 p-2 text-[10px] font-semibold text-red-600">
                                        {emptyMessageError}
                                      </div>
                                    )}

                                    <div>
                                      <label className="mb-1 block text-[10px] font-bold text-charcoal-primary" htmlFor="empty-message-title">
                                        안내 제목 *
                                      </label>
                                      <input
                                        id="empty-message-title"
                                        type="text"
                                        value={editingEmptyMessage.title}
                                        onChange={(e) => setEditingEmptyMessage((prev) => prev ? { ...prev, title: e.target.value } : prev)}
                                        required
                                        className="w-full rounded-lg border border-[#f2f0ed] bg-white px-3 py-2 text-xs outline-none transition focus:border-ember-orange focus:ring-1 focus:ring-ember-orange"
                                      />
                                    </div>

                                    <div>
                                      <label className="mb-1 block text-[10px] font-bold text-charcoal-primary" htmlFor="empty-message-body">
                                        안내 본문 *
                                      </label>
                                      <textarea
                                        id="empty-message-body"
                                        value={editingEmptyMessage.message}
                                        onChange={(e) => setEditingEmptyMessage((prev) => prev ? { ...prev, message: e.target.value } : prev)}
                                        required
                                        rows={4}
                                        className="w-full resize-none rounded-lg border border-[#f2f0ed] bg-white px-3 py-2 text-xs leading-relaxed outline-none transition focus:border-ember-orange focus:ring-1 focus:ring-ember-orange"
                                      />
                                      <p className="mt-1 text-[9px] leading-4 text-ash">
                                        괄호로 감싼 문구는 카드에서 강조 표시됩니다. 예: (실태조사 시정조치)
                                      </p>
                                    </div>

                                    <div className="flex items-center justify-end gap-2">
                                      <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                          setEditingEmptyMessage(null);
                                          setEmptyMessageError("");
                                        }}
                                        className="h-7 rounded-full border-stone-surface px-3 text-[10px] font-bold text-graphite hover:bg-stone-surface"
                                      >
                                        취소
                                      </Button>
                                      <Button
                                        type="submit"
                                        disabled={emptyMessageSaving}
                                        className="h-7 rounded-full bg-midnight px-3 text-[10px] font-bold text-white hover:bg-black disabled:opacity-60"
                                      >
                                        {emptyMessageSaving ? "저장 중..." : "저장"}
                                      </Button>
                                    </div>
                                  </form>
                                ) : (
                                  <>
                                    <div className="flex items-start justify-between gap-3">
                                      <p className="text-[11px] font-bold text-charcoal-primary">
                                        {emptyMessage.title}
                                      </p>
                                      {isAdmin && (
                                        <button
                                          type="button"
                                          onClick={() => openEmptyMessageEditor(itemSubCategory)}
                                          className="shrink-0 rounded-full border border-stone-surface bg-white px-2.5 py-1 text-[9px] font-bold text-graphite hover:border-sky-blue hover:text-sky-blue"
                                        >
                                          안내문 수정
                                        </button>
                                      )}
                                    </div>
                                    <p className="mt-1 text-[10px] leading-4 text-graphite">
                                      {renderEmptyMessageBody(emptyMessage.message)}
                                    </p>
                                  </>
                                )}
                              </div>
                            )}
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] text-meadow-green font-bold flex items-center gap-1">
                                <span>🔓</span> 정식 세션 내 보호 열람 중
                              </span>
                              <Button
                                onClick={() => {
                                  openDocumentFolder(documentFolder);
                                }}
                                size="sm"
                                className="rounded-full text-[11px] font-bold bg-sky-blue hover:bg-sky-blue/90 text-white cursor-pointer h-8"
                              >
                                자료실 열기
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {/* 고해상도 정보 보호용 리드미컬하고 세련된 디테일 블러 프레임 */}
                            <div className="bg-parchment-card border border-stone-surface border-dashed p-3 rounded-xl text-[10px] space-y-1.5 select-none pointer-events-none opacity-50 relative overflow-hidden">
                              {/* 그라데이션 오버레이로 감각적인 숨김 처리 */}
                              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-parchment-card/30 to-parchment-card backdrop-blur-[2.5px] z-1" />
                              <div className="flex justify-between font-mono">
                                <span className="font-bold text-ash">문서분류:</span>
                                <span className="text-charcoal-primary">DISCLOSURE-SECURE-RAW</span>
                              </div>
                              <div className="flex justify-between font-mono">
                                <span className="font-bold text-ash">해시코드:</span>
                                <span className="text-charcoal-primary">SHA256-8F2B...7D0A</span>
                              </div>
                              <div className="flex justify-between font-mono">
                                <span className="font-bold text-ash">파일형태:</span>
                                <span className="text-charcoal-primary">PUBLIC-SEALED-PDF</span>
                              </div>
                            </div>

                            <div className="flex items-center justify-between">
                              <span className="text-[10px] text-ember-orange font-bold flex items-center gap-1">
                                <span>🔒</span> 기밀 문서 보호 대상
                              </span>
                              <Button
                                onClick={() => {
                                  alert("이 문서는 대방동지역주택조합 정식 조합원 기밀 의무공개 자료입니다.\n자산 가치 보호를 위해 조합원 로그인 세션 내에서만 암호화 열람 및 영수증 매칭이 가능합니다.");
                                  router.push("/login");
                                }}
                                variant="outline"
                                size="sm"
                                className="rounded-full text-[11px] font-bold border-ember-orange text-ember-orange hover:bg-ember-orange/5 cursor-pointer h-8"
                              >
                                조합원 로그인
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>

                    </div>
                  );
                })}
                </div>
              )}
            </section>
          );
        })}
      </div>

      {/* 좌측 사이드 슬라이드 오버 (Drawer) 패널 - 문서함 열기 (React Portal로 body에 직접 마운트하여 stacking context 레이아웃 버그 완전 차단) */}
      {mounted && isLeftDrawerOpen && createPortal(
        <>
          <div
            onClick={() => setIsLeftDrawerOpen(false)}
            className="fixed inset-0 z-40 bg-black/35 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
          />

          <div
            className="fixed inset-y-0 left-0 z-50 w-full max-w-2xl bg-warm-canvas border-r border-stone-surface shadow-2xl p-6 sm:p-8 flex flex-col overflow-y-auto animate-in slide-in-from-left duration-300 ease-out"
            aria-label="문서함 열기 상세 드로어"
          >
            <div className="flex items-center justify-between pb-6 border-b border-stone-surface">
              <div className="flex items-center gap-2">
                <span className="flex size-7 items-center justify-center rounded-full bg-midnight text-xs font-semibold text-white">
                  📂
                </span>
                <div>
                  <h2 className="text-base font-bold text-charcoal-primary">
                    {selectedFolder?.title || "문서함"}
                  </h2>
                  <p className="text-[11px] text-ash mt-0.5 font-medium">
                    대방동 지역주택조합 공인 보존 문서 목록
                  </p>
                </div>
              </div>
              
              <button
                onClick={() => setIsLeftDrawerOpen(false)}
                className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full border border-stone-surface bg-[#f8f7f4] text-xs font-medium text-graphite hover:bg-stone-surface active:bg-[#e8e6e1] transition duration-200 cursor-pointer"
              >
                <svg className="w-3.5 h-3.5 text-ash" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
                닫기
              </button>
            </div>

            <div className="flex-1 mt-6">
              {selectedFolder && (
                <MeetingsTable
                  isLoggedIn={isLoggedIn}
                  role={session?.role}
                  onOpenPortal={onOpenPortal}
                  router={router}
                  initialFilterCat={selectedFolder.bbsCategory as MeetingCategory}
                  initialSearchQuery=""
                  initialCorrespondenceTypes={selectedFolder.correspondenceTypes as CorrespondenceType[]}
                  onBackToFolders={() => setIsLeftDrawerOpen(false)}
                  documents={documents}
                  onViewDocument={onViewDocument}
                />
              )}
            </div>
          </div>
        </>,
        document.body
      )}
    </div>
  );
}
