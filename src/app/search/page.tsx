import Link from "next/link";
import { Search } from "lucide-react";
import { searchSiteItems, type SearchableDocument } from "@/content/site-search";
import { SiteFooter } from "@/components/landing/site-footer";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

type SearchPageProps = {
  searchParams?: Promise<{
    q?: string;
  }>;
};

async function loadSearchDocuments(): Promise<SearchableDocument[]> {
  try {
    const session = await getSession() as { role?: string } | null;
    if (!session) return [];

    const docs = await prisma.document.findMany({
      where: session.role === "ADMIN" ? {} : { status: "APPROVED" },
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        subCategory: true,
        correspondenceType: true,
        status: true,
        fileName: true,
        documentDate: true,
        publishedAt: true,
        createdAt: true,
      },
      orderBy: { documentDate: "desc" },
    });

    return docs.map((doc) => ({
      ...doc,
      documentDate: doc.documentDate.toISOString(),
      publishedAt: doc.publishedAt ? doc.publishedAt.toISOString() : null,
      createdAt: doc.createdAt.toISOString(),
    }));
  } catch {
    return [];
  }
}

export default async function SearchPage({ searchParams }: SearchPageProps = {}) {
  const resolvedSearchParams = await searchParams;
  const query = resolvedSearchParams?.q?.trim() || "";
  const documents = await loadSearchDocuments();
  const results = searchSiteItems(query, { documents });

  return (
    <div className="min-h-screen bg-warm-canvas">
      <section className="border-b border-stone-surface bg-gradient-to-br from-warm-canvas via-parchment-card to-stone-surface/30 py-20 text-center">
        <div className="site-container max-w-4xl px-4">
          <span className="inline-flex rounded-full bg-ember-orange/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-ember-orange">
            Site Search
          </span>
          <h1 className="mt-6 text-4xl font-black leading-tight tracking-tight text-charcoal-primary sm:text-5xl">
            전체 찾기
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-graphite/90 sm:text-lg">
            조합소개, 사업현황, 공개자료, 조합소식, 자료실의 주요 내용을 한 번에 찾습니다.
          </p>
        </div>
      </section>

      <main className="site-container max-w-4xl px-4 py-14 sm:py-20">
        <form action="/search" className="rounded-2xl border border-stone-surface bg-white p-4 shadow-[inset_0_0_0_1px_var(--stone-surface)] sm:p-5">
          <label htmlFor="site-search-query" className="text-sm font-bold text-charcoal-primary">
            검색어
          </label>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-ash" aria-hidden="true" />
              <input
                id="site-search-query"
                name="q"
                type="search"
                defaultValue={query}
                placeholder="예: 결정고시, 총회, 위치, 환불"
                className="h-12 w-full rounded-full border border-stone-surface bg-parchment-card pl-11 pr-4 text-sm text-charcoal-primary outline-none transition placeholder:text-ash focus:border-ember-orange focus:bg-white focus:ring-2 focus:ring-ember-orange/15"
              />
            </div>
            <button
              type="submit"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-midnight px-5 text-sm font-bold text-white transition hover:bg-charcoal-primary cursor-pointer"
            >
              <Search className="size-4" aria-hidden="true" />
              찾기
            </button>
          </div>
        </form>

        <section className="mt-10" aria-label="검색 결과">
          {query ? (
            <>
              <p className="rounded-2xl bg-parchment-card px-4 py-3 text-sm text-graphite">
                <strong className="text-charcoal-primary">{query}</strong> 검색 결과 <strong className="text-charcoal-primary">{results.length}건</strong>입니다.
              </p>

              <div className="mt-5 space-y-3">
                {results.length > 0 ? (
                  results.map((item) => (
                    <article
                      key={item.id}
                      data-testid={`site-search-result-${item.id}`}
                      className="stone-card rounded-2xl border border-stone-surface bg-white p-5"
                    >
                      <span className="inline-flex rounded-full bg-stone-surface px-2.5 py-1 text-[10px] font-bold text-graphite">
                        {item.section}
                      </span>
                      <h2 className="mt-3 text-lg font-extrabold tracking-tight text-charcoal-primary">
                        {item.href.startsWith("/api/") ? (
                          <a href={item.href} className="hover:text-ember-orange">
                            {item.title}
                          </a>
                        ) : (
                          <Link href={item.href} className="hover:text-ember-orange">
                            {item.title}
                          </Link>
                        )}
                      </h2>
                      <p className="mt-2 text-sm leading-relaxed text-graphite">
                        {item.description}
                      </p>
                    </article>
                  ))
                ) : (
                  <div className="rounded-2xl border border-stone-surface bg-white p-6 text-sm text-graphite">
                    검색 결과가 없습니다. 다른 검색어를 입력해 주세요.
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="rounded-2xl border border-stone-surface bg-white p-6 text-sm text-graphite">
              찾을 내용을 입력해 주세요.
            </div>
          )}
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
