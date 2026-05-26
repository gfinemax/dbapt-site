import Link from "next/link";
import { LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";
import { memberServices } from "@/content/landing";

export function PortalPreview() {
  return (
    <section className="site-container py-14 sm:py-24">
      <div className="rounded-[2rem] bg-midnight px-6 py-10 text-white sm:px-12 sm:py-14">
        <div className="flex flex-col justify-between gap-7 lg:flex-row lg:items-end">
          <div>
            <p className="mb-3 text-sm font-medium text-sunburst-yellow">조합원 전용 서비스</p>
            <h2 className="max-w-xl text-3xl leading-tight !text-white sm:text-[2.6rem]">
              투명한 정보공개와 참여를
              <br />
              한곳에서 준비합니다
            </h2>
            <p className="mt-5 text-[15px] leading-7 text-white/72">
              아래 서비스는 조합원 로그인 후 이용할 수 있습니다.
            </p>
          </div>
          <Button asChild variant="secondary" size="lg">
            <Link href="/login">조합원 로그인</Link>
          </Button>
        </div>
        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {memberServices.map((service) => (
            <div key={service.title} className="rounded-2xl bg-white/8 p-5 ring-1 ring-white/12">
              <LockKeyhole className="mb-5 size-5 text-sunburst-yellow" aria-hidden="true" />
              <h3 className="text-lg !text-white">{service.title}</h3>
              <p className="mt-3 text-sm leading-6 text-white/70">{service.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
