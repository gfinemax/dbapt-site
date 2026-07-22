import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AdminDocumentCreatePage } from "@/components/portal/admin-document-create-page";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

vi.mock("@/components/portal/document-upload-form", () => ({
  DocumentUploadForm: () => <div data-testid="document-upload-form">등록 폼</div>,
}));

describe("AdminDocumentCreatePage", () => {
  it("provides a dedicated registration page linked back to the full document list", () => {
    render(<AdminDocumentCreatePage replyTargetDocuments={[]} />);

    expect(screen.getByRole("link", { name: /전체 등록 문서 목록/ })).toHaveAttribute("href", "/portal/admin#portal-documents-section");
    expect(screen.getByTestId("document-upload-form")).toBeInTheDocument();
    expect(screen.getByText(/등록이 완료되면 전체 문서 목록으로 돌아갑니다/)).toBeInTheDocument();
  });
});
