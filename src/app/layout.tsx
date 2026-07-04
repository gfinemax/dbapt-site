import type { Metadata } from "next";
import { defaultSiteMetadata } from "@/lib/site-metadata";
import "./globals.css";

export const metadata: Metadata = defaultSiteMetadata;

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
