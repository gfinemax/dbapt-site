import { act, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PersonalLibraryDrawerHost } from "@/components/portal/personal-library-drawer-host";

vi.mock("next/navigation", () => ({
  useRouter() {
    return {
      push: vi.fn(),
      refresh: vi.fn(),
    };
  },
}));

describe("personal library drawer host", () => {
  it("opens the drawer from the global header fallback event", () => {
    render(
      <PersonalLibraryDrawerHost
        session={{
          id: "member-1",
          loginId: "member",
          name: "이조합",
          role: "MEMBER",
        }}
      >
        <main>사업현황</main>
      </PersonalLibraryDrawerHost>,
    );

    expect(screen.queryByLabelText("이조합 개인 자료실 드로어")).not.toBeInTheDocument();

    act(() => {
      window.dispatchEvent(new CustomEvent("open-portal"));
    });

    const drawer = screen.getByLabelText("이조합 개인 자료실 드로어");
    expect(drawer).toBeInTheDocument();

    act(() => {
      window.dispatchEvent(new CustomEvent("close-portal"));
    });

    expect(screen.queryByLabelText("이조합 개인 자료실 드로어")).not.toBeInTheDocument();
    expect(within(document.body).getByText("사업현황")).toBeInTheDocument();
  });
});
