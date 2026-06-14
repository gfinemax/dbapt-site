import { act, fireEvent, render, screen, within } from "@testing-library/react";
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

  it("opens drawer documents in a fullscreen viewer layer outside the drawer", () => {
    render(
      <PersonalLibraryDrawerHost
        session={{
          id: "member-1",
          loginId: "member",
          name: "이조합",
          role: "MEMBER",
        }}
        documents={[
          {
            id: "doc-1",
            title: "2026년 지역주택조합 실태조사 결과통지",
            description: "시구합동 실태조사 결과통지 및 시정조치",
            category: "DISCLOSURE",
            fileName: "2026년 시구합동 실태조사 결과통지.pdf",
            fileSize: 2048,
            status: "APPROVED",
            publishedAt: "2026-06-11T00:00:00.000Z",
            createdAt: "2026-06-11T00:00:00.000Z",
          },
        ]}
      >
        <main>사업현황</main>
      </PersonalLibraryDrawerHost>,
    );

    act(() => {
      window.dispatchEvent(new CustomEvent("open-portal"));
    });

    const drawer = screen.getByLabelText("이조합 개인 자료실 드로어");
    fireEvent.click(within(drawer).getByRole("button", { name: "열람" }));

    const viewerPanel = screen.getByTestId("pdf-viewer-panel");
    expect(viewerPanel).toBeInTheDocument();
    expect(drawer.contains(viewerPanel)).toBe(false);
  });
});
