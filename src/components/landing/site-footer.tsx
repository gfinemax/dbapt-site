import Link from "next/link";

export function SiteFooter() {
  return (
    <footer id="about" className="mt-10 border-t border-stone-surface py-10">
      <div className="site-container flex flex-col justify-between gap-6 text-sm text-muted-foreground sm:flex-row">
        <div>
          <p className="font-semibold text-charcoal-primary">대방동 지역주택조합</p>
          <p className="mt-2">조합사무실 연락처 및 주소는 개통 전 확정하여 안내합니다.</p>
        </div>
        <div className="flex gap-5 font-medium text-graphite">
          <Link href="/terms">이용약관</Link>
          <Link href="/privacy">개인정보처리방침</Link>
          <Link href="#about">찾아오시는 길</Link>
        </div>
      </div>
    </footer>
  );
}
