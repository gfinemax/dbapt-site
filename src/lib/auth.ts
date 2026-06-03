"use server";

import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { prisma } from "./db";

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || "default-secret-key-at-least-32-characters-long-dbapt"
);

const SESSION_MAX_AGE_MS = 2 * 60 * 60 * 1000;

type SessionUser = {
  id: string;
  loginId: string | null;
  name: string | null;
  role: string;
  email?: string | null;
  image?: string | null;
};

export async function encrypt(payload: Record<string, unknown>) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("2h")
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
  return encrypt({
    id: user.id,
    loginId: user.loginId,
    name: user.name,
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
  const loginId = formData.get("loginId") as string;
  const password = formData.get("password") as string;

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

export async function approveUserAction(userId: string, targetRole: "MEMBER" | "REFUND") {
  try {
    // 임시 조합원/환불 번호 자동 매핑
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const loginId = targetRole === "MEMBER" ? `g_member_${randomSuffix}` : `g_refund_${randomSuffix}`;

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        role: targetRole,
        loginId: loginId,
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
    return { error: "신청 이름을 입력해주세요." };
  }

  try {
    const session = await getSession() as { id?: string; role?: string } | null;
    if (!session?.id || session.role !== "ADMIN") {
      return { error: "관리자만 신청 이름을 수정할 수 있습니다." };
    }

    const updated = await prisma.user.updateMany({
      where: {
        id: userId,
        role: "PENDING",
      },
      data: {
        signupName: normalizedName,
      },
    });

    if (updated.count === 0) {
      return { error: "승인 대기 사용자를 찾을 수 없습니다." };
    }

    return { success: true, signupName: normalizedName };
  } catch (e) {
    console.error("Update signup name action error:", e);
    return { error: "신청 이름 수정 중 문제가 발생했습니다." };
  }
}
