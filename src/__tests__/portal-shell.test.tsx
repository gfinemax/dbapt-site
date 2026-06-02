import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PortalShell } from "@/components/portal/portal-shell";

vi.mock("next/navigation", () => ({
  useRouter() {
    return {
      push: vi.fn(),
      refresh: vi.fn(),
    };
  },
}));

vi.mock("@/lib/auth", () => ({
  logoutAction: vi.fn(),
  approveUserAction: vi.fn(),
}));

afterEach(() => {
  vi.useRealTimers();
  localStorage.clear();
  sessionStorage.clear();
});

describe("portal shell", () => {
  it("shows the login announcement popup after administrator login lands on the portal", async () => {
    vi.useFakeTimers();

    render(
      <PortalShell
        role="admin"
        session={{
          id: "admin-1",
          loginId: "admin",
          name: "운영자",
          role: "ADMIN",
        }}
      />,
    );

    expect(screen.queryByText("조합원 개인 자료실 등록 알림")).not.toBeInTheDocument();

    await act(async () => {
      vi.advanceTimersByTime(450);
    });

    expect(screen.getByText("조합원 개인 자료실 등록 알림")).toBeInTheDocument();
  });
});
