import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { heroContent } from "@/content/landing";

export function HeroSection() {
  return (
    <section className="relative isolate overflow-hidden pb-8 pt-3 sm:pb-10">
      <div className="site-container relative min-h-[480px] overflow-hidden rounded-[2rem] bg-white sm:min-h-[520px]">
        <Image
          src="/assets/hero/community-hero-04.png"
          alt=""
          fill
          priority
          className="object-cover object-bottom"
          sizes="(max-width: 768px) 100vw, 1200px"
        />
        <div className="absolute inset-0 flex items-center justify-center px-5">
          <div
            data-hero-content
            className="flex max-w-[920px] -translate-y-10 flex-col items-center text-center sm:-translate-y-20"
          >
            <h1 className="text-[clamp(2.45rem,4.8vw,4rem)] leading-[1.12]">
              {heroContent.title.map((line) => (
                <span key={line} data-hero-line className="block sm:whitespace-nowrap">
                  {line}
                </span>
              ))}
            </h1>
            <p className="mt-6 max-w-none text-[16px] leading-7 text-graphite sm:text-[17px]">
              {heroContent.description}
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/login">{heroContent.primaryAction}</Link>
              </Button>
              <Button asChild variant="secondary" size="lg">
                <Link href="/business">{heroContent.secondaryAction}</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
