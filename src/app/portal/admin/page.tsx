import type { Metadata } from "next";
import { PortalShell } from "@/components/portal/portal-shell";

export const metadata: Metadata = {
  title: "관리자 포털 미리보기 | 대방동 지역주택조합",
};

export default function AdminPortalPage() {
  return <PortalShell role="admin" />;
}
