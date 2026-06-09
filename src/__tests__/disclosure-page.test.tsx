import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DisclosureClient } from "@/components/disclosure/disclosure-client";
import { MeetingsTable } from "@/components/disclosure/meetings-table";
import { type Document } from "@/components/portal/document-table";

vi.mock("next/navigation", () => ({
  useRouter() {
    return {
      push: vi.fn(),
      refresh: vi.fn(),
    };
  },
  useSearchParams() {
    return {
      get: vi.fn().mockReturnValue("operations"),
    };
  },
}));

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("disclosure page", () => {
  it("labels sent, received, and reply correspondence in the document title", () => {
    render(
      <MeetingsTable
        isLoggedIn={false}
        router={{ push: vi.fn() } as never}
        initialFilterCat="수발신 공문"
      />
    );

    expect(screen.getAllByText("발신").length).toBeGreaterThan(0);
    expect(screen.getAllByText("수신").length).toBeGreaterThan(0);
    expect(screen.getAllByText("회신").length).toBeGreaterThan(0);
    expect(screen.getAllByText("[조합→서울시] 사업시행인가 본신청 접수").length).toBeGreaterThan(0);
    expect(screen.getAllByText("[조합→동작구청] 행정실태점검 조치결과 보고서 (3차)").length).toBeGreaterThan(0);
  });

  it("places the construction partner agreement under operations and supervision", () => {
    const { container } = render(<DisclosureClient />);

    const rulesSection = container.querySelector("#section-rules");
    const operationsSection = container.querySelector("#section-operations");

    expect(rulesSection).toBeInTheDocument();
    expect(operationsSection).toBeInTheDocument();
    expect(within(rulesSection as HTMLElement).queryByText("공동사업주체 시공예정사 간의 업무협약서")).not.toBeInTheDocument();
    expect(within(operationsSection as HTMLElement).getByText("공동사업주체 시공예정사 간의 업무협약서")).toBeInTheDocument();
    expect(within(operationsSection as HTMLElement).getByText("분기별 사업실적보고서")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "연간 자금운용계획" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "2026년도 연간 자금운용 계획 및 차입 예산서" })).not.toBeInTheDocument();

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
    expect(within(rulesSection as HTMLElement).queryByText(/기준일:/)).not.toBeInTheDocument();
    expect(within(rulesSection as HTMLElement).queryByText(/업로드 \d+건/)).not.toBeInTheDocument();
    expect(within(rulesSection as HTMLElement).queryByText("읽기 가이드")).not.toBeInTheDocument();

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

  it("opens document edit controls from the folder list for uploaded documents", () => {
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
        isStarred: true,
        publishedAt: "2026-06-05T00:00:00.000Z",
        documentDate: "2026-06-01T00:00:00.000Z",
        createdAt: "2026-06-05T00:00:00.000Z",
      },
    ];

    render(
      <DisclosureClient
        session={{ id: "admin-1", loginId: "admin", name: "운영자", role: "ADMIN" }}
        documents={documents}
      />
    );

    const operatingHeading = screen.getByRole("heading", { name: "운영관리규정" });
    const operatingCard = operatingHeading.closest(".stone-card");
    expect(operatingCard).toBeInTheDocument();

    fireEvent.click(within(operatingCard as HTMLElement).getByRole("button", { name: "자료실 열기" }));
    fireEvent.click(screen.getAllByRole("button", { name: "운영관리규정 최신본 문서 수정" })[0]);

    expect(screen.getByRole("heading", { name: "정보공개 문서 수정" })).toBeInTheDocument();
    expect(screen.getByLabelText("문서 제목 *")).toHaveValue("운영관리규정 최신본");
    expect(screen.getByLabelText("문서 설명 (선택)")).toHaveValue("사무국 운영 및 문서 보존 절차");
    expect(screen.getByLabelText("문서함 세부 분류 *")).toHaveValue("운영관리규정");
    expect(screen.getByLabelText("중요 문서로 표시")).toBeChecked();
  });

  it("lets admins edit disclosure card title and content by clicking the card text", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        cardContent: {
          itemId: "rules-3",
          title: "운영관리규정 수정 제목",
          description: "운영관리규정 수정 본문입니다.",
        },
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    render(
      <DisclosureClient
        session={{ id: "admin-1", loginId: "admin", name: "운영자", role: "ADMIN" }}
        documents={[]}
      />
    );

    const operatingHeading = screen.getByRole("heading", { name: "운영관리규정" });
    const operatingCard = operatingHeading.closest(".stone-card");
    expect(operatingCard).toBeInTheDocument();

    fireEvent.click(within(operatingCard as HTMLElement).getByRole("button", { name: "운영관리규정 카드 제목과 내용 수정" }));

    expect(within(operatingCard as HTMLElement).getByRole("heading", { name: "공개자료 카드 문구 수정" })).toBeInTheDocument();
    fireEvent.change(within(operatingCard as HTMLElement).getByLabelText("카드 제목 *"), {
      target: { value: "운영관리규정 수정 제목" },
    });
    fireEvent.change(within(operatingCard as HTMLElement).getByLabelText("카드 내용 *"), {
      target: { value: "운영관리규정 수정 본문입니다." },
    });
    fireEvent.click(within(operatingCard as HTMLElement).getByRole("button", { name: "저장" }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith(
      "/api/disclosure-card-contents",
      expect.objectContaining({
        method: "PATCH",
        body: expect.stringContaining("\"itemId\":\"rules-3\""),
      }),
    ));
    expect(within(operatingCard as HTMLElement).getByText("운영관리규정 수정 제목")).toBeInTheDocument();
    expect(within(operatingCard as HTMLElement).getByText("운영관리규정 수정 본문입니다.")).toBeInTheDocument();
  });

  it("confirms uploaded document deletion with an in-app modal", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });
    vi.stubGlobal("fetch", fetchMock);
    vi.spyOn(window, "alert").mockImplementation(() => {});

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
        publishedAt: "2026-06-05T00:00:00.000Z",
        documentDate: "2026-06-01T00:00:00.000Z",
        createdAt: "2026-06-05T00:00:00.000Z",
      },
    ];

    render(
      <DisclosureClient
        session={{ id: "admin-1", loginId: "admin", name: "운영자", role: "ADMIN" }}
        documents={documents}
      />
    );

    const operatingHeading = screen.getByRole("heading", { name: "운영관리규정" });
    const operatingCard = operatingHeading.closest(".stone-card");
    expect(operatingCard).toBeInTheDocument();

    fireEvent.click(within(operatingCard as HTMLElement).getByRole("button", { name: "자료실 열기" }));
    fireEvent.click(screen.getAllByRole("button", { name: "운영관리규정 최신본 문서 삭제" })[0]);

    expect(screen.getByRole("dialog", { name: "운영관리규정 최신본 삭제 확인" })).toBeInTheDocument();
    expect(screen.getByText("삭제된 문서와 첨부파일은 복구할 수 없습니다.")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "영구 삭제" }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith(
      "/api/documents/doc-operating-rule",
      { method: "DELETE" },
    ));
    expect(within(screen.getByLabelText("문서함 열기 상세 드로어")).queryByText("운영관리규정 최신본")).not.toBeInTheDocument();
  });

  it("allows admins to replace files while editing uploaded report documents", () => {
    const documents: Document[] = [
      {
        id: "doc-progress-report",
        title: "23년 1사분기_실적보고서",
        description: "분기별 사업 실적 보고서입니다.",
        category: "DISCLOSURE",
        subCategory: "추진실적",
        fileName: "old-report.docx",
        fileSize: 13241,
        status: "APPROVED",
        publishedAt: "2026-06-09T00:00:00.000Z",
        documentDate: "2023-04-01T00:00:00.000Z",
        createdAt: "2026-06-09T00:00:00.000Z",
        attachments: [
          {
            id: "att-old",
            documentId: "doc-progress-report",
            filePath: "documents/old/old-extra.pdf",
            fileName: "old-extra.pdf",
            fileSize: 2048,
            createdAt: "2026-06-09T00:00:00.000Z",
          },
        ],
      },
    ];

    render(
      <DisclosureClient
        session={{ id: "admin-1", loginId: "admin", name: "운영자", role: "ADMIN" }}
        documents={documents}
      />
    );

    const reportHeading = screen.getByRole("heading", { name: "분기별 사업실적보고서" });
    const reportCard = reportHeading.closest(".stone-card");
    expect(reportCard).toBeInTheDocument();

    fireEvent.click(within(reportCard as HTMLElement).getByRole("button", { name: "자료실 열기" }));
    fireEvent.click(screen.getAllByRole("button", { name: "23년 1사분기_실적보고서 문서 수정" })[0]);

    expect(screen.getByRole("heading", { name: "정보공개 문서 수정" })).toBeInTheDocument();
    expect(screen.getByLabelText("문서함 세부 분류 *")).toHaveValue("실적보고서");
    expect(within(screen.getByLabelText("문서함 세부 분류 *")).queryByRole("option", { name: "추진실적" })).not.toBeInTheDocument();
    expect(screen.getByText("현재 첨부 파일: old-report.docx")).toBeInTheDocument();
    expect(screen.getByText("현재 추가 첨부파일")).toBeInTheDocument();
    expect(screen.getByText("old-extra.pdf")).toBeInTheDocument();
    expect(screen.getByLabelText("첨부 파일 교체 (PDF/HWP/Word)")).toBeInTheDocument();
    expect(screen.getByLabelText("추가 첨부파일 교체 (선택, 최대 10개)")).toBeInTheDocument();
  });

  it("shows admin-editable custom empty messages on disclosure cards", () => {
    render(
      <DisclosureClient
        session={{ id: "admin-1", loginId: "admin", name: "운영자", role: "ADMIN" }}
        documents={[]}
        emptyMessages={[
          {
            subCategory: "회계관리규정",
            title: "회계관리규정 자료 준비 중",
            message: "회계 기준 개정본 검토 후 공개할 예정입니다.",
          },
        ]}
      />
    );

    expect(screen.getByText("회계관리규정 자료 준비 중")).toBeInTheDocument();
    expect(screen.getByText("회계 기준 개정본 검토 후 공개할 예정입니다.")).toBeInTheDocument();

    const accountingHeading = screen.getByRole("heading", { name: "회계관리규정" });
    const accountingCard = accountingHeading.closest(".stone-card");
    expect(accountingCard).toBeInTheDocument();

    fireEvent.click(within(accountingCard as HTMLElement).getByRole("button", { name: "안내문 수정" }));

    expect(within(accountingCard as HTMLElement).getByRole("heading", { name: "빈 자료 안내문 수정" })).toBeInTheDocument();
    expect(within(accountingCard as HTMLElement).getByLabelText("안내 제목 *")).toHaveValue("회계관리규정 자료 준비 중");
    expect(within(accountingCard as HTMLElement).getByLabelText("안내 본문 *")).toHaveValue("회계 기준 개정본 검토 후 공개할 예정입니다.");
  });

  it("emphasizes corrective-action guidance in orange", () => {
    render(
      <DisclosureClient
        session={{ id: "admin-1", loginId: "admin", name: "운영자", role: "ADMIN" }}
        documents={[]}
        emptyMessages={[
          {
            subCategory: "회계관리규정",
            title: "회계관리규정 자료 준비 중",
            message: "행정자료 검토 후 공개 예정입니다. (실태조사 시정조치)",
          },
        ]}
      />
    );

    const accountingHeading = screen.getByRole("heading", { name: "회계관리규정" });
    const accountingCard = accountingHeading.closest(".stone-card");
    expect(accountingCard).toBeInTheDocument();

    expect(within(accountingCard as HTMLElement).getByText("행정자료 검토 후 공개 예정입니다.")).toBeInTheDocument();
    expect(within(accountingCard as HTMLElement).getByText("실태조사 시정조치")).toHaveClass("text-ember-orange");
  });
});
