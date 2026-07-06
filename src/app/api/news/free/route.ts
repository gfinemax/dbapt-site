import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { normalizeFreePostType } from "@/lib/free-post-type";
import { parseNewsDisplayAuthorName } from "@/lib/news-display-author";
import { summarizeCommentReactions } from "@/lib/news/comment-reactions";
import { parseKoreaDateTimeLocalValue } from "@/lib/news/korea-date-time";
import { loadContentReactionSummaries } from "@/lib/server/content-reaction-summaries";

function normalizeFreePostAttachment(body: {
  attachmentPath?: unknown;
  attachmentName?: unknown;
  attachmentSize?: unknown;
}) {
  const attachmentPath = typeof body.attachmentPath === "string" && body.attachmentPath.trim()
    ? body.attachmentPath.trim()
    : null;
  const attachmentName = typeof body.attachmentName === "string" && body.attachmentName.trim()
    ? body.attachmentName.trim()
    : null;
  const attachmentSizeNumber = Number(body.attachmentSize);
  const attachmentSize = Number.isFinite(attachmentSizeNumber) && attachmentSizeNumber > 0
    ? Math.round(attachmentSizeNumber)
    : null;

  if (!attachmentPath || !attachmentName) {
    return {
      attachmentPath: null,
      attachmentName: null,
      attachmentSize: null,
    };
  }

  return {
    attachmentPath,
    attachmentName,
    attachmentSize,
  };
}

function hasFreePostAttachmentPayload(body: Record<string, unknown>) {
  return "attachmentPath" in body || "attachmentName" in body || "attachmentSize" in body;
}

