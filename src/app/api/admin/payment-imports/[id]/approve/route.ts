import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { buildNoticeDraft, requireAdminSession } from "@/lib/contribution-import";

type AdminSession = {
  id: string;
  role: string;
} | null;

type ApproveContext = {
  params: Promise<{ id: string }> | { id: string };
};

export async function POST(_request: Request, context: ApproveContext) {
  const session = (await getSession()) as AdminSession;
  const auth = requireAdminSession(session);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const adminSession = session as { id: string; role: string };

  const params = await context.params;
  const batchId = params.id;

  try {
    const batch = await prisma.paymentImportBatch.findUnique({
      where: { id: batchId },
      include: { rows: true },
    });

    if (!batch) {
      return NextResponse.json({ error: "납부자료 import 배치를 찾을 수 없습니다." }, { status: 404 });
    }

    if (batch.status !== "PENDING") {
      return NextResponse.json({ error: "대기 중인 import 배치만 승인할 수 있습니다." }, { status: 409 });
    }

    const invalidRows = batch.rows.filter((row) => row.validationStatus !== "VALID" || !row.targetUserId);
    if (invalidRows.length > 0) {
      return NextResponse.json({ error: "검증 오류가 있는 배치는 승인할 수 없습니다." }, { status: 400 });
    }

    const approvedRows = await prisma.$transaction(async (tx) => {
      for (const row of batch.rows) {
        await tx.contributionSummary.upsert({
          where: { userId: row.targetUserId as string },
          create: {
            userId: row.targetUserId as string,
            totalDue: row.totalDue,
            totalPaid: row.totalPaid,
            unpaidAmount: row.unpaidAmount,
            overdueAmount: row.overdueAmount,
            lateFee: row.lateFee,
            nextDueDate: row.nextDueDate,
            status: row.status,
            noticeMessage: row.noticeMessage,
            sourceBatchId: batch.id,
          },
          update: {
            totalDue: row.totalDue,
            totalPaid: row.totalPaid,
            unpaidAmount: row.unpaidAmount,
            overdueAmount: row.overdueAmount,
            lateFee: row.lateFee,
            nextDueDate: row.nextDueDate,
            status: row.status,
            noticeMessage: row.noticeMessage,
            sourceBatchId: batch.id,
          },
        });

        if (row.unpaidAmount > 0 || row.overdueAmount > 0) {
          await tx.paymentNotice.create({
            data: buildNoticeDraft(
              {
                ...row,
                targetUserId: row.targetUserId as string,
              },
              batch.id,
            ),
          });
        }
      }

      await tx.paymentImportBatch.update({
        where: { id: batch.id },
        data: {
          status: "APPROVED",
          approvedById: adminSession.id,
          approvedAt: new Date(),
        },
      });

      return batch.rows.length;
    });

    return NextResponse.json({ success: true, approvedRows });
  } catch (error) {
    console.error("POST payment import approve error:", error);
    return NextResponse.json({ error: "납부자료 import 승인 중 문제가 발생했습니다." }, { status: 500 });
  }
}
