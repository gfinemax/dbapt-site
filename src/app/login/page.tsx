import { LoginClient } from "./login-client";

type LoginPageProps = {
  searchParams?: Promise<{
    error?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const resolvedSearchParams = await searchParams;

  return <LoginClient googleError={resolvedSearchParams?.error || null} />;
}
