import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AccountRecoveryAdmin } from "@/components/portal/account-recovery-admin";
import { getSession } from "@/lib/auth";
import { maskRecoveryPhone, normalizeRecoveryPhone } from "@/lib/account-recovery";
import { prisma } from "@/lib/db";

export const metadata: Metadata = {
  title: "계정 복구 요청 | 대방동 지역주택조합",
};

export const dynamic = "force-dynamic";

export default async function AccountRecoveryAdminPage() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/login");

  const requests = await prisma.accountRecoveryRequest.findMany({
    include: {
      user: {
        select: {
          name: true,
          signupName: true,
          loginId: true,
          phone: true,
          signupPhone: true,
          role: true,
          isActive: true,
          passwordHash: true,
        },
      },
      handledBy: { select: { name: true, signupName: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <AccountRecoveryAdmin
      requests={requests.map((request) => {
        const phone = normalizeRecoveryPhone(request.user.phone || request.user.signupPhone || request.user.loginId || "") || "";
        return {
          id: request.id,
          requestType: request.requestType,
          status: request.status,
          requestPhoneLast4: request.requestPhoneLast4,
          deliveryMethod: request.deliveryMethod,
          createdAt: request.createdAt.toISOString(),
          tokenExpiresAt: request.tokenExpiresAt?.toISOString() || null,
          deliveryMarkedAt: request.deliveryMarkedAt?.toISOString() || null,
          completedAt: request.completedAt?.toISOString() || null,
          user: {
            name: request.user.name || request.user.signupName || "이름 없음",
            phoneMasked: maskRecoveryPhone(phone),
            role: request.user.role,
            isActive: request.user.isActive,
            hasSitePassword: Boolean(request.user.passwordHash),
          },
          handledByName: request.handledBy?.name || request.handledBy?.signupName || null,
        };
      })}
    />
  );
}
