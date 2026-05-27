import type { PortalAccent, PortalProfile } from "@/content/portal";
import { cn } from "@/lib/utils";

const accentClasses: Record<PortalAccent, string> = {
  orange: "bg-ember-orange/10 text-ember-orange",
  green: "bg-meadow-green/10 text-graphite",
  blue: "bg-sky-blue/10 text-sky-blue",
  yellow: "bg-sunburst-yellow/15 text-charcoal-primary",
};

type PortalDashboardProps = {
  profile: PortalProfile;
};

export function PortalDashboard({ profile }: PortalDashboardProps) {
  return (
    <>
      <section className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {profile.cards.map((card) => (
          <article key={card.title} className="stone-card p-6">
            <span
              className={cn(
                "inline-flex rounded-full px-3 py-1 text-xs font-medium",
                accentClasses[card.accent],
              )}
            >
              {card.status}
            </span>
            <h2 className="mt-6 text-xl">{card.title}</h2>
            <p className="mt-3 text-[15px] leading-7 text-graphite">{card.description}</p>
          </article>
        ))}
      </section>

      <section className="soft-panel mt-8 px-6 py-8 sm:px-8">
        <p className="text-sm font-medium text-ember-orange">빈 상태 안내</p>
        <h2 className="mt-3 text-2xl">{profile.emptyTitle}</h2>
        <p className="mt-3 max-w-2xl text-[15px] leading-7 text-graphite">
          {profile.emptyDescription}
        </p>
      </section>
    </>
  );
}
