import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

type ContributionSession = {
  id: string;
  loginId: string | null;
  name: string;
  role: string;
} | null;

export async function GET() {
  const session = (await getSession()) as ContributionSession;
  if (!session) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  try {
    const [summary, notices] = await Promise.all([
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
    ]);

    return NextResponse.json({
      summary: summary
        ? {
            totalDue: summary.totalDue,
            totalPaid: summary.totalPaid,
            unpaidAmount: summary.unpaidAmount,
            overdueAmount: summary.overdueAmount,
            lateFee: summary.lateFee,
            nextDueDate: summary.nextDueDate?.toISOString() || null,
            status: summary.status,
            noticeMessage: summary.noticeMessage,
            updatedAt: summary.updatedAt?.toISOString() || null,
          }
        : null,
      notices: notices.map((notice) => ({
        id: notice.id,
        type: notice.type,
        status: notice.status,
        title: notice.title,
        message: notice.message,
        unpaidAmount: notice.unpaidAmount,
        overdueAmount: notice.overdueAmount,
        lateFee: notice.lateFee,
        dueDate: notice.dueDate?.toISOString() || null,
        createdAt: notice.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("GET contribution summary error:", error);
    return NextResponse.json({ error: "분담금 납부 현황을 가져오는 데 실패했습니다." }, { status: 500 });
  }
}
