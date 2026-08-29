import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AdminWorkspaceShell } from "@/components/portal/admin-workspace-shell";

vi.mock("next/navigation", () => ({
  usePathname: () => "/portal/admin/documents/new",
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

describe("AdminWorkspaceShell", () => {
  it("keeps operator and site-home navigation around standalone admin pages", () => {
    render(<AdminWorkspaceShell name="운영자"><main>새 문서 등록 화면</main></AdminWorkspaceShell>);

    const shell = screen.getByTestId("admin-workspace-shell");
    expect(within(shell).getAllByRole("link", { name: "운영자 홈" }).some((link) => link.getAttribute("href") === "/portal/admin")).toBe(true);
    expect(within(shell).getAllByRole("link", { name: "사이트 홈" }).every((link) => link.getAttribute("href") === "/")).toBe(true);
    expect(within(shell).getByText("새 문서 등록 화면")).toBeInTheDocument();
    expect(within(shell).queryByRole("link", { name: "새 문서 등록" })).not.toBeInTheDocument();
    expect(within(shell).getByRole("navigation", { name: "모바일 운영 관리자 메뉴" })).toBeInTheDocument();
  });
});
