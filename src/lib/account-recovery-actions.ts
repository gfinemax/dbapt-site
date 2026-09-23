"use server";

import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { validateSignupPassword } from "@/lib/signup-password";
import {
  ACCOUNT_RECOVERY_GENERIC_MESSAGE,
  buildIdLookupSms,
  buildPasswordResetSms,
  buildSmsHref,
  createAccountRecoveryToken,
  getAccountRecoveryTokenExpiry,
  getPhoneLast4,
  hashAccountRecoveryToken,
  isAccountRecoveryTokenUsable,
  normalizeRecoveryName,
  normalizeRecoveryPhone,
  type AccountRecoveryDeliveryMethod,
  type AccountRecoveryType,
} from "@/lib/account-recovery";

const ACTIVE_RECOVERY_STATUSES = ["PENDING", "LINK_CREATED", "SENT"];

function textField(formData: FormData, field: string) {
  const value = formData.get(field);
  return typeof value === "string" ? value : "";
}

function isRecoveryType(value: string): value is AccountRecoveryType {
  return value === "ID_LOOKUP" || value === "PASSWORD_RESET";
}

function isDeliveryMethod(value: string): value is AccountRecoveryDeliveryMethod {
  return value === "OFFICE_MOBILE" || value === "PERSONAL_MOBILE";
}

async function requireAdmin() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN" || typeof session.id !== "string") {
    throw new Error("관리자 권한이 필요합니다.");
  }
  return { id: session.id };
}

export async function requestAccountRecoveryAction(_previousState: unknown, formData: FormData) {
  const requestTypeValue = textField(formData, "requestType");
  const name = normalizeRecoveryName(textField(formData, "name"));
  const phone = normalizeRecoveryPhone(textField(formData, "phone"));

  if (!isRecoveryType(requestTypeValue)) return { error: "도움이 필요한 항목을 선택해 주세요." };
  if (name.length < 2) return { error: "조합원 명부에 등록한 이름을 입력해 주세요." };
  if (!phone) return { error: "등록된 휴대전화 번호를 정확히 입력해 주세요." };

  const users = await prisma.user.findMany({
    where: {
      isActive: true,
      AND: [
        { OR: [{ name }, { signupName: name }] },
        { OR: [{ phone }, { signupPhone: phone }, { loginId: phone }] },
      ],
    },
    select: { id: true },
    take: 2,
  });

  if (users.length === 1) {
    const userId = users[0].id;
    const recent = await prisma.accountRecoveryRequest.findFirst({
      where: {
        userId,
        requestType: requestTypeValue,
        status: { in: ACTIVE_RECOVERY_STATUSES },
      },
      select: { id: true, status: true, tokenExpiresAt: true },
    });

    let shouldCreate = !recent;
    if (
      recent &&
      requestTypeValue === "PASSWORD_RESET" &&
      ["LINK_CREATED", "SENT"].includes(recent.status) &&
      recent.tokenExpiresAt &&
      recent.tokenExpiresAt.getTime() <= Date.now()
    ) {
      const expired = await prisma.accountRecoveryRequest.updateMany({
        where: {
          id: recent.id,
          status: { in: ["LINK_CREATED", "SENT"] },
          tokenExpiresAt: { lte: new Date() },
        },
        data: { status: "EXPIRED", tokenHash: null },
      });
      shouldCreate = expired.count === 1;
    }

    if (shouldCreate) {
      await prisma.accountRecoveryRequest.create({
        data: {
          userId,
          requestType: requestTypeValue,
          requestPhoneLast4: getPhoneLast4(phone),
        },
      });
    }
  }

  return { success: true, message: ACCOUNT_RECOVERY_GENERIC_MESSAGE };
}

