"use client";

import { useState } from "react";
import type { MouseEvent } from "react";
import { cn } from "@/lib/utils";

type PersonalBookmarkButtonProps = {
  title: string;
  targetType: "COOP_NEWS" | "FREE_POST";
  targetId: string;
  initialBookmarked?: boolean;
  className?: string;
};

export function PersonalBookmarkButton({
  title,
  targetType,
  targetId,
  initialBookmarked = false,
  className,
}: PersonalBookmarkButtonProps) {
  const [isBookmarked, setIsBookmarked] = useState(initialBookmarked);
  const [isSaving, setIsSaving] = useState(false);

  const handleToggle = async (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    const nextBookmarked = !isBookmarked;
    setIsSaving(true);
    try {
      const response = await fetch(
        nextBookmarked
          ? "/api/me/content-bookmarks"
          : `/api/me/content-bookmarks?targetType=${encodeURIComponent(targetType)}&targetId=${encodeURIComponent(targetId)}`,
        {
          method: nextBookmarked ? "POST" : "DELETE",
          headers: nextBookmarked ? { "Content-Type": "application/json" } : undefined,
          body: nextBookmarked ? JSON.stringify({ targetType, targetId }) : undefined,
        },
      );
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        alert(body.error || "개인자료실 보관 상태를 변경하지 못했습니다.");
        return;
      }
      setIsBookmarked(nextBookmarked);
    } catch (error) {
      console.error(error);
      alert("개인자료실 보관 상태 변경 중 문제가 발생했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <button
      type="button"
      aria-label={`${title} 개인자료실 ${isBookmarked ? "보관 해제" : "보관"}`}
      onClick={handleToggle}
      disabled={isSaving}
      className={cn(
        "rounded-full border px-2.5 py-1 text-[10px] font-bold transition-colors disabled:opacity-60",
        isBookmarked
          ? "border-ember-orange/25 bg-ember-orange/10 text-ember-orange hover:bg-ember-orange/15"
          : "border-stone-surface bg-white text-graphite hover:border-ember-orange/30 hover:text-ember-orange",
        className,
      )}
    >
      {isSaving ? "저장 중" : isBookmarked ? "보관됨" : "보관"}
    </button>
  );
}
