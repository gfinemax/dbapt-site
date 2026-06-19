import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createSessionToken } from "@/lib/auth";
import { SESSION_MAX_AGE_MS } from "@/lib/session-config";

const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo";
const SIGNUP_APPLICATION_COOKIE = "google_signup_application";

type GoogleTokenResponse = {
  access_token?: string;
  expires_in?: number;
  token_type?: string;
  scope?: string;
  id_token?: string;
  error?: string;
};

type GoogleProfile = {
  sub?: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
};

type SignupApplication = {
  signupName?: string;
  signupPhone?: string;
  signupMemo?: string;
};

function getGoogleRedirectUri(request: Request) {
  return process.env.GOOGLE_REDIRECT_URI || new URL("/api/auth/google/callback", request.url).toString();
}

function redirectToLogin(request: Request, error: string) {
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("error", error);
  return NextResponse.redirect(loginUrl);
}

function readSignupApplication(request: NextRequest): SignupApplication | null {
  const cookieValue = request.cookies.get(SIGNUP_APPLICATION_COOKIE)?.value;
  if (!cookieValue) return null;

  try {
    const parsed = JSON.parse(decodeURIComponent(cookieValue)) as SignupApplication;
    return {
      ...(parsed.signupName ? { signupName: parsed.signupName } : {}),
      ...(parsed.signupPhone ? { signupPhone: parsed.signupPhone } : {}),
      ...(parsed.signupMemo ? { signupMemo: parsed.signupMemo } : {}),
    };
  } catch {
    return null;
  }
}

async function fetchGoogleToken(request: Request, code: string): Promise<GoogleTokenResponse> {
  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID || "",
      client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
      code,
      grant_type: "authorization_code",
      redirect_uri: getGoogleRedirectUri(request),
    }),
  });

  return response.json() as Promise<GoogleTokenResponse>;
}

async function fetchGoogleProfile(accessToken: string): Promise<GoogleProfile> {
  const response = await fetch(GOOGLE_USERINFO_URL, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return response.json() as Promise<GoogleProfile>;
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const expectedState = request.cookies.get("google_oauth_state")?.value;
  const signupApplication = readSignupApplication(request);
  const signupFields = signupApplication
    ? {
        signupName: signupApplication.signupName || null,
        signupPhone: signupApplication.signupPhone || null,
        signupMemo: signupApplication.signupMemo || null,
      }
    : {};

  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return redirectToLogin(request, "google_not_configured");
  }

  if (!code || !state || !expectedState || state !== expectedState) {
    return redirectToLogin(request, "google_state_invalid");
  }

  try {
    const token = await fetchGoogleToken(request, code);
    if (!token.access_token || token.error) {
      return redirectToLogin(request, "google_token_failed");
    }

    const profile = await fetchGoogleProfile(token.access_token);
    if (!profile.sub || !profile.email || !profile.email_verified) {
      return redirectToLogin(request, "google_profile_invalid");
    }

    const email = profile.email;
    const name = profile.name || email;

    const user = await prisma.user.upsert({
      where: { email },
      create: {
        email,
        emailVerified: new Date(),
        name,
        image: profile.picture || null,
        ...signupFields,
        role: "PENDING",
        isActive: true,
      },
      update: {
        emailVerified: new Date(),
        name,
        image: profile.picture || null,
        ...signupFields,
      },
    });

    if (!user.isActive) {
      return redirectToLogin(request, "account_inactive");
    }

    await prisma.account.upsert({
      where: {
        provider_providerAccountId: {
          provider: "google",
          providerAccountId: profile.sub,
        },
      },
      create: {
        userId: user.id,
        type: "oauth",
        provider: "google",
        providerAccountId: profile.sub,
        access_token: token.access_token,
        expires_at: token.expires_in ? Math.floor(Date.now() / 1000) + token.expires_in : null,
        token_type: token.token_type || null,
        scope: token.scope || null,
        id_token: token.id_token || null,
      },
      update: {
        userId: user.id,
        access_token: token.access_token,
        expires_at: token.expires_in ? Math.floor(Date.now() / 1000) + token.expires_in : null,
        token_type: token.token_type || null,
        scope: token.scope || null,
        id_token: token.id_token || null,
      },
    });

    const session = await createSessionToken(user);
    const redirectUrl = new URL(user.role === "PENDING" ? "/portal/pending" : "/", request.url);
    const response = NextResponse.redirect(redirectUrl);

    response.cookies.set("google_oauth_state", "", {
      expires: new Date(0),
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
    response.cookies.set(SIGNUP_APPLICATION_COOKIE, "", {
      expires: new Date(0),
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
    response.cookies.set("session", session, {
      expires: new Date(Date.now() + SESSION_MAX_AGE_MS),
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    return response;
  } catch (error) {
    console.error("Google OAuth callback error:", error);
    return redirectToLogin(request, "google_callback_failed");
  }
}