export async function prepareAccountRecoveryMessageAction(requestId: string, deliveryMethodValue: string) {
  const admin = await requireAdmin();
  if (!isDeliveryMethod(deliveryMethodValue)) return { error: "문자를 보낼 휴대전화를 선택해 주세요." };

  const request = await prisma.accountRecoveryRequest.findUnique({
    where: { id: requestId },
    include: {
      user: {
        select: {
          id: true,
          loginId: true,
          name: true,
          signupName: true,
          phone: true,
          signupPhone: true,
          passwordHash: true,
          isActive: true,
        },
      },
    },
  });

  if (!request || !request.user.isActive || request.status === "COMPLETED" || request.status === "CANCELLED") {
    return { error: "처리할 수 있는 요청을 찾지 못했습니다." };
  }

  const phone = normalizeRecoveryPhone(request.user.phone || request.user.signupPhone || request.user.loginId || "");
  if (!phone || phone.slice(-4) !== request.requestPhoneLast4) {
    return { error: "요청 당시 등록된 휴대전화 번호를 확인할 수 없습니다." };
  }

  const name = request.user.name || request.user.signupName || "조합원";
  const commonUpdate = {
    deliveryMethod: deliveryMethodValue,
    handledById: admin.id,
    handledAt: new Date(),
    messagePreparedAt: new Date(),
  };

  if (request.requestType === "ID_LOOKUP") {
    const loginGuide = request.user.loginId || "Google 계정으로 로그인해 주세요";
    const message = buildIdLookupSms({ name, loginId: loginGuide });
    await prisma.accountRecoveryRequest.update({ where: { id: request.id }, data: commonUpdate });
    revalidatePath("/portal/admin/account-recovery");
    return { success: true, phone, message, smsHref: buildSmsHref(phone, message) };
  }

  if (!request.user.passwordHash) {
    const message = `[대방동지역주택조합]\n${name}님은 Google 로그인 계정입니다. 사이트 로그인 화면에서 Google 계정으로 계속하기를 이용해 주세요.\n\n도움이 필요하시면 사무국으로 문의해 주세요.`;
    await prisma.accountRecoveryRequest.update({ where: { id: request.id }, data: commonUpdate });
    revalidatePath("/portal/admin/account-recovery");
    return { success: true, phone, message, smsHref: buildSmsHref(phone, message), passwordless: true };
  }

  const token = createAccountRecoveryToken();
  const tokenHash = hashAccountRecoveryToken(token);
  const tokenExpiresAt = getAccountRecoveryTokenExpiry();
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
  const resetUrl = `${siteUrl}/reset-password/${token}`;
  const message = buildPasswordResetSms({ name, resetUrl });

  await prisma.$transaction([
    prisma.accountRecoveryRequest.updateMany({
      where: {
        userId: request.userId,
        requestType: "PASSWORD_RESET",
        id: { not: request.id },
        status: { in: ["LINK_CREATED", "SENT"] },
      },
      data: { status: "CANCELLED", cancelledAt: new Date(), tokenHash: null, tokenExpiresAt: null },
    }),
    prisma.accountRecoveryRequest.update({
      where: { id: request.id },
      data: {
        ...commonUpdate,
        status: "LINK_CREATED",
        tokenHash,
        tokenExpiresAt,
        tokenUsedAt: null,
        cancelledAt: null,
      },
    }),
  ]);

  revalidatePath("/portal/admin/account-recovery");
  return { success: true, phone, message, smsHref: buildSmsHref(phone, message), expiresAt: tokenExpiresAt.toISOString() };
}

export async function markAccountRecoverySentAction(requestId: string, deliveryMethodValue: string) {
  const admin = await requireAdmin();
  if (!isDeliveryMethod(deliveryMethodValue)) return { error: "발송 수단을 확인해 주세요." };
  const request = await prisma.accountRecoveryRequest.findUnique({
    where: { id: requestId },
    select: { id: true, requestType: true, status: true, tokenExpiresAt: true },
  });
  if (!request || !["PENDING", "LINK_CREATED"].includes(request.status)) return { error: "발송 완료로 처리할 수 없는 요청입니다." };
  const now = new Date();
  const completesImmediately = request.requestType === "ID_LOOKUP" || !request.tokenExpiresAt;
  await prisma.accountRecoveryRequest.update({
    where: { id: request.id },
    data: {
      deliveryMethod: deliveryMethodValue,
      handledById: admin.id,
      handledAt: now,
      deliveryMarkedAt: now,
      status: completesImmediately ? "COMPLETED" : "SENT",
      completedAt: completesImmediately ? now : null,
    },
  });
  revalidatePath("/portal/admin/account-recovery");
  return { success: true };
}

