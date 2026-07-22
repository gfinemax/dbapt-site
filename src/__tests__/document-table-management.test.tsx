import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DocumentTable, type Document } from "@/components/portal/document-table";

vi.mock("@/components/portal/pdf-viewer-modal", () => ({
  PdfViewerModal: () => null,
}));

const makeDocument = (index: number, overrides: Partial<Document> = {}): Document => ({
  id: `doc-${index}`,
  title: `등록 문서 ${index}`,
  description: index === 2 ? "특별 회계 설명" : null,
  category: index % 2 === 0 ? "ACCOUNTING" : "DISCLOSURE",
  fileName: `document-${index}.pdf`,
  fileSize: 1024,
  status: index % 3 === 0 ? "PENDING" : "APPROVED",
  isStarred: index === 1,
  isBookmarkedByCurrentUser: index === 2,
  publishedAt: "2026-07-20T00:00:00.000Z",
  documentDate: `2026-07-${String(Math.min(index, 28)).padStart(2, "0")}`,
  createdAt: "2026-07-20T00:00:00.000Z",
  ...overrides,
});

describe("administrator document table", () => {
  it("separates global importance from the operator's personal favorites", () => {
    render(<DocumentTable documents={[makeDocument(1), makeDocument(2)]} role="ADMIN" />);

    const table = screen.getByRole("table");
    expect(within(table).getByRole("columnheader", { name: "중요" })).toBeInTheDocument();
    expect(within(table).getByRole("columnheader", { name: "즐겨찾기" })).toBeInTheDocument();
    expect(within(table).getByRole("button", { name: "등록 문서 1 중요 해제" })).toBeInTheDocument();
    expect(within(table).getByRole("button", { name: "등록 문서 2 중요 지정" })).toBeInTheDocument();
    expect(within(table).getByRole("button", { name: "등록 문서 2 즐겨찾기 해제" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "즐겨찾기 문서" }));
    expect(within(table).getByText("등록 문서 2")).toBeInTheDocument();
    expect(within(table).queryByText("등록 문서 1")).not.toBeInTheDocument();
  });

  it("searches title, file name, and description and filters disclosure status", () => {
    render(<DocumentTable documents={[makeDocument(1), makeDocument(2), makeDocument(3)]} role="ADMIN" />);

    const search = screen.getByPlaceholderText("제목·파일명·설명 검색...");
    fireEvent.change(search, { target: { value: "특별 회계" } });
    expect(screen.getAllByText("등록 문서 2")).toHaveLength(2);
    expect(screen.queryByText("등록 문서 1")).not.toBeInTheDocument();

    fireEvent.change(search, { target: { value: "" } });
    fireEvent.click(screen.getByRole("button", { name: "공개 대기" }));
    expect(screen.getAllByText("등록 문서 3")).toHaveLength(2);
    expect(screen.queryByText("등록 문서 2")).not.toBeInTheDocument();
  });

  it("paginates the full list in groups of twenty", () => {
    render(
      <DocumentTable
        documents={Array.from({ length: 21 }, (_, index) => makeDocument(index + 1))}
        role="ADMIN"
      />,
    );

    expect(screen.getByText("1 / 2")).toBeInTheDocument();
    expect(screen.queryByText("등록 문서 21")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "다음" }));
    expect(screen.getAllByText("등록 문서 21")).toHaveLength(2);
    expect(screen.getByText("2 / 2")).toBeInTheDocument();
  });

  it("uses the compact bookmarked-content pattern in drawer mode without a secondary action row", () => {
    const onOpenDocument = vi.fn();
    render(
      <DocumentTable
        documents={[makeDocument(1)]}
        role="ADMIN"
        isDrawerMode
        onOpenDocument={onOpenDocument}
      />,
    );

    const openButton = screen.getByRole("button", { name: "등록 문서 1 열람" });
    expect(openButton.closest("div.group")).toHaveClass("rounded-xl", "px-4", "py-3");
    expect(screen.getByRole("button", { name: "등록 문서 1 중요 해제" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "등록 문서 1 즐겨찾기" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "등록 문서 1 삭제" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "등록 문서 1 공감 0개" })).not.toBeInTheDocument();
    expect(screen.queryByText("1.0 KB")).not.toBeInTheDocument();
    expect(screen.queryByText("열람 0회")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "열람" })).not.toBeInTheDocument();

    fireEvent.click(openButton);
    expect(onOpenDocument).toHaveBeenCalledWith(expect.objectContaining({ id: "doc-1" }));
  });
});
