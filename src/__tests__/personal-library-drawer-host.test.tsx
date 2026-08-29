import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PersonalLibraryDrawerHost } from "@/components/portal/personal-library-drawer-host";
import { buildContributionDashboardView } from "@/lib/contribution-dashboard";

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
    expect(drawer).toHaveClass("inset-0", "w-full", "z-[70]");
    expect(drawer).not.toHaveClass("max-w-[1040px]");
    expect(within(drawer).getByText("이조합 조합원")).toBeInTheDocument();
    expect(within(drawer).getAllByRole("link", { name: "홈으로" }).every((link) => link.getAttribute("href") === "/")).toBe(true);
    expect(within(drawer).getByRole("button", { name: "개인자료" })).toBeInTheDocument();
    expect(within(drawer).getByRole("link", { name: "서류발급" })).toHaveAttribute("href", "/library");
    expect(within(drawer).getByRole("link", { name: "공지사항" })).toHaveAttribute("href", "/news?tab=notice");
    expect(within(drawer).getByRole("link", { name: "문의하기" })).toHaveAttribute("href", "/news?tab=free");
    expect(within(drawer).queryByText("고객센터")).not.toBeInTheDocument();

    fireEvent.click(within(drawer).getAllByRole("link", { name: "홈으로" })[0]);

    expect(screen.queryByLabelText("이조합 (정식조합원) 개인 자료실 드로어")).not.toBeInTheDocument();
    expect(within(document.body).getByText("사업현황")).toBeInTheDocument();
  });

  it("moves to exact member-service sections and updates the selected menu", () => {
    const scrollIntoView = vi.fn();
    Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
      configurable: true,
      value: scrollIntoView,
    });

    render(
      <PersonalLibraryDrawerHost
        session={{ id: "member-1", loginId: "member", name: "이조합", role: "MEMBER" }}
        contributionDashboard={buildContributionDashboardView({
          summary: null,
          profile: null,
          stages: [],
          ledgerEntries: [
            {
              id: "ledger-1",
              label: "신청금 납부",
              amount: 30_000_000,
              paidAt: "2026-01-10T00:00:00.000Z",
              stageLabel: "신청금(가입필증)",
              source: "ERP",
            },
          ],
        })}
      >
        <main>사업현황</main>
      </PersonalLibraryDrawerHost>,
    );

    act(() => window.dispatchEvent(new CustomEvent("open-portal")));

    const drawer = screen.getByLabelText("이조합 개인 자료실 드로어");
    const profileButton = within(drawer).getByRole("button", { name: "내정보" });
    const ledgerButton = within(drawer).getByRole("button", { name: "납부내역" });
    const personalButton = within(drawer).getByRole("button", { name: "개인자료" });
    const disclosure = within(drawer).getByTestId("contribution-ledger-disclosure");

    expect(profileButton).toHaveAttribute("aria-current", "location");
    expect(disclosure).not.toHaveAttribute("open");

    fireEvent.click(ledgerButton);
    expect(scrollIntoView).toHaveBeenLastCalledWith({ behavior: "smooth", block: "start" });
    expect(document.activeElement).toHaveAttribute("id", "member-ledger");
    expect(ledgerButton).toHaveAttribute("aria-current", "location");
    expect(profileButton).not.toHaveAttribute("aria-current");
    expect(disclosure).toHaveAttribute("open");

    fireEvent.click(personalButton);
    expect(document.activeElement).toHaveAttribute("id", "member-personal-library");
    expect(personalButton).toHaveAttribute("aria-current", "location");
    expect(ledgerButton).not.toHaveAttribute("aria-current");
    expect(disclosure).not.toHaveAttribute("open");

    fireEvent.click(within(drawer).getByText("전체 납부내역 보기"));
    expect(disclosure).toHaveAttribute("open");

    fireEvent.click(profileButton);
    expect(disclosure).not.toHaveAttribute("open");
  });

  it.each([
    ["서류발급", "/library"],
    ["공지사항", "/news?tab=notice"],
    ["문의하기", "/news?tab=free"],
  ])("exposes the deterministic %s destination link", (label, href) => {
    render(
      <PersonalLibraryDrawerHost
        session={{ id: "member-1", loginId: "member", name: "이조합", role: "MEMBER" }}
      >
        <main>사업현황</main>
      </PersonalLibraryDrawerHost>,
    );

    act(() => window.dispatchEvent(new CustomEvent("open-portal")));
    const drawer = screen.getByLabelText("이조합 개인 자료실 드로어");

    const shortcut = within(drawer).getByRole("link", { name: label });
    expect(shortcut).toHaveAttribute("href", href);
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

  it("shows a working operations sidebar for administrators", () => {
    const scrollIntoView = vi.fn();
    Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
      configurable: true,
      value: scrollIntoView,
    });

    render(
      <PersonalLibraryDrawerHost
        session={{ id: "admin-1", loginId: "admin", name: "운영자", role: "ADMIN" }}
        documents={[
          {
            id: "disclosure-1",
            title: "정보공개 문서",
            description: "공개 문서",
            category: "DISCLOSURE",
            fileName: "disclosure.pdf",
            fileSize: 1024,
            status: "APPROVED",
            isStarred: false,
            createdAt: "2026-08-20T00:00:00.000Z",
          },
          {
            id: "accounting-1",
            title: "회계 보고 문서",
            description: "회계 문서",
            category: "ACCOUNTING",
            fileName: "accounting.pdf",
            fileSize: 2048,
            status: "APPROVED",
            isStarred: false,
            createdAt: "2026-08-21T00:00:00.000Z",
          },
        ]}
        pendingUsers={[
          {
            id: "pending-1",
            name: "승인대기",
            email: "pending@example.com",
            createdAt: "2026-08-22T00:00:00.000Z",
          },
        ]}
      >
        <main>사업현황</main>
      </PersonalLibraryDrawerHost>,
    );

    act(() => window.dispatchEvent(new CustomEvent("open-portal")));
    const drawer = screen.getByLabelText("운영 문서 관리실 드로어");
    const nav = within(drawer).getByRole("navigation", { name: "운영 관리자 메뉴" });

    expect(within(drawer).getByText("문서·회원 운영")).toBeInTheDocument();
    expect(within(nav).queryByRole("button", { name: "납부내역" })).not.toBeInTheDocument();
    expect(within(nav).queryByRole("link", { name: "새 문서 등록" })).not.toBeInTheDocument();
    expect(within(drawer).getByRole("link", { name: "운영자 홈" })).toHaveAttribute("href", "/portal/admin");
    expect(within(drawer).getByRole("link", { name: "사이트 홈" })).toHaveAttribute("href", "/");
    expect(within(nav).getByRole("link", { name: "조합원 관리" })).toHaveAttribute("href", "/portal/admin/members#confirmation-needed-members");
    expect(within(nav).getByRole("link", { name: "확인 필요 조합원" })).toHaveAttribute("href", "/portal/admin/members#confirmation-needed-members");
    expect(within(nav).getByRole("link", { name: "홈페이지 관리 회원 명단" })).toHaveAttribute("href", "/portal/admin/members#homepage-managed-members");
    expect(within(nav).getByRole("link", { name: /보안 감사 기록/ })).toHaveAttribute("href", "/portal/admin/audit-logs");
    expect(within(nav).getByRole("link", { name: "공지사항 관리" })).toHaveAttribute("href", "/news?tab=notice");

    fireEvent.click(within(nav).getByRole("button", { name: /가입 승인 대기/ }));
    expect(document.activeElement).toHaveAttribute("id", "admin-signup-approvals");

    fireEvent.click(within(nav).getByRole("button", { name: /회계 문서/ }));
    expect(document.activeElement).toHaveAttribute("id", "portal-documents-section");
    expect(scrollIntoView).toHaveBeenLastCalledWith({ behavior: "smooth", block: "start" });
    const documentSection = within(drawer).getByRole("region", { name: "전체 등록 문서 목록" });
    expect(within(documentSection).getByText("회계 보고 문서")).toBeInTheDocument();
    expect(within(documentSection).queryByText("정보공개 문서")).not.toBeInTheDocument();
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
