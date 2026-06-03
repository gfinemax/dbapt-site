import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  collectLoginIds,
  normalizePaymentImportRows,
  parsePaymentImportRows,
  requireAdminSession,
} from "@/lib/contribution-import";

type AdminSession = {
  id: string;
  role: string;
} | null;

export async function POST(request: Request) {
  const session = (await getSession()) as AdminSession;
  const auth = requireAdminSession(session);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const adminSession = session as { id: string; role: string };

  try {
    const body = await request.json();
    const inputRows = parsePaymentImportRows(body.rows);

    if (!inputRows) {
      return NextResponse.json({ error: "검증할 납부자료 행이 필요합니다." }, { status: 400 });
    }

    const loginIds = collectLoginIds(inputRows);
    const users = await prisma.user.findMany({
      where: {
        loginId: { in: loginIds },
        isActive: true,
      },
      select: {
        id: true,
        loginId: true,
        name: true,
        role: true,
      },
    });
    const validation = normalizePaymentImportRows(inputRows, users);

    const batch = await prisma.paymentImportBatch.create({
      data: {
        source: typeof body.source === "string" && body.source.trim() ? body.source.trim() : "MANUAL_API",
        status: "PENDING",
        rowCount: validation.rows.length,
        errorCount: validation.errorCount,
        createdById: adminSession.id,
        rows: {
          create: validation.rows,
        },
      },
      include: {
        rows: true,
      },
    });

    return NextResponse.json(
      {
        batch: {
          id: batch.id,
          source: batch.source,
          status: batch.status,
          rowCount: batch.rowCount,
          errorCount: batch.errorCount,
        },
        rows: batch.rows,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST payment import error:", error);
    return NextResponse.json({ error: "납부자료 import 생성 중 문제가 발생했습니다." }, { status: 500 });
  }
}
