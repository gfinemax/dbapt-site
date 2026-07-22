"use client";

import { useState, type MouseEvent } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { notifyDocumentBookmarkChanged } from "@/lib/document-bookmark-events";
import type { Document } from "./document-table";

type DocumentBookmarkButtonProps = {
  document: Pick<Document, "id" | "title" | "isBookmarkedByCurrentUser">;
  onBookmarkChange?: (documentId: string, isBookmarked: boolean) => void;
  className?: string;
  includeDocumentTitleInLabel?: boolean;
};

export function DocumentBookmarkButton({
  document,
  onBookmarkChange,
  className,
  includeDocumentTitleInLabel = false,
}: DocumentBookmarkButtonProps) {
  const [localBookmarkState, setLocalBookmarkState] = useState<{
    documentId: string;
    isBookmarked: boolean;
  } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const isBookmarked =
    localBookmarkState?.documentId === document.id
      ? localBookmarkState.isBookmarked
      : !!document.isBookmarkedByCurrentUser;

  const handleClick = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    const nextBookmarked = !isBookmarked;
    setIsSaving(true);
    try {
      const response = await fetch(
        nextBookmarked
          ? "/api/me/document-bookmarks"
          : `/api/me/document-bookmarks?documentId=${encodeURIComponent(document.id)}`,
        {
          method: nextBookmarked ? "POST" : "DELETE",
          headers: nextBookmarked ? { "Content-Type": "application/json" } : undefined,
          body: nextBookmarked ? JSON.stringify({ documentId: document.id }) : undefined,
        },
      );

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        alert(body.error || "문서 보관 상태를 변경하지 못했습니다.");
        return;
      }

      if (onBookmarkChange) {
        onBookmarkChange(document.id, nextBookmarked);
      } else {
        setLocalBookmarkState({
          documentId: document.id,
          isBookmarked: nextBookmarked,
        });
      }
      notifyDocumentBookmarkChanged({ documentId: document.id, isBookmarked: nextBookmarked });
    } catch (error) {
      console.error(error);
      alert("문서 보관 상태 변경 중 문제가 발생했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      onClick={handleClick}
      disabled={isSaving}
      aria-label={
        includeDocumentTitleInLabel
          ? `${document.title} ${isBookmarked ? "즐겨찾기 해제" : "즐겨찾기"}`
          : undefined
      }
      className={cn(
        "h-7 rounded-full border-stone-surface px-2.5 text-[10px] font-bold text-graphite hover:border-ember-orange hover:bg-ember-orange/5 hover:text-ember-orange disabled:opacity-60",
        isBookmarked && "border-ember-orange/25 bg-ember-orange/10 text-ember-orange",
        className,
      )}
    >
      {isSaving ? "처리 중" : isBookmarked ? "즐겨찾기 해제" : "즐겨찾기"}
    </Button>
  );
}
