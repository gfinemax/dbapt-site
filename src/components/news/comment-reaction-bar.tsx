"use client";

import { useMemo, useState } from "react";
import {
  COMMENT_REACTION_EMOJIS,
  type CommentReactionSummaryItem,
  type CommentReactionTargetType,
} from "@/lib/news/comment-reactions";
import { cn } from "@/lib/utils";

type CommentReactionBarProps = {
  targetType: CommentReactionTargetType;
  targetId: string;
  reactionSummary?: CommentReactionSummaryItem[];
  canReact: boolean;
  onReactionSummaryChange?: (targetId: string, reactionSummary: CommentReactionSummaryItem[]) => void;
};

const quickEmojis = ["👍", "❤️", "👏", "✅"] as const;

const emojiLabels: Record<string, string> = {
  "👍": "좋아요",
  "❤️": "마음",
  "👏": "박수",
  "✅": "확인",
  "🙏": "감사",
  "😊": "미소",
  "😍": "좋음",
  "😮": "놀람",
  "😢": "슬픔",
  "🤔": "생각",
  "😎": "멋짐",
  "💪": "응원",
  "👌": "오케이",
  "💛": "노랑 하트",
  "💚": "초록 하트",
  "💙": "파랑 하트",
  "💜": "보라 하트",
  "💔": "아쉬움",
};

function buildReactionButtonLabel(emoji: string, count: number, selected: boolean) {
  if (count > 0) {
    return `${emoji} 리액션 ${count}개${selected ? " 선택됨" : ""}`;
  }
  return `${emoji} 리액션 추가`;
}

export function CommentReactionBar({
  targetType,
  targetId,
  reactionSummary = [],
  canReact,
  onReactionSummaryChange,
}: CommentReactionBarProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [isSubmittingEmoji, setIsSubmittingEmoji] = useState<string | null>(null);

  const summaryByEmoji = useMemo(
    () => new Map(reactionSummary.map((item) => [item.emoji, item])),
    [reactionSummary],
  );
  const renderedEmojis = useMemo(() => {
    const ordered = [...reactionSummary.map((item) => item.emoji)];
    for (const emoji of quickEmojis) {
      if (!ordered.includes(emoji)) ordered.push(emoji);
    }
    return ordered.slice(0, 8);
  }, [reactionSummary]);
  const selectedEmoji = reactionSummary.find((item) => item.selectedByCurrentUser)?.emoji;
  const filteredPickerEmojis = COMMENT_REACTION_EMOJIS.filter((emoji) => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return true;
    return emoji.includes(normalizedQuery) || (emojiLabels[emoji] || "").toLowerCase().includes(normalizedQuery);
  });

  const toggleReaction = async (emoji: string) => {
    if (!canReact || isSubmittingEmoji) return;
    setIsSubmittingEmoji(emoji);
    try {
      const response = await fetch("/api/news/comment-reactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetType, targetId, emoji }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        alert(data.error || "리액션 처리에 실패했습니다.");
        return;
      }
      onReactionSummaryChange?.(targetId, data.reactionSummary || []);
      setPickerOpen(false);
      setQuery("");
    } catch (error) {
      console.error(error);
      alert("리액션 처리 중 오류가 발생했습니다.");
    } finally {
      setIsSubmittingEmoji(null);
    }
  };

  if (!canReact && reactionSummary.length === 0) return null;

  return (
    <div className="mt-2">
      <div className="flex flex-wrap items-center gap-1.5">
        {renderedEmojis.map((emoji) => {
          const summary = summaryByEmoji.get(emoji);
          const count = summary?.count || 0;
          const selected = !!summary?.selectedByCurrentUser;
          if (!canReact && count === 0) return null;
          return (
            <button
              key={emoji}
              type="button"
              aria-label={buildReactionButtonLabel(emoji, count, selected)}
              disabled={!canReact || !!isSubmittingEmoji}
              onClick={() => void toggleReaction(emoji)}
              className={cn(
                "inline-flex h-7 items-center gap-1 rounded-full border px-2 text-[11px] font-extrabold transition",
                selected
                  ? "border-sky-blue/40 bg-sky-blue/10 text-sky-blue"
                  : "border-stone-surface bg-white text-graphite hover:bg-stone-surface/70",
                !canReact && "cursor-default opacity-80",
              )}
            >
              <span aria-hidden="true">{emoji}</span>
              {count > 0 && <span>{count}</span>}
            </button>
          );
        })}
        {canReact && (
          <button
            type="button"
            aria-label="리액션 더보기"
            onClick={() => setPickerOpen(true)}
            className="inline-flex h-7 items-center justify-center rounded-full border border-stone-surface bg-[#f8f7f4] px-2.5 text-[11px] font-black text-graphite transition hover:bg-stone-surface"
          >
            +
          </button>
        )}
      </div>

      {pickerOpen && (
        <div className="fixed inset-0 z-[180] flex items-center justify-center bg-black/25 px-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-label="리액션 선택"
            className="w-full max-w-sm rounded-3xl border border-stone-surface bg-white p-4 shadow-xl"
          >
            <div className="flex items-center justify-between gap-3">
              <label className="sr-only" htmlFor={`reaction-search-${targetId}`}>
                찾고 싶은 리액션 검색
              </label>
              <input
                id={`reaction-search-${targetId}`}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="찾고 싶은 리액션 검색"
                className="h-10 min-w-0 flex-1 rounded-full border border-stone-surface bg-[#fbfaf9] px-4 text-sm text-charcoal-primary outline-none transition focus:border-sky-blue focus:ring-2 focus:ring-sky-blue/25"
              />
              <button
                type="button"
                aria-label="리액션 선택 닫기"
                onClick={() => setPickerOpen(false)}
                className="flex size-9 items-center justify-center rounded-full border border-stone-surface bg-white text-lg text-ash hover:bg-stone-surface"
              >
                ×
              </button>
            </div>

            {selectedEmoji && (
              <div className="mt-4 space-y-2">
                <p className="text-[11px] font-bold text-ash">최근 사용</p>
                <button
                  type="button"
                  aria-label={`${selectedEmoji} 리액션 선택`}
                  onClick={() => void toggleReaction(selectedEmoji)}
                  className="flex size-10 items-center justify-center rounded-2xl bg-[#f8f7f4] text-2xl hover:bg-stone-surface"
                >
                  {selectedEmoji}
                </button>
              </div>
            )}

            <div className="mt-4 space-y-2">
              <p className="text-[11px] font-bold text-ash">기본</p>
              <div className="grid grid-cols-6 gap-2">
                {filteredPickerEmojis.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    aria-label={`${emoji} 리액션 선택`}
                    onClick={() => void toggleReaction(emoji)}
                    disabled={!!isSubmittingEmoji}
                    className="flex aspect-square items-center justify-center rounded-2xl bg-[#fbfaf9] text-2xl transition hover:bg-stone-surface disabled:opacity-60"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
