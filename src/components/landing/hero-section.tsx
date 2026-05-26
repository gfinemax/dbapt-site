import Image from "next/image";
import Link from "next/link";
import { Rocket, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { heroContent } from "@/content/landing";

export function HeroSection() {
  return (
    <section className="relative isolate overflow-hidden pb-16 pt-8 sm:pb-24">
      <div className="site-container relative min-h-[610px] overflow-hidden rounded-[2rem] bg-white sm:min-h-[720px]">
        <Image
          src="/assets/hero/community-hero-04.png"
          alt=""
          fill
          priority
          className="object-cover object-center"
          sizes="(max-width: 768px) 100vw, 1200px"
        />
        <Rocket
          aria-hidden="true"
          className="float-soft absolute left-[18%] top-20 hidden size-8 text-ember-orange sm:block"
        />
        <Sparkles
          aria-hidden="true"
          className="sparkle absolute right-[22%] top-28 hidden size-7 text-sunburst-yellow sm:block"
        />
        <div className="absolute inset-0 flex items-center justify-center px-5">
          <div className="mt-6 flex max-w-[590px] flex-col items-center text-center">
            <p className="mb-5 rounded-full bg-parchment-card px-4 py-2 text-sm font-medium text-ember-orange">
              {heroContent.badge}
            </p>
            <h1 className="text-[clamp(2.55rem,5.2vw,4.25rem)] leading-[1.1]">
              {heroContent.title[0]}
              <br />
              {heroContent.title[1]}
            </h1>
            <p className="mt-6 max-w-[490px] text-[16px] leading-7 text-graphite sm:text-[17px]">
              {heroContent.description}
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/login">{heroContent.primaryAction}</Link>
              </Button>
              <Button asChild variant="secondary" size="lg">
                <Link href="#business">{heroContent.secondaryAction}</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
