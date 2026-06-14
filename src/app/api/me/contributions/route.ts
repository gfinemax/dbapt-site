import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { serializeContributionDashboard, serializeContributionSummary, serializePaymentNotices } from "@/lib/contribution-serializer";

type ContributionSession = {
  id: string;
  loginId: string | null;
  name: string;
  role: string;
} | null;

export async function GET(request?: Request) {
  const session = (await getSession()) as ContributionSession;
  if (!session) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  try {
    const [summaryRecord, notices, profile, ledgerEntries] = await Promise.all([
      prisma.contributionSummary.findUnique({
        where: { userId: session.id },
      }),
      prisma.paymentNotice.findMany({
        where: {
          userId: session.id,
          status: { in: ["DRAFT", "APPROVED"] },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.memberContributionProfile.findUnique({
        where: { userId: session.id },
        include: {
          paymentPlan: {
            include: {
              stages: {
                orderBy: { sortOrder: "asc" },
              },
            },
          },
        },
      }),
      prisma.contributionLedgerEntry.findMany({
        where: { userId: session.id },
        include: {
          stage: {
            select: { label: true },
          },
        },
        orderBy: { paidAt: "desc" },
        take: 20,
      }),
    ]);

    const forwardedFor = request?.headers.get("x-forwarded-for") || null;
    await prisma.contributionViewLog.create({
      data: {
        userId: session.id,
        actionType: "VIEW_DASHBOARD",
        ipAddress: forwardedFor?.split(",")[0]?.trim() || request?.headers.get("x-real-ip") || null,
        userAgent: request?.headers.get("user-agent") || null,
      },
    }).catch(() => undefined);

    const summary = serializeContributionSummary(summaryRecord);
    const dashboard = serializeContributionDashboard(summary, profile, ledgerEntries);

    return NextResponse.json({
      summary,
      dashboard,
      notices: serializePaymentNotices(notices),
    });
  } catch (error) {
    console.error("GET contribution summary error:", error);
    return NextResponse.json({ error: "분담금 납부 현황을 가져오는 데 실패했습니다." }, { status: 500 });
  }
}
