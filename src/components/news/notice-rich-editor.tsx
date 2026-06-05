"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type UploadImage = (file: File) => Promise<{ url: string }>;

type NoticeRichEditorProps = {
  value: string;
  onChange: (value: string) => void;
  onUploadImage: UploadImage;
  ariaLabel: string;
  placeholder: string;
};

const EDITOR_BUTTON_CLASS =
  "rounded-full border border-stone-surface bg-[#f8f7f4] px-2.5 py-1 text-[10px] font-bold text-graphite hover:bg-stone-surface focus:outline-none focus:ring-2 focus:ring-sky-blue/30";
const NOTICE_RICH_BODY_CLASS =
  "text-xs leading-relaxed text-charcoal-primary [&_a]:text-sky-blue [&_a]:underline [&_img]:my-1 [&_img]:max-w-full [&_img]:rounded-none [&_img]:border [&_img]:border-stone-surface [&_li]:ml-4 [&_ol]:list-decimal [&_ul]:list-disc";

function escapeAttr(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function getPlainNoticeText(content: string) {
  return content
    .replace(/<img\b[^>]*>/gi, " [이미지] ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|li)>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function sanitizeNoticeContentHtml(content: string) {
  if (!/<[a-z][\s\S]*>/i.test(content)) {
    return escapeAttr(content).replace(/\n/g, "<br />");
  }

  const images: string[] = [];
  const withImagePlaceholders = content.replace(/<img\b([^>]*)>/gi, (_match, attrs: string) => {
    const src = attrs.match(/\ssrc=(["'])(.*?)\1/i)?.[2] || "";
    if (!src.startsWith("/uploads/") && !src.includes("/storage/v1/object/public/")) return "";

    const alt = attrs.match(/\salt=(["'])(.*?)\1/i)?.[2] || "본문 이미지";
    const widthFromData = Number(attrs.match(/\sdata-width=(["'])(\d{1,3})\1/i)?.[2]);
    const widthFromStyle = Number(attrs.match(/width\s*:\s*(\d{1,3})%/i)?.[1]);
    const width = Math.min(100, Math.max(20, widthFromData || widthFromStyle || 100));
    const token = `__NOTICE_IMAGE_${images.length}__`;

    images.push(
      `<img src="${escapeAttr(src)}" alt="${escapeAttr(alt)}" data-width="${width}" style="width:${width}%;max-width:100%;height:auto;" />`,
    );
    return token;
  });

  const sanitized = withImagePlaceholders
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<(script|style|iframe|object|embed|form|input|button)\b[\s\S]*?<\/\1>/gi, "")
    .replace(/\son\w+=(["']).*?\1/gi, "")
    .replace(/\son\w+=[^\s>]+/gi, "")
    .replace(/javascript:/gi, "")
    .replace(/<a\b([^>]*)>/gi, (_match, attrs: string) => {
      const href = attrs.match(/\shref=(["'])(.*?)\1/i)?.[2] || "";
      if (!/^https?:\/\//i.test(href) && !href.startsWith("/")) return "<a>";
      return `<a href="${escapeAttr(href)}" target="_blank" rel="noreferrer">`;
    })
    .replace(/<br\b[^>]*\/?>/gi, "<br />")
    .replace(/<(\/?)(p|strong|b|em|i|u|ul|ol|li)\b[^>]*>/gi, "<$1$2>")
    .replace(/<\/a\b[^>]*>/gi, "</a>")
    .replace(/<(?!\/?(p|br|strong|b|em|i|u|ul|ol|li|a)\b)[^>]*>/gi, "");

  return images.reduce((html, image, index) => html.replace(`__NOTICE_IMAGE_${index}__`, image), sanitized);
}

export function NoticeRichContent({
  content,
  className,
}: {
  content: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "notice-rich-content whitespace-normal break-words",
        NOTICE_RICH_BODY_CLASS,
        className,
      )}
      dangerouslySetInnerHTML={{ __html: sanitizeNoticeContentHtml(content) }}
    />
  );
}

export function NoticeRichEditor({
  value,
  onChange,
  onUploadImage,
  ariaLabel,
  placeholder,
}: NoticeRichEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const selectedImageRef = useRef<HTMLImageElement | null>(null);
  const [selectedImageSrc, setSelectedImageSrc] = useState("");
  const [selectedImageWidth, setSelectedImageWidth] = useState(100);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;
    if (document.activeElement === editor) return;
    if (editor.innerHTML !== value) {
      editor.innerHTML = value;
    }
  }, [value]);

  const commitContent = () => {
    onChange(editorRef.current?.innerHTML || "");
  };

  const runCommand = (command: string, commandValue?: string) => {
    editorRef.current?.focus();
    if (typeof document.execCommand === "function") {
      document.execCommand(command, false, commandValue);
    }
    commitContent();
  };

  const selectImage = (image: HTMLImageElement) => {
    const width = Number(image.dataset.width || image.style.width.replace("%", "") || 100);
    selectedImageRef.current = image;
    setSelectedImageSrc(image.getAttribute("src") || "");
    setSelectedImageWidth(Math.min(100, Math.max(20, width || 100)));
  };

  const insertImage = async (file: File) => {
    setIsUploadingImage(true);
    try {
      const uploaded = await onUploadImage(file);
      const imageHtml = `<p><img src="${escapeAttr(uploaded.url)}" alt="본문 이미지" data-width="100" style="width:100%;max-width:100%;height:auto;" /></p>`;
      if (typeof document.execCommand === "function") {
        document.execCommand("insertHTML", false, imageHtml);
      } else {
        editorRef.current?.insertAdjacentHTML("beforeend", imageHtml);
      }
      commitContent();

      const insertedImage = Array.from(editorRef.current?.querySelectorAll("img") || [])
        .find((image) => image.getAttribute("src") === uploaded.url);
      if (insertedImage) selectImage(insertedImage as HTMLImageElement);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLDivElement>) => {
    const imageFile = Array.from(event.clipboardData.files).find((file) => file.type.startsWith("image/"));
    if (!imageFile) {
      window.setTimeout(commitContent, 0);
      return;
    }

    event.preventDefault();
    void insertImage(imageFile);
  };

  const updateImageWidth = (width: number) => {
    const selectedImage = selectedImageRef.current;
    if (!selectedImage) return;
    const nextWidth = Math.min(100, Math.max(20, width));
    selectedImage.dataset.width = String(nextWidth);
    selectedImage.style.width = `${nextWidth}%`;
    selectedImage.style.maxWidth = "100%";
    selectedImage.style.height = "auto";
    setSelectedImageWidth(nextWidth);
    commitContent();
  };

  const addLink = () => {
    const url = window.prompt("연결할 주소를 입력해 주세요.");
    if (!url) return;
    runCommand("createLink", url);
  };

  return (
    <div className="rounded-xl border border-stone-surface bg-white focus-within:border-sky-blue focus-within:ring-1 focus-within:ring-sky-blue/30">
      <div className="flex flex-wrap items-center gap-1.5 border-b border-stone-surface px-3 py-2">
        <button type="button" className={EDITOR_BUTTON_CLASS} onClick={() => runCommand("bold")}>
          굵게
        </button>
        <button type="button" className={EDITOR_BUTTON_CLASS} onClick={() => runCommand("italic")}>
          기울임
        </button>
        <button type="button" className={EDITOR_BUTTON_CLASS} onClick={() => runCommand("underline")}>
          밑줄
        </button>
        <button type="button" className={EDITOR_BUTTON_CLASS} onClick={() => runCommand("insertUnorderedList")}>
          글머리
        </button>
        <button type="button" className={EDITOR_BUTTON_CLASS} onClick={() => runCommand("insertOrderedList")}>
          번호
        </button>
        <button type="button" className={EDITOR_BUTTON_CLASS} onClick={addLink}>
          링크
        </button>
        <button
          type="button"
          className={EDITOR_BUTTON_CLASS}
          disabled={isUploadingImage}
          onClick={() => fileInputRef.current?.click()}
        >
          {isUploadingImage ? "이미지 업로드 중" : "이미지 삽입"}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/gif,image/webp"
          className="sr-only"
          aria-label="본문 이미지 선택"
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            if (file) void insertImage(file);
          }}
        />
      </div>

      {selectedImageSrc && (
        <div className="flex flex-wrap items-center gap-2 border-b border-stone-surface bg-parchment-card px-3 py-2">
          <span className="text-[10px] font-bold text-graphite">이미지 크기</span>
          <input
            aria-label="이미지 크기"
            type="range"
            min={20}
            max={100}
            step={5}
            value={selectedImageWidth}
            onChange={(event) => updateImageWidth(Number(event.target.value))}
            className="min-w-36 flex-1 accent-sky-blue"
          />
          <span className="w-10 text-right text-[10px] font-bold text-sky-blue">{selectedImageWidth}%</span>
        </div>
      )}

      <div
        ref={editorRef}
        role="textbox"
        aria-label={ariaLabel}
        contentEditable
        suppressContentEditableWarning
        data-placeholder={placeholder}
        onInput={commitContent}
        onPaste={handlePaste}
        onClick={(event) => {
          const target = event.target as HTMLElement;
          if (target.tagName === "IMG") selectImage(target as HTMLImageElement);
        }}
        className={cn(
          "min-h-52 w-full px-4 py-3 outline-none empty:before:text-ash empty:before:content-[attr(data-placeholder)]",
          NOTICE_RICH_BODY_CLASS,
        )}
      />
    </div>
  );
}
