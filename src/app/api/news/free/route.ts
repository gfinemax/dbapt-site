import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

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
            loginId: true,
            role: true,
          },
        },
        comments: {
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
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: [
        { isStarred: "desc" },
        { createdAt: "desc" },
      ],
    });

    return NextResponse.json({ posts });
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
    const { title, content, postId, parentCommentId, isStarred } = body; // 만약 postId가 존재하면 댓글 추가로 판별

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

      return NextResponse.json({ success: true, comment });
    } else {
      // 게시글 등록
      if (!title || !content) {
        return NextResponse.json({ error: "제목과 내용을 모두 입력해 주세요." }, { status: 400 });
      }

      const post = await prisma.freePost.create({
        data: {
          title,
          content,
          authorId: session.id,
          isStarred: session.role === "ADMIN" ? !!isStarred : false,
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
    const { postId, title, content, isStarred } = body;

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

    const updateData: { title: string; content: string; isStarred?: boolean } = {
      title,
      content,
    };
    if (session.role === "ADMIN") {
      updateData.isStarred = !!isStarred;
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
