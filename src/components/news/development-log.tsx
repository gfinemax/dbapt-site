"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DEVELOPMENT_LOG_CATEGORIES,
  buildDevelopmentLogList,
  getDevelopmentLogStatus,
} from "@/lib/news/development-log";
import type { CoopNewsView } from "@/lib/news/types";
import { cn } from "@/lib/utils";

type DevelopmentLogProps = {
  isAdmin: boolean;
  logs: CoopNewsView[];
  onRefresh: () => Promise<void> | void;
};

const statusStyles = {
  draft: "border-amber-200 bg-amber-50 text-amber-700",
  published: "border-meadow-green/20 bg-meadow-green/10 text-meadow-green",
  hidden: "border-stone-surface bg-stone-surface/70 text-ash",
} as const;

export function DevelopmentLog({ isAdmin, logs, onRefresh }: DevelopmentLogProps) {
  const [mutatingId, setMutatingId] = useState<string | null>(null);
  const [isCreatingDraft, setIsCreatingDraft] = useState(false);
  const visibleLogs = useMemo(
    () => buildDevelopmentLogList(logs, { includeAdminOnly: isAdmin }),
    [isAdmin, logs],
  );

  const createDraft = async () => {
    setIsCreatingDraft(true);
    try {
      const res = await fetch("/api/news/development-log/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(data.error || "개발일지 초안 생성에 실패했습니다.");
        return;
      }
      await onRefresh();
    } finally {
      setIsCreatingDraft(false);
    }
  };

  const updateLogCategory = async (log: CoopNewsView, category: string) => {
    setMutatingId(log.id);
    try {
      const res = await fetch("/api/news", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: log.id,
          title: log.title,
          content: log.content,
          category,
          imagePath: log.imagePath || null,
          isStarred: !!log.isStarred,
          attachmentPath: log.attachmentPath || null,
          attachmentName: log.attachmentName || null,
          attachmentSize: log.attachmentSize || null,
          displayAuthorName: log.displayAuthorName || "운영자",
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(data.error || "개발일지 상태 변경에 실패했습니다.");
        return;
      }
      await onRefresh();
    } finally {
      setMutatingId(null);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 border-b border-[#f2f0ed] pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 className="flex items-center gap-2 text-base font-black text-charcoal-primary">
            <span>개발일지</span>
          </h3>
          <p className="mt-0.5 text-[10px] font-medium text-ash font-mono">
            Development Log & Request History
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full border border-sky-blue/20 bg-sky-blue/10 px-2.5 py-0.5 text-[10px] font-bold text-sky-blue select-none">
            전체 공개
          </span>
          {isAdmin && (
            <Button
              type="button"
              onClick={createDraft}
              disabled={isCreatingDraft}
              className="h-8 rounded-full bg-midnight px-4 text-[11px] font-bold text-white hover:bg-black"
            >
              {isCreatingDraft ? "생성 중" : "자동 초안 생성"}
            </Button>
          )}
        </div>
      </div>

      {visibleLogs.length === 0 ? (
        <div className="stone-card rounded-2xl border border-stone-surface bg-white p-8 text-center">
          <p className="text-sm font-bold text-charcoal-primary">아직 공개된 개발일지가 없습니다.</p>
          <p className="mt-2 text-xs text-graphite">
            주요 기능 반영이나 오류 수정이 정리되면 이곳에 게시됩니다.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {visibleLogs.map((log) => {
            const status = getDevelopmentLogStatus(log.category);
            const version = extractVersion(log.content);
            const isDraft = log.category === DEVELOPMENT_LOG_CATEGORIES.draft;
            const isHidden = log.category === DEVELOPMENT_LOG_CATEGORIES.hidden;
            const isPublished = log.category === DEVELOPMENT_LOG_CATEGORIES.published;

            return (
              <article
                key={log.id}
                aria-label={log.title}
                className="stone-card overflow-hidden rounded-2xl border border-stone-surface bg-white"
              >
                <div className="space-y-4 p-5 sm:p-6">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        {version && (
                          <span className="rounded-full border border-stone-surface bg-[#fbfaf9] px-2.5 py-0.5 text-[10px] font-extrabold text-charcoal-primary font-mono">
                            {version}
                          </span>
                        )}
                        <span className={cn(
                          "rounded-full border px-2.5 py-0.5 text-[10px] font-bold",
                          statusStyles[status.tone],
                        )}>
                          {status.label}
                        </span>
                      </div>
                      <h4 className="text-[15px] font-black leading-snug text-charcoal-primary">
                        {log.title}
                      </h4>
                      <p className="mt-1 text-[10px] font-medium text-ash">
                        등록일 {String(log.createdAt).slice(0, 10).replace(/-/g, ".")}
                      </p>
                    </div>

                    {isAdmin && (
                      <div className="flex shrink-0 flex-wrap gap-2">
                        {(isDraft || isHidden) && (
                          <Button
                            type="button"
                            onClick={() => updateLogCategory(log, DEVELOPMENT_LOG_CATEGORIES.published)}
                            disabled={mutatingId === log.id}
                            className="h-8 rounded-full bg-midnight px-4 text-[11px] font-bold text-white hover:bg-black"
                          >
                            게시
                          </Button>
                        )}
                        {isPublished && (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => updateLogCategory(log, DEVELOPMENT_LOG_CATEGORIES.hidden)}
                            disabled={mutatingId === log.id}
                            className="h-8 rounded-full border-stone-surface px-4 text-[11px] font-bold text-graphite hover:bg-stone-surface/40"
                          >
                            숨김
                          </Button>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="whitespace-pre-wrap rounded-xl bg-[#fbfaf9] p-4 text-[12px] leading-7 text-graphite">
                    {log.content}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

function extractVersion(content: string) {
  return content.match(/v\d{4}\.\d{2}\.\d+(?:-hotfix\.\d+)?/)?.[0] ?? null;
}