function parseSocialImagePath(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function hasSocialImagePathPayload(body: Record<string, unknown>) {
  return "socialImagePath" in body;
}

function parseCreatedAt(value: unknown): Date | null {
  const date = parseKoreaDateTimeLocalValue(value);
  return date ?? null;
}

function hasCreatedAtPayload(body: Record<string, unknown>) {
  return "createdAt" in body;
}

// 1. GET: 자유게시판 글 및 댓글 목록 조회 (MEMBER, ADMIN, REFUND 전용)
export async function GET() {
  const session = (await getSession()) as { id: string; role: string } | null;
  if (!session) {
    return NextResponse.json({ error: "인증되지 않은 사용자입니다." }, { status: 401 });
  }

  try {
    const posts = await prisma.freePost.findMany({
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
        comments: {
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
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: [
        { isStarred: "desc" },
        { registeredAt: "desc" },
      ],
    });
    const likeSummaries = await loadContentReactionSummaries(
      "FREE_POST",
      posts.map((post) => post.id),
      session.id,
    );

    return NextResponse.json({
      posts: posts.map((post) => ({
        ...post,
        ...(likeSummaries.get(post.id) || { likeCount: 0, likedByCurrentUser: false }),
        comments: post.comments.map((comment) => ({
          ...comment,
          reactionSummary: summarizeCommentReactions(comment.reactions, session.id),
        })),
      })),
    });
  } catch (e) {
    console.error("GET free posts error:", e);
    return NextResponse.json({ error: "자유게시판 목록을 가져오는 데 실패했습니다." }, { status: 500 });
  }
}

// 2. POST: 자유게시판 신규 포스트 작성 혹은 댓글 등록 (MEMBER, ADMIN, REFUND 전용)
export async function POST(request: Request) {
  const session = (await getSession()) as { id: string; role: string } | null;
  if (!session) {
    return NextResponse.json({ error: "인증되지 않은 사용자입니다." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      title,
      content,
      postId,
      parentCommentId,
      isStarred,
      postType,
      displayAuthorName,
      registeredAt,
      isPublicShareEnabled,
      socialImagePath,
    } = body; // 만약 postId가 존재하면 댓글 추가로 판별
    const parsedDisplayAuthorName = session.role === "ADMIN"
      ? parseNewsDisplayAuthorName(displayAuthorName)
      : { ok: true as const, value: null };

    if (!parsedDisplayAuthorName.ok) {
      return NextResponse.json({ error: parsedDisplayAuthorName.error }, { status: 400 });
    }

    if (postId) {
      // 댓글 등록
      const commentContent = typeof content === "string" ? content.trim() : "";
      if (!commentContent) {
        return NextResponse.json({ error: "댓글 내용을 입력해 주세요." }, { status: 400 });
      }

      let parentId: string | undefined;
      if (parentCommentId) {
        const parentComment = await prisma.freeComment.findUnique({
          where: { id: parentCommentId },
          select: { id: true, postId: true, parentId: true },
        });

        if (!parentComment) {
          return NextResponse.json({ error: "답글 대상 댓글을 찾을 수 없습니다." }, { status: 404 });
        }

        if (parentComment.postId !== postId) {
          return NextResponse.json({ error: "답글 대상 댓글이 게시글과 일치하지 않습니다." }, { status: 400 });
        }

        parentId = parentComment.parentId || parentComment.id;
      }

      const comment = await prisma.freeComment.create({
        data: {
          content: commentContent,
          postId,
          parentId,
          authorId: session.id,
          displayAuthorName: session.role === "ADMIN" ? parsedDisplayAuthorName.value : null,
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
        },
      });

      return NextResponse.json({ success: true, comment: { ...comment, reactionSummary: [] } });
    } else {
      // 게시글 등록
      if (!title || !content) {
        return NextResponse.json({ error: "제목과 내용을 모두 입력해 주세요." }, { status: 400 });
      }

      if (hasCreatedAtPayload(body)) {
        return NextResponse.json({ error: "작성일은 시스템 기록으로만 보관됩니다." }, { status: 400 });
      }
      const parsedRegisteredAt = parseCreatedAt(registeredAt);
      if (registeredAt && session.role !== "ADMIN") {
        return NextResponse.json({ error: "등록일 변경은 관리자만 가능합니다." }, { status: 403 });
      }
      if (hasSocialImagePathPayload(body) && session.role !== "ADMIN") {
        return NextResponse.json({ error: "카톡 미리보기 이미지는 관리자만 변경할 수 있습니다." }, { status: 403 });
      }
      const publicShareEnabled = session.role === "ADMIN" ? !!isPublicShareEnabled : false;

      const post = await prisma.freePost.create({
        data: {
          title,
          content,
          postType: normalizeFreePostType(postType, session.role === "ADMIN"),
          authorId: session.id,
          isStarred: session.role === "ADMIN" ? !!isStarred : false,
          displayAuthorName: session.role === "ADMIN" ? parsedDisplayAuthorName.value : null,
          isPublicShareEnabled: publicShareEnabled,
          publicShareEnabledAt: publicShareEnabled ? new Date() : null,
          ...(session.role === "ADMIN" && hasSocialImagePathPayload(body)
            ? { socialImagePath: parseSocialImagePath(socialImagePath) }
            : {}),
          ...normalizeFreePostAttachment(body),
          ...(parsedRegisteredAt && session.role === "ADMIN" ? { registeredAt: parsedRegisteredAt } : {}),
        },
      });

      return NextResponse.json({ success: true, post });
    }
  } catch (e) {
    console.error("POST free posts/comments error:", e);
    return NextResponse.json({ error: "자유게시판 처리에 실패했습니다." }, { status: 500 });
  }
}
export async function DELETE(request: Request) {
  const session = (await getSession()) as { id: string; role: string } | null;
  if (!session) {
    return NextResponse.json({ error: "인증되지 않은 사용자입니다." }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get("postId");
    const commentId = searchParams.get("commentId");

    if (postId) {
      // 게시글 삭제
      const post = await prisma.freePost.findUnique({ where: { id: postId } });
      if (!post) {
        return NextResponse.json({ error: "존재하지 않는 게시글입니다." }, { status: 404 });
      }

      // 작성자 본인 혹은 관리자만 삭제 가능
      if (post.authorId !== session.id && session.role !== "ADMIN") {
        return NextResponse.json({ error: "삭제 권한이 없습니다." }, { status: 403 });
      }

      await prisma.freePost.delete({ where: { id: postId } });
      return NextResponse.json({ success: true });
    } else if (commentId) {
      // 댓글 삭제
      const comment = await prisma.freeComment.findUnique({ where: { id: commentId } });
      if (!comment) {
        return NextResponse.json({ error: "존재하지 않는 댓글입니다." }, { status: 404 });
      }

      if (comment.authorId !== session.id && session.role !== "ADMIN") {
        return NextResponse.json({ error: "삭제 권한이 없습니다." }, { status: 403 });
      }

      await prisma.freeComment.delete({ where: { id: commentId } });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "삭제할 대상 식별자가 누락되었습니다." }, { status: 400 });
  } catch (e) {
    console.error("DELETE free post/comment error:", e);
    return NextResponse.json({ error: "삭제 처리에 실패했습니다." }, { status: 500 });
  }
}

// 4. PATCH: 자유게시판 포스트 수정 (작성자 혹은 ADMIN 전용)
export async function PATCH(request: Request) {
  const session = (await getSession()) as { id: string; role: string } | null;
  if (!session) {
    return NextResponse.json({ error: "인증되지 않은 사용자입니다." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { postId, title, content, isStarred, postType, displayAuthorName, registeredAt, isPublicShareEnabled, socialImagePath } = body;

    if (!postId) {
      return NextResponse.json({ error: "수정할 대상 ID가 누락되었습니다." }, { status: 400 });
    }

    if (!title || !content) {
      return NextResponse.json({ error: "제목과 내용을 모두 입력해 주세요." }, { status: 400 });
    }

    const post = await prisma.freePost.findUnique({ where: { id: postId } });
    if (!post) {
      return NextResponse.json({ error: "존재하지 않는 게시글입니다." }, { status: 404 });
    }

    if (post.authorId !== session.id && session.role !== "ADMIN") {
      return NextResponse.json({ error: "수정 권한이 없습니다." }, { status: 403 });
    }

    if (hasCreatedAtPayload(body)) {
      return NextResponse.json({ error: "작성일은 시스템 기록으로만 보관됩니다." }, { status: 400 });
    }
    const parsedRegisteredAt = parseCreatedAt(registeredAt);
    if (registeredAt && session.role !== "ADMIN") {
      return NextResponse.json({ error: "등록일 변경은 관리자만 가능합니다." }, { status: 403 });
    }
    if (hasSocialImagePathPayload(body) && session.role !== "ADMIN") {
      return NextResponse.json({ error: "카톡 미리보기 이미지는 관리자만 변경할 수 있습니다." }, { status: 403 });
    }

    const updateData: {
      title: string;
      content: string;
      postType: string;
      attachmentPath?: string | null;
      attachmentName?: string | null;
      attachmentSize?: number | null;
      isStarred?: boolean;
      displayAuthorName?: string | null;
      registeredAt?: Date;
      isPublicShareEnabled?: boolean;
      publicShareEnabledAt?: Date | null;
      socialImagePath?: string | null;
    } = {
      title,
      content,
      postType: normalizeFreePostType(postType, session.role === "ADMIN"),
    };
    if (hasFreePostAttachmentPayload(body)) {
      Object.assign(updateData, normalizeFreePostAttachment(body));
    }
    if (session.role === "ADMIN") {
      const parsedDisplayAuthorName = parseNewsDisplayAuthorName(displayAuthorName);
      if (!parsedDisplayAuthorName.ok) {
        return NextResponse.json({ error: parsedDisplayAuthorName.error }, { status: 400 });
      }
      updateData.isStarred = !!isStarred;
      updateData.displayAuthorName = parsedDisplayAuthorName.value;
      updateData.isPublicShareEnabled = !!isPublicShareEnabled;
      updateData.publicShareEnabledAt = isPublicShareEnabled
        ? post.publicShareEnabledAt || new Date()
        : null;
      if (parsedRegisteredAt) {
        updateData.registeredAt = parsedRegisteredAt;
      }
      if (hasSocialImagePathPayload(body)) {
        updateData.socialImagePath = parseSocialImagePath(socialImagePath);
      }
    }

    const updated = await prisma.freePost.update({
      where: { id: postId },
      data: updateData,
    });

    return NextResponse.json({ success: true, post: updated });
  } catch (e) {
    console.error("PATCH free post error:", e);
    return NextResponse.json({ error: "게시글 수정 처리에 실패했습니다." }, { status: 500 });
  }
}
