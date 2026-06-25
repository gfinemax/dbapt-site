"use server";

import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { prisma } from "./db";
import {
  normalizeLoginIdentifier,
  normalizePhoneLoginId,
  validateSignupPassword,
} from "./signup-password";
import { normalizeMemberType, type MemberType } from "./member-type";
import { getUserDisplayName } from "./user-display-name";
import { SESSION_MAX_AGE_MS, SESSION_MAX_AGE_SECONDS } from "./session-config";

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || "default-secret-key-at-least-32-characters-long-dbapt"
);

const PHONE_PASSWORD_SIGNUP_SUCCESS_MESSAGE = "가입 신청이 접수되었습니다. 사무국 확인 후 승인됩니다.";

type SessionUser = {
  id: string;
  loginId: string | null;
  name: string | null;
  signupName?: string | null;
  role: string;
  email?: string | null;
  image?: string | null;
};

function stringField(formData: FormData, field: string) {
  const value = formData.get(field);
  return typeof value === "string" ? value.replace(/[\u0000-\u001f\u007f]/g, "").trim() : "";
}

export async function encrypt(payload: Record<string, unknown>) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(SECRET_KEY);
}

export async function decrypt(token: string) {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY, {
      algorithms: ["HS256"],
    });
    return payload;
  } catch {
    return null;
  }
}

export async function createSessionToken(user: SessionUser) {
  const displayName = getUserDisplayName(user, user.name || "조합원");

  return encrypt({
    id: user.id,
    loginId: user.loginId,
    name: displayName,
    role: user.role,
    email: user.email || undefined,
    image: user.image || undefined,
  });
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  if (!token) return null;
  return await decrypt(token);
}

export async function loginAction(prevState: unknown, formData: FormData) {
  const loginId = normalizeLoginIdentifier(stringField(formData, "loginId"));
  const password = stringField(formData, "password");

  if (!loginId || !password) {
    return { error: "아이디와 비밀번호를 입력해주세요." };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { loginId },
    });

    if (!user || !user.isActive || !user.passwordHash) {
      return { error: "아이디 또는 비밀번호가 올바르지 않습니다." };
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return { error: "아이디 또는 비밀번호가 올바르지 않습니다." };
    }

    // Create session
    const expires = new Date(Date.now() + SESSION_MAX_AGE_MS);
    const session = await createSessionToken(user);

    const cookieStore = await cookies();
    cookieStore.set("session", session, {
      expires,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    return { success: true, role: user.role };

  } catch (e) {
    console.error("Login action error:", e);
    return { error: "로그인 처리 중 문제가 발생했습니다." };
  }
}

export async function signupWithPhonePasswordAction(prevState: unknown, formData: FormData) {
  const signupName = stringField(formData, "signupName").slice(0, 80);
  const signupPhoneInput = stringField(formData, "signupPhone");
  const signupMemo = stringField(formData, "signupMemo").slice(0, 300);
  const password = stringField(formData, "signupPassword");
  const passwordConfirm = stringField(formData, "signupPasswordConfirm");
  const phoneLoginId = normalizePhoneLoginId(signupPhoneInput);

  if (!signupName) {
    return { error: "신청자 이름을 입력해주세요." };
  }

  if (!phoneLoginId) {
    return { error: "휴대폰 번호는 010으로 시작하는 11자리 번호로 입력해주세요." };
  }

  if (!password || !passwordConfirm) {
    return { error: "비밀번호와 비밀번호 확인을 입력해주세요." };
  }

  if (password !== passwordConfirm) {
    return { error: "비밀번호 확인이 일치하지 않습니다." };
  }

  const passwordValidation = validateSignupPassword(password, phoneLoginId);
  if (!passwordValidation.valid) {
    return { error: passwordValidation.error };
  }

  try {
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { loginId: phoneLoginId },
          { phone: phoneLoginId },
          { signupPhone: phoneLoginId },
        ],
      },
      select: { id: true },
    });

    if (existingUser) {
      return { error: "이미 가입 신청 또는 계정 발급이 진행된 휴대폰 번호입니다." };
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await prisma.user.create({
      data: {
        loginId: phoneLoginId,
        passwordHash,
        name: signupName,
        signupName,
        signupPhone: phoneLoginId,
        phone: phoneLoginId,
        signupMemo: signupMemo || null,
        role: "PENDING",
        isActive: true,
      },
    });

    return { success: true, message: PHONE_PASSWORD_SIGNUP_SUCCESS_MESSAGE };
  } catch (e) {
    console.error("Phone password signup action error:", e);
    return { error: "가입 신청 처리 중 문제가 발생했습니다." };
  }
}

