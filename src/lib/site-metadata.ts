import type { Metadata } from "next";

export const siteTitle = "대방동 지역주택조합";
export const siteDescription = "대방동 지역주택조합 공식 홈페이지";
export const siteUrl = "https://dbapt-site.vercel.app";

export const socialPreviewImage = {
  url: "/assets/hero/community-hero-04.png",
  width: 1672,
  height: 941,
  alt: "대방동 지역주택조합 대표 이미지",
};

export const defaultSiteMetadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: siteTitle,
  description: siteDescription,
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    url: "/",
    siteName: siteTitle,
    locale: "ko_KR",
    type: "website",
    images: [socialPreviewImage],
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
    images: [socialPreviewImage.url],
  },
};
