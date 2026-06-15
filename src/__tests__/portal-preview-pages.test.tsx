import type { ReactNode } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter() {
    return {
      push: vi.fn(),
      refresh: vi.fn(),
    };
  },
}));

vi.mock("next/headers", () => ({
  cookies() {
    return {
      get() {
        return undefined;
      },
      set() {},
    };
  },
}));

afterEach(() => {
  vi.unstubAllEnvs();
});

type PageComponent = (props?: {
  searchParams?: Promise<{
    error?: string;
  }>;
}) => ReactNode | Promise<ReactNode>;

const pageModules = import.meta.glob<{ default: PageComponent }>("../app/**/page.tsx", {
  eager: true,
});

function findPage(path: string) {
  const Page = pageModules[path]?.default;

  expect(Page).toBeDefined();
  return Page;
}

describe("role-specific portal preview pages", () => {
  it("renders a truthful member preview with member-facing services", async () => {
    const Page = findPage("../app/portal/member/page.tsx");
    if (!Page) return;

    render(await Page());

    expect(
      screen.getByRole("heading", { name: "정식 조합원 포털 미리보기" }),
    ).toBeInTheDocument();
    expect(screen.getByText("내 분담금")).toBeInTheDocument();
    expect(screen.getByText("새 정보공개")).toBeInTheDocument();
    expect(screen.getByText("이슈의 장")).toBeInTheDocument();
    expect(screen.getByText("투표·설문")).toBeInTheDocument();
    expect(screen.queryByText("문서 승인")).not.toBeInTheDocument();
    expect(
      screen.getByText(/실제 인증이나 개인 자료 제공 기능은 포함되지 않습니다/),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "홈으로" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "로그인 안내" })).toHaveAttribute("href", "/login");
    expect(screen.getByRole("link", { name: "환불조합원 화면" })).toHaveAttribute(
      "href",
      "/portal/refund",
    );
    expect(screen.getByRole("link", { name: "관리자 화면" })).toHaveAttribute(
      "href",
      "/portal/admin",
    );
  });

  it("renders only permitted refund-member preview services", async () => {
    const Page = findPage("../app/portal/refund/page.tsx");
    if (!Page) return;

    render(await Page());

    expect(
      screen.getByRole("heading", { name: "환불조합원 포털 미리보기" }),
    ).toBeInTheDocument();
    expect(screen.getByText("내 환불현황")).toBeInTheDocument();
    expect(screen.getByText("통지 알림")).toBeInTheDocument();
    expect(screen.queryByText("내 분담금")).not.toBeInTheDocument();
    expect(screen.queryByText("이슈의 장")).not.toBeInTheDocument();
    expect(screen.queryByText("투표·설문")).not.toBeInTheDocument();
  });

  it("renders administrator preparation cards without live actions", async () => {
    const Page = findPage("../app/portal/admin/page.tsx");
    if (!Page) return;

    render(await Page());

    expect(
      screen.getByRole("heading", { name: "관리자 포털 미리보기" }),
    ).toBeInTheDocument();
    expect(screen.getByText("문서 승인")).toBeInTheDocument();
    expect(screen.getByText("독촉 승인")).toBeInTheDocument();
    expect(screen.getByText("권한·감사로그")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /승인|발송|업로드/ })).not.toBeInTheDocument();
    expect(screen.getAllByText(/준비 중/).length).toBeGreaterThan(0);
  });

  it("hides demo credentials from the login page by default", async () => {
    const Page = findPage("../app/login/page.tsx");
    if (!Page) return;

    render(await Page({ searchParams: Promise.resolve({}) }));

    expect(
      screen.getByText(/발급받은 계정으로 로그인하면 권한에 맞는 전용 화면으로 이동합니다/),
    ).toBeInTheDocument();
    expect(screen.queryByText("로그인 후 이동 경로")).not.toBeInTheDocument();
    expect(screen.getByText("계정 권한 안내")).toBeInTheDocument();
    expect(screen.getByText("승인된 계정 권한에 따라 보호된 포털 화면이 다르게 표시됩니다.")).toBeInTheDocument();
    expect(screen.getByText("정식 조합원 계정")).toBeInTheDocument();
    expect(screen.getByText("정보공개 자료실과 조합원 전용 자료를 확인할 수 있습니다.")).toBeInTheDocument();
    expect(screen.getByText("환불 조합원 계정")).toBeInTheDocument();
    expect(screen.getByText("환불/정산 및 납부 현황을 확인할 수 있습니다.")).toBeInTheDocument();
    expect(screen.getByText("관계자 및 기타 승인 계정")).toBeInTheDocument();
    expect(screen.getByText("사무국이 승인한 범위 안에서만 자료 열람이 가능합니다.")).toBeInTheDocument();
    expect(screen.queryByText("관리자 계정은 문서 등록과 감사 로그 화면으로 이동합니다.")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "신규 가입 신청" }));

    expect(screen.getByRole("heading", { name: "신규 가입 신청" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "조합원 로그인" })).not.toBeInTheDocument();
    expect(screen.queryByLabelText("로그인 폼")).not.toBeInTheDocument();
    expect(screen.queryByText("로그인 후 이동 경로")).not.toBeInTheDocument();
    expect(screen.queryByText("계정 권한 안내")).not.toBeInTheDocument();
    expect(screen.getByText("가입 신청 절차")).toBeInTheDocument();
    expect(screen.getByLabelText("신청자 이름")).toHaveAttribute("name", "signupName");
    expect(screen.getByLabelText("휴대폰 번호")).toHaveAttribute("name", "signupPhone");
    expect(screen.getByLabelText("비밀번호", { selector: 'input[name="signupPassword"]' })).toHaveAttribute("name", "signupPassword");
    expect(screen.getByLabelText("비밀번호 확인")).toHaveAttribute("name", "signupPasswordConfirm");
    expect(screen.getByLabelText("전달 메모")).toHaveAttribute("name", "signupMemo");
    expect(screen.getByText("비밀번호는 8자 이상으로 입력해 주세요.")).toBeInTheDocument();
    expect(screen.getByText("영문과 숫자를 함께 사용해 주세요.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "가입 신청하기" })).toHaveAttribute(
      "type",
      "submit",
    );
    expect(screen.getByRole("button", { name: "로그인으로 돌아가기" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Google 계정으로 신청하기" })).not.toBeInTheDocument();
    expect(screen.queryByText("데모 테스트 계정 정보")).not.toBeInTheDocument();
    expect(screen.queryByText("member1 / member123")).not.toBeInTheDocument();
    expect(screen.queryByText("refund1 / refund123")).not.toBeInTheDocument();
    expect(screen.queryByText("admin / admin123")).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /화면 보기/ })).not.toBeInTheDocument();
  });

  it("never renders demo credential information on the login page", async () => {
    vi.stubEnv("NEXT_PUBLIC_SHOW_DEMO_CREDENTIALS", "true");
    const Page = findPage("../app/login/page.tsx");
    if (!Page) return;

    render(await Page({ searchParams: Promise.resolve({}) }));

    expect(screen.queryByText("데모 테스트 계정 정보")).not.toBeInTheDocument();
    expect(screen.queryByText("member1 / member123")).not.toBeInTheDocument();
    expect(screen.queryByText("refund1 / refund123")).not.toBeInTheDocument();
    expect(screen.queryByText("admin / admin123")).not.toBeInTheDocument();
    expect(
      screen.getByText(/발급받은 계정으로 로그인하면 권한에 맞는 전용 화면으로 이동합니다/),
    ).toBeInTheDocument();
  });

  it("warns mobile embedded browser users before Google OAuth", async () => {
    vi.spyOn(window.navigator, "userAgent", "get").mockReturnValue(
      "Mozilla/5.0 (Linux; Android 14; SM-S928N Build/UP1A) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/125.0.0.0 Mobile Safari/537.36 wv",
    );
    const Page = findPage("../app/login/page.tsx");
    if (!Page) return;

    render(await Page({ searchParams: Promise.resolve({}) }));

    expect(
      await screen.findByText(/앱 안에서 열린 브라우저에서는 Google 로그인이 차단될 수 있습니다/),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "외부 브라우저에서 Google 로그인" })).toHaveAttribute(
      "href",
      expect.stringContaining("intent://"),
    );
  });
});
