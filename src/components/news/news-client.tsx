"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  NEWS_DISPLAY_AUTHOR_NAMES,
  type NewsDisplayAuthorName,
} from "@/lib/news-display-author";
import { buildShallowCommentTree } from "@/lib/news/comment-tree";
import { mergeNewsCategoryRefresh } from "@/lib/news/category-refresh";
import {
  appendNoticeComment,
  appendNoticeCommentToList,
  removeNoticeComment as removeNoticeCommentFromNotice,
  removeNoticeCommentFromList,
  replaceNoticeComment,
  replaceNoticeCommentInList,
  type NoticeCommentMutation,
} from "@/lib/news/comment-mutations";
import {
  findNewsletterFromSearchParams,
  findNoticeFromSearchParams,
  getNewsTabFromSearchParams,
  type NewsTabId,
} from "@/lib/news/deep-links";
import {
  buildNoticeCommentEditDraft,
  canCommentOnNotice as canCommentOnNoticeItem,
  canEditNotice,
  canMutateNoticeComment as canMutateNoticeCommentItem,
} from "@/lib/news/notice-access";
import {
  buildNoticeCommentCreatePayload,
  buildNoticeCommentUpdatePayload,
} from "@/lib/news/notice-comment-payload";
import {
  buildActiveEditedNoticeView,
  buildEditedNoticeView,
  mergeNoticeRefresh,
  replaceNoticeInList,
} from "@/lib/news/notice-mutations";
import { getNoticeCommentAuthorName } from "@/lib/news/comment-author";
import { buildNoticeEditDraft } from "@/lib/news/notice-edit-draft";
import { buildNoticeEditPayload } from "@/lib/news/notice-edit-payload";
import { buildNewsClientSummary } from "@/lib/news/news-client-summary";
import { uploadPublicFile } from "@/lib/news/public-upload";
import {
  getNewsComments,
  type CoopNewsView,
  type FAQView,
  type FreePostView,
  type NewsCommentView,
  type NewsSessionView,
} from "@/lib/news/types";
import { cn } from "@/lib/utils";
import { NoticeBoard } from "./notice-board";
import { FreeBoard } from "./free-board";
import { FaqAccordion } from "./faq-accordion";
import { CoopNewsletter } from "./coop-newsletter";
import { DevelopmentLog } from "./development-log";
import { NoticeRichContent, NoticeRichEditor, getPlainNoticeText } from "./notice-rich-editor";

type NewsClientProps = {
  session?: NewsSessionView | null;
  initialNewsList?: CoopNewsView[];
  initialFreePosts?: FreePostView[];
  initialFaqs?: FAQView[];
};

const menuItems = [
  { id: "notice", label: "공지사항", isSecure: false },
  { id: "free", label: "자유게시판", isSecure: true },
  { id: "faq", label: "FAQ", isSecure: true },
  { id: "newsletter", label: "조합뉴스 (주/월간소식)", isSecure: false },
  { id: "development", label: "개발일지", isSecure: false },
] as const;

function formatNoticeDate(value: unknown) {
  if (!value) return "";
  return String(value).slice(0, 10).replace(/-/g, ".");
}

