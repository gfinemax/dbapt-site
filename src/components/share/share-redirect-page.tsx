"use client";

import { useEffect } from "react";

type ShareRedirectPageProps = {
  destination: string;
  title: string;
  description: string;
};

export function ShareRedirectPage({ destination, title, description }: ShareRedirectPageProps) {
  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      window.location.replace(destination);
    }, 150);

    return () => window.clearTimeout(timeoutId);
  }, [destination]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-warm-canvas px-5 py-16 text-graphite">
      <section className="w-full max-w-md rounded-[24px] bg-white p-8 text-center shadow-[inset_0_0_0_1px_#f2f0ed]">
        <p className="text-sm font-semibold text-charcoal-primary">{title}</p>
        <p className="mt-3 text-xs leading-relaxed text-graphite/70">{description}</p>
        <a
          href={destination}
          className="mt-6 inline-flex rounded-full bg-midnight px-5 py-3 text-xs font-bold text-white transition hover:bg-charcoal-primary"
        >
          바로 이동
        </a>
      </section>
    </main>
  );
}
