import type { Metadata } from "next";
import { ShareRedirectPage } from "@/components/share/share-redirect-page";
import { prisma } from "@/lib/db";
import { buildFreePostSocialPreview } from "@/lib/news/social-preview";
import { defaultSiteMetadata, siteTitle } from "@/lib/site-metadata";

type SharePageProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function generateMetadata({ params }: SharePageProps): Promise<Metadata> {
  const { id } = await params;

  try {
    const post = await prisma.freePost.findFirst({
      where: {
        id,
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

    if (!post) {
      return defaultSiteMetadata;
    }

    const preview = buildFreePostSocialPreview(post);
    const sharePath = `/share/free/${encodeURIComponent(post.id)}`;

    return {
      metadataBase: defaultSiteMetadata.metadataBase,
      title: `${preview.title} | ${siteTitle}`,
      description: preview.description,
      openGraph: {
        title: preview.title,
        description: preview.description,
        url: sharePath,
        siteName: siteTitle,
        locale: "ko_KR",
        type: "article",
        images: [preview.image],
      },
      twitter: {
        card: "summary_large_image",
        title: preview.title,
        description: preview.description,
        images: [preview.image.url],
      },
    };
  } catch (error) {
    console.error("Free-board share metadata error:", error);
    return defaultSiteMetadata;
  }
}

export default async function FreePostSharePage({ params }: SharePageProps) {
  const { id } = await params;

  return (
    <ShareRedirectPage
      title="자유게시판으로 이동 중입니다"
      description="잠시 후 게시글 화면으로 이동합니다."
      destination={`/news?tab=free&post=${encodeURIComponent(id)}`}
    />
  );
}
