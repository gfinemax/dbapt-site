"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */

import { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type FreeBoardProps = {
  session: any;
  posts: any[];
  onRefresh: () => Promise<void>;
};

const MOCK_POSTS = [
  {
    id: "mock-post-1",
    title: "최근 임시총회 의결서 공증 완료본 확인했습니다.",
    content: "공개자료실 문서함에서 총회의사록 신속하게 공증 완료된 버전 확인했습니다. 사무국에서 발빠르게 등재해주시니 기밀성 유지되면서도 투명함이 느껴져 든든하네요. 모두 고생 많으셨습니다. 앞으로도 화이팅입니다!",
    createdAt: "2026.05.28",
    author: { name: "이조합", loginId: "member2", role: "MEMBER" },
    comments: [
      {
        id: "mock-comm-1",
        content: "동감합니다. 매 분기 예산 집행 세부 내역도 자금 입출금이랑 대조되어서 올라오니까 믿음직스럽네요.",
        createdAt: "2026.05.28 14:22",
        author: { name: "정조합", loginId: "member3", role: "MEMBER" },
      },
    ],
  },
  {
    id: "mock-post-2",
    title: "신규로 등재된 주간 실무 보고서 유익하네요.",
    content: "시공사 설계팀과의 도면 협의 및 주차 대수 추가 최적화 도면 수정 보고서가 신속하게 올라와서 좋네요. 다가오는 건축심의 본신청에서도 시정 지적 없이 깔끔하게 조치 결과 보고 수령하길 조합원 가족 모두 기원합니다.",
    createdAt: "2026.05.27",
    author: { name: "박조합", loginId: "member4", role: "MEMBER" },
    comments: [],
  },
] as const;

export function FreeBoard({
  session,
  posts = [],
  onRefresh,
}: FreeBoardProps) {
  const currentUserId = session?.id;
  const isAdmin = session?.role === "ADMIN";

  const [searchQuery, setSearchQuery] = useState("");
  const [showWriteModal, setShowWriteModal] = useState(false);
  const [activeExpandedPost, setActiveExpandedPost] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (showWriteModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [showWriteModal]);

  // New Post Form State
  const [writeTitle, setWriteTitle] = useState("");
  const [writeContent, setWriteContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New Comment Form State (Mapped by Post ID)
  const [commentContents, setCommentContents] = useState<Record<string, string>>({});
  const [commentSubmitting, setCommentSubmitting] = useState<Record<string, boolean>>({});

  // Anonymize/Mask user details for privacy protection
  const getMaskedAuthorName = (author: { name: string; loginId: string | null; role: string; id?: string }) => {
    if (author.id === currentUserId) {
      return `${author.name || "조합원"} (나)`;
    }
    if (author.role === "ADMIN") {
      return "사무국";
    }
    const cleanName = author.name || "조합원";
    const maskedId = author.loginId 
      ? `${author.loginId.slice(0, 2)}***`
      : "social";
    return `${cleanName.slice(0, 1)}*조합원 (${maskedId})`;
  };

  // Combine real database posts with simulated demonstration mocks
  const combinedPosts = useMemo(() => {
    const realPosts = posts.map((p) => ({
      id: p.id,
      title: p.title,
      content: p.content,
      createdAt: p.createdAt.slice(0, 16).replace("T", " "),
      author: p.author,
      comments: p.comments.map((c: any) => ({
        id: c.id,
        content: c.content,
        createdAt: c.createdAt.slice(0, 16).replace("T", " "),
        author: c.author,
        isReal: true,
      })),
      isReal: true,
    }));

    let filteredReal = realPosts;
    let filteredMock = MOCK_POSTS.map((p) => ({
      ...p,
      isReal: false,
      comments: p.comments.map((c) => ({
        ...c,
        isReal: false,
      })),
    }));

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      filteredReal = filteredReal.filter((p) => p.title.toLowerCase().includes(q) || p.content.toLowerCase().includes(q));
      filteredMock = filteredMock.filter((p) => p.title.toLowerCase().includes(q) || p.content.toLowerCase().includes(q));
    }

    return [...filteredReal, ...filteredMock];
  }, [posts, searchQuery]);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!writeTitle.trim() || !writeContent.trim()) {
      alert("제목과 본문을 모두 작성해 주십시오.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/news/free", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: writeTitle,
          content: writeContent,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "게시글 게시 과정에서 문제가 발생했습니다.");
        return;
      }

      setWriteTitle("");
      setWriteContent("");
      setShowWriteModal(false);
      await onRefresh();
    } catch (err) {
      console.error(err);
      alert("게시글 저장 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateComment = async (postId: string) => {
    const text = commentContents[postId] || "";
    if (!text.trim()) {
      alert("댓글 내용을 입력해 주십시오.");
      return;
    }

    setCommentSubmitting((prev) => ({ ...prev, [postId]: true }));
    try {
      const res = await fetch("/api/news/free", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId,
          content: text,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "댓글 작성에 실패했습니다.");
        return;
      }

      setCommentContents((prev) => ({ ...prev, [postId]: "" }));
      await onRefresh();
    } catch (err) {
      console.error(err);
      alert("댓글 저장 중 오류가 발생했습니다.");
    } finally {
      setCommentSubmitting((prev) => ({ ...prev, [postId]: false }));
    }
  };

  const handleDeletePostOrComment = async (params: { postId?: string; commentId?: string }) => {
    if (!confirm("정말 이 대상을 영구 삭제하시겠습니까?\n\n삭제 후에는 복구할 수 없습니다.")) {
      return;
    }

    try {
      let url = "/api/news/free";
      if (params.postId) url += `?postId=${params.postId}`;
      else if (params.commentId) url += `?commentId=${params.commentId}`;

      const res = await fetch(url, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "삭제 작업에 실패했습니다.");
        return;
      }

      await onRefresh();
    } catch (err) {
      console.error(err);
      alert("삭제 처리 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="space-y-6">
      {/* 자유게시판 미니 대시보드 */}
      <div className="stone-card bg-[#fbfaf9] border border-stone-surface p-5 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-in fade-in duration-300">
        <div>
          <span className="inline-flex rounded-full bg-meadow-green/10 px-2 py-0.5 text-[9px] font-bold text-meadow-green uppercase tracking-wider select-none mb-1">
            💬 토론 공간 현황
          </span>
          <h4 className="text-[13.5px] font-extrabold text-charcoal-primary leading-snug">
            조합원 전용 소통 게시판
          </h4>
          <p className="text-[11px] text-graphite/95 font-normal mt-1 leading-relaxed">
            자산 가치를 수호하고 투명한 정보를 나누기 위해 마련된 양방향 토론 구역입니다.
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono font-bold shrink-0">
          <div className="text-center bg-white px-4 py-2 border border-stone-surface rounded-xl shadow-2xs">
            <span className="text-ash block text-[9px] font-bold uppercase mb-0.5">실시간 소통 온도</span>
            <span className="text-meadow-green text-[13px] font-extrabold">36.5 °C</span>
          </div>
          <div className="text-center bg-white px-4 py-2 border border-stone-surface rounded-xl shadow-2xs">
            <span className="text-ash block text-[9px] font-bold uppercase mb-0.5">이달의 소통글</span>
            <span className="text-sky-blue text-[13px] font-extrabold">+{combinedPosts.length}건</span>
          </div>
        </div>
      </div>

      {/* 검색 바 & 새 글 작성 */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <svg className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ash" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="자유게시판 제목/내용 검색…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-stone-surface bg-white pl-10 pr-4 py-2.5 text-xs text-charcoal-primary placeholder:text-ash shadow-2xs focus:outline-none focus:ring-2 focus:ring-sky-blue/30 focus:border-sky-blue"
          />
        </div>

        <Button
          onClick={() => setShowWriteModal(true)}
          className="rounded-full bg-midnight hover:bg-black text-white text-xs font-bold px-5 h-9.5 active:scale-95 transition-all duration-200 cursor-pointer"
        >
          ✍️ 새 토론 게시글 작성
        </Button>
      </div>

      {/* 자유게시판 글 목록 피드 */}
      <div className="space-y-5">
        {combinedPosts.map((post) => {
          const isExpanded = activeExpandedPost === post.id;
          const authorLabel = getMaskedAuthorName(post.author);
          const showDeletePost = post.isReal && (post.author.id === currentUserId || isAdmin);

          // Generate dynamic or stable avatar initial background color based on name length
          const bgColors = ["bg-[#ff3e00]/10 text-[#ff3e00]", "bg-[#0090ff]/10 text-[#0090ff]", "bg-[#00ca48]/10 text-[#00ca48]", "bg-[#ffbb26]/10 text-[#d48f00]"];
          const avatarColorClass = bgColors[authorLabel.length % bgColors.length];

          return (
            <div
              key={post.id}
              className={cn(
                "stone-card bg-white rounded-2xl border p-5.5 transition-all duration-300 flex items-start gap-4 shadow-2xs hover:shadow-xs",
                post.isReal ? "border-stone-surface" : "border-stone-surface/60 bg-amber-50/[0.02] border-dashed"
              )}
            >
              {/* Avatar Column */}
              <div className={cn("size-10 rounded-full flex items-center justify-center font-bold text-xs shrink-0 select-none border border-stone-surface/50 shadow-2xs font-mono", avatarColorClass)}>
                {authorLabel.slice(0, 1)}
              </div>

              {/* Content Column */}
              <div className="flex-1 space-y-3">
                {/* 상단 메타 */}
                <div className="flex items-center justify-between text-[10px] font-bold text-ash font-mono">
                  <span className="flex items-center gap-1.5">
                    <span className="bg-[#f8f7f4] text-charcoal-primary border border-stone-surface/75 px-2 py-0.5 rounded text-[9px] font-extrabold select-none">
                      {post.isReal ? "정식 토론" : "데모 피드"}
                    </span>
                    <span>작성자: {authorLabel}</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <span>{post.createdAt}</span>
                    {showDeletePost && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePostOrComment({ postId: post.id });
                        }}
                        className="text-red-500 hover:bg-red-50 p-1 rounded-full active:scale-90 transition cursor-pointer"
                        title="게시글 삭제"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                </div>

                {/* 게시글 본문 */}
                <div className="space-y-1">
                  <h4 className="text-[13.5px] font-extrabold text-charcoal-primary leading-snug">
                    {post.title}
                  </h4>
                  <p className="text-xs text-graphite/95 font-normal leading-relaxed whitespace-pre-wrap pt-1 font-sans">
                    {post.content}
                  </p>
                </div>

                {/* 하단 피드백 및 댓글 열기 */}
                <div className="pt-2 flex items-center justify-between border-t border-stone-surface/40">
                  <button
                    onClick={() => setActiveExpandedPost(isExpanded ? null : post.id)}
                    className="inline-flex items-center gap-1.5 text-[10.5px] font-extrabold text-sky-blue hover:text-sky-blue/90 select-none cursor-pointer"
                  >
                    💬 댓글 ({post.comments.length}개) {isExpanded ? "▲ 접기" : "▼ 더 보기"}
                  </button>
                </div>

                {/* 확장된 댓글 스레드 목록 */}
                {isExpanded && (
                  <div className="mt-2.5 p-4 rounded-xl bg-[#f8f7f4] border border-stone-surface/60 border-dashed space-y-4">
                    {/* 댓글 목록 */}
                    {post.comments.length === 0 ? (
                      <p className="text-[10px] text-graphite/60 font-medium font-mono text-center select-none py-2">
                        첫 번째 의견 댓글을 남겨보세요.
                      </p>
                    ) : (
                      <div className="space-y-3 divide-y divide-stone-surface/45">
                        {post.comments.map((comm: any, cIdx: number) => {
                          const commAuthor = getMaskedAuthorName(comm.author);
                          const showDeleteComm = comm.isReal && (comm.author.id === currentUserId || isAdmin);
                          return (
                            <div key={comm.id} className={cn("text-xs leading-relaxed space-y-1", cIdx > 0 && "pt-3")}>
                              <div className="flex items-center justify-between text-[9.5px] font-bold text-ash font-mono mb-1">
                                <span>작성자: {commAuthor}</span>
                                <div className="flex items-center gap-2">
                                  <span>{comm.createdAt}</span>
                                  {showDeleteComm && (
                                    <button
                                      onClick={() => handleDeletePostOrComment({ commentId: comm.id })}
                                      className="text-red-500 hover:bg-red-50 px-1 rounded active:scale-90 transition cursor-pointer"
                                      title="댓글 삭제"
                                    >
                                      🗑️
                                    </button>
                                  )}
                                </div>
                              </div>
                              <p className="text-[11px] text-graphite/90 font-normal">{comm.content}</p>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* 댓글 작성 폼 (실제 글에만 허용 혹은 데모 글의 경우 알림) */}
                    <div className="flex gap-2 pt-2 border-t border-stone-surface/40">
                      <input
                        type="text"
                        placeholder={post.isReal ? "안전하고 고운 의견 댓글을 작성해 주세요…" : "가상 데모 보존 게시글에는 댓글을 추가하실 수 없습니다."}
                        value={commentContents[post.id] || ""}
                        disabled={!post.isReal}
                        onChange={(e) => setCommentContents((prev) => ({ ...prev, [post.id]: e.target.value }))}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && post.isReal) {
                            handleCreateComment(post.id);
                          }
                        }}
                        className="flex-1 rounded-lg border border-stone-surface bg-white px-3.5 py-1.5 text-[11px] text-charcoal-primary placeholder:text-ash outline-none transition focus:border-sky-blue"
                      />
                      <Button
                        onClick={() => {
                          if (!post.isReal) {
                            alert("시연용 아카이브 포스트에는 댓글 전송이 차단되어 있습니다.\n실제 토론 게시판 연동을 확인하시려면, 새 토론 게시글을 직접 작성한 후 댓글을 작성하십시오!");
                            return;
                          }
                          handleCreateComment(post.id);
                        }}
                        disabled={commentSubmitting[post.id] || !post.isReal}
                        className="rounded-lg bg-midnight text-white text-[10.5px] font-bold px-3 h-8.5 cursor-pointer disabled:opacity-50 shrink-0"
                      >
                        의견 등록
                      </Button>
                    </div>
                  </div>
                )}

              </div>
            </div>
          );
        })}
      </div>

      {/* 새 글 작성 드로어 */}
      {mounted && showWriteModal && createPortal(
        <>
          <div
            onClick={() => setShowWriteModal(false)}
            className="fixed inset-0 z-[120] bg-black/35 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
          />
          <div
            className="fixed inset-y-0 right-0 z-[130] w-full max-w-lg bg-warm-canvas border-l border-stone-surface shadow-2xl p-6 sm:p-8 flex flex-col overflow-y-auto animate-in slide-in-from-right duration-300 ease-out"
            aria-label="새 토론글 게시 드로어"
          >
            <div className="flex items-center justify-between pb-6 border-b border-stone-surface mb-6">
              <h3 className="text-base font-black text-charcoal-primary flex items-center gap-1.5">
                <span>✍️</span> 새 토론 게시물 등록
              </h3>
              <button
                onClick={() => setShowWriteModal(false)}
                className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full border border-stone-surface bg-[#f8f7f4] text-xs font-medium text-graphite hover:bg-stone-surface active:bg-[#e8e6e1] transition duration-200 cursor-pointer"
              >
                닫기
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-5 flex-1">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-charcoal-primary font-mono block">
                  게시글 제목 *
                </label>
                <input
                  type="text"
                  required
                  placeholder="의견을 명확하게 요약한 제목을 입력해 주십시오."
                  value={writeTitle}
                  onChange={(e) => setWriteTitle(e.target.value)}
                  className="w-full rounded-xl border border-stone-surface bg-white px-4 py-2.5 text-xs text-charcoal-primary outline-none transition focus:border-sky-blue focus:ring-1 focus:ring-sky-blue/30"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-charcoal-primary font-mono block">
                  게시글 본문 내용 *
                </label>
                <textarea
                  required
                  rows={8}
                  placeholder="조합원님들과 공유하고 싶은 소통과 상생 의견을 자유롭게 기록해 주십시오."
                  value={writeContent}
                  onChange={(e) => setWriteContent(e.target.value)}
                  className="w-full rounded-xl border border-stone-surface bg-white px-4 py-2.5 text-xs text-charcoal-primary outline-none transition focus:border-sky-blue focus:ring-1 focus:ring-sky-blue/30 resize-none leading-relaxed"
                />
              </div>

              <div className="pt-5 border-t border-stone-surface flex justify-end">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-full bg-midnight hover:bg-black text-white text-xs font-bold px-6 h-10 cursor-pointer disabled:opacity-50 transition-all duration-200 active:scale-95"
                >
                  {isSubmitting ? "작성 중…" : "게시글 작성 완료"}
                </Button>
              </div>
            </form>
          </div>
        </>,
        document.body
      )}
    </div>
  );
}
