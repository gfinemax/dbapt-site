// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const prismaMock = vi.hoisted(() => ({
  user: {
    upsert: vi.fn(),
  },
  account: {
    upsert: vi.fn(),
  },
}));

const createSessionTokenMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/db", () => ({
  prisma: prismaMock,
}));

vi.mock("@/lib/auth", () => ({
  createSessionToken: createSessionTokenMock,
}));

beforeEach(() => {
  delete process.env.GOOGLE_CLIENT_ID;
  delete process.env.GOOGLE_CLIENT_SECRET;
  delete process.env.GOOGLE_REDIRECT_URI;
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.resetModules();
  delete process.env.GOOGLE_CLIENT_ID;
  delete process.env.GOOGLE_CLIENT_SECRET;
  delete process.env.GOOGLE_REDIRECT_URI;
});

describe("google oauth routes", () => {
  it("redirects to configuration error when Google credentials are missing", async () => {
    const { GET } = await import("@/app/api/auth/google/route");

    const response = await GET(new Request("http://localhost:3000/api/auth/google"));

    expect(response.headers.get("location")).toBe(
      "http://localhost:3000/login?error=google_not_configured",
    );
  });

  it("stores signup form input in a short-lived OAuth cookie", async () => {
    process.env.GOOGLE_CLIENT_ID = "client-id";
    process.env.GOOGLE_CLIENT_SECRET = "client-secret";

    const { GET } = await import("@/app/api/auth/google/route");

    const response = await GET(
      new Request(
        "http://localhost:3000/api/auth/google?signupName=%ED%99%8D%EA%B8%B8%EB%8F%99&signupPhone=010-1234-5678&signupMemo=101%EB%8F%99",
      ),
    );

    expect(response.headers.get("location")).toContain("https://accounts.google.com");
    expect(response.headers.get("set-cookie")).toContain("google_signup_application=");
  });

  it("persists the real Google name and Gmail from the callback profile", async () => {
    process.env.GOOGLE_CLIENT_ID = "client-id";
    process.env.GOOGLE_CLIENT_SECRET = "client-secret";

    const user = {
      id: "google-user-1",
      loginId: null,
      name: "홍길동",
      email: "hong.gildong@gmail.com",
      image: "https://lh3.googleusercontent.com/profile.png",
      role: "PENDING",
      isActive: true,
    };

    prismaMock.user.upsert.mockResolvedValue(user);
    prismaMock.account.upsert.mockResolvedValue({});
    createSessionTokenMock.mockResolvedValue("session-token");
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce(
          Response.json({
            access_token: "access-token",
            expires_in: 3600,
            token_type: "Bearer",
            scope: "openid email profile",
            id_token: "id-token",
          }),
        )
        .mockResolvedValueOnce(
          Response.json({
            sub: "google-sub-1",
            email: "hong.gildong@gmail.com",
            email_verified: true,
            name: "홍길동",
            picture: "https://lh3.googleusercontent.com/profile.png",
          }),
        ),
    );

    const { GET } = await import("@/app/api/auth/google/callback/route");
    const signupCookie = encodeURIComponent(
      JSON.stringify({
        signupName: "가입신청 홍길동",
        signupPhone: "010-1234-5678",
        signupMemo: "101동 확인 요청",
      }),
    );
    const request = new NextRequest(
      "http://localhost:3000/api/auth/google/callback?code=code-1&state=state-1",
      {
        headers: {
          cookie: `google_oauth_state=state-1; google_signup_application=${signupCookie}`,
        },
      },
    );

    const response = await GET(request);

    expect(prismaMock.user.upsert).toHaveBeenCalledWith({
      where: { email: "hong.gildong@gmail.com" },
      create: expect.objectContaining({
        email: "hong.gildong@gmail.com",
        name: "홍길동",
        image: "https://lh3.googleusercontent.com/profile.png",
        signupName: "가입신청 홍길동",
        signupPhone: "010-1234-5678",
        signupMemo: "101동 확인 요청",
        role: "PENDING",
      }),
      update: expect.objectContaining({
        name: "홍길동",
        image: "https://lh3.googleusercontent.com/profile.png",
        signupName: "가입신청 홍길동",
        signupPhone: "010-1234-5678",
        signupMemo: "101동 확인 요청",
      }),
    });
    expect(createSessionTokenMock).toHaveBeenCalledWith(user);
    expect(response.headers.get("location")).toBe("http://localhost:3000/portal/pending");
    expect(response.headers.get("set-cookie")).toContain("session=session-token");
  });
});
