import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "대방동 지역주택조합",
  description: "대방동 지역주택조합 공식 홈페이지",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="flex min-h-full flex-col font-sans">{children}</body>
    </html>
  );
}
