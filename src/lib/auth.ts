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

    if (!user) {
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
