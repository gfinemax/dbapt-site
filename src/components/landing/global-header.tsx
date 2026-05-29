"use client";

import { SiteHeader } from "./site-header";

interface SessionData {
  id: string;
  loginId: string | null;
  name: string;
  role: string;
  email?: string;
}

export function GlobalHeader({ session }: { session: SessionData | null }) {
  return <SiteHeader session={session} />;
}
