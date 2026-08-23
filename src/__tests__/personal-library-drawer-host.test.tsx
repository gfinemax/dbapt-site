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
          name: "이조합 (정식조합원)",
          role: "MEMBER",
        }}
      >
        <main>사업현황</main>
      </PersonalLibraryDrawerHost>,
    );

    expect(screen.queryByLabelText("이조합 (정식조합원) 개인 자료실 드로어")).not.toBeInTheDocument();

    act(() => {
      window.dispatchEvent(new CustomEvent("open-portal"));
    });

    const drawer = screen.getByLabelText("이조합 (정식조합원) 개인 자료실 드로어");
    expect(drawer).toBeInTheDocument();
    expect(drawer).toHaveClass("inset-0", "w-full");
    expect(drawer).not.toHaveClass("max-w-[1040px]");
    expect(within(drawer).getByText("이조합 조합원")).toBeInTheDocument();
    expect(within(drawer).getAllByRole("link", { name: "홈으로" }).every((link) => link.getAttribute("href") === "/")).toBe(true);
    expect(within(drawer).getByRole("link", { name: "서류발급" })).toHaveAttribute("href", "/library");
    expect(within(drawer).getByRole("link", { name: "공지사항" })).toHaveAttribute("href", "/news?tab=notice");
    expect(within(drawer).getByRole("link", { name: "문의하기" })).toHaveAttribute("href", "/news?tab=free");
    expect(within(drawer).queryByText("고객센터")).not.toBeInTheDocument();

    act(() => {
      window.dispatchEvent(new CustomEvent("close-portal"));
    });

    expect(screen.queryByLabelText("이조합 (정식조합원) 개인 자료실 드로어")).not.toBeInTheDocument();
    expect(within(document.body).getByText("사업현황")).toBeInTheDocument();
  });

  it("labels withdrawn members as refund members", () => {
    render(
      <PersonalLibraryDrawerHost
        session={{ id: "refund-1", loginId: "refund", name: "박정산", role: "REFUND" }}
      >
        <main>사업현황</main>
      </PersonalLibraryDrawerHost>,
    );

    act(() => window.dispatchEvent(new CustomEvent("open-portal")));

    expect(within(screen.getByLabelText("박정산 개인 자료실 드로어")).getByText("박정산 환불조합원")).toBeInTheDocument();
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
            isStarred: true,
            isViewedByCurrentUser: false,
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
    fireEvent.click(within(drawer).getByRole("button", { name: "2026년 지역주택조합 실태조사 결과통지 열람" }));

    const viewerPanel = screen.getByTestId("pdf-viewer-panel");
    const viewerLayer = screen.getByTestId("pdf-viewer-modal-layer");
    expect(viewerPanel).toBeInTheDocument();
    expect(drawer.contains(viewerPanel)).toBe(false);
    expect(viewerLayer.parentElement).toBe(document.body);
  });
});
