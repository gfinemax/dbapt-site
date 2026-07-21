"use client";

import { useState } from "react";
import { Link2, MessageCircle } from "lucide-react";
import { copyTextToClipboard } from "@/lib/copy-to-clipboard";
import { buildAbsoluteNewsShareUrl, type ShareableNewsKind } from "@/lib/news/content-share";

type ContentShareActionsProps = {
  kind: ShareableNewsKind;
  contentId: string;
  title: string;
};

export function ContentShareActions({ kind, contentId, title }: ContentShareActionsProps) {
  const [status, setStatus] = useState<"idle" | "copied" | "shared" | "error">("idle");
  const getShareUrl = () => buildAbsoluteNewsShareUrl(window.location.origin, kind, contentId);

  const handleCopy = async () => {
    try {
      await copyTextToClipboard(getShareUrl());
      setStatus("copied");
    } catch {
      setStatus("error");
    }
  };

  const handleShare = async () => {
    const url = getShareUrl();
    try {
      if (navigator.share) {
        await navigator.share({ title, text: title, url });
        setStatus("shared");
        return;
      }
      await copyTextToClipboard(url);
      setStatus("copied");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setStatus("error");
    }
  };

  const statusLabel = status === "copied"
    ? "링크 복사 완료"
    : status === "shared"
      ? "공유 완료"
      : status === "error"
        ? "공유 실패"
        : null;

  return (
    <div className="flex flex-wrap items-center justify-end gap-2" aria-live="polite">
      <button
        type="button"
        onClick={() => void handleShare()}
        className="inline-flex min-h-8 items-center gap-1.5 rounded-full border border-[#f7c600]/40 bg-[#fee500] px-3 py-1.5 text-[11px] font-bold text-[#191919] transition hover:bg-[#f7dc00] focus:outline-none focus:ring-2 focus:ring-[#f7c600]/40"
      >
        <MessageCircle className="size-3.5" aria-hidden="true" />
        카카오톡 공유
      </button>
      <button
        type="button"
        onClick={() => void handleCopy()}
        className="inline-flex min-h-8 items-center gap-1.5 rounded-full border border-stone-surface bg-white px-3 py-1.5 text-[11px] font-bold text-graphite transition hover:bg-stone-surface focus:outline-none focus:ring-2 focus:ring-sky-blue/25"
      >
        <Link2 className="size-3.5" aria-hidden="true" />
        링크 복사
      </button>
      {statusLabel && (
        <span className={status === "error" ? "text-[10px] font-bold text-coral-red" : "text-[10px] font-bold text-meadow-green"}>
          {statusLabel}
        </span>
      )}
    </div>
  );
}
