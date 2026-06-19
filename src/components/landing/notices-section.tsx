import Link from "next/link";

export type LandingNotice = {
  id: string;
  kind: "notice" | "free";
  title: string;
  createdAt: string;
  isStarred?: boolean;
};

function formatNoticeDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value.slice(0, 10).replace(/-/g, ".");
  }

  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")}`;
}

const noticeLabels: Record<LandingNotice["kind"], string> = {
  notice: "공지",
  free: "게시글",
};

const noticeLabelClasses: Record<LandingNotice["kind"], string> = {
  notice: "bg-ember-orange/10 text-ember-orange",
  free: "bg-sky-blue/10 text-sky-blue",
};

function getNoticeHref(notice: LandingNotice) {
  if (notice.kind === "free") {
    return `/news?tab=free&post=${encodeURIComponent(notice.id)}`;
  }

  return "/news?tab=notice";
}

export function NoticesSection({ notices = [] }: { notices?: LandingNotice[] }) {
  return (
    <section id="notices" className="site-container grid gap-4 py-14 lg:grid-cols-[1.05fr_0.95fr]">
      <div className="stone-card p-7 sm:p-9" role="region" aria-labelledby="landing-notices-title">
        <div className="mb-7 flex items-end justify-between">
          <div>
            <p className="mb-2 text-sm font-medium text-ember-orange">조합소식</p>
            <h2 id="landing-notices-title" className="text-3xl">공지사항 및 조합원 게시글</h2>
          </div>
          <Link href="/news" className="text-sm font-medium text-graphite hover:text-ember-orange">
            전체보기
          </Link>
        </div>
        <ul className="space-y-1">
          {notices.length === 0 ? (
            <li className="border-b border-stone-surface py-4 text-sm font-medium text-muted-foreground">
              최근 등록된 공지사항 및 조합원 게시글이 없습니다.
            </li>
          ) : notices.map((notice) => (
            <li key={`${notice.kind}-${notice.id}`} className="flex items-center justify-between gap-4 border-b border-stone-surface py-4 text-sm">
              <Link href={getNoticeHref(notice)} className="min-w-0 flex-1 hover:text-ember-orange">
                <span className="flex min-w-0 items-center gap-2">
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold ${noticeLabelClasses[notice.kind]}`}>
                    {noticeLabels[notice.kind]}
                  </span>
                  <span className="truncate font-medium text-charcoal-primary">{notice.title}</span>
                </span>
              </Link>
              <time className="shrink-0 text-muted-foreground">{formatNoticeDate(notice.createdAt)}</time>
            </li>
          ))}
        </ul>
      </div>
      <div id="library" className="soft-panel p-7 sm:p-9">
        <p className="mb-2 text-sm font-medium text-sky-blue">자료실</p>
        <h2 className="text-3xl">필요한 자료를 한곳에서 찾습니다</h2>
        <p className="mt-4 max-w-md text-[15px] leading-7">
          공개자료, 사업현황, 조합소식에 나뉜 문서까지 통합 자료실에서 다시 안내합니다.
        </p>
        <div className="mt-8 flex flex-wrap gap-2 text-sm font-medium">
          {["핵심자료", "계약·협약", "법령·제도"].map((label) => (
            <span key={label} className="rounded-full bg-white px-4 py-2 text-charcoal-primary">
              {label}
            </span>
          ))}
        </div>
        <Link href="/library" className="mt-8 inline-flex rounded-full bg-midnight px-5 py-2.5 text-sm font-bold text-white">
          자료실 보기
        </Link>
      </div>
    </section>
  );
}
