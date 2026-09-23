import type { Metadata } from "next";
import { AccountRecoveryClient } from "./account-recovery-client";

export const metadata: Metadata = {
  title: "아이디·비밀번호 도움 | 대방동 지역주택조합",
};

type AccountRecoveryPageProps = {
  searchParams?: Promise<{ mode?: string }>;
};

export default async function AccountRecoveryPage({ searchParams }: AccountRecoveryPageProps) {
  const params = await searchParams;
  return <AccountRecoveryClient initialMode={params?.mode === "id" ? "ID_LOOKUP" : "PASSWORD_RESET"} />;
}
