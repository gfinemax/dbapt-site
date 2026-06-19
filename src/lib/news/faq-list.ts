import type { FAQView } from "@/lib/news/types";

export type FaqCategory = "LOAN" | "TAX" | "ADMIN";
export type FaqCategoryFilter = "ALL" | FaqCategory;

export type FAQListItem = {
  id: string;
  question: string;
  answer: string;
  category: string;
  isReal: boolean;
};

const MOCK_FAQS: readonly FAQListItem[] = [
  {
    id: "mock-faq-1",
    question: "중도금 대출 보증서 발급 시 필요한 자격 요건은 무엇입니까?",
    answer:
      "조합 설립인가 및 토지 소유권 등기 단계가 지속됨에 따라, 시공예정사 계약 심의가 마무리되면 HUG 주택도시보증공사 혹은 HF 한국주택금융공사의 보증서 발급 절차가 가동됩니다.\n\n개별 세대 기준으로는 신용평가 요건(7등급 이내), 서울/경기 거주 요건, 그리고 세대주 전원의 무주택 혹은 1주택 소유(입주 후 기존 주택 처분 약정서 제출 조건) 요건을 빈틈없이 충족하셔야 정상 대출이 실행됩니다. 향후 대출 금융사가 확정되면 현장 전담 파견단이 조합 사무실에서 1:1 집중 심사를 제공합니다.",
    category: "LOAN",
    isReal: false,
  },
  {
    id: "mock-faq-2",
    question: "분담금 납부 시 발생하는 취득세 및 조합 지방세 감면 기준은 무엇인가요?",
    answer:
      "지역주택조합 사업 과정에서 조합원 개인 명의 신축 주택에 대한 원시 취득 등록 처리는 법령에 따라 단계적으로 집행됩니다.\n\n취득세(지방세법 제11조 및 지방세특례제한법 관련 감면 요건)는 개별 조합원의 분담금 실비 대조 및 동작구청 신고를 통해 계산되며, 자산의 이중 과세 방지 및 신탁 수탁 자산 매칭 감면 등 세부 조율이 진행됩니다. 조합원의 편리한 신고를 위해 조합 공식 법무대행법인(월드)이 인허가 승인 시 단체 대행 접수 프로세스를 전개할 예정입니다.",
    category: "TAX",
    isReal: false,
  },
  {
    id: "mock-faq-3",
    question: "설립인가 취득 이후 조합원 자격을 안전하게 유지하기 위한 필수 조건은 무엇인가요?",
    answer:
      "주택법령상 지역주택조합원 자격은 [최초 조합설립인가 신청일로부터 입주 가능일까지] 단 하루도 단절됨이 없이 자격 법적 조건을 완벽하게 유지하셔야 안전한 등기가 완수됩니다.\n\n1. 세대주 자격 유지: 세대주 요건을 계속 유지해야 하며, 부득이한 주민등록 이전 시 세대주 여부를 즉각 원대 복귀하셔야 합니다.\n2. 거주 자격: 서울/인천/경기 거주 기간 요건.\n3. 주택 소유 요건: 주민등록등본상 세대원 전원을 합산하여 전용면적 85㎡ 이하 1가구 소유 또는 무주택 요건을 입주 완료 시까지 유지해야 합니다. (도중 다른 일반 아파트 분양권 취득 시 즉각 자격이 박탈되므로 절대 유의바랍니다.)",
    category: "ADMIN",
    isReal: false,
  },
];

export function buildFaqList(
  faqs: readonly FAQView[],
  activeCategory: FaqCategoryFilter,
  searchQuery: string,
): FAQListItem[] {
  const query = searchQuery.trim().toLowerCase();
  const items: FAQListItem[] = [
    ...faqs.map((faq) => ({
      id: faq.id,
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
      isReal: true,
    })),
    ...MOCK_FAQS,
  ];

  return items.filter((item) => {
    const categoryMatches = activeCategory === "ALL" || item.category === activeCategory;
    const queryMatches =
      !query ||
      item.question.toLowerCase().includes(query) ||
      item.answer.toLowerCase().includes(query);

    return categoryMatches && queryMatches;
  });
}
