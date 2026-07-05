import type { Metadata } from "next";
import { ShareRedirectPage } from "@/components/share/share-redirect-page";
import { prisma } from "@/lib/db";
import { buildDocumentSocialPreview } from "@/lib/document-social-preview";
import { defaultSiteMetadata, siteTitle } from "@/lib/site-metadata";

type SharePageProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function generateMetadata({ params }: SharePageProps): Promise<Metadata> {
  const { id } = await params;

  try {
    const document = await prisma.document.findFirst({
      where: {
        id,
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

    if (!document) {
      return defaultSiteMetadata;
    }

    const preview = buildDocumentSocialPreview(document);
    const sharePath = `/share/document/${encodeURIComponent(document.id)}`;

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
    console.error("Document share metadata error:", error);
    return defaultSiteMetadata;
  }
}

export default async function DocumentSharePage({ params }: SharePageProps) {
  const { id } = await params;

  return (
    <ShareRedirectPage
      title="공개자료로 이동 중입니다"
      description="잠시 후 공개자료 화면으로 이동합니다."
      destination={`/disclosure?document=${encodeURIComponent(id)}`}
    />
  );
}
