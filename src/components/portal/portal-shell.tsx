import Link from "next/link";
import { PortalDashboard } from "@/components/portal/portal-dashboard";
import { Button } from "@/components/ui/button";
import { portalProfiles, portalRoleOrder, type PortalRole } from "@/content/portal";
import { cn } from "@/lib/utils";

type PortalShellProps = {
  role: PortalRole;
};

export function PortalShell({ role }: PortalShellProps) {
  const profile = portalProfiles[role];

  return (
    <main className="min-h-screen bg-warm-canvas px-4 pb-14 pt-4 sm:px-6">
      <nav className="site-container stone-card flex flex-wrap items-center justify-between gap-4 px-5 py-4">
        <Link href="/" className="font-semibold text-charcoal-primary">
          대방동 지역주택조합
        </Link>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link href="/">홈으로</Link>
          </Button>
          <Button asChild variant="secondary" size="sm">
            <Link href="/login">로그인 안내</Link>
          </Button>
        </div>
      </nav>

      <div className="site-container py-10 sm:py-14">
        <p className="inline-flex rounded-full bg-parchment-card px-4 py-2 text-sm font-medium text-ember-orange">
          포털 화면 미리보기
        </p>
        <h1 className="mt-6 max-w-3xl text-4xl leading-tight sm:text-[3rem]">{profile.title}</h1>
        <p className="mt-5 max-w-2xl text-base leading-8 text-graphite">{profile.description}</p>

        <section className="soft-panel mt-9 p-5 sm:p-6" aria-label="미리보기 이용 안내">
          <p className="font-semibold text-charcoal-primary">
            이 화면은 향후 서비스 구조를 보여주는 준비 화면입니다.
          </p>
          <p className="mt-2 text-[15px] leading-7 text-graphite">
            실제 인증이나 개인 자료 제공 기능은 포함되지 않습니다. 각 항목은 운영 준비 상태만
            안내합니다.
          </p>
        </section>

        <nav className="mt-8 flex flex-wrap gap-2" aria-label="역할별 미리보기 전환">
          {portalRoleOrder.map((item) => {
            const target = portalProfiles[item];
            const current = item === role;

            return (
              <Link
                key={item}
                href={target.href}
                aria-current={current ? "page" : undefined}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                  current
                    ? "bg-midnight text-white"
                    : "bg-white text-graphite shadow-[inset_0_0_0_1px_var(--stone-surface)] hover:bg-parchment-card",
                )}
              >
                {target.navLabel} 화면
              </Link>
            );
          })}
        </nav>

        <PortalDashboard profile={profile} />
      </div>
    </main>
  );
}
