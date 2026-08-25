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
  compactMobile?: boolean;
};

export function StatusPage({
  eyebrow,
  title,
  description,
  children,
  wide = false,
  compactMobile = false,
}: StatusPageProps) {
  return (
    <main className={cn("flex min-h-screen items-center px-4 py-16", compactMobile && "items-start px-0 py-0 sm:items-center sm:px-4 sm:py-16")}>
      <section
        className={cn(
          "soft-panel mx-auto w-full p-6 sm:p-10",
          wide ? "max-w-3xl" : "max-w-xl",
          compactMobile && "rounded-none bg-transparent p-0 shadow-none sm:rounded-[24px] sm:bg-white sm:p-10 sm:shadow-[inset_0_0_0_1px_var(--stone-surface)]",
        )}
      >
        <div className={cn("stone-card px-6 py-12 text-center sm:px-10", compactMobile && "rounded-none px-4 py-6 shadow-none sm:rounded-[10px] sm:px-10 sm:py-12 sm:shadow-[inset_0_0_0_1px_var(--stone-surface)]")}>
          <p className={cn("mb-4 text-sm font-medium text-ember-orange", compactMobile && "mb-2 text-xs sm:mb-4 sm:text-sm")}>{eyebrow}</p>
          <h1 className={cn("text-3xl leading-tight sm:text-[2.5rem]", compactMobile && "text-2xl sm:text-[2.5rem]")}>{title}</h1>
          <p className={cn("mx-auto mt-5 max-w-md text-[15px] leading-7 text-graphite", compactMobile && "mt-2 text-sm leading-6 sm:mt-5 sm:text-[15px] sm:leading-7")}>
            {description}
          </p>
          {children}
          <Button asChild size="lg" className={cn("mt-9", compactMobile && "mt-6 sm:mt-9")}>
            <Link href="/">홈으로 돌아가기</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
