import { execFileSync } from "node:child_process";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  DEVELOPMENT_LOG_CATEGORIES,
  buildDevelopmentLogDraft,
} from "@/lib/news/development-log";

export async function POST(request: Request) {
  const session = (await getSession()) as { id: string; role: string } | null;

  if (!session) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  if (session.role !== "ADMIN") {
    return NextResponse.json({ error: "관리자 권한이 필요합니다." }, { status: 403 });
  }

  try {
    const body = await readJsonBody(request);
    const date = typeof body.date === "string" ? new Date(body.date) : new Date();
    const changes = Array.isArray(body.changes)
      ? body.changes.filter((item): item is string => typeof item === "string")
      : readRecentGitSubjects();
    const draft = buildDevelopmentLogDraft({
      date,
      type: parseDevelopmentLogType(body.type),
      title: typeof body.title === "string" && body.title.trim() ? body.title.trim() : undefined,
      changes,
    });

    const news = await prisma.coopNews.create({
      data: {
        title: draft.title,
        content: draft.content,
        category: DEVELOPMENT_LOG_CATEGORIES.draft,
        isStarred: false,
        imagePath: null,
        attachmentPath: null,
        attachmentName: null,
        attachmentSize: null,
        displayAuthorName: "운영자",
        authorId: session.id,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            loginId: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, news });
  } catch (error) {
    console.error("POST development log draft error:", error);
    return NextResponse.json({ error: "개발일지 초안 생성에 실패했습니다." }, { status: 500 });
  }
}

function readRecentGitSubjects() {
  try {
    return execFileSync("git", ["log", "--since=14.days", "--pretty=format:%s"], {
      encoding: "utf8",
      timeout: 3000,
    })
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .slice(0, 12);
  } catch {
    return [];
  }
}

async function readJsonBody(request: Request) {
  try {
    return (await request.json()) as Record<string, unknown>;
  } catch {
    return {};
  }
}

function parseDevelopmentLogType(value: unknown) {
  if (
    value === "주간 개발일지" ||
    value === "기능 반영" ||
    value === "오류 수정" ||
    value === "요청 반영"
  ) {
    return value;
  }

  return "주간 개발일지";
}
