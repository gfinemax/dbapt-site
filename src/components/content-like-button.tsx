"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { ContentReactionTargetType } from "@/lib/content-reactions";

type ContentLikeButtonProps = {
  targetType: ContentReactionTargetType;
  targetId: string;
  title: string;
  initialLikeCount?: number | null;
  initialLikedByCurrentUser?: boolean | null;
  canLike: boolean;
  className?: string;
  onLikeChange?: (targetId: string, likeCount: number, likedByCurrentUser: boolean) => void;
};

function buildLikeLabel(title: string, likeCount: number, likedByCurrentUser: boolean) {
  return `${title} 공감 ${likeCount}개${likedByCurrentUser ? " 선택됨" : ""}`;
}

export function ContentLikeButton({
  targetType,
  targetId,
  title,
  initialLikeCount = 0,
  initialLikedByCurrentUser = false,
  canLike,
  className,
  onLikeChange,
}: ContentLikeButtonProps) {
  const [likeCount, setLikeCount] = useState(initialLikeCount ?? 0);
  const [likedByCurrentUser, setLikedByCurrentUser] = useState(!!initialLikedByCurrentUser);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleLike = async () => {
    if (!canLike) {
      alert("로그인 후 공감을 누를 수 있습니다.");
      return;
    }
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/content-reactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetType, targetId }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        alert(data.error || "공감 처리에 실패했습니다.");
        return;
      }

      const nextCount = typeof data.likeCount === "number" ? data.likeCount : likeCount;
      const nextLiked = !!data.likedByCurrentUser;
      setLikeCount(nextCount);
      setLikedByCurrentUser(nextLiked);
      onLikeChange?.(targetId, nextCount, nextLiked);
    } catch (error) {
      console.error(error);
      alert("공감 처리 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <button
      type="button"
      aria-label={buildLikeLabel(title, likeCount, likedByCurrentUser)}
      onClick={(event) => {
        event.stopPropagation();
        void toggleLike();
      }}
      disabled={isSubmitting}
      title={canLike ? "공감 누르기" : "로그인 후 공감을 누를 수 있습니다."}
      className={cn(
        "inline-flex min-w-[78px] items-center justify-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold transition hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-60",
        likedByCurrentUser
          ? "border-ember-orange/30 bg-ember-orange/10 text-ember-orange shadow-[0_0_0_1px_rgba(255,62,0,0.08)_inset]"
          : "border-stone-surface bg-white text-graphite hover:border-ember-orange/30 hover:bg-ember-orange/5 hover:text-ember-orange",
        className,
      )}
    >
      <span aria-hidden="true" className="text-[12px] leading-none">
        {likedByCurrentUser ? "🧡" : "👍"}
      </span>
      <span>공감</span>
      <span>{likeCount}</span>
    </button>
  );
}
