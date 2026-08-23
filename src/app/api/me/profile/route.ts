import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  PERSONAL_INFO_FIELDS,
  decryptPersonalInfo,
  encryptPersonalInfo,
  getCurrentPersonalInfoValue,
  isPersonalInfoField,
  maskPersonalInfo,
  normalizePersonalInfoValue,
  personalInfoFieldLabels,
  requiresPeopleOnReflection,
} from "@/lib/personal-information";

type SessionPayload = { id?: string; role?: string };

async function currentUserId() {
  const session = (await getSession()) as SessionPayload | null;
  return session?.id || null;
}

async function loadProfileSource(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      name: true,
      phone: true,
      email: true,
      role: true,
      personalProfile: true,
      contributionProfile: { select: { selectedUnitLabel: true, externalMemberId: true } },
    },
  });
  if (!user) return null;
  return {
    user,
    profile: user.personalProfile,
    selectedUnit: user.contributionProfile?.selectedUnitLabel || null,
  };
}

export async function GET() {
  const userId = await currentUserId();
  if (!userId) return NextResponse.json({ error: "인증되지 않은 사용자입니다." }, { status: 401 });

  const [source, requests] = await Promise.all([
    loadProfileSource(userId),
    prisma.personalInfoChangeRequest.findMany({
      where: { userId },
      include: { events: { orderBy: { createdAt: "asc" } } },
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
  ]);
  if (!source) return NextResponse.json({ error: "사용자 정보를 찾을 수 없습니다." }, { status: 404 });

  const fields = PERSONAL_INFO_FIELDS
    .filter((field) => !(source.user.role === "REFUND" && field === "selectedUnit"))
    .map((field) => {
      const value = getCurrentPersonalInfoValue(field, source);
      return { field, label: personalInfoFieldLabels[field], value: maskPersonalInfo(field, value) };
    });

  return NextResponse.json({
    profile: {
      fields,
      lastConfirmedAt: source.profile?.lastConfirmedAt?.toISOString() || null,
      updatedAt: source.profile?.updatedAt?.toISOString() || null,
      peopleOnSyncedAt: source.profile?.peopleOnSyncedAt?.toISOString() || null,
      hasPeopleOnBinding: Boolean(source.profile?.peopleOnMemberId || source.user.contributionProfile?.externalMemberId),
    },
    requests: requests.map((request) => ({
      id: request.id,
      field: request.field,
      label: isPersonalInfoField(request.field) ? personalInfoFieldLabels[request.field] : request.field,
      previousValue: isPersonalInfoField(request.field)
        ? maskPersonalInfo(request.field, decryptPersonalInfo(request.previousValueEncrypted))
        : "-",
      requestedValue: isPersonalInfoField(request.field)
        ? maskPersonalInfo(request.field, decryptPersonalInfo(request.requestedValueEncrypted))
        : "-",
      status: request.status,
      peopleOnStatus: request.peopleOnStatus,
      publicMemo: request.publicMemo,
      createdAt: request.createdAt.toISOString(),
      resolvedAt: request.resolvedAt?.toISOString() || null,
      events: request.events.map((event) => ({
        id: event.id,
        eventType: event.eventType,
        message: event.message,
        createdAt: event.createdAt.toISOString(),
      })),
    })),
  });
}

export async function POST(request: Request) {
  const userId = await currentUserId();
  if (!userId) return NextResponse.json({ error: "인증되지 않은 사용자입니다." }, { status: 401 });

  try {
    const body = (await request.json()) as { field?: unknown; value?: unknown; memo?: unknown };
    if (!isPersonalInfoField(body.field)) {
      return NextResponse.json({ error: "수정할 개인정보 항목이 올바르지 않습니다." }, { status: 400 });
    }
    const value = normalizePersonalInfoValue(body.field, body.value);
    const memo = typeof body.memo === "string"
      ? body.memo.replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, 500)
      : "";
    const source = await loadProfileSource(userId);
    if (!source) return NextResponse.json({ error: "사용자 정보를 찾을 수 없습니다." }, { status: 404 });

    const currentValue = getCurrentPersonalInfoValue(body.field, source);
    if (currentValue === value) {
      return NextResponse.json({ error: "현재 정보와 변경할 정보가 같습니다." }, { status: 400 });
    }
    const duplicate = await prisma.personalInfoChangeRequest.findFirst({
      where: { userId, field: body.field, status: "PENDING" },
      select: { id: true },
    });
    if (duplicate) {
      return NextResponse.json({ error: "같은 항목의 처리 중인 요청이 이미 있습니다." }, { status: 409 });
    }

    const created = await prisma.personalInfoChangeRequest.create({
      data: {
        userId,
        field: body.field,
        previousValueEncrypted: currentValue ? encryptPersonalInfo(currentValue) : null,
        requestedValueEncrypted: encryptPersonalInfo(value),
        publicMemo: memo || null,
        peopleOnStatus: requiresPeopleOnReflection(body.field) ? "PENDING" : "NOT_REQUIRED",
        events: {
          create: { actorId: userId, eventType: "REQUESTED", message: "개인정보 수정 요청이 접수되었습니다." },
        },
      },
      select: { id: true },
    });
    return NextResponse.json({ success: true, id: created.id }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "수정 요청을 접수하지 못했습니다.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