export async function cancelAccountRecoveryAction(requestId: string) {
  const admin = await requireAdmin();
  const result = await prisma.accountRecoveryRequest.updateMany({
    where: { id: requestId, status: { in: ACTIVE_RECOVERY_STATUSES } },
    data: {
      status: "CANCELLED",
      cancelledAt: new Date(),
      tokenHash: null,
      tokenExpiresAt: null,
      handledById: admin.id,
      handledAt: new Date(),
    },
  });
  revalidatePath("/portal/admin/account-recovery");
  return result.count === 1 ? { success: true } : { error: "취소할 수 있는 요청을 찾지 못했습니다." };
}

export async function getPasswordResetState(token: string) {
  if (!token || token.length > 256) return { valid: false as const, reason: "INVALID" as const };
  const request = await prisma.accountRecoveryRequest.findUnique({
    where: { tokenHash: hashAccountRecoveryToken(token) },
    select: { status: true, tokenExpiresAt: true, tokenUsedAt: true, user: { select: { name: true, signupName: true, isActive: true } } },
  });
  if (!request || !request.user.isActive) return { valid: false as const, reason: "INVALID" as const };
  if (!isAccountRecoveryTokenUsable(request)) {
    return { valid: false as const, reason: request.tokenExpiresAt && request.tokenExpiresAt.getTime() <= Date.now() ? "EXPIRED" as const : "USED" as const };
  }
  return { valid: true as const, name: request.user.name || request.user.signupName || "조합원" };
}

export async function resetPasswordWithTokenAction(_previousState: unknown, formData: FormData) {
  const token = textField(formData, "token");
  const newPassword = textField(formData, "newPassword");
  const newPasswordConfirm = textField(formData, "newPasswordConfirm");
  if (newPassword !== newPasswordConfirm) return { error: "새 비밀번호 확인이 일치하지 않습니다." };

  const tokenHash = hashAccountRecoveryToken(token);
  const request = await prisma.accountRecoveryRequest.findUnique({
    where: { tokenHash },
    select: {
      id: true,
      userId: true,
      status: true,
      tokenExpiresAt: true,
      tokenUsedAt: true,
      user: { select: { loginId: true, phone: true, isActive: true } },
    },
  });
  if (!request || !request.user.isActive || !isAccountRecoveryTokenUsable(request)) {
    return { error: "사용할 수 없거나 유효시간이 지난 링크입니다. 사무국에 새 링크를 요청해 주세요." };
  }

  const passwordValidation = validateSignupPassword(newPassword, request.user.loginId || request.user.phone || "");
  if (!passwordValidation.valid) return { error: passwordValidation.error };
  const passwordHash = await bcrypt.hash(newPassword, 10);
  const now = new Date();

  try {
    await prisma.$transaction(async (transaction) => {
      const consumed = await transaction.accountRecoveryRequest.updateMany({
        where: {
          id: request.id,
          tokenHash,
          tokenUsedAt: null,
          tokenExpiresAt: { gt: now },
          status: { in: ["LINK_CREATED", "SENT"] },
        },
        data: { status: "COMPLETED", tokenUsedAt: now, completedAt: now, tokenHash: null },
      });
      if (consumed.count !== 1) throw new Error("RESET_TOKEN_ALREADY_USED");
      await transaction.user.update({
        where: { id: request.userId },
        data: { passwordHash, authVersion: { increment: 1 } },
      });
      await transaction.accountRecoveryRequest.updateMany({
        where: {
          userId: request.userId,
          requestType: "PASSWORD_RESET",
          id: { not: request.id },
          status: { in: ACTIVE_RECOVERY_STATUSES },
        },
        data: { status: "CANCELLED", cancelledAt: now, tokenHash: null, tokenExpiresAt: null },
      });
    });
  } catch {
    return { error: "이미 사용되었거나 만료된 링크입니다. 사무국에 새 링크를 요청해 주세요." };
  }

  const cookieStore = await cookies();
  cookieStore.set("session", "", {
    expires: new Date(0),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
  return { success: true, message: "비밀번호가 안전하게 변경되었습니다. 새 비밀번호로 다시 로그인해 주세요." };
}
