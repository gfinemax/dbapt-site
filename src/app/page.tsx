import { FeatureLinks } from "@/components/landing/feature-links";
import { HeroSection } from "@/components/landing/hero-section";
import { NoticesSection } from "@/components/landing/notices-section";
import { PortalPreview } from "@/components/landing/portal-preview";
import { SiteFooter } from "@/components/landing/site-footer";
import { SiteHeader } from "@/components/landing/site-header";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <HeroSection />
        <FeatureLinks />
        <NoticesSection />
        <PortalPreview />
      </main>
      <SiteFooter />
    </>
  );
}
