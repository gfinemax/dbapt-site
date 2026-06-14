import Link from "next/link";
import { ArrowRight, FileText, MessageSquareText, ShieldCheck } from "lucide-react";
import { SiteFooter } from "@/components/landing/site-footer";
import { getIssueCategory, issueCategories } from "@/content/issues";
import { cn } from "@/lib/utils";

type IssuesPageProps = {
  searchParams?: Promise<{
    category?: string;
  }>;
};

export default async function IssuesPage({ searchParams }: IssuesPageProps = {}) {
  const resolvedSearchParams = await searchParams;
  const selectedCategory = getIssueCategory(resolvedSearchParams?.category);

  return (
    <div className="min-h-screen bg-warm-canvas pt-[52px]">
      <section className="border-b border-stone-surface bg-gradient-to-br from-warm-canvas via-parchment-card to-stone-surface/30 py-16 sm:py-20">
        <div className="site-container max-w-5xl px-4">
          <span className="inline-flex rounded-full bg-ember-orange/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-ember-orange">
            Issue Dashboard
          </span>
          <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-end">
            <div>
              <h1 className="text-4xl font-black leading-tight tracking-tight text-charcoal-primary sm:text-5xl">
                이슈 대시보드
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-graphite/90 sm:text-lg">
                공개자료를 먼저 확인하고, 주요 현안을 주제별로 나눠 볼 수 있도록 정리했습니다.
                개인자료실과 겹치지 않도록 공개 가능한 자료와 논의 맥락만 안내합니다.
              </p>
            </div>
            <div className="rounded-2xl border border-stone-surface bg-white p-5 shadow-[inset_0_0_0_1px_var(--stone-surface)]">
              <p className="text-xs font-bold uppercase tracking-widest text-sky-blue">
                현재 선택
              </p>
              <p className="mt-2 text-xl font-extrabold tracking-tight text-charcoal-primary">
                {selectedCategory.title}
              </p>
              <p className="mt-3 text-sm leading-6 text-graphite">
                {selectedCategory.summary}
              </p>
            </div>
          </div>
        </div>
      </section>

      <main className="site-container max-w-5xl px-4 py-12 sm:py-16">
        <nav aria-label="이슈 카테고리" className="overflow-x-auto">
          <div className="flex min-w-max gap-2 pb-1">
            {issueCategories.map((category) => (
              <Link
                key={category.id}
                href={`/issues?category=${category.id}`}
                className={cn(
                  "rounded-full px-4 py-2 text-xs font-bold transition",
                  category.id === selectedCategory.id
                    ? "bg-midnight text-white"
                    : "bg-white text-graphite shadow-[inset_0_0_0_1px_var(--stone-surface)] hover:text-charcoal-primary",
                )}
              >
                {category.title}
              </Link>
            ))}
          </div>
        </nav>

        <section className="mt-8 grid gap-5 lg:grid-cols-[minmax(0,0.82fr)_minmax(280px,0.38fr)]">
          <article className="rounded-3xl border border-stone-surface bg-white p-6 shadow-[inset_0_0_0_1px_var(--stone-surface)] sm:p-8">
            <p className="text-xs font-bold uppercase tracking-widest text-ember-orange">
              {selectedCategory.eyebrow}
            </p>
            <h2 className="mt-3 text-3xl font-extrabold leading-tight tracking-tight text-charcoal-primary">
              {selectedCategory.title}
            </h2>
            <p className="mt-4 text-sm leading-7 text-graphite">
              {selectedCategory.focus}
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <section>
                <div className="flex items-center gap-2">
                  <FileText className="size-4 text-ember-orange" aria-hidden="true" />
                  <h3 className="text-lg font-extrabold tracking-tight text-charcoal-primary">
                    관련 공개자료
                  </h3>
                </div>
                <div className="mt-4 space-y-3">
                  {selectedCategory.materials.map((material) => (
                    <Link
                      key={material.title}
                      href={material.href}
                      aria-label={material.title}
                      className="group block rounded-2xl bg-parchment-card p-4 transition hover:bg-stone-surface/80"
                    >
                      <span className="flex items-center justify-between gap-3">
                        <span className="text-sm font-bold text-charcoal-primary">
                          {material.title}
                        </span>
                        <ArrowRight className="size-4 shrink-0 text-ember-orange transition group-hover:translate-x-1" aria-hidden="true" />
                      </span>
                      <span className="mt-2 block text-xs leading-5 text-graphite">
                        {material.description}
                      </span>
                    </Link>
                  ))}
                </div>
              </section>

              <section>
                <div className="flex items-center gap-2">
                  <MessageSquareText className="size-4 text-sky-blue" aria-hidden="true" />
                  <h3 className="text-lg font-extrabold tracking-tight text-charcoal-primary">
                    논의 주제
                  </h3>
                </div>
                <div className="mt-4 space-y-3">
                  {selectedCategory.topics.map((topic) => (
                    <article key={topic.title} className="rounded-2xl border border-stone-surface bg-white p-4">
                      <span className="rounded-full bg-stone-surface/70 px-2.5 py-1 text-[10px] font-bold text-graphite">
                        {topic.status}
                      </span>
                      <h4 className="mt-3 text-sm font-bold text-charcoal-primary">
                        {topic.title}
                      </h4>
                      <p className="mt-2 text-xs leading-5 text-graphite">
                        {topic.description}
                      </p>
                    </article>
                  ))}
                </div>
              </section>
            </div>
          </article>

          <aside className="rounded-3xl border border-stone-surface bg-parchment-card p-6">
            <div className="flex size-11 items-center justify-center rounded-full bg-midnight text-white">
              <ShieldCheck className="size-5" aria-hidden="true" />
            </div>
            <h3 className="mt-5 text-xl font-extrabold tracking-tight text-charcoal-primary">
              참여 안내
            </h3>
            <p className="mt-3 text-sm leading-7 text-graphite">
              {selectedCategory.participationGuide}
            </p>
            <div className="mt-6 space-y-2 text-xs leading-5 text-graphite">
              <p className="rounded-2xl bg-white p-4">
                공개자료 확인은 이 페이지에서 시작하고, 권한이 필요한 원문 열람은 로그인 후 진행합니다.
              </p>
              <p className="rounded-2xl bg-white p-4">
                공지성 내용은 조합소식, 자유 의견은 자유게시판, 사안별 검토는 이슈 대시보드로 분리합니다.
              </p>
            </div>
          </aside>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
