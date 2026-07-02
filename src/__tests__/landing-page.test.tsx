import { existsSync } from "node:fs";
import { join } from "node:path";
import { act, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { HomeClient } from "@/components/landing/home-client";
import { featureLinks, megaMenuNavigation, publicNavigation } from "@/content/landing";

vi.mock("next/navigation", () => ({
  useRouter() {
    return {
      push: vi.fn(),
      refresh: vi.fn(),
    };
  },
  useSearchParams() {
    return {
      get: vi.fn().mockReturnValue(null),
    };
  },
}));

afterEach(() => {
  vi.useRealTimers();
  localStorage.clear();
  sessionStorage.clear();
});

describe("public landing page", () => {
  it("introduces the cooperative with member and business entry actions", () => {
    render(<HomeClient />);

    expect(
      screen.getByRole("heading", { name: /함께 만드는 새로운 보금자리/ }),
    ).toBeInTheDocument();
    expect(
      screen
        .getAllByRole("link", { name: "조합원 로그인" })
        .every((link) => link.getAttribute("href") === "/login"),
    ).toBe(true);
    expect(screen.getByRole("link", { name: "사업정보 보기" })).toHaveAttribute(
      "href",
      "/business",
    );
  });

  it("hides the hero entry actions after login", () => {
    const { container } = render(
      <HomeClient
        session={{
          id: "admin-1",
          loginId: "admin",
          name: "운영자",
          role: "ADMIN",
        }}
      />,
    );

    expect(container.querySelector("[data-hero-actions]")).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "사업정보 보기" })).not.toBeInTheDocument();
  });

  it("routes public business entry points to the business status page", () => {
    expect(publicNavigation).toContainEqual({ label: "사업현황", href: "/business" });
    expect(megaMenuNavigation.find((item) => item.title === "사업현황")).toMatchObject({
      href: "/business",
      subItems: expect.arrayContaining([
        { label: "건축개요", href: "/business#overview" },
        { label: "조감도", href: "/business#rendering" },
        { label: "건축계획·배치도", href: "/business#plan" },
        { label: "단위세대 평면도", href: "/business#unit" },
        { label: "차량·보행 동선", href: "/business#mobility" },
        { label: "추진절차", href: "/business#timeline" },
      ]),
    });
    expect(megaMenuNavigation.find((item) => item.title === "사업현황")?.subItems).not.toContainEqual({
      label: "교통처리계획",
      href: "/business#traffic",
    });
    expect(featureLinks.find((item) => item.title === "사업정보")).toMatchObject({
      description: "건축개요와 배치도, 조감도를 확인하세요.",
      href: "/business#overview",
    });
  });

  it("routes public library entry points to the unified library page", () => {
    expect(publicNavigation).toContainEqual({ label: "자료실", href: "/library" });
    expect(megaMenuNavigation.find((item) => item.title === "자료실")).toMatchObject({
      href: "/library",
      subItems: expect.arrayContaining([
        { label: "핵심자료", href: "/library#featured" },
        { label: "계약·협약", href: "/library#contracts" },
        { label: "법령·제도", href: "/library#legal" },
      ]),
    });
    expect(featureLinks.find((item) => item.title === "자료실")).toMatchObject({
      description: "법령, 계약, 총회, 서식 자료를 한곳에서 찾습니다.",
      href: "/library",
    });
  });

  it("presents protected services as login-only access", () => {
    render(<HomeClient />);

    expect(screen.getByText("정보공개")).toBeInTheDocument();
    expect(screen.getByText("회계·실적보고")).toBeInTheDocument();
    expect(
      screen.getByText(/로그인 후 이용할 수 있습니다/),
    ).toBeInTheDocument();
  });

  it("does not show hardcoded mock notices on the landing page", () => {
    render(<HomeClient />);

    expect(screen.queryByText("대방동 지역주택조합 홈페이지 준비 안내")).not.toBeInTheDocument();
    expect(screen.queryByText("조합원 전용 정보공개 서비스 운영 예정")).not.toBeInTheDocument();
    expect(screen.queryByText("사업정보 및 관련 법령 자료실 안내")).not.toBeInTheDocument();
    expect(screen.getByText("최근 등록된 공지사항 및 조합원 게시글이 없습니다.")).toBeInTheDocument();
  });

  it("renders database-backed notices passed from the homepage server", () => {
    render(
      <HomeClient
        notices={[
          {
            id: "notice-1",
            kind: "notice",
            title: "대방동 지역주택조합 공식 홈페이지 운영 안내",
            createdAt: "2026-06-18T00:00:00.000Z",
          },
        ]}
      />,
    );

    expect(screen.getByText("대방동 지역주택조합 공식 홈페이지 운영 안내")).toBeInTheDocument();
    expect(screen.getByText("2026.06.18")).toBeInTheDocument();
  });

  it("combines public notices and member board posts in the landing notice card", () => {
    render(
      <HomeClient
        notices={[
          {
            id: "notice-1",
            kind: "notice",
            title: "대방동 지역주택조합 공식 홈페이지 운영 안내",
            createdAt: "2026-06-18T00:00:00.000Z",
          },
          {
            id: "free-1",
            kind: "free",
            title: "정보공개 자료 열람 문의",
            createdAt: "2026-06-17T00:00:00.000Z",
          },
        ]}
      />,
    );

    const newsCard = screen.getByRole("region", { name: "공지사항 및 조합원 게시글" });

    expect(within(newsCard).getByRole("heading", { name: "공지사항 및 조합원 게시글" })).toBeInTheDocument();
    expect(within(newsCard).getByText("소통마당")).toBeInTheDocument();
    expect(within(newsCard).getByText("공지")).toBeInTheDocument();
    expect(within(newsCard).getByText("게시글")).toBeInTheDocument();
    expect(within(newsCard).getByRole("link", { name: /대방동 지역주택조합 공식 홈페이지 운영 안내/ })).toHaveAttribute(
      "href",
      "/news?tab=notice",
    );
    expect(within(newsCard).getByRole("link", { name: /정보공개 자료 열람 문의/ })).toHaveAttribute(
      "href",
      "/news?tab=free&post=free-1",
    );
    expect(within(newsCard).getByRole("link", { name: "전체보기" })).toHaveAttribute("href", "/news");
  });

  it("uses the logged-in portal preview as an issue participation hub", () => {
    render(
      <HomeClient
        session={{
          id: "member-1",
          loginId: "member1",
          name: "이조합",
          role: "MEMBER",
        }}
      />,
    );

    expect(screen.getByText("현재 열린 이슈")).toBeInTheDocument();
    expect(screen.getByText("사업 추진 현안")).toBeInTheDocument();
    expect(screen.getByText("자료·회계 질의")).toBeInTheDocument();
    expect(screen.queryByText("조합원 제안")).not.toBeInTheDocument();
    expect(screen.queryByText("최근 업데이트")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "조합원 자료실 열기" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "정보공개 관련 공개자료 보기" })).toHaveAttribute(
      "href",
      "/issues?category=disclosure",
    );
    expect(screen.getByRole("link", { name: "이슈의 장 이슈 대시보드 보기" })).toHaveAttribute(
      "href",
      "/issues?category=participation",
    );
  });

  it("keeps the hero upper space clear of floating decorations", () => {
    const { container } = render(<HomeClient />);

    expect(container.querySelector(".float-soft")).not.toBeInTheDocument();
    expect(container.querySelector(".sparkle")).not.toBeInTheDocument();
  });

  it("renders the desktop hero headline as two intended lines", () => {
    const { container } = render(<HomeClient />);
    const headlineLines = Array.from(container.querySelectorAll("[data-hero-line]")).map(
      (line) => line.textContent,
    );

    expect(headlineLines).toEqual([
      "함께 만드는 새로운 보금자리",
      "투명하게 소통하는 우리 조합"
    ]);
  });

  it("uses the compact hero spacing approved for the landing page", () => {
    const { container } = render(<HomeClient />);
    const heroSection = container.querySelector("main > section");
    const heroContent = container.querySelector("[data-hero-content]");

    expect(heroSection).toHaveClass("pt-3", "pb-8", "sm:pb-10");
    expect(heroContent).toHaveClass("-translate-y-10", "sm:-translate-y-20");
  });

  it("ships the validated transparent icon asset set", () => {
    const icons = [
      "business-info.png",
      "progress.png",
      "disclosure.png",
      "accounting.png",
      "notices.png",
      "issues.png",
      "payment.png",
      "library.png",
    ];

    for (const icon of icons) {
      expect(existsSync(join(process.cwd(), "public", "assets", "icons", icon))).toBe(true);
    }
  });

  it("shows the login announcement popup for administrator sessions", async () => {
    vi.useFakeTimers();

    render(
      <HomeClient
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

  it("shows contribution payment details in the login announcement and personal library", async () => {
    vi.useFakeTimers();

    render(
      <HomeClient
        session={{
          id: "member-1",
          loginId: "member1",
          name: "이조합",
          role: "MEMBER",
        }}
        contributionSummary={{
          totalDue: 120000000,
          totalPaid: 95000000,
          unpaidAmount: 25000000,
          overdueAmount: 5000000,
          lateFee: 120000,
          nextDueDate: "2026-06-30T00:00:00.000Z",
          status: "OVERDUE",
          noticeMessage: "연체 미납금 납부 안내 대상입니다.",
          updatedAt: "2026-06-01T00:00:00.000Z",
        }}
        paymentNotices={[
          {
            id: "notice-1",
            type: "OVERDUE",
            status: "DRAFT",
            title: "연체 미납금 납부 안내",
            message: "연체 미납금 5,000,000원이 있습니다.",
            unpaidAmount: 25000000,
            overdueAmount: 5000000,
            lateFee: 120000,
            dueDate: "2026-06-30T00:00:00.000Z",
            createdAt: "2026-06-01T00:00:00.000Z",
          },
        ]}
      />,
    );

    expect(screen.getByText("내 분담금 현황")).toBeInTheDocument();
    expect(screen.getByText("120,000,000 원")).toBeInTheDocument();

    await act(async () => {
      vi.advanceTimersByTime(450);
    });

    expect(screen.getByText("내 분담금 요약")).toBeInTheDocument();
    expect(screen.getAllByText("25,000,000 원").length).toBeGreaterThan(0);
    expect(screen.getAllByText("연체 미납금 납부 안내").length).toBeGreaterThan(0);
  });
});
