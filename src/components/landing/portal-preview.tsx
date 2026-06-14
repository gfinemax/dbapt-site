import Link from "next/link";
import { ArrowRight, LockKeyhole, MessageSquareText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { memberServices } from "@/content/landing";
import { issueCategories } from "@/content/issues";

type PortalPreviewProps = {
  session?: {
    id: string;
    loginId: string | null;
    name: string;
    role: string;
  } | null;
};

const memberServiceIssueHref = {
  "정보공개": "/issues?category=disclosure",
  "회계·실적보고": "/issues?category=accounting",
  "내 분담금": "/issues?category=contribution",
  "이슈의 장": "/issues?category=participation",
} as const;

export function PortalPreview({ session }: PortalPreviewProps) {
  const isLoggedIn = !!session;
  const issueTopics = [
    {
      label: "사업 추진 현안",
      description: "주요 진행 사안을 자료와 함께 논의합니다.",
    },
    {
      label: "자료·회계 질의",
      description: "공개자료와 회계 보고에 대한 질문을 모읍니다.",
    },
  ] as const;
  const getIssueLinkLabel = (title: string) => {
    const category = issueCategories.find((item) => item.title === title);
    return `${title} ${category?.dashboardLabel ?? "관련 공개자료 보기"}`;
  };

  return (
    <section className="site-container py-14 sm:py-24">
      <div className="rounded-[2rem] bg-midnight px-6 py-10 text-white sm:px-12 sm:py-14">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.52fr)] lg:items-center">
          <div>
            <p className="mb-3 text-sm font-medium text-sunburst-yellow">조합원 전용 서비스</p>
            <h2 className="max-w-xl text-3xl leading-tight !text-white sm:text-[2.6rem]">
              투명한 정보공개와 참여를
              <br />
              한곳에서 준비합니다
            </h2>
            <p className="mt-5 text-[15px] leading-7 text-white/72">
              {isLoggedIn 
                ? "공개자료를 확인하고, 주요 현안을 주제별로 나눕니다."
                : "아래 서비스는 조합원 로그인 후 이용할 수 있습니다."}
            </p>
          </div>

          {isLoggedIn ? (
            <aside className="w-full max-w-xl rounded-3xl bg-white/8 p-5 ring-1 ring-white/12 lg:justify-self-end">
              <div className="flex items-center gap-2 text-sunburst-yellow">
                <MessageSquareText className="size-4" aria-hidden="true" />
                <p className="text-sm font-semibold">현재 열린 이슈</p>
              </div>
              <div className="mt-4 space-y-3">
                {issueTopics.map((item) => (
                  <div key={item.label} className="rounded-2xl bg-white/7 px-4 py-3">
                    <p className="text-sm font-bold !text-white">{item.label}</p>
                    <p className="mt-1 text-xs leading-5 text-white/62">{item.description}</p>
                  </div>
                ))}
              </div>
            </aside>
          ) : (
            <div className="flex lg:justify-end">
              <Button asChild variant="secondary" size="lg" className="rounded-full">
                <Link href="/login">조합원 로그인</Link>
              </Button>
            </div>
          )}
        </div>
        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {memberServices.map((service) => (
            isLoggedIn ? (
              <Link
                key={service.title}
                href={memberServiceIssueHref[service.title]}
                aria-label={getIssueLinkLabel(service.title)}
                className={`group flex min-h-56 flex-col rounded-2xl bg-white/8 p-5 text-left ring-1 transition duration-200 hover:-translate-y-0.5 hover:bg-white/11 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
                  service.title === "이슈의 장" ? "ring-sunburst-yellow/45 bg-white/10" : "ring-white/12"
                }`}
              >
                <LockKeyhole className="mb-5 size-5 text-sunburst-yellow" aria-hidden="true" />
                {service.title === "이슈의 장" && (
                  <span className="mb-3 inline-flex w-fit rounded-full bg-sunburst-yellow/12 px-2.5 py-1 text-[11px] font-bold text-sunburst-yellow">
                    참여 포커스
                  </span>
                )}
                <h3 className="text-lg !text-white">{service.title}</h3>
                <p className="mt-3 text-sm leading-6 text-white/70">{service.description}</p>
                <ArrowRight className="mt-auto size-4 text-sunburst-yellow opacity-70 transition group-hover:translate-x-1 group-hover:opacity-100" aria-hidden="true" />
              </Link>
            ) : (
              <div key={service.title} className="rounded-2xl bg-white/8 p-5 ring-1 ring-white/12">
                <LockKeyhole className="mb-5 size-5 text-sunburst-yellow" aria-hidden="true" />
                <h3 className="text-lg !text-white">{service.title}</h3>
                <p className="mt-3 text-sm leading-6 text-white/70">{service.description}</p>
              </div>
            )
          ))}
        </div>
      </div>
    </section>
  );
}
