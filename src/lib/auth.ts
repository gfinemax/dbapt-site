"use server";

import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { prisma } from "./db";

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || "default-secret-key-at-least-32-characters-long-dbapt"
);

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
    const expires = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours
    const session = await encrypt({
      id: user.id,
      loginId: user.loginId,
      name: user.name,
      role: user.role,
    });

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

export async function googleMockLoginAction() {
  try {
    // 1. 가상의 구글 사용자 이메일 및 프로필
    const mockGoogleEmail = "google_member_preview@gmail.com";
    const mockGoogleName = "구글조합원 (가상)";

    // 2. DB에서 이메일 기준 유저 조회 또는 생성
    let user = await prisma.user.findUnique({
      where: { email: mockGoogleEmail },
    });

    if (!user) {
      // 구글 로그인으로 처음 가입하는 유저는 기본 권한이 PENDING(대기) 상태
      user = await prisma.user.create({
        data: {
          email: mockGoogleEmail,
          name: mockGoogleName,
          role: "PENDING", // 최초 가입 시 미승인 대기 상태
          isActive: true,
        },
      });
    }

    // 3. 세션 쿠키 생성 (jose SignJWT 활용)
    const expires = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours
    const session = await encrypt({
      id: user.id,
      loginId: user.loginId || null,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    const cookieStore = await cookies();
    cookieStore.set("session", session, {
      expires,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    // 4. 역할(role)에 따른 리다이렉트 분기 제공
    return { success: true, role: user.role };
  } catch (e) {
    console.error("Google mock login error:", e);
    return { error: "구글 소셜 로그인 처리 중 문제가 발생했습니다." };
  }
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


