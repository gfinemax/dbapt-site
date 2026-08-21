import { siteTitle, socialPreviewImage } from "@/lib/site-metadata";
import { getSocialPreviewDimensions } from "@/lib/social-preview-image";

type DocumentSocialPreviewInput = {
  id: string;
  title: string;
  description?: string | null;
  socialImagePath?: string | null;
};

type DocumentSocialPreview = {
  title: string;
  description: string;
  image: {
    url: string;
    width: number;
    height: number;
    alt: string;
  };
};

function isSafeSocialImageSrc(src: string) {
  return (src.startsWith("/") && !src.startsWith("//")) || /^https?:\/\//i.test(src);
}

export function buildDocumentSocialPreview(document: DocumentSocialPreviewInput): DocumentSocialPreview {
  const imageUrl =
    document.socialImagePath && isSafeSocialImageSrc(document.socialImagePath)
      ? document.socialImagePath
      : socialPreviewImage.url;
  const customImageDimensions = getSocialPreviewDimensions(imageUrl);

  return {
    title: document.title,
    description: document.description?.trim() || siteTitle,
    image: {
      url: imageUrl,
      width: imageUrl === socialPreviewImage.url ? socialPreviewImage.width : customImageDimensions.width,
      height: imageUrl === socialPreviewImage.url ? socialPreviewImage.height : customImageDimensions.height,
      alt: document.title,
    },
  };
}
