import { AdminWorkspaceShell } from "@/components/portal/admin-workspace-shell";
import { getSession } from "@/lib/auth";

export default async function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const session = await getSession();

  if (!session || session.role !== "ADMIN") return children;

  return <AdminWorkspaceShell name={typeof session.name === "string" ? session.name : "운영자"}>{children}</AdminWorkspaceShell>;
}
