import { describe, expect, it } from "vitest";

import { buildFaqList } from "@/lib/news/faq-list";
import type { FAQView } from "@/lib/news/types";

const faq = (overrides: Partial<FAQView> = {}): FAQView => ({
  id: "real-faq-1",
  question: "분양 관련 실제 질문",
  answer: "분양 관련 실제 답변입니다.",
  category: "ADMIN",
  isPublished: true,
  viewCount: 0,
  sortOrder: 0,
  createdAt: "2026-06-19T00:00:00.000Z",
  updatedAt: "2026-06-19T00:00:00.000Z",
  ...overrides,
});

describe("buildFaqList", () => {
  it("keeps real FAQs before preview FAQs and marks their source", () => {
    const items = buildFaqList([faq()], "ALL", "");

    expect(items[0]).toMatchObject({
      id: "real-faq-1",
      question: "분양 관련 실제 질문",
      isReal: true,
    });
    expect(items.slice(1).every((item) => item.isReal === false)).toBe(true);
  });

  it("filters real and preview FAQs by category", () => {
    const items = buildFaqList(
      [
        faq({ id: "loan-real", category: "LOAN", question: "중도금 대출 실제 질문" }),
        faq({ id: "tax-real", category: "TAX", question: "세금 실제 질문" }),
      ],
      "TAX",
      "",
    );

    expect(items.map((item) => item.id)).toEqual(["tax-real", "mock-faq-2"]);
  });

  it("searches question and answer text after combining sources", () => {
    const items = buildFaqList(
      [faq({ id: "answer-match", answer: "조합원 명부 열람 절차를 안내합니다." })],
      "ALL",
      "명부",
    );

    expect(items.map((item) => item.id)).toEqual(["answer-match"]);
  });
});
