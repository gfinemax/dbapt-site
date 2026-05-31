import Link from "next/link";
import { notices } from "@/content/landing";

export function NoticesSection() {
  return (
    <section id="notices" className="site-container grid gap-4 py-14 lg:grid-cols-[1.05fr_0.95fr]">
      <div className="stone-card p-7 sm:p-9">
        <div className="mb-7 flex items-end justify-between">
          <div>
            <p className="mb-2 text-sm font-medium text-ember-orange">조합소식</p>
            <h2 className="text-3xl">공지사항</h2>
          </div>
          <Link href="/news?tab=notice" className="text-sm font-medium text-graphite hover:text-ember-orange">
            전체보기
          </Link>
        </div>
        <ul className="space-y-1">
          {notices.map((notice) => (
            <li key={notice.title} className="flex items-center justify-between gap-4 border-b border-stone-surface py-4 text-sm">
              <span className="truncate font-medium text-charcoal-primary">{notice.title}</span>
              <time className="shrink-0 text-muted-foreground">{notice.date}</time>
            </li>
          ))}
        </ul>
      </div>
      <div id="library" className="soft-panel p-7 sm:p-9">
        <p className="mb-2 text-sm font-medium text-sky-blue">자료실</p>
        <h2 className="text-3xl">관련 자료를 안내합니다</h2>
        <p className="mt-4 max-w-md text-[15px] leading-7">
          보도자료, 관련 법령, 일반 안내자료는 누구나 확인할 수 있도록 정리합니다.
        </p>
        <div className="mt-8 flex flex-wrap gap-2 text-sm font-medium">
          {["보도자료", "관련 법령", "일반 안내자료"].map((label) => (
            <span key={label} className="rounded-full bg-white px-4 py-2 text-charcoal-primary">
              {label}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
