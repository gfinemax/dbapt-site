import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { decryptPersonalInfo, isPersonalInfoField, maskPersonalInfo, personalInfoFieldLabels } from "@/lib/personal-information";

export async function GET() {
  const session = (await getSession()) as { role?: string } | null;
  if (session?.role !== "ADMIN") return NextResponse.json({ error: "관리자 권한이 필요합니다." }, { status: 403 });

  const requests = await prisma.personalInfoChangeRequest.findMany({
    include: {
      user: {
        select: {
          name: true,
          loginId: true,
          personalProfile: { select: { peopleOnMemberId: true } },
          contributionProfile: { select: { externalMemberId: true } },
        },
      },
      resolvedBy: { select: { name: true, loginId: true } },
    },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    take: 100,
  });

  return NextResponse.json({
    requests: requests.map((request) => {
      const field = isPersonalInfoField(request.field) ? request.field : null;
      return {
        id: request.id,
        memberName: request.user.name || request.user.loginId || "이름 없음",
        field: request.field,
        label: field ? personalInfoFieldLabels[field] : request.field,
        previousValue: field ? maskPersonalInfo(field, decryptPersonalInfo(request.previousValueEncrypted)) : "-",
        requestedValue: field ? maskPersonalInfo(field, decryptPersonalInfo(request.requestedValueEncrypted)) : "-",
        status: request.status,
        peopleOnStatus: request.peopleOnStatus,
        hasPeopleOnBinding: Boolean(request.user.personalProfile?.peopleOnMemberId || request.user.contributionProfile?.externalMemberId),
        publicMemo: request.publicMemo,
        adminMemo: request.adminMemo,
        createdAt: request.createdAt.toISOString(),
        resolvedAt: request.resolvedAt?.toISOString() || null,
        resolverName: request.resolvedBy?.name || request.resolvedBy?.loginId || null,
      };
    }),
  });
}
