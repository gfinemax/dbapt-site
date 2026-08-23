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
import { fetchPeopleOnMemberProfile, type PeopleOnMemberProfile } from "@/lib/peopleon/member-profile";

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
      createdAt: true,
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

  const source = await loadProfileSource(userId);
  if (!source) return NextResponse.json({ error: "사용자 정보를 찾을 수 없습니다." }, { status: 404 });

  const externalMemberId = source.profile?.peopleOnMemberId || source.user.contributionProfile?.externalMemberId || "";
  const [requests, peopleOnResult] = await Promise.all([
    prisma.personalInfoChangeRequest.findMany({
      where: { userId },
      include: { events: { orderBy: { createdAt: "asc" } } },
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
    fetchPeopleOnMemberProfile({ externalMemberId }).catch(() => ({
      member: null as PeopleOnMemberProfile | null,
      generatedAt: null,
      status: "UNAVAILABLE" as const,
    })),
  ]);

  const peopleOn = peopleOnResult.member;
  const peopleOnOverrides: Partial<Record<(typeof PERSONAL_INFO_FIELDS)[number], string>> = {};
  if (peopleOn) {
    if (peopleOn.name) peopleOnOverrides.name = peopleOn.name;
    if (peopleOn.phone) peopleOnOverrides.phone = peopleOn.phone;
    if (peopleOn.address) peopleOnOverrides.address = peopleOn.address;
    if (peopleOn.birth_date) peopleOnOverrides.birthDate = peopleOn.birth_date;
    const coOwners = peopleOn.related_names.filter((item) => /공동(?:명의|소유)?/.test(item.relation));
    if (coOwners.length) {
      peopleOnOverrides.coOwner = coOwners.map((item) => `${item.name} ${item.relation}`).join(", ");
    }
    if (peopleOn.refund_account) {
      peopleOnOverrides.refundAccount = `${peopleOn.refund_account.bank_name} ${peopleOn.refund_account.account_number}`;
    }
    if (peopleOn.unit_group) {
      peopleOnOverrides.selectedUnit = /^\d+(?:\.\d+)?$/.test(peopleOn.unit_group)
        ? `${peopleOn.unit_group}㎡`
        : peopleOn.unit_group;
    }
    if (peopleOn.display_status || peopleOn.status) {
      peopleOnOverrides.memberStatus = peopleOn.display_status || peopleOn.status || "";
    }
  }

  const fields = PERSONAL_INFO_FIELDS
    .filter((field) => !(source.user.role === "REFUND" && field === "selectedUnit"))
    .map((field) => {
      const value = peopleOnOverrides[field] ?? getCurrentPersonalInfoValue(field, source);
      return { field, label: personalInfoFieldLabels[field], value: maskPersonalInfo(field, value) };
    });

  return NextResponse.json({
    profile: {
      fields,
      accountCreatedAt: source.user.createdAt.toISOString(),
      memberStatus: source.user.role,
      lastConfirmedAt: source.profile?.lastConfirmedAt?.toISOString() || null,
      updatedAt: source.profile?.updatedAt?.toISOString() || null,
      peopleOnSyncedAt: peopleOnResult.generatedAt || source.profile?.peopleOnSyncedAt?.toISOString() || null,
      hasPeopleOnBinding: Boolean(externalMemberId),
      peopleOn: {
        status: peopleOnResult.status,
        memberNumber: peopleOn?.member_id || null,
        joinedAt: peopleOn?.joined_at || null,
        certificateStatus: peopleOn?.certificate_display ? "발급 완료" : "발급 상태 확인 대기",
        certificateNumberSuffix: peopleOn?.certificate_numbers?.[0]?.replace(/\D/g, "").slice(-4) || null,
      },
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
