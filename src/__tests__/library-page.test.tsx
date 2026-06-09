import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LibraryClient } from "@/components/library/library-client";
import { type Document } from "@/components/portal/document-table";

const uploadedMeetingDocuments: Document[] = [
  {
    id: "doc-regular-meeting",
    title: "2026년 정기총회 의사록(직인)",
    description: "등록된 조합원 전용 문서입니다.",
    category: "DISCLOSURE",
    subCategory: "총회 의사록",
    fileName: "regular-meeting-2026.pdf",
    fileSize: 204800,
    status: "APPROVED",
    publishedAt: "2026-04-18T00:00:00.000Z",
    documentDate: "2026-04-18T00:00:00.000Z",
    createdAt: "2026-04-18T00:00:00.000Z",
  },
  {
    id: "doc-founding-meeting",
    title: "창립총회 의사록",
    description: "창립총회 의결 결과와 조합 설립 초기 결의 사항을 확인하는 회의록입니다.",
    category: "DISCLOSURE",
    subCategory: "총회 의사록",
    fileName: "founding-meeting.pdf",
    fileSize: 102400,
    status: "APPROVED",
    publishedAt: "2026-04-17T00:00:00.000Z",
    documentDate: "2026-04-17T00:00:00.000Z",
    createdAt: "2026-04-17T00:00:00.000Z",
  },
  {
    id: "doc-general-meeting",
    title: "정기총회 의사록",
    description: "결산, 예산, 규약 변경 등 정기총회 주요 결의 내용을 확인합니다.",
    category: "DISCLOSURE",
    subCategory: "총회 의사록",
    fileName: "general-meeting.pdf",
    fileSize: 153600,
    status: "APPROVED",
    publishedAt: "2026-04-16T00:00:00.000Z",
    documentDate: "2026-04-16T00:00:00.000Z",
    createdAt: "2026-04-16T00:00:00.000Z",
  },
  {
    id: "doc-board-meeting",
    title: "이사회 회의록",
    description: "계약 심의, 예산 집행, 사업 추진 현황 등 이사회 의결 기록입니다.",
    category: "DISCLOSURE",
    subCategory: "이사회 회의록",
    fileName: "board-meeting.pdf",
    fileSize: 128000,
    status: "APPROVED",
    publishedAt: "2026-04-15T00:00:00.000Z",
    documentDate: "2026-04-15T00:00:00.000Z",
    createdAt: "2026-04-15T00:00:00.000Z",
  },
];

