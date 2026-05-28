import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || "default-secret-key-at-least-32-characters-long-dbapt",
);

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = request.cookies.get("session")?.value;

  let decoded: { id: string; loginId: string; name: string; role: string } | null = null;
  if (session) {
    try {
      const { payload } = await jwtVerify(session, SECRET_KEY, {
        algorithms: ["HS256"],
      });
      decoded = payload as { id: string; loginId: string; name: string; role: string };
    } catch {
      // Token is invalid/expired.
    }
  }

  if (pathname.startsWith("/portal")) {
    if (!decoded) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const { role } = decoded;

    if (pathname.startsWith("/portal/member") && role !== "MEMBER" && role !== "ADMIN") {
      if (role === "REFUND") {
        return NextResponse.redirect(new URL("/portal/refund", request.url));
      }
      return NextResponse.redirect(new URL("/login", request.url));
    }

    if (pathname.startsWith("/portal/refund") && role !== "REFUND" && role !== "ADMIN") {
      if (role === "MEMBER") {
        return NextResponse.redirect(new URL("/portal/member", request.url));
      }
      return NextResponse.redirect(new URL("/login", request.url));
    }

    if (pathname.startsWith("/portal/admin") && role !== "ADMIN") {
      if (role === "MEMBER") {
        return NextResponse.redirect(new URL("/portal/member", request.url));
      } else if (role === "REFUND") {
        return NextResponse.redirect(new URL("/portal/refund", request.url));
      }
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  if (pathname === "/login" && decoded) {
    const { role } = decoded;
    if (role === "MEMBER") {
      return NextResponse.redirect(new URL("/portal/member", request.url));
    } else if (role === "REFUND") {
      return NextResponse.redirect(new URL("/portal/refund", request.url));
    } else if (role === "ADMIN") {
      return NextResponse.redirect(new URL("/portal/admin", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/portal/:path*", "/login"],
};
