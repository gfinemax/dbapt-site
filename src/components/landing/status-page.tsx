import type { ReactNode } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type StatusPageProps = {
  eyebrow: string;
  title: string;
  description: string;
  children?: ReactNode;
  wide?: boolean;
};

export function StatusPage({
  eyebrow,
  title,
  description,
  children,
  wide = false,
}: StatusPageProps) {
  return (
    <main className="flex min-h-screen items-center px-4 py-16">
      <section
        className={cn(
          "soft-panel mx-auto w-full p-6 sm:p-10",
          wide ? "max-w-3xl" : "max-w-xl",
        )}
      >
        <div className="stone-card px-6 py-12 text-center sm:px-10">
          <p className="mb-4 text-sm font-medium text-ember-orange">{eyebrow}</p>
          <h1 className="text-3xl leading-tight sm:text-[2.5rem]">{title}</h1>
          <p className="mx-auto mt-5 max-w-md text-[15px] leading-7 text-graphite">
            {description}
          </p>
          {children}
          <Button asChild size="lg" className="mt-9">
            <Link href="/">홈으로 돌아가기</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