const uploadedRuleDocuments: Document[] = [
  {
    id: "doc-coop-rule",
    title: "조합규약(260418 1차개정)",
    description: "2026년 정기총회에서 조합규약 개정됨",
    category: "DISCLOSURE",
    subCategory: "정관 및 조합규약",
    fileName: "coop-rule.pdf",
    fileSize: 204800,
    status: "APPROVED",
    publishedAt: "2026-06-04T00:00:00.000Z",
    documentDate: "2026-06-04T00:00:00.000Z",
    createdAt: "2026-06-04T00:00:00.000Z",
  },
];

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("library page", () => {
  it("presents a unified index of duplicated public and gated materials", () => {
    render(<LibraryClient />);

    expect(screen.getByRole("heading", { name: "자료실" })).toBeInTheDocument();
    expect(screen.getByText("전체 자료 통합 색인")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "계약·협약" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "회계·감사" })).toBeInTheDocument();

    for (const title of ["조합규약", "각종 계약서", "회의록", "회계감사보고서", "주택법 개정법령"]) {
      expect(screen.getAllByRole("heading", { name: title }).length).toBeGreaterThan(0);
    }

    const contractCard = screen.getAllByTestId("library-item-service-contracts")[0];
    expect(within(contractCard).getByText("조합원 전용")).toBeInTheDocument();
    expect(within(contractCard).getByText(/원본 위치: 공개자료/)).toBeInTheDocument();
    expect(within(contractCard).getByRole("link", { name: "로그인 후 확인" })).toHaveAttribute("href", "/login");

    const lawCard = screen.getByTestId("library-item-housing-law");
    expect(within(lawCard).getByText("공개")).toBeInTheDocument();
    expect(within(lawCard).getByRole("link", { name: "자료 위치 보기" })).toHaveAttribute("href", "/library#legal");
  });

  it("opens member-only source links directly for logged-in users", () => {
    render(<LibraryClient isLoggedIn />);

    const contractCard = screen.getAllByTestId("library-item-service-contracts")[0];
    expect(within(contractCard).queryByRole("link", { name: "로그인 후 확인" })).not.toBeInTheDocument();
    expect(within(contractCard).getByRole("button", { name: "자료 확인" })).toBeInTheDocument();
  });

  it("shows the selected material list inside the library page for logged-in users", () => {
    render(<LibraryClient isLoggedIn />);

    const meetingCard = screen.getAllByTestId("library-item-meeting-minutes")[0];
    fireEvent.click(within(meetingCard).getByRole("button", { name: "자료 확인" }));

    expect(screen.getByRole("dialog", { name: "회의록 자료 목록" })).toBeInTheDocument();
    expect(screen.getByText("회의록 리스트")).toBeInTheDocument();
    expect(screen.getByText("자료실 안에서 바로 확인하는 조합원 전용 색인입니다.")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "자료 목록 닫기" }));
    expect(screen.queryByRole("dialog", { name: "회의록 자료 목록" })).not.toBeInTheDocument();
  });

  it("opens uploaded material details from the material list", () => {
    render(<LibraryClient isLoggedIn documents={uploadedMeetingDocuments} />);

    const meetingCard = screen.getAllByTestId("library-item-meeting-minutes")[0];
    fireEvent.click(within(meetingCard).getByRole("button", { name: "자료 확인" }));
    fireEvent.click(screen.getByText("2026년 정기총회 의사록(직인)"));

    expect(screen.getByTitle("문서 온라인 열람 뷰어")).toHaveAttribute(
      "src",
      "/api/documents/doc-regular-meeting/view",
    );
  });

  it("shows a download prompt instead of a PDF iframe for uploaded Word documents", () => {
    const wordDocuments: Document[] = [
      {
        id: "doc-quarter-report",
        title: "23년 1사분기_실적보고서",
        description: "분기별 조합 실무 보고서입니다.",
        category: "ACCOUNTING",
        subCategory: "실적보고서",
        fileName: "23년 1사분기_실적보고서.docx",
        fileSize: 13241,
        status: "APPROVED",
        publishedAt: "2026-06-09T00:00:00.000Z",
        documentDate: "2023-04-01T00:00:00.000Z",
        createdAt: "2026-06-09T00:00:00.000Z",
      },
    ];

    render(<LibraryClient isLoggedIn documents={wordDocuments} />);

    const auditCard = screen.getAllByTestId("library-item-audit-report")[0];
    fireEvent.click(within(auditCard).getByRole("button", { name: "자료 확인" }));
    fireEvent.click(screen.getByRole("button", { name: "23년 1사분기_실적보고서 상세 열람" }));

    expect(screen.queryByTitle("문서 온라인 열람 뷰어")).not.toBeInTheDocument();
    expect(screen.getByText("이 문서는 PDF 미리보기를 지원하지 않습니다.")).toBeInTheDocument();
    expect(screen.getByText(/23년 1사분기_실적보고서\.docx/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "문서 다운로드" })).toBeInTheDocument();
  });

  it("does not mix static index placeholders with uploaded rule materials", () => {
    render(<LibraryClient isLoggedIn documents={uploadedRuleDocuments} />);

    const ruleCard = screen.getAllByTestId("library-item-cooperative-rules")[0];
    fireEvent.click(within(ruleCard).getByRole("button", { name: "자료 확인" }));

    expect(screen.getByText("조합규약(260418 1차개정)")).toBeInTheDocument();
    expect(screen.queryByText("조합규약 및 정관")).not.toBeInTheDocument();
    expect(screen.queryByText("정식 조합원 연명부")).not.toBeInTheDocument();
  });

  it("lets admins edit and delete uploaded material entries from the library panel", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          document: {
            ...uploadedMeetingDocuments[0],
            title: "수정된 정기총회 의사록",
            description: "수정된 문서 설명",
          },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });
    vi.stubGlobal("fetch", fetchMock);
    vi.spyOn(window, "confirm").mockReturnValue(true);
    vi.spyOn(window, "alert").mockImplementation(() => {});

    render(<LibraryClient isLoggedIn isAdmin documents={uploadedMeetingDocuments} />);

    const meetingCard = screen.getAllByTestId("library-item-meeting-minutes")[0];
    fireEvent.click(within(meetingCard).getByRole("button", { name: "자료 확인" }));

    const uploadedEntry = screen.getByLabelText("2026년 정기총회 의사록(직인) 관리");
    fireEvent.click(within(uploadedEntry).getByRole("button", { name: "수정" }));
    fireEvent.change(within(uploadedEntry).getByLabelText("문서 제목"), {
      target: { value: "수정된 정기총회 의사록" },
    });
    fireEvent.change(within(uploadedEntry).getByLabelText("문서 설명"), {
      target: { value: "수정된 문서 설명" },
    });
    fireEvent.click(within(uploadedEntry).getByRole("button", { name: "저장" }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith(
      "/api/documents/doc-regular-meeting",
      expect.objectContaining({
        method: "PATCH",
        body: expect.stringContaining("수정된 정기총회 의사록"),
      }),
    ));
    expect(screen.getByText("수정된 정기총회 의사록")).toBeInTheDocument();

    const updatedEntry = screen.getByLabelText("수정된 정기총회 의사록 관리");
    fireEvent.click(within(updatedEntry).getByRole("button", { name: "삭제" }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith(
      "/api/documents/doc-regular-meeting",
      { method: "DELETE" },
    ));
    expect(screen.queryByText("수정된 정기총회 의사록")).not.toBeInTheDocument();
  });
});
