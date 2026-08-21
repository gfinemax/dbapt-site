import { getPlainNoticeText } from "@/lib/news/rich-text";
import { siteTitle, socialPreviewImage } from "@/lib/site-metadata";
import { SOCIAL_PREVIEW_OUTPUT_HEIGHT, SOCIAL_PREVIEW_OUTPUT_WIDTH } from "@/lib/social-preview-crop";

type NewsPostSocialPreviewInput = {
  id: string;
  title: string;
  content: string;
  imagePath?: string | null;
  socialImagePath?: string | null;
};

type SocialPreview = {
  title: string;
  description: string;
  image: {
    url: string;
    width: number;
    height: number;
    alt: string;
  };
};

const MAX_DESCRIPTION_LENGTH = 160;

function cleanImageSrc(src: string) {
  return src.trim().replace(/&amp;/g, "&");
}

function isSafeSocialImageSrc(src: string) {
  return (src.startsWith("/") && !src.startsWith("//")) || /^https?:\/\//i.test(src);
}

export function getFirstRichTextImageSrc(content: string) {
  const imagePattern = /<img\b[^>]*\bsrc\s*=\s*(?:"([^"]+)"|'([^']+)'|([^\s>]+))/gi;

  for (const match of content.matchAll(imagePattern)) {
    const src = cleanImageSrc(match[1] || match[2] || match[3] || "");
    if (src && isSafeSocialImageSrc(src)) {
      return src;
    }
  }

  return null;
}

function truncateDescription(description: string) {
  if (description.length <= MAX_DESCRIPTION_LENGTH) return description;
  return `${description.slice(0, MAX_DESCRIPTION_LENGTH - 1).trimEnd()}…`;
}

export function buildNewsPostSocialPreview(post: NewsPostSocialPreviewInput): SocialPreview {
  const imageUrl = post.socialImagePath || getFirstRichTextImageSrc(post.content) || post.imagePath || socialPreviewImage.url;
  const safeImageUrl = isSafeSocialImageSrc(imageUrl) ? imageUrl : socialPreviewImage.url;
  const description = truncateDescription(getPlainNoticeText(post.content) || siteTitle);

  return {
    title: post.title,
    description,
    image: {
      url: safeImageUrl,
      width: safeImageUrl === socialPreviewImage.url ? socialPreviewImage.width : SOCIAL_PREVIEW_OUTPUT_WIDTH,
      height: safeImageUrl === socialPreviewImage.url ? socialPreviewImage.height : SOCIAL_PREVIEW_OUTPUT_HEIGHT,
      alt: post.title,
    },
  };
}

export function buildFreePostSocialPreview(post: NewsPostSocialPreviewInput): SocialPreview {
  return buildNewsPostSocialPreview(post);
}
