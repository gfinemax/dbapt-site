import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const SIGNUP_APPLICATION_COOKIE = "google_signup_application";

type SignupApplication = {
  signupName?: string;
  signupPhone?: string;
  signupMemo?: string;
};

function getGoogleRedirectUri(request: Request) {
  return process.env.GOOGLE_REDIRECT_URI || new URL("/api/auth/google/callback", request.url).toString();
}

function normalizeSignupValue(value: string | null, maxLength: number) {
  return value?.replace(/[\u0000-\u001f\u007f]/g, "").trim().slice(0, maxLength) || "";
}

function getSignupApplication(request: Request): SignupApplication | null {
  const requestUrl = new URL(request.url);
  const signupName = normalizeSignupValue(requestUrl.searchParams.get("signupName"), 80);
  const signupPhone = normalizeSignupValue(requestUrl.searchParams.get("signupPhone"), 40);
  const signupMemo = normalizeSignupValue(requestUrl.searchParams.get("signupMemo"), 240);

  if (!signupName && !signupPhone && !signupMemo) return null;

  return {
    ...(signupName ? { signupName } : {}),
    ...(signupPhone ? { signupPhone } : {}),
    ...(signupMemo ? { signupMemo } : {}),
  };
}

export async function GET(request: Request) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const loginUrl = new URL("/login", request.url);
  const signupApplication = getSignupApplication(request);

  if (!clientId || !clientSecret) {
    loginUrl.searchParams.set("error", "google_not_configured");
    return NextResponse.redirect(loginUrl);
  }

  const state = randomBytes(24).toString("hex");
  const authUrl = new URL(GOOGLE_AUTH_URL);
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("redirect_uri", getGoogleRedirectUri(request));
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("scope", "openid email profile");
  authUrl.searchParams.set("state", state);
  authUrl.searchParams.set("prompt", "select_account");

  const response = NextResponse.redirect(authUrl);
  response.cookies.set("google_oauth_state", state, {
    httpOnly: true,
    maxAge: 10 * 60,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  if (signupApplication) {
    response.cookies.set(SIGNUP_APPLICATION_COOKIE, encodeURIComponent(JSON.stringify(signupApplication)), {
      httpOnly: true,
      maxAge: 10 * 60,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
  }

  return response;
}
