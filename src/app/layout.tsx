import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "대방동 지역주택조합",
  description: "대방동 지역주택조합 공식 홈페이지",
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
    <html lang="ko" className="h-full antialiased">
      <body className="flex min-h-full flex-col font-sans pb-16 md:pb-0">
        <GlobalHeader session={session} />
        {children}
      </body>
    </html>
  );
}
