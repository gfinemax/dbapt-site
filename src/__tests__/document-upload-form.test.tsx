import { render, screen } from "@testing-library/react";
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

    const fileInput = container.querySelector("#file-upload");
    expect(fileInput).toHaveAttribute("accept", ".pdf,.hwp,.hwpx,.doc,.docx");
  });
});
