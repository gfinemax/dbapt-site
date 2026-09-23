import { LoginClient } from "./login-client";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

type LoginPageProps = {
  searchParams?: Promise<{
    error?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await getSession();
  if (session?.role === "MEMBER") redirect("/portal/member");
  if (session?.role === "REFUND") redirect("/portal/refund");
  if (session?.role === "ADMIN") redirect("/portal/admin");
  if (session?.role === "PENDING" || session?.role === "ASSOCIATE") redirect("/portal/pending");
  const resolvedSearchParams = await searchParams;

  return <LoginClient googleError={resolvedSearchParams?.error || null} />;
}
