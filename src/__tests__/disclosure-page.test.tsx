import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DisclosureClient } from "@/components/disclosure/disclosure-client";
import { type Document } from "@/components/portal/document-table";

vi.mock("next/navigation", () => ({
  useRouter() {
    return {
      push: vi.fn(),
    };
  },
  useSearchParams() {
    return {
      get: vi.fn().mockReturnValue("operations"),
    };
  },
}));

describe("disclosure page", () => {
  it("places the construction partner agreement under operations and supervision", () => {
    const { container } = render(<DisclosureClient />);

    const rulesSection = container.querySelector("#section-rules");
    const operationsSection = container.querySelector("#section-operations");

    expect(rulesSection).toBeInTheDocument();
    expect(operationsSection).toBeInTheDocument();
    expect(within(rulesSection as HTMLElement).queryByText("공동사업주체 시공예정사 간의 업무협약서")).not.toBeInTheDocument();
    expect(within(operationsSection as HTMLElement).getByText("공동사업주체 시공예정사 간의 업무협약서")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "4. 사업 및 감리" }));
    expect(screen.getByText("시공자 협약서")).toBeInTheDocument();
  });

  it("shows management regulation cards with uploaded document previews", () => {
    const documents: Document[] = [
      {
        id: "doc-operating-rule",
        title: "운영관리규정 최신본",
        description: "사무국 운영 및 문서 보존 절차",
        category: "DISCLOSURE",
        subCategory: "운영관리규정",
        fileName: "operating-rule.pdf",
        fileSize: 1024,
        status: "APPROVED",
        publishedAt: "2026-02-15T00:00:00.000Z",
        documentDate: "2026-02-14T00:00:00.000Z",
        createdAt: "2026-02-15T00:00:00.000Z",
      },
      {
        id: "doc-accounting-rule",
        title: "회계관리규정 최신본",
        description: "예산 집행 및 증빙 관리 절차",
        category: "DISCLOSURE",
        subCategory: "회계관리규정",
        fileName: "accounting-rule.pdf",
        fileSize: 2048,
        status: "APPROVED",
        publishedAt: "2026-02-16T00:00:00.000Z",
        documentDate: "2026-02-16T00:00:00.000Z",
        createdAt: "2026-02-16T00:00:00.000Z",
      },
    ];

    render(
      <DisclosureClient
        session={{ id: "member-1", loginId: "member", name: "조합원", role: "MEMBER" }}
        documents={documents}
      />
    );

    const rulesSection = screen.getByRole("heading", { name: "규약 및 연명부" }).closest("section");
    expect(rulesSection).toBeInTheDocument();
    expect(within(rulesSection as HTMLElement).getByText("운영관리규정")).toBeInTheDocument();
    expect(within(rulesSection as HTMLElement).getByText("회계관리규정")).toBeInTheDocument();
    expect(within(rulesSection as HTMLElement).getByText("선거관리규정")).toBeInTheDocument();
    expect(within(rulesSection as HTMLElement).getByText("운영관리규정 최신본")).toBeInTheDocument();
    expect(within(rulesSection as HTMLElement).getByText("회계관리규정 최신본")).toBeInTheDocument();
    expect(within(rulesSection as HTMLElement).getAllByText("업로드 1건").length).toBeGreaterThanOrEqual(2);

    fireEvent.click(screen.getByRole("button", { name: "1. 규약 및 연명부" }));
    expect(screen.getAllByText("운영관리규정").length).toBeGreaterThan(0);
    expect(screen.getAllByText("회계관리규정").length).toBeGreaterThan(0);
    expect(screen.getAllByText("선거관리규정").length).toBeGreaterThan(0);
  });

  it("opens folder-style registration for regulation documents", () => {
    render(
      <DisclosureClient
        session={{ id: "admin-1", loginId: "admin", name: "운영자", role: "ADMIN" }}
        documents={[]}
      />
    );

    const operatingHeading = screen.getByRole("heading", { name: "운영관리규정" });
    const operatingCard = operatingHeading.closest(".stone-card");
    expect(operatingCard).toBeInTheDocument();

    fireEvent.click(within(operatingCard as HTMLElement).getByRole("button", { name: "자료실 열기" }));

    expect(screen.getByRole("heading", { name: "운영관리규정 문서함" })).toBeInTheDocument();
    const createButton = screen.getByRole("button", { name: "+ 신규 문서 등록" });
    expect(createButton).toBeInTheDocument();

    fireEvent.click(createButton);

    expect(screen.getByRole("heading", { name: "신규 정보공개 문서 등록" })).toBeInTheDocument();
    expect(screen.getByLabelText("문서함 세부 분류 *")).toHaveValue("운영관리규정");
  });
});
