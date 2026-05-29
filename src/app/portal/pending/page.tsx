import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession, logoutAction } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "승인 대기 안내 | 대방동 지역주택조합",
};

export default async function PendingPortalPage() {
  const session = (await getSession()) as {
    id: string;
    loginId: string | null;
    email?: string;
    name: string;
    role: string;
  } | null;

  // 세션이 없으면 로그인 화면으로 강제 이동
  if (!session) {
    redirect("/login");
  }

  // 승인 대기 상태가 아니면 권한에 맞는 포털로 이동
  if (session.role !== "PENDING") {
    if (session.role === "MEMBER") redirect("/portal/member");
    if (session.role === "REFUND") redirect("/portal/refund");
    if (session.role === "ADMIN") redirect("/portal/admin");
  }

  const handleLogout = async () => {
    "use server";
    await logoutAction();
    redirect("/login");
  };

  return (
    <main className="min-h-screen bg-warm-canvas px-4 pb-14 pt-4 sm:px-6">
      {/* Navigation */}
      <nav className="site-container stone-card flex flex-wrap items-center justify-between gap-4 px-5 py-4 bg-white">
        <Link href="/" className="font-semibold text-charcoal-primary">
          대방동 지역주택조합
        </Link>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xs text-graphite font-medium">
              {session.name} (승인 대기)
            </span>
            <form action={handleLogout}>
              <Button type="submit" variant="ghost" size="sm" className="rounded-full hover:text-ember-orange text-xs h-8">
                로그아웃
              </Button>
            </form>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="site-container py-10 sm:py-14">
        {/* Status Badge */}
        <p className="inline-flex rounded-full bg-ember-orange/10 px-4 py-2 text-sm font-medium text-ember-orange">
          가입 승인 대기 중
        </p>

        <h1 className="mt-6 max-w-3xl text-4xl leading-tight sm:text-[3rem] text-charcoal-primary">
          {session.name}님, 환영합니다
        </h1>
        
        <p className="mt-5 max-w-2xl text-base leading-8 text-graphite">
          Google 계정을 통한 소셜 인증에 성공하였습니다. 대방동 지역주택조합 홈페이지는 기밀 조합 정보 보호를 위해 **관리자 승인 후** 전용 포털을 활성화하고 있습니다.
        </p>

        {/* Detailed Info Card */}
        <div className="mt-10 grid gap-8 md:grid-cols-2">
          {/* Left Side: Status Alert */}
          <section className="soft-panel p-6 bg-white border border-[#f2f0ed] rounded-2xl text-left">
            <h2 className="text-lg font-semibold text-charcoal-primary">가입 신청 상세 정보</h2>
            <p className="mt-1 text-xs text-graphite mb-6">등록된 소셜 인증 계정 명세입니다.</p>

            <ul className="space-y-4 text-sm text-graphite border-t border-[#f2f0ed] pt-4">
              <li className="flex justify-between items-center pb-2 border-b border-[#f8f7f4]">
                <span className="font-medium">신청 이름</span>
                <span className="text-charcoal-primary font-semibold">{session.name}</span>
              </li>
              <li className="flex justify-between items-center pb-2 border-b border-[#f8f7f4]">
                <span className="font-medium">구글 계정 이메일</span>
                <span className="text-charcoal-primary font-mono">{session.email || "이메일 없음"}</span>
              </li>
              <li className="flex justify-between items-center pb-2 border-b border-[#f8f7f4]">
                <span className="font-medium">기본 권한 지정</span>
                <span className="inline-flex items-center rounded-full bg-sunburst-yellow/20 text-charcoal-primary px-2.5 py-0.5 text-xs font-semibold">
                  PENDING
                </span>
              </li>
              <li className="flex justify-between items-center">
                <span className="font-medium">조합원 매핑 현황</span>
                <span className="text-ember-orange font-semibold">미승인 (조합원 번호 조회 대기)</span>
              </li>
            </ul>
          </section>

          {/* Right Side: Next Steps Guide */}
          <section className="flex flex-col gap-5 text-left">
            <div className="soft-panel p-6 bg-[#f8f7f4] border border-dashed border-[#f2f0ed]">
              <h3 className="text-sm font-semibold text-charcoal-primary">이후 진행 단계 안내</h3>
              <p className="mt-2 text-xs leading-5 text-graphite">
                조합 사무국에서 구글 소셜 계정으로 로그인한 본인 이메일 및 신청인 명의를 대조하여 정식 조합원 번호(`loginId`)를 매핑하고 승인 처리를 진행합니다.
              </p>
              <ul className="mt-4 space-y-2 text-xs leading-5 text-graphite">
                <li>1. 관리자가 사용자의 본명과 가입 이메일을 조합원 명부와 대조합니다.</li>
                <li>2. 매칭 성공 시 해당 계정의 권한을 <strong className="text-charcoal-primary">MEMBER</strong> 또는 <strong className="text-charcoal-primary">REFUND</strong>로 업데이트합니다.</li>
                <li>3. 승인 처리가 완료되면 로그아웃 후 다시 구글 로그인 시 정상적으로 정보공개 자료실 또는 환불 명세를 안전하게 이용하실 수 있습니다.</li>
              </ul>
            </div>

            <div className="soft-panel p-5 bg-white">
              <h3 className="text-sm font-semibold text-charcoal-primary">조합원 전용 프리뷰 알림</h3>
              <p className="mt-2 text-xs text-graphite leading-5">
                데모 관리자 계정으로 로그인하여 승인 처리를 미리 시뮬레이션할 수 있습니다. 
                <br />
                <strong className="text-ember-orange font-medium">관리자(admin / admin123)</strong>로 접속하여 본 가입 건의 역할을 변경해 보십시오.
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