export async function changePasswordAction(prevState: unknown, formData: FormData) {
  void prevState;

  const currentPassword = stringField(formData, "currentPassword");
  const newPassword = stringField(formData, "newPassword");
  const newPasswordConfirm = stringField(formData, "newPasswordConfirm");

  if (!currentPassword || !newPassword || !newPasswordConfirm) {
    return { error: "현재 비밀번호와 새 비밀번호를 모두 입력해주세요." };
  }

  if (newPassword !== newPasswordConfirm) {
    return { error: "새 비밀번호 확인이 일치하지 않습니다." };
  }

  try {
    const session = await getSession() as { id?: string } | null;
    if (!session?.id) {
      return { error: "로그인 후 비밀번호를 변경할 수 있습니다." };
    }

    const user = await prisma.user.findUnique({
      where: { id: session.id },
      select: {
        id: true,
        loginId: true,
        phone: true,
        passwordHash: true,
        isActive: true,
      },
    });

    if (!user || !user.isActive) {
      return { error: "비밀번호를 변경할 수 있는 계정을 찾을 수 없습니다." };
    }

    if (!user.passwordHash) {
      return { error: "사이트 비밀번호가 없는 계정입니다. Google 계정에서 비밀번호를 관리해 주세요." };
    }

    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isCurrentPasswordValid) {
      return { error: "현재 비밀번호가 올바르지 않습니다." };
    }

    const passwordValidation = validateSignupPassword(newPassword, user.loginId || user.phone || "");
    if (!passwordValidation.valid) {
      return { error: passwordValidation.error };
    }

    if (await bcrypt.compare(newPassword, user.passwordHash)) {
      return { error: "새 비밀번호는 현재 비밀번호와 다르게 입력해주세요." };
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    return { success: true, message: "비밀번호가 변경되었습니다." };
  } catch (e) {
    console.error("Change password action error:", e);
    return { error: "비밀번호 변경 중 문제가 발생했습니다." };
  }
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.set("session", "", {
    expires: new Date(0),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
}

export async function approveUserAction(
  userId: string,
  targetRole: "MEMBER" | "REFUND" | "ASSOCIATE",
  targetMemberType?: MemberType,
) {
  try {
    // 임시 조합원/환불 번호 자동 매핑
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const loginId =
      targetRole === "MEMBER"
        ? `g_member_${randomSuffix}`
        : targetRole === "REFUND"
          ? `g_refund_${randomSuffix}`
          : `g_associate_${randomSuffix}`;
    const memberType =
      targetRole === "REFUND"
        ? "REFUND"
        : targetRole === "ASSOCIATE"
          ? "ASSOCIATE"
          : normalizeMemberType(targetMemberType, targetRole);
    const pendingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { loginId: true },
    });

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        role: targetRole,
        memberType,
        ...(pendingUser?.loginId ? {} : { loginId }),
      }
    });

    return { success: true, role: updated.role };
  } catch (e) {
    console.error("Approve user action error:", e);
    return { error: "조합원 승인 처리 중 문제가 발생했습니다." };
  }
}

export async function updateSignupNameAction(userId: string, signupName: string) {
  const normalizedName = signupName.replace(/[\u0000-\u001f\u007f]/g, "").trim().slice(0, 80);

  if (!normalizedName) {
    return { error: "표시 명의를 입력해주세요." };
  }

  try {
    const session = await getSession() as { id?: string; role?: string } | null;
    if (!session?.id || session.role !== "ADMIN") {
      return { error: "관리자만 표시 명의를 수정할 수 있습니다." };
    }

    const updated = await prisma.user.updateMany({
      where: {
        id: userId,
        role: { in: ["PENDING", "MEMBER", "REFUND", "ASSOCIATE"] },
      },
      data: {
        signupName: normalizedName,
      },
    });

    if (updated.count === 0) {
      return { error: "표시 명의를 수정할 사용자를 찾을 수 없습니다." };
    }

    return { success: true, signupName: normalizedName };
  } catch (e) {
    console.error("Update signup name action error:", e);
    return { error: "표시 명의 수정 중 문제가 발생했습니다." };
  }
}
