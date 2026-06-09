import { render, screen, within } from "@testing-library/react";
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
    expect(correspondenceSelect).toHaveTextContent("회신");
  });
});
