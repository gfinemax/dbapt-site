import Link from "next/link";
import { Button } from "@/components/ui/button";

type StatusPageProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function StatusPage({ eyebrow, title, description }: StatusPageProps) {
  return (
    <main className="flex min-h-screen items-center px-4 py-16">
      <section className="soft-panel mx-auto w-full max-w-xl p-6 sm:p-10">
        <div className="stone-card px-6 py-12 text-center sm:px-10">
          <p className="mb-4 text-sm font-medium text-ember-orange">{eyebrow}</p>
          <h1 className="text-3xl leading-tight sm:text-[2.5rem]">{title}</h1>
          <p className="mx-auto mt-5 max-w-md text-[15px] leading-7 text-graphite">
            {description}
          </p>
          <Button asChild size="lg" className="mt-9">
            <Link href="/">홈으로 돌아가기</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
