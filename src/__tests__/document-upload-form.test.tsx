import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DocumentUploadForm } from "@/components/portal/document-upload-form";

describe("document upload form", () => {
  it("supports regulation subcategories and common regulation file formats", () => {
    const { container } = render(<DocumentUploadForm />);

    const subCategorySelect = screen.getByLabelText("문서함 세부 분류 *");
    expect(subCategorySelect).toHaveTextContent("정관 및 조합규약");
    expect(subCategorySelect).toHaveTextContent("운영관리규정");
    expect(subCategorySelect).toHaveTextContent("회계관리규정");
    expect(subCategorySelect).toHaveTextContent("선거관리규정");
    expect(within(subCategorySelect).getByRole("option", { name: "연간자금운용계획" })).toBeInTheDocument();
    expect(subCategorySelect).toHaveTextContent("실적보고서");
    expect(within(subCategorySelect).queryByRole("option", { name: "자금운용계획" })).not.toBeInTheDocument();
    expect(subCategorySelect).not.toHaveTextContent("추진실적");

    const fileInput = container.querySelector("#file-upload");
    expect(fileInput).toHaveAttribute("accept", ".pdf,.hwp,.hwpx,.doc,.docx");
  });

  it("shows correspondence type selection for correspondence documents", () => {
    render(<DocumentUploadForm defaultSubCategory="수발신 공문" />);

    const correspondenceSelect = screen.getByLabelText("수발신 구분 *");
    expect(correspondenceSelect).toHaveValue("수신");
    expect(correspondenceSelect).toHaveTextContent("수신");
    expect(correspondenceSelect).toHaveTextContent("발신");
    expect(correspondenceSelect).not.toHaveTextContent("회신");
  });

  it("normalizes the sent correspondence folder to the correspondence upload form", () => {
    render(
      <DocumentUploadForm
        defaultSubCategory="발신 공문"
        replyTargetDocuments={[
          {
            id: "received-1",
            title: "동작구청 시정명령 수신 공문",
            description: null,
            category: "DISCLOSURE",
            subCategory: "수발신 공문",
            correspondenceType: "수신",
            fileName: "received.pdf",
            fileSize: 1024,
            status: "APPROVED",
            publishedAt: "2026-06-01T00:00:00.000Z",
            documentDate: "2026-06-01T00:00:00.000Z",
            createdAt: "2026-06-01T00:00:00.000Z",
          },
        ]}
      />
    );

    expect(screen.getByLabelText("문서함 세부 분류 *")).toHaveValue("수발신 공문");
    expect(screen.getByLabelText("수발신 구분 *")).toHaveValue("발신");
    expect(screen.queryByLabelText("회신 대상 수신 공문 (선택)")).not.toBeInTheDocument();

    fireEvent.click(screen.getByLabelText("회신 공문으로 등록"));

    const replyTargetSelect = screen.getByLabelText("회신 대상 수신 공문 (선택)");
    expect(replyTargetSelect).toHaveTextContent("동작구청 시정명령 수신 공문");
  });

  it("allows received correspondence to be marked as not requiring a reply", () => {
    render(<DocumentUploadForm defaultSubCategory="수발신 공문" />);

    expect(screen.getByLabelText("회신 불필요")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("수발신 구분 *"), { target: { value: "발신" } });
    expect(screen.queryByLabelText("회신 불필요")).not.toBeInTheDocument();
  });

  it("shows reply due date only for received correspondence that requires a reply", () => {
    render(<DocumentUploadForm defaultSubCategory="수발신 공문" />);

    expect(screen.getByLabelText("회신기한")).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText("회신 불필요"));
    expect(screen.queryByLabelText("회신기한")).not.toBeInTheDocument();

    fireEvent.click(screen.getByLabelText("회신 불필요"));
    fireEvent.change(screen.getByLabelText("수발신 구분 *"), { target: { value: "발신" } });
    expect(screen.queryByLabelText("회신기한")).not.toBeInTheDocument();
  });

  it("shows received correspondence targets only when registering a reply correspondence", () => {
    render(
      <DocumentUploadForm
        defaultSubCategory="수발신 공문"
        replyTargetDocuments={[
          {
            id: "received-1",
            title: "동작구청 시정조치 요구 공문",
            description: null,
            category: "DISCLOSURE",
            subCategory: "수발신 공문",
            correspondenceType: "수신",
            fileName: "received.pdf",
            fileSize: 1024,
            status: "APPROVED",
            publishedAt: "2026-06-01T00:00:00.000Z",
            documentDate: "2026-06-01T00:00:00.000Z",
            createdAt: "2026-06-01T00:00:00.000Z",
          },
          {
            id: "sent-1",
            title: "서울시 제출 공문",
            description: null,
            category: "DISCLOSURE",
            subCategory: "수발신 공문",
            correspondenceType: "발신",
            fileName: "sent.pdf",
            fileSize: 1024,
            status: "APPROVED",
            publishedAt: "2026-06-02T00:00:00.000Z",
            documentDate: "2026-06-02T00:00:00.000Z",
            createdAt: "2026-06-02T00:00:00.000Z",
          },
        ]}
      />
    );

    expect(screen.queryByLabelText("회신 대상 수신 공문 (선택)")).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("수발신 구분 *"), { target: { value: "발신" } });
    fireEvent.click(screen.getByLabelText("회신 공문으로 등록"));

    const replyTargetSelect = screen.getByLabelText("회신 대상 수신 공문 (선택)");
    expect(replyTargetSelect).toHaveTextContent("동작구청 시정조치 요구 공문");
    expect(replyTargetSelect).not.toHaveTextContent("서울시 제출 공문");
  });
});
