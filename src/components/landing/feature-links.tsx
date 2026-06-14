import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { featureLinks } from "@/content/landing";

export function FeatureLinks() {
  return (
    <section id="business" className="site-container scroll-mt-24 py-14 sm:py-20">
      <div className="mb-10 text-center">
        <p className="mb-3 text-sm font-medium text-ember-orange">빠른 안내</p>
        <h2 className="text-3xl leading-tight sm:text-[2.75rem]">필요한 소식을 쉽게 찾아보세요</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {featureLinks.map((feature) => (
          <Link
            href={feature.href}
            key={feature.title}
            className="stone-card group flex min-h-64 flex-col p-6 hover:-translate-y-1 hover:shadow-sm"
          >
            <div className="soft-panel mb-6 flex size-24 items-center justify-center">
              <Image src={feature.icon} width={78} height={78} alt="" loading="eager" />
            </div>
            <h3 className="text-xl">{feature.title}</h3>
            <p className="mt-2 text-[15px] leading-6 text-graphite">{feature.description}</p>
            <ArrowRight className="mt-auto size-4 text-ember-orange" aria-hidden="true" />
          </Link>
        ))}
      </div>
    </section>
  );
}
