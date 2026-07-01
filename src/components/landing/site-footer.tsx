import Link from "next/link";

export function SiteFooter() {
  return (
    <footer id="about" className="mt-10 border-t border-stone-surface py-10">
      <div className="site-container flex flex-col justify-between gap-6 text-sm text-muted-foreground sm:flex-row">
        <div>
          <p className="font-semibold text-charcoal-primary">대방동 지역주택조합</p>
          <address className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 not-italic leading-6">
            <span>(06947) 서울시 동작구 여의대방로 36길 102-11</span>
            <span>1층 대방동지역주택조합사무실</span>
            <span aria-hidden="true" className="text-stone-surface">
              ·
            </span>
            <span>연락처 02-822-1508</span>
          </address>
          <p className="mt-3 text-xs text-ash">Website created & maintained by 오학동 · 2026.6.17</p>
        </div>
        <div className="flex gap-5 font-medium text-graphite">
          <Link href="/terms">이용약관</Link>
          <Link href="/privacy">개인정보처리방침</Link>
          <Link href="/about#section-location">찾아오시는 길</Link>
        </div>
      </div>
    </footer>
  );
}
