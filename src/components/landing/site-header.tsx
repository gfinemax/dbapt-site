import Link from "next/link";
import { Button } from "@/components/ui/button";
import { publicNavigation } from "@/content/landing";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-stone-surface/80 bg-warm-canvas/90 backdrop-blur">
      <div className="site-container flex h-18 items-center justify-between gap-6">
        <Link href="/" className="flex items-center gap-3 text-charcoal-primary">
          <span className="flex size-9 items-center justify-center rounded-full bg-sky-blue text-sm font-semibold text-white">
            D
          </span>
          <span className="text-[15px] font-semibold tracking-[-0.03em]">
            대방동 지역주택조합
          </span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm font-medium text-charcoal-primary md:flex">
          {publicNavigation.map((item) => (
            <Link key={item.label} href={item.href} className="hover:text-ember-orange">
              {item.label}
            </Link>
          ))}
        </nav>
        <Button asChild variant="secondary" className="hidden sm:inline-flex">
          <Link href="/login">조합원 로그인</Link>
        </Button>
      </div>
    </header>
  );
}
