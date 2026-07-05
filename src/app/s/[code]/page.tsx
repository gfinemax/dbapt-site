import type { Metadata } from "next";
import { ShareRedirectPage } from "@/components/share/share-redirect-page";
import { prisma } from "@/lib/db";
import { buildDocumentSocialPreview } from "@/lib/document-social-preview";
import { buildFreePostSocialPreview, buildNewsPostSocialPreview } from "@/lib/news/social-preview";
import { buildShortSharePath, parseShortShareCode, type ShortShareKind } from "@/lib/short-share-url";
import { defaultSiteMetadata, siteTitle } from "@/lib/site-metadata";

type ShortSharePageProps = {
  params: Promise<{
    code: string;
  }>;
};

function metadataFromPreview(params: {
  kind: ShortShareKind;
  id: string;
  title: string;
  description: string;
  image: {
    url: string;
    width: number;
    height: number;
    alt: string;
  };
}): Metadata {
  const sharePath = buildShortSharePath(params.kind, params.id);

  return {
    metadataBase: defaultSiteMetadata.metadataBase,
    title: `${params.title} | ${siteTitle}`,
    description: params.description,
    openGraph: {
      title: params.title,
      description: params.description,
      url: sharePath,
      siteName: siteTitle,
      locale: "ko_KR",
      type: "article",
      images: [params.image],
    },
    twitter: {
      card: "summary_large_image",
      title: params.title,
      description: params.description,
      images: [params.image.url],
    },
  };
}

export async function generateMetadata({ params }: ShortSharePageProps): Promise<Metadata> {
  const { code } = await params;
  const parsed = parseShortShareCode(code);
  if (!parsed) return defaultSiteMetadata;

  try {
    if (parsed.kind === "free") {
      const post = await prisma.freePost.findFirst({
        where: {
          id: parsed.id,
          isPublicShareEnabled: true,
        },
        select: {
          id: true,
          title: true,
          content: true,
          imagePath: true,
          socialImagePath: true,
        },
      });

      if (!post) return defaultSiteMetadata;

      return metadataFromPreview({
        kind: parsed.kind,
        id: post.id,
        ...buildFreePostSocialPreview(post),
      });
    }

    if (parsed.kind === "document") {
      const document = await prisma.document.findFirst({
        where: {
          id: parsed.id,
          category: "DISCLOSURE",
          status: "APPROVED",
        },
        select: {
          id: true,
          title: true,
          description: true,
          socialImagePath: true,
        },
      });

      if (!document) return defaultSiteMetadata;

      return metadataFromPreview({
        kind: parsed.kind,
        id: document.id,
        ...buildDocumentSocialPreview(document),
      });
    }

    const category = parsed.kind === "notice" ? "NOTICE" : "WEEKLY_MONTHLY";
    const news = await prisma.coopNews.findFirst({
      where: {
        id: parsed.id,
        category,
      },
      select: {
        id: true,
        title: true,
        content: true,
        imagePath: true,
        socialImagePath: true,
      },
    });

    if (!news) return defaultSiteMetadata;

    return metadataFromPreview({
      kind: parsed.kind,
      id: news.id,
      ...buildNewsPostSocialPreview(news),
    });
  } catch (error) {
    console.error("Short share metadata error:", error);
    return defaultSiteMetadata;
  }
}

function getDestination(kind: ShortShareKind, id: string) {
  if (kind === "free") return `/news?tab=free&post=${encodeURIComponent(id)}`;
  if (kind === "notice") return `/news?tab=notice&news=${encodeURIComponent(id)}`;
  if (kind === "newsletter") return `/news?tab=newsletter&news=${encodeURIComponent(id)}`;
  return `/disclosure?document=${encodeURIComponent(id)}`;
}

function getRedirectCopy(kind: ShortShareKind) {
  if (kind === "free") {
    return {
      title: "자유게시판으로 이동 중입니다",
      description: "잠시 후 게시글 화면으로 이동합니다.",
    };
  }
  if (kind === "notice") {
    return {
      title: "공지사항으로 이동 중입니다",
      description: "잠시 후 공지사항 화면으로 이동합니다.",
    };
  }
  if (kind === "newsletter") {
    return {
      title: "조합소식으로 이동 중입니다",
      description: "잠시 후 조합소식 화면으로 이동합니다.",
    };
  }

  return {
    title: "공개자료로 이동 중입니다",
    description: "잠시 후 공개자료 화면으로 이동합니다.",
  };
}

export default async function ShortSharePage({ params }: ShortSharePageProps) {
  const { code } = await params;
  const parsed = parseShortShareCode(code);

  if (!parsed) {
    return (
      <ShareRedirectPage
        title="홈페이지로 이동 중입니다"
        description="유효하지 않은 공유 링크입니다."
        destination="/"
      />
    );
  }

  const copy = getRedirectCopy(parsed.kind);

  return (
    <ShareRedirectPage
      title={copy.title}
      description={copy.description}
      destination={getDestination(parsed.kind, parsed.id)}
    />
  );
}