function NewsSectionLockTab({ label, router }: { label: string; router: { push: (href: string) => void } }) {
  return (
    <div className="stone-card bg-[#fbfaf9] rounded-3xl p-10 text-center relative overflow-hidden min-h-[360px] flex flex-col justify-center items-center border border-stone-surface">
      {/* 고해상도 정보 보호용 리드미컬하고 세련된 디테일 블러 프레임 */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#f8f7f4]/40 to-[#f8f7f4] backdrop-blur-[2.5px] z-1" />
      
      {/* 시각적인 보안 해시 및 정보 차단 프레임 데코 */}
      <div className="absolute top-8 left-8 right-8 text-left opacity-15 select-none pointer-events-none font-mono text-[9px] text-ash space-y-1 z-0">
        <div className="flex justify-between">
          <span>SECURE_GROUP:</span>
          <span>MEMBERS_ONLY_SECRET</span>
        </div>
        <div className="flex justify-between">
          <span>SHA256_HASH:</span>
          <span>8f2b1a3c5e7d9f0a2b4c6e8f...</span>
        </div>
        <div className="flex justify-between">
          <span>ENCRYPTION_KEY:</span>
          <span>AES256_GCM_ACTIVE</span>
        </div>
      </div>

      <div className="relative z-10 max-w-sm space-y-6">
        <div className="flex size-14 items-center justify-center rounded-full bg-ember-orange/10 text-ember-orange text-2xl mx-auto shadow-2xs border border-ember-orange/15 select-none animate-pulse">
          🔒
        </div>
        <div className="space-y-2">
          <h4 className="text-[15px] font-black text-charcoal-primary tracking-tight">
            대방동 정식 조합원 검증 필요 ({label})
          </h4>
          <p className="text-[11px] text-graphite/90 leading-relaxed font-normal px-2">
            본 공간은 우리 자산 가치 보호 및 조합 정보 유출을 수호하기 위해 대방동 정식 조합원 인증을 완료하신 분들만 안심하고 열람하실 수 있는 기밀 보안 영역입니다.
          </p>
        </div>
        <Button
          onClick={() => router.push("/login")}
          className="w-full max-w-[210px] rounded-full bg-midnight hover:bg-black text-white text-xs font-bold h-10 shadow-sm transition-all duration-200 active:scale-95 cursor-pointer mx-auto"
        >
          조합원 로그인 검증
        </Button>
      </div>
    </div>
  );
}

export function NewsClient({
  session,
  initialNewsList = [],
  initialFreePosts = [],
  initialFaqs = [],
}: NewsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isLoggedIn = !!session;
  const isAdmin = session?.role === "ADMIN";
  const initialTab = getNewsTabFromSearchParams(searchParams) ?? "notice";
  const initialNoticeFromUrl = findNoticeFromSearchParams(initialNewsList, searchParams);
  const initialNewsletterFromUrl = findNewsletterFromSearchParams(initialNewsList, searchParams);

  const [activeTab, setActiveTab] = useState<NewsTabId>(initialTab);
  const [newsList, setNewsList] = useState<CoopNewsView[]>(initialNewsList);
  const [freePosts, setFreePosts] = useState<FreePostView[]>(initialFreePosts);
  const [faqs, setFaqs] = useState<FAQView[]>(initialFaqs);

  const [activeViewNotice, setActiveViewNotice] = useState<CoopNewsView | null>(initialNoticeFromUrl);
  const [isEditingNotice, setIsEditingNotice] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editAttachmentPath, setEditAttachmentPath] = useState<string | null>(null);
  const [editAttachmentName, setEditAttachmentName] = useState<string | null>(null);
  const [editAttachmentSize, setEditAttachmentSize] = useState<number | null>(null);
  const [editAttachmentFile, setEditAttachmentFile] = useState<File | null>(null);
  const [editRegisteredAt, setEditRegisteredAt] = useState("");
  const [editIsStarred, setEditIsStarred] = useState(false);
  const [editDisplayAuthorName, setEditDisplayAuthorName] =
    useState<NewsDisplayAuthorName>("운영자");
  const [isSavingNotice, setIsSavingNotice] = useState(false);
  const [noticeCommentContent, setNoticeCommentContent] = useState("");
  const [noticeReplyContents, setNoticeReplyContents] = useState<Record<string, string>>({});
  const [replyingNoticeCommentId, setReplyingNoticeCommentId] = useState<string | null>(null);
  const [expandedNoticeReplies, setExpandedNoticeReplies] = useState<Record<string, boolean>>({});
  const [noticeCommentDisplayAuthorName, setNoticeCommentDisplayAuthorName] =
    useState<NewsDisplayAuthorName>("운영자");
  const [editingNoticeCommentId, setEditingNoticeCommentId] = useState<string | null>(null);
  const [editNoticeCommentContent, setEditNoticeCommentContent] = useState("");
  const [editNoticeCommentDisplayAuthorName, setEditNoticeCommentDisplayAuthorName] =
    useState<NewsDisplayAuthorName>("운영자");
  const [isSubmittingNoticeComment, setIsSubmittingNoticeComment] = useState(false);
  const [noticeCommentMutatingId, setNoticeCommentMutatingId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const requestedNewsletterFromUrl = findNewsletterFromSearchParams(newsList, searchParams);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (activeViewNotice) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      setIsEditingNotice(false);
      setNoticeCommentContent("");
      setNoticeReplyContents({});
      setReplyingNoticeCommentId(null);
      setExpandedNoticeReplies({});
      setNoticeCommentDisplayAuthorName("운영자");
      setEditingNoticeCommentId(null);
      setEditNoticeCommentContent("");
      setEditNoticeCommentDisplayAuthorName("운영자");
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [activeViewNotice]);

  const isEditableNotice = canEditNotice(activeViewNotice, isAdmin);
  const canCommentOnNotice = canCommentOnNoticeItem(activeViewNotice);

  const canMutateNoticeComment = (comment: NewsCommentView) => {
    return canMutateNoticeCommentItem(comment, session);
  };

  const syncNoticeComment = (comment: NoticeCommentMutation) => {
    setNewsList((prev) => replaceNoticeCommentInList(prev, comment));
    setActiveViewNotice((prev) => replaceNoticeComment(prev, comment));
  };

  const removeNoticeComment = (commentId: string) => {
    setNewsList((prev) => removeNoticeCommentFromList(prev, commentId));
    setActiveViewNotice((prev) => removeNoticeCommentFromNotice(prev, commentId));
  };

  const refreshNoticeList = async () => {
    const res = await fetch("/api/news?category=NOTICE");
    const data = await res.json();
    if (data.newsList) {
      setNewsList((prev) => mergeNoticeRefresh(prev, data.newsList));
    }
  };

  const beginNoticeEdit = () => {
    if (!activeViewNotice) return;
    const draft = buildNoticeEditDraft(activeViewNotice);
    setEditTitle(draft.title);
    setEditContent(draft.content);
    setEditAttachmentPath(draft.attachmentPath);
    setEditAttachmentName(draft.attachmentName);
    setEditAttachmentSize(draft.attachmentSize);
    setEditAttachmentFile(null);
    setEditRegisteredAt(draft.registeredAt);
    setEditIsStarred(draft.isStarred);
    setEditDisplayAuthorName(draft.displayAuthorName);
    setIsEditingNotice(true);
  };

  const saveNoticeEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeViewNotice) return;
    if (!editTitle.trim() || !getPlainNoticeText(editContent).trim()) {
      alert("공지 제목과 본문 내용을 모두 입력해 주세요.");
      return;
    }

    setIsSavingNotice(true);
    try {
      let attachmentPath = editAttachmentPath;
      let attachmentName = editAttachmentName;
      let attachmentSize = editAttachmentSize;

      if (editAttachmentFile) {
        const uploadData = await uploadPublicFile(editAttachmentFile, "attachment");
        attachmentPath = uploadData.url;
        attachmentName = uploadData.name;
        attachmentSize = uploadData.size;
      }

      const res = await fetch("/api/news", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildNoticeEditPayload({
          id: activeViewNotice.id,
          title: editTitle,
          content: editContent,
          attachmentPath,
          attachmentName,
          attachmentSize,
          registeredAt: editRegisteredAt,
          isStarred: editIsStarred,
          displayAuthorName: editDisplayAuthorName,
        })),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "공지사항 수정에 실패했습니다.");
        return;
      }

      const updatedNotice = buildEditedNoticeView(data.news, activeViewNotice);
      setNewsList((prev) => replaceNoticeInList(prev, updatedNotice));
      setActiveViewNotice(buildActiveEditedNoticeView(updatedNotice, editDisplayAuthorName));
      setIsEditingNotice(false);
      await refreshNoticeList();
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "공지사항 수정 중 오류가 발생했습니다.");
    } finally {
      setIsSavingNotice(false);
    }
  };

  const submitNoticeComment = async (e: React.FormEvent | null, parentCommentId?: string) => {
    e?.preventDefault();
    if (!activeViewNotice || !canCommentOnNotice) return;
    const content = (parentCommentId ? noticeReplyContents[parentCommentId] || "" : noticeCommentContent).trim();
    if (!content) {
      alert("댓글 내용을 입력해 주세요.");
      return;
    }

    setIsSubmittingNoticeComment(true);
    try {
      const res = await fetch("/api/news/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildNoticeCommentCreatePayload({
          newsId: activeViewNotice.id,
          content,
          parentCommentId,
          isAdmin,
          displayAuthorName: noticeCommentDisplayAuthorName,
        })),
      });
      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "댓글 등록에 실패했습니다.");
        return;
      }

      const nextComment = data.comment;
      setNewsList((prev) => appendNoticeCommentToList(prev, activeViewNotice.id, nextComment));
      setActiveViewNotice((prev) => appendNoticeComment(prev, activeViewNotice.id, nextComment));
      if (parentCommentId) {
        setNoticeReplyContents((prev) => ({ ...prev, [parentCommentId]: "" }));
        setReplyingNoticeCommentId(null);
        setExpandedNoticeReplies((prev) => ({ ...prev, [parentCommentId]: true }));
      } else {
        setNoticeCommentContent("");
        setNoticeCommentDisplayAuthorName("운영자");
      }
    } catch (err) {
      console.error(err);
      alert("댓글 등록 중 오류가 발생했습니다.");
    } finally {
      setIsSubmittingNoticeComment(false);
    }
  };

  const beginNoticeCommentEdit = (comment: NewsCommentView) => {
    const draft = buildNoticeCommentEditDraft(comment);
    setEditingNoticeCommentId(draft.id);
    setEditNoticeCommentContent(draft.content);
    setEditNoticeCommentDisplayAuthorName(draft.displayAuthorName);
  };

  const saveNoticeCommentEdit = async (comment: NewsCommentView) => {
    const content = editNoticeCommentContent.trim();
    if (!content) {
      alert("댓글 내용을 입력해 주세요.");
      return;
    }

    setNoticeCommentMutatingId(comment.id);
    try {
      const res = await fetch("/api/news/comments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildNoticeCommentUpdatePayload({
          commentId: comment.id,
          content,
          isAdmin,
          displayAuthorName: editNoticeCommentDisplayAuthorName,
        })),
      });
      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "댓글 수정에 실패했습니다.");
        return;
      }

      syncNoticeComment(data.comment as NoticeCommentMutation);
      setEditingNoticeCommentId(null);
      setEditNoticeCommentContent("");
    } catch (err) {
      console.error(err);
      alert("댓글 수정 중 오류가 발생했습니다.");
    } finally {
      setNoticeCommentMutatingId(null);
    }
  };

  const deleteNoticeComment = async (comment: NewsCommentView) => {
    if (!confirm("댓글을 삭제하시겠습니까?")) return;

    setNoticeCommentMutatingId(comment.id);
    try {
      const res = await fetch(`/api/news/comments?commentId=${encodeURIComponent(comment.id)}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "댓글 삭제에 실패했습니다.");
        return;
      }

      removeNoticeComment(comment.id);
      if (editingNoticeCommentId === comment.id) {
        setEditingNoticeCommentId(null);
        setEditNoticeCommentContent("");
      }
    } catch (err) {
      console.error(err);
      alert("댓글 삭제 중 오류가 발생했습니다.");
    } finally {
      setNoticeCommentMutatingId(null);
    }
  };

  const {
    latestStarredNotice,
    freePostsCount,
    newsletterCount,
    developmentLogCount,
    noticeItems,
    newsletterItems,
    developmentLogItems,
    adminDevelopmentLogItems,
  } = useMemo(() => buildNewsClientSummary(newsList, freePosts), [newsList, freePosts]);


  // Sync tab with URL query parameter on mount or url change
  useEffect(() => {
    const tabParam = getNewsTabFromSearchParams(searchParams);
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  useEffect(() => {
    const requestedNotice = findNoticeFromSearchParams(newsList, searchParams);
    if (!requestedNotice) return;

    setActiveTab("notice");
    setActiveViewNotice(requestedNotice);
  }, [newsList, searchParams]);

  useEffect(() => {
    const requestedNewsletter = findNewsletterFromSearchParams(newsList, searchParams);
    if (!requestedNewsletter) return;

    setActiveTab("newsletter");
  }, [newsList, searchParams]);

  // Sync state with server props
  useEffect(() => {
    setNewsList(initialNewsList);
  }, [initialNewsList]);

  useEffect(() => {
    setFreePosts(initialFreePosts);
  }, [initialFreePosts]);

  useEffect(() => {
    setFaqs(initialFaqs);
  }, [initialFaqs]);

  const handleTabClick = (tabId: NewsTabId) => {
    setActiveTab(tabId);
    router.push(`/news?tab=${tabId}`, { scroll: false });

    // 탭 클릭 시, 서브배지 바가 상단 글로벌 헤더(72px) 밑에 정밀하게 스티키 고정되도록 부드러운 스크롤 스냅 처리
    const navElement = document.getElementById("news-sub-nav");
    if (navElement) {
      const stickyThreshold = navElement.offsetTop - 72; // 상단 헤더 높이(72px) 보정
      window.scrollTo({
        top: stickyThreshold,
        behavior: "smooth"
      });
    }
  };

  return (
    <div className="w-full">
      {/* 대형 배너 (Hero Section) */}
      <section className="bg-gradient-to-br from-warm-canvas via-parchment-card to-stone-surface/30 pt-16 pb-20 border-b border-stone-surface text-center">
        <div className="site-container max-w-4xl px-4">
          <span className="inline-flex rounded-full bg-sky-blue/10 px-4 py-1.5 text-xs font-bold text-sky-blue uppercase tracking-wider">
            Cooperative News
          </span>
          <h1 className="mt-6 text-4xl sm:text-5xl font-black text-charcoal-primary leading-tight tracking-tight">
            투명하게 나누는<br />
            <span className="text-sky-blue">대방동의 소통 창구</span>
          </h1>
          <p className="mt-6 text-base sm:text-lg text-graphite/90 max-w-2xl mx-auto leading-relaxed">
            사업 진행 성과를 주/월간 단위로 신속하게 보고하고, 조합원들의 다양한 질문과 목소리를 적극 수용하여 어떠한 밀실 의사결정도 없이 바르게 가겠습니다.
          </p>
        </div>
      </section>

      {/* 3열 실시간 통합 소식 대시보드 */}
      <section className="py-8 bg-[#fdfdfc] border-b border-stone-surface/50">
        <div className="site-container max-w-4xl px-4">
          <div className="grid gap-6 md:grid-cols-3">
            {/* Card 1: 중요 공지 / 최신 공지 */}
            <div className="stone-card bg-white p-5 rounded-2xl border border-stone-surface border-t-4 border-t-ember-orange flex flex-col justify-between transition-all duration-200 hover:shadow-sm">
              <div>
                <span className="inline-flex rounded-full bg-ember-orange/10 px-2 py-0.5 text-[9px] font-bold text-ember-orange uppercase tracking-wider select-none">
                  📢 최신 공지 브리핑
                </span>
                {latestStarredNotice ? (
                  <div className="mt-3.5 space-y-1">
                    <h4 className="text-[12.5px] font-extrabold text-charcoal-primary leading-snug line-clamp-2">
                      {latestStarredNotice.isStarred && "★ "}{latestStarredNotice.title}
                    </h4>
                    <p className="text-[11px] text-graphite/85 line-clamp-2 font-normal leading-relaxed pt-0.5">
                      {getPlainNoticeText(latestStarredNotice.content)}
                    </p>
                  </div>
                ) : (
                  <p className="text-[11px] text-ash mt-4 font-normal select-none">최근 등록된 공지사항이 없습니다.</p>
                )}
              </div>
              {latestStarredNotice && (
                <div className="mt-5 pt-3 border-t border-stone-surface/60 flex items-center justify-between">
                  <span className="text-[10px] text-ash font-mono font-medium">등록일: {formatNoticeDate(latestStarredNotice.registeredAt ?? latestStarredNotice.createdAt)}</span>
                  <button
                    onClick={() => {
                      setActiveViewNotice(latestStarredNotice);
                    }}
                    className="text-[10.5px] font-bold text-ember-orange hover:underline cursor-pointer select-none"
                  >
                    공지 읽기 →
                  </button>
                </div>
              )}
            </div>

            {/* Card 2: 자유게시판 소통 */}
            <div className="stone-card bg-white p-5 rounded-2xl border border-stone-surface border-t-4 border-t-meadow-green flex flex-col justify-between transition-all duration-200 hover:shadow-sm">
              <div>
                <span className="inline-flex rounded-full bg-meadow-green/10 px-2 py-0.5 text-[9px] font-bold text-meadow-green uppercase tracking-wider select-none">
                  💬 소통 활성 지표
                </span>
                <div className="mt-3.5 space-y-2">
                  <h4 className="text-[12.5px] font-extrabold text-charcoal-primary leading-snug">
                    조합원 소통 아카이브
                  </h4>
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[11px] font-medium text-graphite">
                      <span>이번 주 누적 토론글</span>
                      <span className="font-bold text-meadow-green font-mono">+{freePostsCount}건</span>
                    </div>
                    <div className="flex justify-between items-center text-[11px] font-medium text-graphite">
                      <span>사무국 소통 피드백율</span>
                      <span className="font-extrabold text-meadow-green font-mono">100%</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-5 pt-3 border-t border-stone-surface/60 flex items-center justify-between">
                <span className="text-[10px] text-ash font-mono font-medium">실시간 연동 중</span>
                <button
                  onClick={() => handleTabClick("free")}
                  className="text-[10.5px] font-bold text-meadow-green hover:underline cursor-pointer select-none"
                >
                  참여하기 →
                </button>
              </div>
            </div>

            {/* Card 3: 마일스톤 게이지 */}
            <div className="stone-card bg-white p-5 rounded-2xl border border-stone-surface border-t-4 border-t-sky-blue flex flex-col justify-between transition-all duration-200 hover:shadow-sm">
              <div>
                <span className="inline-flex rounded-full bg-sky-blue/10 px-2 py-0.5 text-[9px] font-bold text-sky-blue uppercase tracking-wider select-none">
                  📅 사업 추진 마일스톤
                </span>
                <div className="mt-3.5 space-y-3">
                  <h4 className="text-[12.5px] font-extrabold text-charcoal-primary leading-snug">
                    인허가 시행율: <span className="text-sky-blue font-mono">지구단위 완료 기준</span>
                  </h4>
                  {/* 미니 게이지 바 */}
                  <div className="space-y-1">
                    <div className="w-full bg-stone-surface rounded-full h-1.5 overflow-hidden">
                      <div className="bg-sky-blue h-1.5 rounded-full transition-all duration-500" style={{ width: "33%" }}></div>
                    </div>
                    <div className="text-[8.5px] font-bold text-ash tracking-tight font-mono select-none">
                      <span>지구단위(완료)</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-5 pt-3 border-t border-stone-surface/60 flex items-center justify-between">
                <span className="text-[10px] text-ash font-mono font-medium">
                  {newsletterCount > 0 ? `뉴스레터 ${newsletterCount}집 발행` : "뉴스레터 제1호 오픈 예정"}
                  {developmentLogCount > 0 ? ` · 개발일지 ${developmentLogCount}건` : ""}
                </span>
                <button
                  onClick={() => handleTabClick("newsletter")}
                  className="text-[10.5px] font-bold text-sky-blue hover:underline cursor-pointer select-none"
                >
                  소식지 보기 →
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 스티키 서브 내비게이션 탭 바 (Sticky Sub Nav) - 공개자료와 동일 */}
      <nav id="news-sub-nav" className="sticky top-18 z-10 bg-warm-canvas/90 backdrop-blur border-b border-stone-surface shadow-xs transition-all duration-200 py-2">
        <div className="site-container max-w-4xl px-4 relative">
          {/* 우측 페이드 아웃 그라데이션 오버레이 (모바일용 가로 스크롤 시각 유도) */}
          <div className="absolute right-4 top-0 bottom-0 w-12 bg-gradient-to-l from-warm-canvas via-warm-canvas/60 to-transparent pointer-events-none z-10 md:hidden animate-in fade-in" />
          
          <div className="flex justify-start md:justify-center items-center gap-1 sm:gap-4 overflow-x-auto whitespace-nowrap scrollbar-none py-1.5 text-sm font-semibold pr-12 md:pr-0">
            {menuItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={cn(
                    "px-4 py-2 rounded-full text-xs sm:text-sm transition-all duration-200 cursor-pointer font-bold flex items-center gap-1.5",
                    isActive
                      ? "bg-midnight text-white shadow-sm"
                      : "text-graphite hover:text-charcoal-primary hover:bg-stone-surface/50"
                  )}
                >
                  {item.label}
                  {item.isSecure && (
                    <span className={cn(
                      "text-[11px] font-mono shrink-0 select-none",
                      isLoggedIn
                        ? isActive ? "text-meadow-green" : "text-meadow-green/75"
                        : isActive ? "text-amber-300" : "text-ember-orange/75"
                    )}>
                      {isLoggedIn ? "🔓" : "🔒"}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* 본문 통합 내용 영역 (Sections) - 선택된 탭 독점 렌더링 */}
      <div className="site-container max-w-4xl px-4 py-10 sm:py-14 min-h-[75vh]">
            
        {/* 1. 공지사항 */}
        {activeTab === "notice" && (
          <section id="section-notice" className="space-y-4 animate-in fade-in duration-200">
            <NoticeBoard
              isLoggedIn={isLoggedIn}
              isAdmin={isAdmin}
              newsList={noticeItems}
              onViewNotice={setActiveViewNotice}
              onRefresh={async () => {
                const res = await fetch("/api/news?category=NOTICE");
                const data = await res.json();
                if (data.newsList) {
                  setNewsList((prev) => mergeNewsCategoryRefresh(prev, data.newsList, "NOTICE"));
                }
              }}
            />
          </section>
        )}

        {/* 2. 자유게시판 */}
        {activeTab === "free" && (
          <section id="section-free" className="space-y-4 animate-in fade-in duration-200">
            {isLoggedIn ? (
              <FreeBoard
                session={session}
                posts={freePosts}
                onRefresh={async () => {
                  const res = await fetch("/api/news/free");
                  const data = await res.json();
                  if (data.posts) setFreePosts(data.posts);
                }}
              />
            ) : (
              <>
                <div className="pb-3 border-b border-[#f2f0ed] flex justify-between items-end">
                  <div>
                    <h3 className="text-base font-black text-charcoal-primary flex items-center gap-2">
                      <span>💬</span> 자유게시판
                    </h3>
                    <p className="text-[10px] text-ash font-medium mt-0.5 font-mono">
                      Cooperative Community Board
                    </p>
                  </div>
                  <span className="text-[10px] font-bold rounded-full px-2.5 py-0.5 select-none text-ember-orange bg-ember-orange/10 border border-ember-orange/20">
                    조합원 기밀 🔒
                  </span>
                </div>
                <NewsSectionLockTab label="자유게시판" router={router} />
              </>
            )}
          </section>
        )}

        {/* 3. FAQ */}
        {activeTab === "faq" && (
          <section id="section-faq" className="space-y-4 animate-in fade-in duration-200">
            <div className="pb-3 border-b border-[#f2f0ed] flex justify-between items-end">
              <div>
                <h3 className="text-base font-black text-charcoal-primary flex items-center gap-2">
                  <span>❓</span> FAQ (자주 묻는 질문)
                </h3>
                <p className="text-[10px] text-ash font-medium mt-0.5 font-mono">
                  Frequently Asked Questions
                </p>
              </div>
              <span className={cn(
                "text-[10px] font-bold rounded-full px-2.5 py-0.5 select-none",
                isLoggedIn 
                  ? "text-meadow-green bg-meadow-green/10 border border-meadow-green/20" 
                  : "text-ember-orange bg-ember-orange/10 border border-ember-orange/20"
              )}>
                {isLoggedIn ? "조합원 인증 완료 🔓" : "조합원 기밀 🔒"}
              </span>
            </div>

            {isLoggedIn ? (
              <FaqAccordion
                isLoggedIn={isLoggedIn}
                isAdmin={isAdmin}
                faqs={faqs}
                onRefresh={async () => {
                  const res = await fetch("/api/news/faq");
                  const data = await res.json();
                  if (data.faqs) setFaqs(data.faqs);
                }}
              />
            ) : (
              <NewsSectionLockTab label="FAQ 자주 묻는 질문" router={router} />
            )}
          </section>
        )}

        {/* 4. 조합뉴스 (주/월간소식) */}
        {activeTab === "newsletter" && (
          <section id="section-newsletter" className="space-y-4 animate-in fade-in duration-200">
            <div className="pb-3 border-b border-[#f2f0ed] flex justify-between items-end">
              <div>
                <h3 className="text-base font-black text-charcoal-primary flex items-center gap-2">
                  <span>📅</span> 조합뉴스 (주/월간소식)
                </h3>
                <p className="text-[10px] text-ash font-medium mt-0.5 font-mono">
                  Weekly & Monthly Newsletters
                </p>
              </div>
              <span className="text-[10px] font-bold text-sky-blue bg-sky-blue/10 border border-sky-blue/20 rounded-full px-2.5 py-0.5 select-none">
                전체 공개 🔓
              </span>
            </div>

            <CoopNewsletter
              isLoggedIn={isLoggedIn}
              isAdmin={isAdmin}
              newsList={newsletterItems}
              initialOpenNewsId={requestedNewsletterFromUrl?.id ?? initialNewsletterFromUrl?.id ?? null}
              onRefresh={async () => {
                const res = await fetch("/api/news?category=WEEKLY_MONTHLY");
                const data = await res.json();
                if (data.newsList) {
                  setNewsList((prev) => mergeNewsCategoryRefresh(prev, data.newsList, "WEEKLY_MONTHLY"));
                }
              }}
            />
          </section>
        )}

        {/* 5. 개발일지 */}
        {activeTab === "development" && (
          <section id="section-development" className="space-y-4 animate-in fade-in duration-200">
            <DevelopmentLog
              isAdmin={isAdmin}
              session={session}
              logs={isAdmin ? adminDevelopmentLogItems : developmentLogItems}
              onRefresh={async () => {
                const res = await fetch("/api/news");
                const data = await res.json();
                if (data.newsList) setNewsList(data.newsList);
              }}
            />
          </section>
        )}

      </div>

      {/* 좌측 사이드 슬라이드 오버 (Drawer) 패널 - 공지사항 상세 열람 */}
      {mounted && activeViewNotice && createPortal(
        <>
          <div
            onClick={() => setActiveViewNotice(null)}
            className="fixed inset-0 z-[120] bg-black/35 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
          />

          <div
            className="fixed inset-y-0 left-0 z-[130] w-full max-w-2xl bg-warm-canvas border-r border-stone-surface shadow-2xl p-6 sm:p-8 flex flex-col overflow-y-auto animate-in slide-in-from-left duration-300 ease-out"
            aria-label="공지사항 상세 드로어"
          >
            <div className="flex items-center justify-between pb-6 border-b border-stone-surface">
              <div className="flex items-center gap-2">
                <span className="flex size-7 items-center justify-center rounded-full bg-midnight text-xs font-semibold text-white">
                  📢
                </span>
                <div>
                  <h2 className="text-base font-bold text-charcoal-primary">
                    공지사항 열람
                  </h2>
                  <p className="text-[11px] text-ash mt-0.5 font-medium">
                    대방동 지역주택조합 공식 안내
                  </p>
                </div>
              </div>
              
              <button
                onClick={() => setActiveViewNotice(null)}
                className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full border border-stone-surface bg-[#f8f7f4] text-xs font-medium text-graphite hover:bg-stone-surface active:bg-[#e8e6e1] transition duration-200 cursor-pointer"
              >
                <svg className="w-3.5 h-3.5 text-ash" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
                닫기
              </button>
            </div>

            <div className="flex-1 mt-6 space-y-6">
              {isEditingNotice ? (
                <form onSubmit={saveNoticeEdit} className="space-y-5">
                  <div className="flex items-center justify-between gap-3 border-b border-stone-surface pb-3">
                    <h3 className="text-sm font-black text-charcoal-primary">공지사항 수정</h3>
                    <button
                      type="button"
                      onClick={() => setIsEditingNotice(false)}
                      className="rounded-full border border-stone-surface bg-white px-3 py-1.5 text-[11px] font-bold text-graphite hover:bg-stone-surface"
                    >
                      수정 취소
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="edit-notice-display-author" className="text-[11px] font-bold text-charcoal-primary font-mono block">
                      공지 작성자
                    </label>
                    <select
                      id="edit-notice-display-author"
                      value={editDisplayAuthorName}
                      onChange={(e) => setEditDisplayAuthorName(e.target.value as NewsDisplayAuthorName)}
                      className="w-full rounded-xl border border-stone-surface bg-white px-4 py-2.5 text-xs font-bold text-charcoal-primary outline-none transition focus:border-sky-blue focus:ring-1 focus:ring-sky-blue/30"
                    >
                      {NEWS_DISPLAY_AUTHOR_NAMES.map((name) => (
                        <option key={name} value={name}>
                          {name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-charcoal-primary font-mono block">
                      공지 제목 *
                    </label>
                    <input
                      type="text"
                      required
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full rounded-xl border border-stone-surface bg-white px-4 py-2.5 text-xs text-charcoal-primary outline-none transition focus:border-sky-blue focus:ring-1 focus:ring-sky-blue/30"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-charcoal-primary font-mono block">
                      공지 내용 *
                    </label>
                    <NoticeRichEditor
                      value={editContent}
                      onChange={setEditContent}
                      onUploadImage={(file) => uploadPublicFile(file, "image")}
                      ariaLabel="공지 내용 편집창"
                      placeholder="공지사항 세부 내용을 상세히 기술해 주십시오."
                    />
                    <p className="text-[10px] font-medium text-ash">
                      이미지 버튼 또는 Ctrl+V로 본문에 이미지를 넣고, 이미지를 선택하면 크기를 조절할 수 있습니다.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="edit-notice-registered-at" className="text-[11px] font-bold text-charcoal-primary font-mono block">
                      등록일
                    </label>
                    <input
                      id="edit-notice-registered-at"
                      aria-label="등록일"
                      type="datetime-local"
                      value={editRegisteredAt}
                      onChange={(e) => setEditRegisteredAt(e.target.value)}
                      className="w-full rounded-xl border border-stone-surface bg-white px-4 py-2.5 text-xs text-charcoal-primary outline-none transition focus:border-sky-blue focus:ring-1 focus:ring-sky-blue/30"
                    />
                  </div>

                  <div className="flex items-center gap-2.5 py-1 select-none">
                    <input
                      type="checkbox"
                      id="edit-star-checkbox"
                      checked={editIsStarred}
                      onChange={(e) => setEditIsStarred(e.target.checked)}
                      className="size-4.5 border border-stone-surface rounded focus:ring-sky-blue/30 text-midnight cursor-pointer bg-white"
                    />
                    <label htmlFor="edit-star-checkbox" className="text-[11.5px] font-extrabold text-graphite/95 cursor-pointer font-mono">
                      중요 공지사항으로 상단 고정 표시 (★)
                    </label>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="edit-notice-attachment-file" className="text-[11px] font-bold text-charcoal-primary font-mono block">
                      첨부파일 (선택)
                    </label>
                    {editAttachmentPath && (
                      <div className="flex items-center justify-between gap-3 rounded-xl border border-stone-surface bg-white px-3 py-2 text-[11px] font-bold text-graphite">
                        <span>현재 첨부파일: {editAttachmentName || "다운로드"}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setEditAttachmentPath(null);
                            setEditAttachmentName(null);
                            setEditAttachmentSize(null);
                          }}
                          className="rounded-full bg-stone-surface px-2.5 py-1 text-[10px] font-bold text-graphite"
                        >
                          첨부 제거
                        </button>
                      </div>
                    )}
                    <input
                      id="edit-notice-attachment-file"
                      type="file"
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.hwp,.hwpx,.zip"
                      onChange={(e) => setEditAttachmentFile(e.target.files?.[0] || null)}
                      className="w-full rounded-xl border border-stone-surface bg-white px-4 py-2.5 text-xs text-charcoal-primary file:mr-3 file:rounded-full file:border-0 file:bg-stone-surface file:px-3 file:py-1 file:text-[10px] file:font-bold file:text-graphite"
                    />
                    {editAttachmentFile && (
                      <p className="text-[10px] font-bold text-sky-blue">
                        새 첨부파일: {editAttachmentFile.name}
                      </p>
                    )}
                  </div>

                  <div className="flex justify-end gap-2 border-t border-stone-surface pt-5">
                    <Button
                      type="submit"
                      disabled={isSavingNotice}
                      className="rounded-full bg-midnight hover:bg-black text-white text-xs font-bold px-6 h-10 cursor-pointer disabled:opacity-50"
                    >
                      {isSavingNotice ? "저장 중..." : "수정사항 저장"}
                    </Button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-xl font-extrabold text-charcoal-primary leading-snug">
                        {activeViewNotice.isStarred && (
                          <span className="inline-flex items-center justify-center rounded bg-amber-500/15 text-amber-600 text-[10px] font-bold px-1.5 py-0.5 select-none shrink-0 border border-amber-500/20 mr-1.5 align-middle">
                            ★ 중요
                          </span>
                        )}
                        {activeViewNotice.title}
                      </h3>
                      {isEditableNotice && (
                        <button
                          type="button"
                          onClick={beginNoticeEdit}
                          className="shrink-0 rounded-full border border-stone-surface bg-white px-3 py-1.5 text-[11px] font-bold text-graphite hover:bg-stone-surface"
                        >
                          수정
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-[11px] font-bold text-ash font-mono border-y border-stone-surface/65 py-2.5">
                      <span>📂 분류: 조합 공지사항</span>
                      <span>•</span>
                      <span>작성자: {activeViewNotice.author?.name || "조합 사무국"}</span>
                      <span>•</span>
                      <span>등록일: {formatNoticeDate(activeViewNotice.registeredAt ?? activeViewNotice.createdAt)}</span>
                    </div>
                  </div>

                  <div className="text-sm text-graphite/95 leading-8 font-normal pt-2">
                    {activeViewNotice.imagePath && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={activeViewNotice.imagePath}
                        alt=""
                        className="mb-4 max-h-80 w-full rounded-2xl object-cover border border-stone-surface"
                      />
                    )}
                    <NoticeRichContent content={activeViewNotice.content} />
                  </div>
                  {activeViewNotice.attachmentPath && (
                    <a
                      href={activeViewNotice.attachmentPath}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between gap-3 rounded-2xl border border-stone-surface bg-white px-4 py-3 text-xs font-bold text-charcoal-primary hover:border-sky-blue"
                    >
                      <span>첨부파일: {activeViewNotice.attachmentName || "다운로드"}</span>
                      <span className="text-[10px] text-sky-blue">열기</span>
                    </a>
                  )}

                  <section className="border-t border-stone-surface pt-5 space-y-4">
                    <div className="flex items-center justify-between gap-3">
                      <h4 className="text-sm font-black text-charcoal-primary">
                        댓글 {getNewsComments(activeViewNotice).length}개
                      </h4>
                      <span className="text-[10px] font-bold text-ash">
                        공식 공지 확인 의견
                      </span>
                    </div>

                    {getNewsComments(activeViewNotice).length === 0 ? (
                      <div className="rounded-2xl border border-stone-surface bg-white px-4 py-5 text-center">
                        <p className="text-[11px] font-medium text-ash">
                          아직 등록된 댓글이 없습니다. 첫 확인 의견을 남겨보세요.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {buildShallowCommentTree(getNewsComments(activeViewNotice)).map((comment) => {
                          const repliesExpanded = expandedNoticeReplies[comment.id] || false;
                          return (
                          <article key={comment.id} className="rounded-2xl border border-stone-surface bg-white px-4 py-3.5">
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-2">
                                <span className="flex size-6 items-center justify-center rounded-full bg-sky-blue/10 text-[10px] font-black text-sky-blue">
                                  말
                                </span>
                                <span className="text-[11px] font-black text-charcoal-primary">
                                  {getNoticeCommentAuthorName(comment)}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-[9.5px] font-mono font-bold text-ash">
                                  {formatNoticeDate(comment.createdAt)}
                                </span>
                                {canMutateNoticeComment(comment) && (
                                  <div className="flex items-center gap-1">
                                    <button
                                      type="button"
                                      aria-label="댓글 수정"
                                      onClick={() => beginNoticeCommentEdit(comment)}
                                      className="rounded-full border border-stone-surface bg-[#f8f7f4] px-2 py-0.5 text-[9.5px] font-bold text-graphite hover:bg-stone-surface"
                                    >
                                      수정
                                    </button>
                                    <button
                                      type="button"
                                      aria-label="댓글 삭제"
                                      onClick={() => void deleteNoticeComment(comment)}
                                      disabled={noticeCommentMutatingId === comment.id}
                                      className="rounded-full border border-coral-red/20 bg-coral-red/10 px-2 py-0.5 text-[9.5px] font-bold text-coral-red hover:bg-coral-red/15 disabled:opacity-60"
                                    >
                                      삭제
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                            {editingNoticeCommentId === comment.id ? (
                              <div className="mt-3 space-y-2">
                                {isAdmin && (
                                  <div className="space-y-1">
                                    <label htmlFor={`notice-comment-edit-author-${comment.id}`} className="text-[10px] font-bold text-charcoal-primary font-mono">
                                      댓글 수정 작성자
                                    </label>
                                    <select
                                      id={`notice-comment-edit-author-${comment.id}`}
                                      aria-label="댓글 수정 작성자"
                                      value={editNoticeCommentDisplayAuthorName}
                                      onChange={(event) => setEditNoticeCommentDisplayAuthorName(event.target.value as NewsDisplayAuthorName)}
                                      className="h-8 rounded-xl border border-stone-surface bg-white px-3 text-[11px] font-bold text-charcoal-primary outline-none transition focus:border-sky-blue focus:ring-1 focus:ring-sky-blue/30"
                                    >
                                      {NEWS_DISPLAY_AUTHOR_NAMES.map((name) => (
                                        <option key={name} value={name}>
                                          {name}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                )}
                                <label htmlFor={`notice-comment-edit-${comment.id}`} className="sr-only">
                                  댓글 수정 내용
                                </label>
                                <textarea
                                  id={`notice-comment-edit-${comment.id}`}
                                  aria-label="댓글 수정 내용"
                                  value={editNoticeCommentContent}
                                  onChange={(event) => setEditNoticeCommentContent(event.target.value)}
                                  rows={3}
                                  className="w-full resize-none rounded-xl border border-stone-surface bg-[#fbfaf9] px-3 py-2.5 text-xs text-charcoal-primary placeholder:text-ash outline-none transition focus:border-sky-blue focus:ring-1 focus:ring-sky-blue/30"
                                />
                                <div className="flex justify-end gap-2">
                                  <button
                                    type="button"
                                    onClick={() => setEditingNoticeCommentId(null)}
                                    className="rounded-full border border-stone-surface bg-white px-3 py-1.5 text-[11px] font-bold text-graphite hover:bg-stone-surface"
                                  >
                                    취소
                                  </button>
                                  <Button
                                    type="button"
                                    onClick={() => void saveNoticeCommentEdit(comment)}
                                    disabled={noticeCommentMutatingId === comment.id}
                                    className="rounded-full bg-midnight hover:bg-black text-white text-xs font-bold px-4 h-8 cursor-pointer disabled:opacity-50"
                                  >
                                    수정 완료
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <p className="mt-2.5 text-[12px] leading-relaxed text-graphite font-normal whitespace-pre-wrap">
                                {comment.content}
                              </p>
                            )}
                            <div className="mt-2 flex flex-wrap items-center gap-2">
                              {canCommentOnNotice && isLoggedIn && (
                                <button
                                  type="button"
                                  aria-label="답글 작성"
                                  onClick={() => setReplyingNoticeCommentId((prev) => prev === comment.id ? null : comment.id)}
                                  className="rounded-full px-2 py-0.5 text-[10px] font-extrabold text-graphite hover:bg-stone-surface"
                                >
                                  답글
                                </button>
                              )}
                              {comment.replies.length > 0 && (
                                <button
                                  type="button"
                                  onClick={() => setExpandedNoticeReplies((prev) => ({ ...prev, [comment.id]: !repliesExpanded }))}
                                  className="rounded-full bg-sky-blue/10 px-2.5 py-1 text-[10px] font-extrabold text-sky-blue hover:bg-sky-blue/15"
                                >
                                  답글 {comment.replies.length}개 {repliesExpanded ? "숨기기" : "보기"}
                                </button>
                              )}
                            </div>

                            {repliesExpanded && comment.replies.length > 0 && (
                              <div className="mt-3 space-y-2 border-l-2 border-stone-surface pl-3">
                                {comment.replies.map((reply) => (
                                  <div key={reply.id} className="rounded-xl bg-[#f8f7f4] px-3 py-2.5">
                                    <div className="mb-1.5 flex items-center justify-between gap-2 text-[9px] font-bold text-ash font-mono">
                                      <span>작성자: {getNoticeCommentAuthorName(reply)}</span>
                                      <div className="flex items-center gap-2">
                                        <span>{formatNoticeDate(reply.createdAt)}</span>
                                        {canMutateNoticeComment(reply) && (
                                          <>
                                            <button
                                              type="button"
                                              aria-label="댓글 수정"
                                              onClick={() => beginNoticeCommentEdit(reply)}
                                              className="rounded-full border border-stone-surface bg-white px-2 py-0.5 text-[9px] font-bold text-graphite hover:bg-stone-surface"
                                            >
                                              수정
                                            </button>
                                            <button
                                              type="button"
                                              aria-label="댓글 삭제"
                                              onClick={() => void deleteNoticeComment(reply)}
                                              disabled={noticeCommentMutatingId === reply.id}
                                              className="rounded-full bg-coral-red/10 px-2 py-0.5 text-[9px] font-bold text-coral-red disabled:opacity-60"
                                            >
                                              삭제
                                            </button>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                    {editingNoticeCommentId === reply.id ? (
                                      <div className="space-y-2">
                                        <label htmlFor={`notice-comment-edit-${reply.id}`} className="sr-only">
                                          댓글 수정 내용
                                        </label>
                                        <textarea
                                          id={`notice-comment-edit-${reply.id}`}
                                          aria-label="댓글 수정 내용"
                                          value={editNoticeCommentContent}
                                          onChange={(event) => setEditNoticeCommentContent(event.target.value)}
                                          rows={3}
                                          className="w-full resize-none rounded-xl border border-stone-surface bg-white px-3 py-2.5 text-xs text-charcoal-primary placeholder:text-ash outline-none transition focus:border-sky-blue focus:ring-1 focus:ring-sky-blue/30"
                                        />
                                        <div className="flex justify-end gap-2">
                                          <button
                                            type="button"
                                            onClick={() => setEditingNoticeCommentId(null)}
                                            className="rounded-full border border-stone-surface bg-white px-3 py-1.5 text-[11px] font-bold text-graphite hover:bg-stone-surface"
                                          >
                                            취소
                                          </button>
                                          <Button
                                            type="button"
                                            onClick={() => void saveNoticeCommentEdit(reply)}
                                            disabled={noticeCommentMutatingId === reply.id}
                                            className="rounded-full bg-midnight hover:bg-black text-white text-xs font-bold px-4 h-8 cursor-pointer disabled:opacity-50"
                                          >
                                            수정 완료
                                          </Button>
                                        </div>
                                      </div>
                                    ) : (
                                      <p className="text-[12px] text-graphite/90 font-normal leading-relaxed whitespace-pre-wrap">
                                        {reply.content}
                                      </p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}

                            {replyingNoticeCommentId === comment.id && canCommentOnNotice && (
                              <div className="mt-3 space-y-2 border-l-2 border-sky-blue/30 pl-3">
                                {isAdmin && (
                                  <div className="space-y-1">
                                    <label htmlFor={`notice-reply-author-${comment.id}`} className="text-[10px] font-bold text-charcoal-primary font-mono">
                                      답글 작성자
                                    </label>
                                    <select
                                      id={`notice-reply-author-${comment.id}`}
                                      aria-label="답글 작성자"
                                      value={noticeCommentDisplayAuthorName}
                                      onChange={(event) => setNoticeCommentDisplayAuthorName(event.target.value as NewsDisplayAuthorName)}
                                      className="h-8 rounded-xl border border-stone-surface bg-white px-3 text-[11px] font-bold text-charcoal-primary outline-none transition focus:border-sky-blue focus:ring-1 focus:ring-sky-blue/30"
                                    >
                                      {NEWS_DISPLAY_AUTHOR_NAMES.map((name) => (
                                        <option key={name} value={name}>
                                          {name}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                )}
                                <div className="flex gap-2">
                                  <input
                                    type="text"
                                    placeholder="공지 댓글에 답글을 작성해 주세요…"
                                    value={noticeReplyContents[comment.id] || ""}
                                    onChange={(event) => setNoticeReplyContents((prev) => ({ ...prev, [comment.id]: event.target.value }))}
                                    onKeyDown={(event) => {
                                      if (event.key === "Enter") {
                                        void submitNoticeComment(null, comment.id);
                                      }
                                    }}
                                    className="flex-1 rounded-xl border border-stone-surface bg-white px-3 py-2 text-[12px] text-charcoal-primary placeholder:text-ash outline-none transition focus:border-sky-blue"
                                  />
                                  <Button
                                    type="button"
                                    onClick={() => void submitNoticeComment(null, comment.id)}
                                    disabled={isSubmittingNoticeComment}
                                    className="rounded-xl bg-midnight px-3 text-[11px] font-bold text-white disabled:opacity-50"
                                  >
                                    답글 등록
                                  </Button>
                                </div>
                              </div>
                            )}
                          </article>
                          );
                        })}
                      </div>
                    )}

                    {isLoggedIn ? (
                      canCommentOnNotice ? (
                        <form onSubmit={(event) => void submitNoticeComment(event)} className="rounded-2xl border border-stone-surface bg-white p-3.5 space-y-3">
                          {isAdmin && (
                            <div className="space-y-1.5">
                              <label htmlFor="notice-comment-author" className="text-[10px] font-bold text-charcoal-primary font-mono">
                                댓글 작성자
                              </label>
                              <select
                                id="notice-comment-author"
                                aria-label="댓글 작성자"
                                value={noticeCommentDisplayAuthorName}
                                onChange={(event) => setNoticeCommentDisplayAuthorName(event.target.value as NewsDisplayAuthorName)}
                                className="h-9 rounded-xl border border-stone-surface bg-white px-3 text-[11px] font-bold text-charcoal-primary outline-none transition focus:border-sky-blue focus:ring-1 focus:ring-sky-blue/30"
                              >
                                {NEWS_DISPLAY_AUTHOR_NAMES.map((name) => (
                                  <option key={name} value={name}>
                                    {name}
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}
                          <label htmlFor="notice-comment" className="sr-only">
                            공지사항 댓글 작성
                          </label>
                          <textarea
                            id="notice-comment"
                            value={noticeCommentContent}
                            onChange={(e) => setNoticeCommentContent(e.target.value)}
                            placeholder="공지에 대한 확인 의견이나 질문을 남겨주세요…"
                            rows={3}
                            className="w-full resize-none rounded-xl border border-stone-surface bg-[#fbfaf9] px-3 py-2.5 text-xs text-charcoal-primary placeholder:text-ash outline-none transition focus:border-sky-blue focus:ring-1 focus:ring-sky-blue/30"
                          />
                          <div className="flex justify-end">
                            <Button
                              type="submit"
                              disabled={isSubmittingNoticeComment}
                              className="rounded-full bg-midnight hover:bg-black text-white text-xs font-bold px-5 h-9 cursor-pointer disabled:opacity-50"
                            >
                              {isSubmittingNoticeComment ? "등록 중..." : "댓글 등록"}
                            </Button>
                          </div>
                        </form>
                      ) : (
                        <div className="rounded-2xl border border-stone-surface bg-white px-4 py-3 text-[11px] font-medium text-ash">
                          예시 공지에는 댓글을 저장하지 않습니다. 실제 등록된 공지에서 의견을 남길 수 있습니다.
                        </div>
                      )
                    ) : (
                      <div className="rounded-2xl border border-stone-surface bg-white px-4 py-3 text-[11px] font-medium text-ash">
                        댓글 작성은 조합원 로그인 후 가능합니다.
                      </div>
                    )}
                  </section>
                </>
              )}
            </div>
          </div>
        </>,
        document.body
      )}
    </div>
  );
}
