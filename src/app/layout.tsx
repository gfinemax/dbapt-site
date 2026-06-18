import type { Metadata } from "next";
import "./globals.css";

const siteTitle = "대방동 지역주택조합";
const siteDescription = "대방동 지역주택조합 공식 홈페이지";
const socialPreviewImage = {
  url: "/assets/hero/community-hero-04.png",
  width: 1672,
  height: 941,
  alt: "대방동 지역주택조합 대표 이미지",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://dbapt-site.vercel.app"),
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

import { getSession } from "@/lib/auth";
import { GlobalHeader } from "@/components/landing/global-header";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = (await getSession()) as {
    id: string;
    loginId: string | null;
    name: string;
    role: string;
    email?: string;
  } | null;

  return (
    <html lang="ko" data-scroll-behavior="smooth" className="h-full antialiased">
      <body className="flex min-h-full flex-col font-sans pb-16 md:pb-0">
        <GlobalHeader session={session} />
        {children}
      </body>
    </html>
  );
}
