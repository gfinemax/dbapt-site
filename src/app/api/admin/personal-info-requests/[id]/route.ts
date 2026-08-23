import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { applyApprovedPersonalInfo, decryptPersonalInfo, isPersonalInfoField, isLedgerCorrectionField } from "@/lib/personal-information";

type RouteContext = { params: Promise<{ id: string }> };
type AdminAction = "APPROVE" | "REJECT" | "PEOPLEON_COMPLETED" | "PEOPLEON_FAILED";

export async function PATCH(request: Request, { params }: RouteContext) {
  const session = (await getSession()) as { id?: string; role?: string } | null;
  if (!session?.id || session.role !== "ADMIN") {
    return NextResponse.json({ error: "관리자 권한이 필요합니다." }, { status: 403 });
  }
  const { id } = await params;

  try {
    const body = (await request.json()) as { action?: AdminAction; memo?: unknown };
    const memo = typeof body.memo === "string"
      ? body.memo.replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, 500)
      : "";
    if (!body.action || !["APPROVE", "REJECT", "PEOPLEON_COMPLETED", "PEOPLEON_FAILED"].includes(body.action)) {
      return NextResponse.json({ error: "처리 작업이 올바르지 않습니다." }, { status: 400 });
    }
    if ((body.action === "REJECT" || body.action === "PEOPLEON_FAILED") && !memo) {
      return NextResponse.json({ error: "처리 사유를 입력해주세요." }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const changeRequest = await tx.personalInfoChangeRequest.findUnique({ where: { id } });
      if (!changeRequest || !isPersonalInfoField(changeRequest.field)) throw new Error("수정 요청을 찾을 수 없습니다.");

      if (body.action === "APPROVE") {
        if (changeRequest.status !== "PENDING") throw new Error("이미 처리된 요청입니다.");
        const value = decryptPersonalInfo(changeRequest.requestedValueEncrypted);
        if (!value) throw new Error("변경 값을 확인할 수 없습니다.");
        await applyApprovedPersonalInfo(tx, changeRequest.userId, changeRequest.field, value);
        const publicMessage = isLedgerCorrectionField(changeRequest.field)
          ? "원장 정정 요청이 승인되었습니다. 원장 반영을 확인하고 있습니다."
          : "개인정보 수정 요청이 승인되어 홈페이지에 반영되었습니다.";
        await tx.personalInfoChangeRequest.update({
          where: { id },
          data: { status: "APPROVED", resolvedById: session.id, resolvedAt: new Date(), adminMemo: memo || null },
        });
        await tx.personalInfoChangeEvent.create({
          data: { requestId: id, actorId: session.id, eventType: "APPROVED", message: publicMessage },
        });
        return { success: true, message: publicMessage };
      }

      if (body.action === "REJECT") {
        if (changeRequest.status !== "PENDING") throw new Error("이미 처리된 요청입니다.");
        await tx.personalInfoChangeRequest.update({
          where: { id },
          data: { status: "REJECTED", resolvedById: session.id, resolvedAt: new Date(), adminMemo: memo, publicMemo: memo },
        });
        await tx.personalInfoChangeEvent.create({
          data: { requestId: id, actorId: session.id, eventType: "REJECTED", message: `수정 요청이 반려되었습니다. ${memo}` },
        });
        return { success: true, message: "수정 요청을 반려했습니다." };
      }

      if (changeRequest.status !== "APPROVED") throw new Error("승인된 요청만 PeopleON 반영 상태를 변경할 수 있습니다.");
      const completed = body.action === "PEOPLEON_COMPLETED";
      await tx.personalInfoChangeRequest.update({
        where: { id },
        data: {
          peopleOnStatus: completed ? "COMPLETED" : "FAILED",
          peopleOnError: completed ? null : memo,
          ...(completed ? { publicMemo: "PeopleON 원장 반영이 완료되었습니다." } : {}),
        },
      });
      await tx.personalInfoChangeEvent.create({
        data: {
          requestId: id,
          actorId: session.id,
          eventType: completed ? "PEOPLEON_COMPLETED" : "PEOPLEON_FAILED",
          message: completed ? "PeopleON 원장 반영이 완료되었습니다." : "PeopleON 원장 반영을 확인하고 있습니다.",
        },
      });
      return { success: true, message: completed ? "PeopleON 반영 완료로 기록했습니다." : "PeopleON 반영 실패로 기록했습니다." };
    });
    return NextResponse.json(result);
  } catch (error) {
    const isUniqueConflict = error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
    const message = isUniqueConflict
      ? "이미 사용 중인 이메일 또는 연락처입니다."
      : error instanceof Error ? error.message : "요청을 처리하지 못했습니다.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
