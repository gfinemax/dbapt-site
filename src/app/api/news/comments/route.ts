import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { parseNewsDisplayAuthorName } from "@/lib/news-display-author";
import { isDevelopmentLogCategory } from "@/lib/news/development-log";
import { summarizeCommentReactions } from "@/lib/news/comment-reactions";

function isAdminSession(session: { role: string } | null) {
  return session?.role === "ADMIN";
}

function canMutateComment(session: { id: string; role: string }, comment: { authorId: string }) {
  return comment.authorId === session.id || session.role === "ADMIN";
}

function canCommentOnNewsCategory(category: string) {
  return category === "NOTICE" || isDevelopmentLogCategory(category);
}

export async function POST(request: Request) {
  const session = (await getSession()) as { id: string; role: string } | null;
  if (!session) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const newsId = typeof body.newsId === "string" ? body.newsId : "";
    const content = typeof body.content === "string" ? body.content.trim() : "";
    const parentCommentId = typeof body.parentCommentId === "string" ? body.parentCommentId : "";
    const parsedDisplayAuthorName = isAdminSession(session)
      ? parseNewsDisplayAuthorName(body.displayAuthorName)
      : { ok: true as const, value: null };

    if (!parsedDisplayAuthorName.ok) {
      return NextResponse.json({ error: parsedDisplayAuthorName.error }, { status: 400 });
    }

    if (!newsId) {
      return NextResponse.json({ error: "댓글을 등록할 공지사항이 누락되었습니다." }, { status: 400 });
    }

    if (!content) {
      return NextResponse.json({ error: "댓글 내용을 입력해 주세요." }, { status: 400 });
    }

    const notice = await prisma.coopNews.findUnique({
      where: { id: newsId },
      select: { id: true, category: true },
    });

    if (!notice || !canCommentOnNewsCategory(notice.category)) {
      return NextResponse.json({ error: "댓글을 등록할 공지사항을 찾을 수 없습니다." }, { status: 404 });
    }

    let parentId: string | undefined;
    if (parentCommentId) {
      const parentComment = await prisma.coopNewsComment.findUnique({
        where: { id: parentCommentId },
        select: { id: true, newsId: true, parentId: true },
      });

      if (!parentComment) {
        return NextResponse.json({ error: "답글 대상 댓글을 찾을 수 없습니다." }, { status: 404 });
      }

      if (parentComment.newsId !== newsId) {
        return NextResponse.json({ error: "답글 대상 댓글이 공지사항과 일치하지 않습니다." }, { status: 400 });
      }

      parentId = parentComment.parentId || parentComment.id;
    }

    const comment = await prisma.coopNewsComment.create({
      data: {
        newsId,
        content,
        authorId: session.id,
        ...(parentId ? { parentId } : {}),
        ...(session.role === "ADMIN" ? { displayAuthorName: parsedDisplayAuthorName.value } : {}),
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            signupName: true,
            loginId: true,
            role: true,
            memberType: true,
          },
        },
        reactions: {
          select: {
            emoji: true,
            userId: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, comment: { ...comment, reactionSummary: [] } });
  } catch (e) {
    console.error("POST notice comment error:", e);
    return NextResponse.json({ error: "공지사항 댓글 등록에 실패했습니다." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const session = (await getSession()) as { id: string; role: string } | null;
  if (!session) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const commentId = typeof body.commentId === "string" ? body.commentId : "";
    const content = typeof body.content === "string" ? body.content.trim() : "";
    const parsedDisplayAuthorName = isAdminSession(session)
      ? parseNewsDisplayAuthorName(body.displayAuthorName)
      : { ok: true as const, value: null };

    if (!commentId) {
      return NextResponse.json({ error: "수정할 댓글이 누락되었습니다." }, { status: 400 });
    }

    if (!content) {
      return NextResponse.json({ error: "댓글 내용을 입력해 주세요." }, { status: 400 });
    }

    if (!parsedDisplayAuthorName.ok) {
      return NextResponse.json({ error: parsedDisplayAuthorName.error }, { status: 400 });
    }

    const comment = await prisma.coopNewsComment.findUnique({
      where: { id: commentId },
      include: {
        news: {
          select: {
            category: true,
          },
        },
      },
    });

    if (!comment || !canCommentOnNewsCategory(comment.news.category)) {
      return NextResponse.json({ error: "수정할 댓글을 찾을 수 없습니다." }, { status: 404 });
    }

    if (!canMutateComment(session, comment)) {
      return NextResponse.json({ error: "댓글 수정 권한이 없습니다." }, { status: 403 });
    }

    const updated = await prisma.coopNewsComment.update({
      where: { id: commentId },
      data: {
        content,
        ...(session.role === "ADMIN" ? { displayAuthorName: parsedDisplayAuthorName.value } : {}),
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            signupName: true,
            loginId: true,
            role: true,
            memberType: true,
          },
        },
        reactions: {
          select: {
            emoji: true,
            userId: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      comment: {
        ...updated,
        reactionSummary: summarizeCommentReactions(updated.reactions, session.id),
      },
    });
  } catch (e) {
    console.error("PATCH notice comment error:", e);
    return NextResponse.json({ error: "공지사항 댓글 수정에 실패했습니다." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = (await getSession()) as { id: string; role: string } | null;
  if (!session) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  try {
    const commentId = new URL(request.url).searchParams.get("commentId") || "";
    if (!commentId) {
      return NextResponse.json({ error: "삭제할 댓글이 누락되었습니다." }, { status: 400 });
    }

    const comment = await prisma.coopNewsComment.findUnique({
      where: { id: commentId },
      include: {
        news: {
          select: {
            category: true,
          },
        },
      },
    });

    if (!comment || !canCommentOnNewsCategory(comment.news.category)) {
      return NextResponse.json({ error: "삭제할 댓글을 찾을 수 없습니다." }, { status: 404 });
    }

    if (!canMutateComment(session, comment)) {
      return NextResponse.json({ error: "댓글 삭제 권한이 없습니다." }, { status: 403 });
    }

    await prisma.coopNewsComment.delete({ where: { id: commentId } });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("DELETE notice comment error:", e);
    return NextResponse.json({ error: "공지사항 댓글 삭제에 실패했습니다." }, { status: 500 });
  }
}
