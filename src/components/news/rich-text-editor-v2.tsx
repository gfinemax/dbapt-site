"use client";

import Color from "@tiptap/extension-color";
import FontFamily from "@tiptap/extension-font-family";
import Highlight from "@tiptap/extension-highlight";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import Underline from "@tiptap/extension-underline";
import { Extension, mergeAttributes, Node } from "@tiptap/core";
import { NodeSelection, TextSelection } from "@tiptap/pm/state";
import {
  EditorContent,
  NodeViewWrapper,
  ReactNodeViewRenderer,
  useEditor,
  type Editor,
  type NodeViewProps,
} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Crop as CropIcon,
  ImageIcon,
  Indent,
  Italic,
  LinkIcon,
  List,
  ListOrdered,
  Maximize2,
  MoreVertical,
  Outdent,
  RotateCw,
  Strikethrough,
  UnderlineIcon,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { NEWS_ARTICLE_BODY_SURFACE_CLASS } from "@/lib/news/content-layout";
import { cn } from "@/lib/utils";

type UploadImage = (file: File) => Promise<{ url: string }>;

type RichTextEditorV2Props = {
  value: string;
  onChange: (value: string) => void;
  onUploadImage: UploadImage;
  ariaLabel: string;
  placeholder: string;
};

type ImageInsertMode = "inline" | "two-column" | "featured-grid";
type ImageFit = "contain" | "cover";
type ImageLayout = "inline" | "block" | "wrap" | "behind" | "front";
type CropX = "left" | "center" | "right";
type CropY = "top" | "center" | "bottom";

type LinkDraft = {
  url: string;
  label: string;
  error: string;
  mode: "create" | "edit";
  replaceWholeContent?: boolean;
};

type ImageHandleDrag = {
  startX: number;
  startY: number;
  startWidth: number;
  startPixelWidth: number;
  startHeight: number | null;
  handle: ResizeHandle;
};

type ImageRotateDrag = {
  centerX: number;
  centerY: number;
  startPointerAngle: number;
  startRotate: number;
};

type ImageCropDrag = {
  startX: number;
  startY: number;
  frameWidth: number;
  frameHeight: number;
  startBox: CropBox;
  handle: ResizeHandle;
};

type ImageLayerDrag = {
  startX: number;
  startY: number;
  startOffsetX: number;
  startOffsetY: number;
};

type ResizeHandle =
  | "top-left"
  | "top"
  | "top-right"
  | "right"
  | "bottom-right"
  | "bottom"
  | "bottom-left"
  | "left";

type CropBox = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

type ImageEditDraft = {
  pixelWidth: string;
  pixelHeight: string;
  zoom: string;
  fit: ImageFit;
  cropX: CropX;
  cropY: CropY;
  rotate: number;
};

type ImageToolButtonEvent = React.MouseEvent<HTMLButtonElement> | React.PointerEvent<HTMLButtonElement>;

const FONT_OPTIONS = [
  { label: "Pretendard", value: "Pretendard" },
  { label: "굴림", value: "Gulim" },
  { label: "맑은 고딕", value: "Malgun Gothic" },
];
const FONT_SIZE_OPTIONS = ["12px", "14px", "16px", "18px", "20px", "24px"];
const LINE_HEIGHT_OPTIONS = ["1.2", "1.5", "1.625", "1.8", "2"];
const GALLERY_GRID_STYLE =
  "display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px;width:100%;max-width:820px;";
const DEFAULT_CROP_BOX: CropBox = { top: 0, right: 0, bottom: 0, left: 0 };
const MAX_CROP_INSET = 45;
const MAX_CROP_PAIR_TOTAL = 75;
const TOOL_BUTTON_CLASS =
  "flex size-8 items-center justify-center border-r border-stone-surface text-graphite hover:bg-parchment-card focus:outline-none focus:ring-2 focus:ring-sky-blue/30 disabled:opacity-40";
const TOOL_BUTTON_ACTIVE_CLASS = "bg-stone-surface text-sky-blue";
const FIELD_CLASS =
  "h-9 border-r border-stone-surface bg-white px-3 text-sm text-charcoal-primary outline-none focus:bg-parchment-card focus:ring-2 focus:ring-sky-blue/20";
declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    fontSize: {
      setFontSize: (fontSize: string) => ReturnType;
      unsetFontSize: () => ReturnType;
    };
    lineHeight: {
      setLineHeight: (lineHeight: string) => ReturnType;
      unsetLineHeight: () => ReturnType;
    };
  }
}

function escapeAttr(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function normalizeLinkDraftUrl(value: string) {
  return value.replace(/&amp;/g, "&").trim();
}

function normalizeEditorLinkHref(value: string) {
  const trimmed = normalizeLinkDraftUrl(value);
  if (!trimmed) return "";

  try {
    const parsed = new URL(trimmed, "http://localhost");
    const tab = parsed.searchParams.get("tab");
    const hasFocusedFreePost = tab === "free" && parsed.searchParams.get("post");
    const hasFocusedNotice = tab === "notice" && parsed.searchParams.get("news");
    if (parsed.pathname === "/news" && (hasFocusedFreePost || hasFocusedNotice)) {
      return `/news?${parsed.searchParams.toString()}`;
    }
  } catch {
    return "";
  }

  if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith("/")) return trimmed;
  return "";
}

function getEditorDomSelectionText(editorRoot: HTMLElement) {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return "";
  const anchor = selection.anchorNode;
  if (!anchor || !editorRoot.contains(anchor)) return "";
  return selection.toString().trim();
}

export function shouldMoveCursorToDocumentEndOnClick(editorRoot: HTMLElement, target: EventTarget | null) {
  if (target !== editorRoot) return false;

  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return true;
  if (!selection.toString().trim()) return true;

  const anchor = selection.anchorNode;
  const focus = selection.focusNode;
  if ((anchor && editorRoot.contains(anchor)) || (focus && editorRoot.contains(focus))) {
    return false;
  }

  const range = selection.getRangeAt(0);
  return !editorRoot.contains(range.commonAncestorContainer);
}

function findLastImageNode(editor: Editor): { pos: number; attrs: Record<string, unknown> } | null {
  let found: { pos: number; attrs: Record<string, unknown> } | null = null;
  editor.state.doc.descendants((node, pos) => {
    if (node.type.name === "image") {
      found = { pos, attrs: node.attrs };
    }
  });
  return found;
}

function normalizeImageFit(value: string): ImageFit {
  return value === "cover" ? "cover" : "contain";
}

function normalizeCropX(value: string): CropX {
  if (value === "left" || value === "right") return value;
  return "center";
}

function normalizeCropY(value: string): CropY {
  if (value === "top" || value === "bottom") return value;
  return "center";
}

function normalizeRotate(value: unknown) {
  const rotation = Number(value);
  if (!Number.isFinite(rotation)) return 0;
  return ((Math.round(rotation) % 360) + 360) % 360;
}

function normalizeImageLayout(value: string): ImageLayout {
  if (value === "inline" || value === "wrap" || value === "behind" || value === "front") return value;
  return "block";
}

function normalizeImageZoom(value: unknown) {
  const zoom = Number(value);
  if (!Number.isFinite(zoom) || zoom <= 0) return 100;
  return Math.min(200, Math.max(25, Math.round(zoom)));
}

function normalizePixelDimension(value: unknown) {
  const dimension = Number(value);
  if (!Number.isFinite(dimension) || dimension <= 0) return null;
  return Math.min(4000, Math.max(40, Math.round(dimension)));
}

function normalizeImageOffset(value: unknown) {
  const offset = Number(value);
  if (!Number.isFinite(offset)) return 0;
  return Math.min(4000, Math.max(-4000, Math.round(offset)));
}

function clampCropInset(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.min(MAX_CROP_INSET, Math.max(0, Math.round(value)));
}

function constrainCropBox(box: CropBox): CropBox {
  const next = {
    top: clampCropInset(box.top),
    right: clampCropInset(box.right),
    bottom: clampCropInset(box.bottom),
    left: clampCropInset(box.left),
  };

  const horizontalOverflow = next.left + next.right - MAX_CROP_PAIR_TOTAL;
  if (horizontalOverflow > 0) {
    next.left = clampCropInset(next.left - horizontalOverflow / 2);
    next.right = clampCropInset(next.right - horizontalOverflow / 2);
  }

  const verticalOverflow = next.top + next.bottom - MAX_CROP_PAIR_TOTAL;
  if (verticalOverflow > 0) {
    next.top = clampCropInset(next.top - verticalOverflow / 2);
    next.bottom = clampCropInset(next.bottom - verticalOverflow / 2);
  }

  return next;
}

function resolveCropBoxImageAttrs(box: CropBox): { cropX: CropX; cropY: CropY; zoom: number } {
  const next = constrainCropBox(box);
  const visibleWidthRatio = Math.max(0.25, (100 - next.left - next.right) / 100);
  const visibleHeightRatio = Math.max(0.25, (100 - next.top - next.bottom) / 100);
  const zoom = normalizeImageZoom(Math.round(100 / Math.min(visibleWidthRatio, visibleHeightRatio)));
  const cropX = next.left > next.right + 2 ? "right" : next.right > next.left + 2 ? "left" : "center";
  const cropY = next.top > next.bottom + 2 ? "bottom" : next.bottom > next.top + 2 ? "top" : "center";

  return {
    cropX,
    cropY,
    zoom: Math.max(100, zoom),
  };
}

function buildImageStyle({
  width,
  fit,
  cropX,
  cropY,
  rotate,
  align,
  layout,
  zoom = 100,
  pixelWidth,
  pixelHeight,
  offsetX = 0,
  offsetY = 0,
  isGalleryImage = false,
  isFeatured = false,
}: {
  width: number;
  fit: ImageFit;
  cropX: CropX;
  cropY: CropY;
  rotate: number;
  align: "left" | "center" | "right";
  layout?: ImageLayout;
  zoom?: number;
  pixelWidth?: number | null;
  pixelHeight?: number | null;
  offsetX?: number;
  offsetY?: number;
  isGalleryImage?: boolean;
  isFeatured?: boolean;
}) {
  const widthStyle = isGalleryImage ? "width:100%;" : pixelWidth ? `width:${pixelWidth}px;` : `width:${width}%;`;
  const heightStyle = pixelHeight && !isGalleryImage ? `height:${pixelHeight}px;` : "height:auto;";
  const hasPixelSize = Boolean((pixelWidth || pixelHeight) && !isGalleryImage);
  const isRotated = normalizeRotate(rotate) !== 0;
  const fitFrame = fit === "cover" && !hasPixelSize && !isRotated ? `aspect-ratio:${isFeatured ? "16 / 10" : "1 / 1"};` : "";
  const objectFit = isRotated ? (hasPixelSize ? "fill" : "contain") : hasPixelSize ? "fill" : fit;
  const resolvedLayout = layout || "block";
  const margin = isGalleryImage
    ? ""
    : resolvedLayout === "inline"
      ? "display:inline-block;margin-left:4px;margin-right:4px;vertical-align:middle;"
      : resolvedLayout === "behind"
        ? `display:inline-block;position:relative;left:${normalizeImageOffset(offsetX)}px;top:${normalizeImageOffset(offsetY)}px;z-index:0;opacity:0.45;margin-left:4px;margin-right:4px;vertical-align:middle;`
        : resolvedLayout === "front"
          ? `display:inline-block;position:relative;left:${normalizeImageOffset(offsetX)}px;top:${normalizeImageOffset(offsetY)}px;z-index:3;opacity:1;margin-left:4px;margin-right:4px;vertical-align:middle;`
      : resolvedLayout === "wrap" && align === "left"
        ? "display:block;float:left;margin:0 16px 12px 0;"
        : resolvedLayout === "wrap" && align === "right"
          ? "display:block;float:right;margin:0 0 12px 16px;"
          : align === "center"
            ? "display:block;margin-left:auto;margin-right:auto;"
            : align === "right"
              ? "display:block;margin-left:auto;margin-right:0;"
              : "display:block;margin-left:0;margin-right:auto;";
  const scale = normalizeImageZoom(zoom) !== 100 ? ` scale(${normalizeImageZoom(zoom) / 100})` : "";
  const rotation = rotate || scale ? `transform:${rotate ? `rotate(${rotate}deg)` : ""}${scale};transform-origin:center;` : "";
  const featured = isFeatured ? "grid-column:1 / -1;" : "";
  return `${widthStyle}max-width:100%;${heightStyle}${fitFrame}object-fit:${objectFit};object-position:${cropX} ${cropY};${margin}${rotation}${featured}`;
}

function buildImageHtml(url: string) {
  return `<img src="${escapeAttr(url)}" alt="본문 이미지" data-width="100" data-fit="contain" data-crop-x="center" data-crop-y="center" data-rotate="0" data-align="left" data-layout="block" data-zoom="100" data-offset-x="0" data-offset-y="0" style="${buildImageStyle({
    width: 100,
    fit: "contain",
    cropX: "center",
    cropY: "center",
    rotate: 0,
    align: "left",
    layout: "block",
    zoom: 100,
    offsetX: 0,
    offsetY: 0,
  })}" />`;
}

function createImageEditDraft({
  width,
  pixelWidth,
  pixelHeight,
  fit,
  cropX,
  cropY,
  rotate,
  zoom,
}: {
  width: number;
  pixelWidth: number | null;
  pixelHeight: number | null;
  fit: ImageFit;
  cropX: CropX;
  cropY: CropY;
  rotate: number;
  zoom?: number;
}): ImageEditDraft {
  return {
    pixelWidth: String(pixelWidth || Math.max(160, Math.round(width * 8))),
    pixelHeight: String(pixelHeight || Math.max(120, Math.round(width * 6))),
    zoom: String(normalizeImageZoom(zoom)),
    fit,
    cropX,
    cropY,
    rotate,
  };
}

function ImageEditorDialog({
  draft,
  imageSrc,
  imageAlt,
  layout,
  onDraftChange,
  onLayoutChange,
  onCancel,
  onApply,
}: {
  draft: ImageEditDraft;
  imageSrc: string;
  imageAlt: string;
  layout: ImageLayout;
  onDraftChange: (updates: Partial<ImageEditDraft>) => void;
  onLayoutChange: (layout: ImageLayout) => void;
  onCancel: () => void;
  onApply: () => void;
}) {
  const updateDraft = (updates: Partial<ImageEditDraft>) => {
    onDraftChange(updates);
  };

  return (
    <div
      className="fixed bottom-0 right-0 top-0 z-[220] flex w-full max-w-[360px] flex-col border-l border-stone-surface bg-white text-charcoal-primary shadow-2xl"
      style={{ zIndex: 220 }}
      data-notice-image-editor-dialog=""
      data-notice-image-options-panel=""
      role="dialog"
      aria-modal="false"
      aria-labelledby="image-editor-title"
      onClick={(event) => event.stopPropagation()}
    >
      <div className="flex h-14 items-center justify-between border-b border-stone-surface px-4">
        <h2 id="image-editor-title" className="text-lg font-bold">이미지 편집</h2>
        <button
          type="button"
          aria-label="이미지 편집 취소"
          className="flex size-9 items-center justify-center rounded-full text-graphite hover:bg-parchment-card focus:outline-none focus:ring-2 focus:ring-sky-blue/30"
          onClick={onCancel}
        >
          <X className="size-5" aria-hidden="true" />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
        <div className="mb-5 rounded-lg border border-stone-surface bg-parchment-card p-3">
          {/* Tiptap image editor preview intentionally uses the same plain img as the document node. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageSrc}
            alt={imageAlt}
            className="max-h-52 w-full rounded-sm border border-stone-surface bg-white object-contain"
            style={{
              height: "180px",
              objectFit: draft.fit,
              objectPosition: `${draft.cropX} ${draft.cropY}`,
              transform: draft.rotate ? `rotate(${draft.rotate}deg)` : undefined,
            }}
          />
          <div className="mt-2 text-xs text-ash">{draft.pixelWidth} x {draft.pixelHeight} (px)</div>
        </div>

        <section className="border-b border-stone-surface py-4">
          <h3 className="mb-3 text-sm font-bold">크기 및 회전</h3>
          <div className="grid grid-cols-2 gap-3">
            <label className="text-xs font-bold text-graphite">
              너비
              <input
                aria-label="너비(px)"
                type="number"
                min={40}
                max={4000}
                value={draft.pixelWidth}
                onChange={(event) => updateDraft({ pixelWidth: event.target.value })}
                className="mt-1 h-10 w-full rounded-md border border-stone-surface bg-white px-2 text-sm text-charcoal-primary outline-none focus:ring-2 focus:ring-sky-blue/30"
              />
            </label>
            <label className="text-xs font-bold text-graphite">
              높이
              <input
                aria-label="높이(px)"
                type="number"
                min={40}
                max={4000}
                value={draft.pixelHeight}
                onChange={(event) => updateDraft({ pixelHeight: event.target.value })}
                className="mt-1 h-10 w-full rounded-md border border-stone-surface bg-white px-2 text-sm text-charcoal-primary outline-none focus:ring-2 focus:ring-sky-blue/30"
              />
            </label>
          </div>
          <div className="mt-3 flex items-center gap-3">
            <label className="min-w-0 flex-1 text-xs font-bold text-graphite">
              각도
              <input
                aria-label="회전 각도"
                type="number"
                min={0}
                max={359}
                value={draft.rotate}
                onChange={(event) => updateDraft({ rotate: normalizeRotate(event.target.value) })}
                className="mt-1 h-10 w-full rounded-md border border-stone-surface bg-white px-2 text-sm text-charcoal-primary outline-none focus:ring-2 focus:ring-sky-blue/30"
              />
            </label>
            <button
              type="button"
              aria-label="이미지 편집 오른쪽 회전"
              className="mt-5 flex size-10 items-center justify-center rounded-md border border-stone-surface bg-white text-graphite hover:bg-parchment-card focus:outline-none focus:ring-2 focus:ring-sky-blue/30"
              onClick={() => updateDraft({ rotate: (draft.rotate + 90) % 360 })}
            >
              <RotateCw className="size-5" aria-hidden="true" />
            </button>
          </div>
        </section>

        <section className="border-b border-stone-surface py-4">
          <h3 className="mb-3 text-sm font-bold">텍스트 줄바꿈</h3>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              aria-pressed={layout === "inline"}
              className="rounded-md border border-stone-surface bg-white px-3 py-2 text-xs font-bold text-graphite hover:bg-parchment-card focus:outline-none focus:ring-2 focus:ring-sky-blue/30"
              onClick={() => onLayoutChange("inline")}
            >
              글자처럼 처리
            </button>
            <button
              type="button"
              aria-pressed={layout === "block"}
              className="rounded-md border border-stone-surface bg-white px-3 py-2 text-xs font-bold text-graphite hover:bg-parchment-card focus:outline-none focus:ring-2 focus:ring-sky-blue/30"
              onClick={() => onLayoutChange("block")}
            >
              텍스트와 함께 이동
            </button>
          </div>
        </section>

        <section className="border-b border-stone-surface py-4">
          <h3 className="mb-3 text-sm font-bold">조정</h3>
          <label className="flex items-center gap-3 text-sm text-graphite">
            확대
            <input
              aria-label="이미지 편집 확대"
              type="range"
              min={25}
              max={200}
              value={draft.zoom}
              onChange={(event) => updateDraft({ zoom: event.target.value })}
              className="min-w-0 flex-1 accent-sky-blue"
            />
            <span className="w-12 text-right text-xs text-ash">{draft.zoom}%</span>
          </label>
          <div className="mt-3 flex gap-2">
            <button type="button" aria-label="이미지 편집 자르기" className="flex items-center gap-2 rounded-md border border-stone-surface bg-white px-3 py-2 text-xs font-bold text-graphite hover:bg-parchment-card focus:outline-none focus:ring-2 focus:ring-sky-blue/30" onClick={() => updateDraft({ fit: "cover" })}>
              <CropIcon className="size-4" aria-hidden="true" />
              채우기
            </button>
            <button type="button" aria-label="이미지 편집 원본비율" aria-pressed={draft.fit === "contain"} className={cn("flex items-center gap-2 rounded-md border border-stone-surface bg-white px-3 py-2 text-xs font-bold text-graphite hover:bg-parchment-card focus:outline-none focus:ring-2 focus:ring-sky-blue/30", draft.fit === "contain" && "border-sky-blue text-sky-blue")} onClick={() => updateDraft({ fit: "contain" })}>
              <Maximize2 className="size-4" aria-hidden="true" />
              원본비율
            </button>
            <button type="button" aria-label="이미지 편집 채우기" aria-pressed={draft.fit === "cover"} className={cn("flex items-center gap-2 rounded-md border border-stone-surface bg-white px-3 py-2 text-xs font-bold text-graphite hover:bg-parchment-card focus:outline-none focus:ring-2 focus:ring-sky-blue/30", draft.fit === "cover" && "border-sky-blue text-sky-blue")} onClick={() => updateDraft({ fit: "cover" })}>
              <ImageIcon className="size-4" aria-hidden="true" />
              맞춤
            </button>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {([
              ["이미지 편집 왼쪽 위 트리밍", "left", "top", "좌상"],
              ["이미지 편집 중앙 트리밍", "center", "center", "중앙"],
              ["이미지 편집 오른쪽 아래 트리밍", "right", "bottom", "우하"],
            ] as const).map(([label, nextCropX, nextCropY, text]) => (
              <button
                key={label}
                type="button"
                aria-label={label}
                aria-pressed={draft.cropX === nextCropX && draft.cropY === nextCropY}
                className={cn(
                  "rounded-md border border-stone-surface bg-white px-3 py-2 text-xs font-bold text-graphite hover:bg-parchment-card focus:outline-none focus:ring-2 focus:ring-sky-blue/30",
                  draft.cropX === nextCropX && draft.cropY === nextCropY && "border-sky-blue text-sky-blue",
                )}
                onClick={() => updateDraft({ cropX: nextCropX, cropY: nextCropY })}
              >
                {text}
              </button>
            ))}
          </div>
        </section>

        <section className="py-4">
          <h3 className="mb-2 text-sm font-bold">대체 텍스트</h3>
          <p className="text-xs leading-relaxed text-ash">이미지 설명은 현재 본문 이미지의 alt 텍스트를 사용해.</p>
        </section>
      </div>

      <div className="flex items-center justify-end gap-2 border-t border-stone-surface bg-[#fbfaf9] px-4 py-3">
        <button
          type="button"
          className="rounded-full border border-stone-surface bg-white px-4 py-2 text-sm font-bold text-graphite hover:bg-parchment-card focus:outline-none focus:ring-2 focus:ring-sky-blue/30"
          onClick={onCancel}
        >
          취소
        </button>
        <button
          type="button"
          aria-label="이미지 편집 적용"
          className="rounded-full bg-charcoal-primary px-5 py-2 text-sm font-bold text-white hover:bg-charcoal-primary/90 focus:outline-none focus:ring-2 focus:ring-charcoal-primary/30"
          onClick={onApply}
        >
          적용
        </button>
      </div>
    </div>
  );
}

function ImageLayoutIcon({
  variant,
  active,
}: {
  variant: "inline" | "wrap" | "block" | "behind" | "front";
  active: boolean;
}) {
  const colorClass = active ? "text-sky-blue" : "text-graphite";
  return (
    <svg
      aria-hidden="true"
      data-notice-image-layout-icon=""
      viewBox="0 0 24 24"
      className={cn("size-6", colorClass)}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    >
      {variant === "inline" && (
        <>
          <rect x="3" y="5" width="5" height="14" rx="0.5" />
          <line x1="11" y1="6" x2="21" y2="6" />
          <line x1="11" y1="12" x2="19" y2="12" />
          <line x1="11" y1="18" x2="21" y2="18" />
        </>
      )}
      {variant === "wrap" && (
        <>
          <line x1="3" y1="5" x2="21" y2="5" />
          <rect x="4" y="8" width="7" height="8" rx="0.5" />
          <line x1="14" y1="9" x2="21" y2="9" />
          <line x1="14" y1="13" x2="20" y2="13" />
          <line x1="3" y1="19" x2="21" y2="19" />
        </>
      )}
      {variant === "block" && (
        <>
          <line x1="3" y1="5" x2="21" y2="5" />
          <rect x="8" y="9" width="8" height="6" rx="0.5" />
          <line x1="3" y1="19" x2="21" y2="19" />
        </>
      )}
      {variant === "behind" && (
        <>
          <line x1="3" y1="5" x2="21" y2="5" />
          <line x1="3" y1="10" x2="21" y2="10" />
          <rect x="7" y="7" width="10" height="10" rx="0.5" strokeDasharray="2 2" />
          <line x1="3" y1="15" x2="21" y2="15" />
          <line x1="3" y1="20" x2="21" y2="20" />
        </>
      )}
      {variant === "front" && (
        <>
          <line x1="3" y1="5" x2="21" y2="5" />
          <line x1="3" y1="10" x2="21" y2="10" />
          <rect x="7" y="7" width="10" height="10" rx="0.5" fill="white" />
          <line x1="3" y1="15" x2="21" y2="15" />
          <line x1="3" y1="20" x2="21" y2="20" />
        </>
      )}
    </svg>
  );
}

function normalizeEditorInputHtml(content: string) {
  return content;
}

function normalizeEditorComparisonHtml(content: string) {
  return normalizeEditorInputHtml(content)
    .replace(/<p>(?:\s|<br\s*\/?>)*<\/p>/gi, "")
    .trim();
}

function hasEquivalentEditorHtml(currentHtml: string, nextHtml: string) {
  return normalizeEditorComparisonHtml(currentHtml) === normalizeEditorComparisonHtml(nextHtml);
}

function NoticeImageNodeView({
  node,
  selected,
  editor,
  getPos,
  updateAttributes,
}: NodeViewProps) {
  const attrs = node.attrs;
  const imageSrc = typeof attrs.src === "string" ? attrs.src.trim() : "";
  const width = Number(attrs.width || 100);
  const fit = normalizeImageFit(String(attrs.fit || ""));
  const cropX = normalizeCropX(String(attrs.cropX || ""));
  const cropY = normalizeCropY(String(attrs.cropY || ""));
  const rotate = normalizeRotate(attrs.rotate);
  const align = attrs.align === "right" || attrs.align === "center" ? attrs.align : "left";
  const layout = normalizeImageLayout(String(attrs.layout || ""));
  const zoom = normalizeImageZoom(attrs.zoom);
  const pixelWidth = normalizePixelDimension(attrs.pixelWidth);
  const pixelHeight = normalizePixelDimension(attrs.pixelHeight);
  const offsetX = normalizeImageOffset(attrs.offsetX);
  const offsetY = normalizeImageOffset(attrs.offsetY);
  const isLayerLayout = layout === "behind" || layout === "front";
  const wrapperRef = useRef<HTMLSpanElement | null>(null);
  const handleDragRef = useRef<ImageHandleDrag | null>(null);
  const rotateDragRef = useRef<ImageRotateDrag | null>(null);
  const cropDragRef = useRef<ImageCropDrag | null>(null);
  const layerDragRef = useRef<ImageLayerDrag | null>(null);
  const imageClickRef = useRef<{ time: number } | null>(null);
  const [isImageEditorOpen, setIsImageEditorOpen] = useState(false);
  const [isImageObjectActive, setIsImageObjectActive] = useState(false);
  const [isCropMode, setIsCropMode] = useState(false);
  const [cropDraft, setCropDraft] = useState<CropBox>(DEFAULT_CROP_BOX);
  const [imageEditDraft, setImageEditDraft] = useState<ImageEditDraft>({
    pixelWidth: String(pixelWidth || 800),
    pixelHeight: String(pixelHeight || 600),
    zoom: "100",
    fit,
    cropX,
    cropY,
    rotate,
  });
  const isActive = selected || isImageObjectActive;

  const selectNode = () => {
    const pos = typeof getPos === "function" ? getPos() : null;
    if (typeof pos !== "number") return;
    setIsImageObjectActive(true);
    try {
      editor.view.dispatch(editor.state.tr.setSelection(NodeSelection.create(editor.state.doc, pos)));
      editor.view.focus();
    } catch {
      // Keep the object UI active even if ProseMirror cannot create a node selection for this click.
    }
  };

  const isImageControlTarget = (target: EventTarget | null) => (
    target instanceof HTMLElement
    && Boolean(
      target.closest("[data-notice-image-controls]")
      || target.closest("[data-notice-image-resize]")
      || target.closest("[data-notice-image-rotate]")
      || target.closest("[data-notice-image-crop-controls]")
      || target.closest("[data-notice-image-crop-handle]")
      || target.closest("[data-notice-image-crop-action]"),
    )
  );

  const applyImageLayoutMode = (nextLayout: ImageLayout) => {
    setIsImageObjectActive(true);
    setIsCropMode(false);
    imageClickRef.current = null;
    updateImageAttrs({ layout: nextLayout });
  };

  const enterCropModeFromImageClick = () => {
    setIsImageObjectActive(true);
    setIsImageEditorOpen(false);
    setCropDraft(DEFAULT_CROP_BOX);
    setIsCropMode(true);
    imageClickRef.current = null;
  };

  const shouldEnterCropModeFromRepeatedClick = (event: React.MouseEvent<HTMLElement>) => {
    if (event.type !== "click") return false;
    if (!(event.target instanceof HTMLElement)) return false;
    if (!event.target.closest("[data-notice-image-frame]")) return false;

    const now = Number.isFinite(event.timeStamp) ? event.timeStamp : 0;
    const previous = imageClickRef.current;
    imageClickRef.current = { time: now };
    return Boolean(previous && now - previous.time <= 500);
  };

  const isImageEditorOpenTarget = (target: EventTarget | null) => (
    target instanceof HTMLElement && Boolean(target.closest("[data-notice-image-open-editor]"))
  );

  const selectNodeFromPointer = (event: React.MouseEvent<HTMLElement>) => {
    const target = event.target;
    const layoutTarget = target instanceof HTMLElement
      ? target.closest("[data-notice-image-layout]") as HTMLElement | null
      : null;
    if (layoutTarget) {
      event.preventDefault();
      event.stopPropagation();
      applyImageLayoutMode(normalizeImageLayout(layoutTarget.dataset.noticeImageLayout || ""));
      return;
    }
    if (isImageEditorOpenTarget(event.target)) {
      event.preventDefault();
      event.stopPropagation();
      setIsImageObjectActive(true);
      setIsCropMode(false);
      openCurrentImageEditor();
      return;
    }
    const cropActionTarget = event.target instanceof HTMLElement
      ? event.target.closest("[data-notice-image-crop-action]") as HTMLElement | null
      : null;
    if (cropActionTarget) {
      event.preventDefault();
      event.stopPropagation();
      const action = cropActionTarget.dataset.noticeImageCropAction;
      if (action === "apply") applyInlineCrop();
      if (action === "cancel") cancelInlineCrop();
      if (action === "reset") setCropDraft(DEFAULT_CROP_BOX);
      return;
    }
    const cropHandleTarget = event.target instanceof HTMLElement
      ? event.target.closest("[data-notice-image-crop-handle]") as HTMLElement | null
      : null;
    if (cropHandleTarget) {
      const handle = cropHandleTarget.dataset.cropHandle as ResizeHandle | undefined;
      startCropDrag(event, handle || "bottom-right");
      return;
    }
    const resizeTarget = event.target instanceof HTMLElement
      ? event.target.closest("[data-notice-image-resize]") as HTMLElement | null
      : null;
    if (resizeTarget) {
      const handle = resizeTarget.dataset.resizeHandle as ResizeHandle | undefined;
      startResizeDrag(event, handle || "bottom-right");
      return;
    }
    const rotateTarget = event.target instanceof HTMLElement
      ? event.target.closest("[data-notice-image-rotate]") as HTMLElement | null
      : null;
    if (rotateTarget) {
      startRotateDrag(event);
      return;
    }
    const moveSurfaceTarget = event.target instanceof HTMLElement
      ? event.target.closest("[data-notice-image-move-surface]") as HTMLElement | null
      : null;
    if (moveSurfaceTarget && (event.type === "mousedown" || event.type === "pointerdown")) {
      if (isLayerLayout) {
        startLayerDrag(event);
        return;
      }
      event.stopPropagation();
      selectNode();
      return;
    }
    if (isImageControlTarget(event.target)) {
      if (event.type === "click") return;
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    if (isActive && event.target instanceof HTMLElement && event.target.tagName === "IMG") {
      event.preventDefault();
      event.stopPropagation();
      if (shouldEnterCropModeFromRepeatedClick(event)) {
        enterCropModeFromImageClick();
        return;
      }
      selectNode();
      return;
    }
    if (shouldEnterCropModeFromRepeatedClick(event)) {
      event.preventDefault();
      event.stopPropagation();
      enterCropModeFromImageClick();
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    selectNode();
  };

  useEffect(() => {
    if (!isActive) return;
    const handlePointerOutside = (event: MouseEvent | PointerEvent) => {
      const target = event.target;
      if (target instanceof HTMLElement && target.closest("[data-notice-image-editor-dialog]")) return;
      if (target instanceof globalThis.Node && wrapperRef.current?.contains(target)) return;
      setIsImageObjectActive(false);
      setIsCropMode(false);
    };
    document.addEventListener("pointerdown", handlePointerOutside, true);
    document.addEventListener("mousedown", handlePointerOutside, true);
    document.addEventListener("click", handlePointerOutside, true);
    return () => {
      document.removeEventListener("pointerdown", handlePointerOutside, true);
      document.removeEventListener("mousedown", handlePointerOutside, true);
      document.removeEventListener("click", handlePointerOutside, true);
    };
  }, [isActive]);

  function updateImageAttrs(updates: {
    src?: string | null;
    alt?: string | null;
    title?: string | null;
    width?: number;
    fit?: ImageFit;
    cropX?: CropX;
    cropY?: CropY;
    rotate?: number;
    align?: "left" | "center" | "right";
    layout?: ImageLayout;
    zoom?: number;
    pixelWidth?: number | null;
    pixelHeight?: number | null;
    offsetX?: number;
    offsetY?: number;
  }) {
    updateAttributes({
      src: imageSrc || null,
      alt: typeof attrs.alt === "string" ? attrs.alt : "본문 이미지",
      title: typeof attrs.title === "string" ? attrs.title : null,
      width,
      fit,
      cropX,
      cropY,
      rotate,
      align,
      layout,
      zoom,
      pixelWidth,
      pixelHeight,
      offsetX,
      offsetY,
      ...updates,
    });
  }

  function startResizeDrag(
    event: React.MouseEvent<HTMLElement> | React.PointerEvent<HTMLElement>,
    handle: ResizeHandle = "bottom-right",
  ) {
    event.preventDefault();
    event.stopPropagation();
    selectNode();
    const frameRect = wrapperRef.current
      ?.querySelector<HTMLElement>("[data-notice-image-frame]")
      ?.getBoundingClientRect();
    const frameWidth = frameRect?.width && frameRect.width > 0 ? Math.round(frameRect.width) : null;
    const frameHeight = frameRect?.height && frameRect.height > 0 ? Math.round(frameRect.height) : null;
    const startPixelWidth = pixelWidth || frameWidth || Math.max(40, Math.round(width * 4));
    const startPixelHeight = pixelHeight || frameHeight || (fit === "cover" ? startPixelWidth : Math.max(40, Math.round(startPixelWidth * 0.75)));
    handleDragRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      startWidth: width,
      startPixelWidth,
      startHeight: startPixelHeight,
      handle,
    };
    const applyDrag = (clientX: number, clientY: number) => {
      const drag = handleDragRef.current;
      if (!drag) return;
      const horizontalDirection = drag.handle.includes("left") ? -1 : drag.handle.includes("right") ? 1 : 0;
      const verticalDirection = drag.handle.includes("top") ? -1 : drag.handle.includes("bottom") ? 1 : 0;
      const deltaX = horizontalDirection ? (clientX - drag.startX) * horizontalDirection : 0;
      const deltaY = verticalDirection ? (clientY - drag.startY) * verticalDirection : 0;
      const hasHorizontalResize = horizontalDirection !== 0;
      const hasVerticalResize = verticalDirection !== 0 && drag.startHeight !== null;
      const nextWidth = width;
      let nextPixelWidth = pixelWidth;
      let nextPixelHeight = pixelHeight;

      if (hasHorizontalResize && hasVerticalResize) {
        const horizontalWidth = Math.max(40, Math.round(drag.startPixelWidth + deltaX));
        const verticalHeight = Math.max(40, Math.round((drag.startHeight || 40) + deltaY));
        const horizontalRatio = horizontalWidth / Math.max(1, drag.startPixelWidth);
        const verticalRatio = verticalHeight / Math.max(1, drag.startHeight || verticalHeight);
        const ratio = Math.abs(deltaY) > Math.abs(deltaX) ? verticalRatio : horizontalRatio;
        nextPixelWidth = Math.max(40, Math.round(drag.startPixelWidth * ratio));
        nextPixelHeight = Math.max(40, Math.round((drag.startHeight || 40) * ratio));
      } else if (hasHorizontalResize) {
        nextPixelWidth = Math.max(40, Math.round(drag.startPixelWidth + deltaX));
      } else if (hasVerticalResize) {
        nextPixelHeight = Math.max(40, Math.round((drag.startHeight || 40) + deltaY));
      }

      updateImageAttrs({
        width: nextWidth,
        pixelWidth: nextPixelWidth,
        pixelHeight: nextPixelHeight,
      });
    };
    const handleMove = (moveEvent: MouseEvent | PointerEvent) => {
      moveEvent.preventDefault();
      applyDrag(moveEvent.clientX, moveEvent.clientY);
    };
    const finishDrag = () => {
      handleDragRef.current = null;
      document.removeEventListener("mousemove", handleMove);
      document.removeEventListener("pointermove", handleMove);
      document.removeEventListener("mouseup", finishDrag);
      document.removeEventListener("pointerup", finishDrag);
    };
    document.addEventListener("mousemove", handleMove);
    document.addEventListener("pointermove", handleMove);
    document.addEventListener("mouseup", finishDrag);
    document.addEventListener("pointerup", finishDrag);
  }

  function startLayerDrag(event: React.MouseEvent<HTMLElement> | React.PointerEvent<HTMLElement>) {
    event.preventDefault();
    event.stopPropagation();
    selectNode();
    layerDragRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      startOffsetX: offsetX,
      startOffsetY: offsetY,
    };
    const applyDrag = (clientX: number, clientY: number) => {
      const drag = layerDragRef.current;
      if (!drag) return;
      updateImageAttrs({
        offsetX: normalizeImageOffset(drag.startOffsetX + clientX - drag.startX),
        offsetY: normalizeImageOffset(drag.startOffsetY + clientY - drag.startY),
      });
    };
    const handleMove = (moveEvent: MouseEvent | PointerEvent) => {
      moveEvent.preventDefault();
      applyDrag(moveEvent.clientX, moveEvent.clientY);
    };
    const finishDrag = () => {
      layerDragRef.current = null;
      document.removeEventListener("mousemove", handleMove);
      document.removeEventListener("pointermove", handleMove);
      document.removeEventListener("mouseup", finishDrag);
      document.removeEventListener("pointerup", finishDrag);
    };
    document.addEventListener("mousemove", handleMove);
    document.addEventListener("pointermove", handleMove);
    document.addEventListener("mouseup", finishDrag);
    document.addEventListener("pointerup", finishDrag);
  }

  function getPointerAngle(centerX: number, centerY: number, clientX: number, clientY: number) {
    return Math.atan2(clientY - centerY, clientX - centerX) * (180 / Math.PI);
  }

  function startRotateDrag(event: React.MouseEvent<HTMLElement> | React.PointerEvent<HTMLElement>) {
    event.preventDefault();
    event.stopPropagation();
    selectNode();
    const frameRect = wrapperRef.current
      ?.querySelector<HTMLElement>("[data-notice-image-frame]")
      ?.getBoundingClientRect();
    const centerX = frameRect && frameRect.width > 0 ? frameRect.left + frameRect.width / 2 : event.clientX;
    const centerY = frameRect && frameRect.height > 0 ? frameRect.top + frameRect.height / 2 : event.clientY + 80;
    rotateDragRef.current = {
      centerX,
      centerY,
      startPointerAngle: getPointerAngle(centerX, centerY, event.clientX, event.clientY),
      startRotate: rotate,
    };
    const applyRotate = (clientX: number, clientY: number) => {
      const drag = rotateDragRef.current;
      if (!drag) return;
      const pointerAngle = getPointerAngle(drag.centerX, drag.centerY, clientX, clientY);
      const delta = pointerAngle - drag.startPointerAngle;
      const nextRotate = normalizeRotate(Math.round((drag.startRotate + delta) / 5) * 5);
      updateImageAttrs({
        rotate: nextRotate,
      });
    };
    const handleMove = (moveEvent: MouseEvent | PointerEvent) => {
      moveEvent.preventDefault();
      applyRotate(moveEvent.clientX, moveEvent.clientY);
    };
    const finishDrag = () => {
      rotateDragRef.current = null;
      document.removeEventListener("mousemove", handleMove);
      document.removeEventListener("pointermove", handleMove);
      document.removeEventListener("mouseup", finishDrag);
      document.removeEventListener("pointerup", finishDrag);
    };
    document.addEventListener("mousemove", handleMove);
    document.addEventListener("pointermove", handleMove);
    document.addEventListener("mouseup", finishDrag);
    document.addEventListener("pointerup", finishDrag);
  }

  function startCropDrag(
    event: React.MouseEvent<HTMLElement> | React.PointerEvent<HTMLElement>,
    handle: ResizeHandle = "bottom-right",
  ) {
    event.preventDefault();
    event.stopPropagation();
    selectNode();
    const frameRect = wrapperRef.current
      ?.querySelector<HTMLElement>("[data-notice-image-frame]")
      ?.getBoundingClientRect();
    cropDragRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      frameWidth: frameRect?.width && frameRect.width > 0 ? frameRect.width : 400,
      frameHeight: frameRect?.height && frameRect.height > 0 ? frameRect.height : 300,
      startBox: cropDraft,
      handle,
    };
    const applyDrag = (clientX: number, clientY: number) => {
      const drag = cropDragRef.current;
      if (!drag) return;
      const deltaXPercent = ((clientX - drag.startX) / Math.max(1, drag.frameWidth)) * 100;
      const deltaYPercent = ((clientY - drag.startY) / Math.max(1, drag.frameHeight)) * 100;
      const nextBox = { ...drag.startBox };

      if (drag.handle.includes("left")) nextBox.left = drag.startBox.left + deltaXPercent;
      if (drag.handle.includes("right")) nextBox.right = drag.startBox.right - deltaXPercent;
      if (drag.handle.includes("top")) nextBox.top = drag.startBox.top + deltaYPercent;
      if (drag.handle.includes("bottom")) nextBox.bottom = drag.startBox.bottom - deltaYPercent;

      setCropDraft(constrainCropBox(nextBox));
    };
    const handleMove = (moveEvent: MouseEvent | PointerEvent) => {
      moveEvent.preventDefault();
      applyDrag(moveEvent.clientX, moveEvent.clientY);
    };
    const finishDrag = () => {
      cropDragRef.current = null;
      document.removeEventListener("mousemove", handleMove);
      document.removeEventListener("pointermove", handleMove);
      document.removeEventListener("mouseup", finishDrag);
      document.removeEventListener("pointerup", finishDrag);
    };
    document.addEventListener("mousemove", handleMove);
    document.addEventListener("pointermove", handleMove);
    document.addEventListener("mouseup", finishDrag);
    document.addEventListener("pointerup", finishDrag);
  }

  function handleResizeMouseDown(event: React.MouseEvent<HTMLButtonElement> | React.PointerEvent<HTMLButtonElement>) {
    const handle = event.currentTarget.dataset.resizeHandle as ResizeHandle | undefined;
    startResizeDrag(event, handle || "bottom-right");
  }

  function handleRotateMouseDown(event: React.MouseEvent<HTMLButtonElement> | React.PointerEvent<HTMLButtonElement>) {
    startRotateDrag(event);
  }

  function openCurrentImageEditor() {
    setImageEditDraft(createImageEditDraft({ width, pixelWidth, pixelHeight, fit, cropX, cropY, rotate, zoom }));
    setIsCropMode(false);
    setIsImageEditorOpen(true);
  }

  const openImageEditor = (event: ImageToolButtonEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsImageObjectActive(true);
    setIsCropMode(false);
    openCurrentImageEditor();
  };

  const openImageEditorFromObject = (event: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>) => {
    if ("key" in event && event.key !== "Enter" && event.key !== " ") return;
    if (isImageControlTarget(event.target)) return;
    event.preventDefault();
    event.stopPropagation();
    setIsImageObjectActive(true);
    setIsCropMode(false);
    openCurrentImageEditor();
  };

  const enterInlineCropMode = (event: React.MouseEvent<HTMLElement>) => {
    if (isImageControlTarget(event.target)) return;
    event.preventDefault();
    event.stopPropagation();
    enterCropModeFromImageClick();
  };

  function cancelInlineCrop() {
    setCropDraft(DEFAULT_CROP_BOX);
    setIsCropMode(false);
    imageClickRef.current = null;
  }

  function applyInlineCrop() {
    if (cropDraft.top === 0 && cropDraft.right === 0 && cropDraft.bottom === 0 && cropDraft.left === 0) {
      cancelInlineCrop();
      return;
    }
    const cropAttrs = resolveCropBoxImageAttrs(cropDraft);
    updateImageAttrs({
      fit: "cover",
      cropX: cropAttrs.cropX,
      cropY: cropAttrs.cropY,
      zoom: cropAttrs.zoom,
    });
    setCropDraft(DEFAULT_CROP_BOX);
    setIsCropMode(false);
  }

  const applyImageEdit = () => {
    updateImageAttrs({
      pixelWidth: normalizePixelDimension(imageEditDraft.pixelWidth),
      pixelHeight: normalizePixelDimension(imageEditDraft.pixelHeight),
      fit: imageEditDraft.fit,
      cropX: imageEditDraft.cropX,
      cropY: imageEditDraft.cropY,
      rotate: imageEditDraft.rotate,
      zoom: normalizeImageZoom(imageEditDraft.zoom),
    });
    setIsImageEditorOpen(false);
  };

  const layoutButton = (
    label: string,
    active: boolean,
    nextLayout: ImageLayout,
    icon: React.ReactNode,
  ) => (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      data-notice-image-layout={nextLayout}
      className={cn(
        "flex h-10 w-11 items-center justify-center border-r border-stone-surface bg-white text-graphite hover:bg-parchment-card focus:outline-none focus:ring-2 focus:ring-sky-blue/30",
        active && "text-sky-blue",
      )}
      onMouseDown={(event) => {
        event.preventDefault();
        event.stopPropagation();
      }}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        applyImageLayoutMode(nextLayout);
      }}
    >
      <span
        className={cn(
          "flex size-8 items-center justify-center rounded-full",
          active && "bg-sky-blue/15",
        )}
      >
        {icon}
      </span>
    </button>
  );

  const resizeHandles: Array<{ handle: ResizeHandle; label: string; className: string; style: CSSProperties }> = [
    { handle: "top-left", label: "이미지 크기 조절 왼쪽 위", className: "cursor-nwse-resize", style: { left: -4, top: -4 } },
    { handle: "top", label: "이미지 크기 조절 위", className: "cursor-ns-resize", style: { left: "50%", top: -4, transform: "translateX(-50%)" } },
    { handle: "top-right", label: "이미지 크기 조절 오른쪽 위", className: "cursor-nesw-resize", style: { right: -4, top: -4 } },
    { handle: "right", label: "이미지 크기 조절 오른쪽", className: "cursor-ew-resize", style: { right: -4, top: "50%", transform: "translateY(-50%)" } },
    { handle: "bottom-right", label: "이미지 크기 조절 오른쪽 아래", className: "cursor-nwse-resize", style: { right: -4, bottom: -4 } },
    { handle: "bottom", label: "이미지 크기 조절 아래", className: "cursor-ns-resize", style: { left: "50%", bottom: -4, transform: "translateX(-50%)" } },
    { handle: "bottom-left", label: "이미지 크기 조절 왼쪽 아래", className: "cursor-nesw-resize", style: { left: -4, bottom: -4 } },
    { handle: "left", label: "이미지 크기 조절 왼쪽", className: "cursor-ew-resize", style: { left: -4, top: "50%", transform: "translateY(-50%)" } },
  ];
  const cropHandles: Array<{ handle: ResizeHandle; label: string; className: string; style: CSSProperties; markClassName: string }> = [
    {
      handle: "top-left",
      label: "자르기 왼쪽 위",
      className: "cursor-nwse-resize",
      style: { left: -10, top: -10 },
      markClassName: "border-l-2 border-t-2",
    },
    {
      handle: "top",
      label: "자르기 위",
      className: "cursor-ns-resize",
      style: { left: "50%", top: -8, transform: "translateX(-50%)" },
      markClassName: "h-1 w-8 border-t-2",
    },
    {
      handle: "top-right",
      label: "자르기 오른쪽 위",
      className: "cursor-nesw-resize",
      style: { right: -10, top: -10 },
      markClassName: "border-r-2 border-t-2",
    },
    {
      handle: "right",
      label: "자르기 오른쪽",
      className: "cursor-ew-resize",
      style: { right: -8, top: "50%", transform: "translateY(-50%)" },
      markClassName: "h-8 w-1 border-r-2",
    },
    {
      handle: "bottom-right",
      label: "자르기 오른쪽 아래",
      className: "cursor-nwse-resize",
      style: { right: -10, bottom: -10 },
      markClassName: "border-b-2 border-r-2",
    },
    {
      handle: "bottom",
      label: "자르기 아래",
      className: "cursor-ns-resize",
      style: { left: "50%", bottom: -8, transform: "translateX(-50%)" },
      markClassName: "h-1 w-8 border-b-2",
    },
    {
      handle: "bottom-left",
      label: "자르기 왼쪽 아래",
      className: "cursor-nesw-resize",
      style: { left: -10, bottom: -10 },
      markClassName: "border-b-2 border-l-2",
    },
    {
      handle: "left",
      label: "자르기 왼쪽",
      className: "cursor-ew-resize",
      style: { left: -8, top: "50%", transform: "translateY(-50%)" },
      markClassName: "h-8 w-1 border-l-2",
    },
  ];
  const cropBoxStyle: CSSProperties = {
    top: `${cropDraft.top}%`,
    right: `${cropDraft.right}%`,
    bottom: `${cropDraft.bottom}%`,
    left: `${cropDraft.left}%`,
  };

  const imageEditorDialog = isImageEditorOpen ? (
    <ImageEditorDialog
      draft={imageEditDraft}
      imageSrc={imageSrc}
      imageAlt={String(attrs.alt || "본문 이미지")}
      layout={layout}
      onDraftChange={(updates) => setImageEditDraft((draft) => ({ ...draft, ...updates }))}
      onLayoutChange={(nextLayout) => updateImageAttrs({ layout: nextLayout })}
      onCancel={() => setIsImageEditorOpen(false)}
      onApply={applyImageEdit}
    />
  ) : null;
  const layerPixelWidth = pixelWidth || Math.max(120, Math.round(width * 8));
  const imageWrapperStyle: CSSProperties = {
    width: isLayerLayout ? "0px" : pixelWidth ? `${pixelWidth}px` : `${width}%`,
    height: isLayerLayout ? "0px" : undefined,
    maxWidth: isLayerLayout ? "none" : "100%",
    paddingBottom: !isLayerLayout && isActive ? (isCropMode ? "72px" : "56px") : undefined,
    overflow: isLayerLayout ? "visible" : undefined,
  };
  const imageFrameStyle: CSSProperties = {
    width: "100%",
    maxWidth: "100%",
    height: pixelHeight ? `${pixelHeight}px` : undefined,
    aspectRatio: fit === "cover" && !pixelWidth && !pixelHeight && !rotate ? "1 / 1" : undefined,
    overflow: isCropMode ? "hidden" : rotate ? "visible" : "hidden",
    display: "block",
  };
  const hasPixelSize = Boolean(pixelWidth || pixelHeight);
  const objectFit = rotate ? (hasPixelSize ? "fill" : "contain") : hasPixelSize ? "fill" : fit;
  const objectTransform = rotate ? `rotate(${rotate}deg)` : undefined;
  const imageTransform = zoom !== 100 ? `scale(${zoom / 100})` : undefined;
  const rotationLabel = `${rotate.toFixed(1)}°`;
  const estimatedLayerHeight = pixelHeight || Math.max(90, Math.round(layerPixelWidth * 0.75));
  const layerToolbarStyle: CSSProperties | undefined = isLayerLayout
    ? {
      left: `${offsetX}px`,
      top: `${offsetY + estimatedLayerHeight}px`,
    }
    : undefined;
  const layerSurfaceStyle: CSSProperties = isLayerLayout
    ? {
      position: "absolute",
      left: `${offsetX}px`,
      top: `${offsetY}px`,
      width: `${layerPixelWidth}px`,
      zIndex: layout === "front" ? 30 : 0,
      transform: objectTransform,
      transformOrigin: "center",
    }
    : {
      width: "100%",
      transform: objectTransform,
      transformOrigin: "center",
    };

  if (!imageSrc) {
    return (
      <NodeViewWrapper
        as="span"
        data-notice-image-node=""
        data-notice-image-missing-src=""
        style={{ display: "none" }}
      />
    );
  }

  return (
    <NodeViewWrapper
      ref={wrapperRef}
      as="span"
      role={isActive ? "group" : undefined}
      aria-label={isActive ? "이미지 객체" : undefined}
      className={cn(
        "relative my-2 inline-block max-w-full align-top",
        layout === "inline" && "inline-block",
        isLayerLayout && "inline-block overflow-visible",
        layout !== "inline" && !isLayerLayout && "block",
        layout === "wrap" && align === "left" && "float-left mr-4 mb-3",
        layout === "wrap" && align === "right" && "float-right ml-4 mb-3",
        layout === "behind" && "z-0",
        layout === "front" && "z-30",
        layout === "block" && align === "center" && "mx-auto",
        layout === "block" && align === "right" && "ml-auto mr-0",
        layout === "block" && align === "left" && "ml-0 mr-auto",
      )}
      data-notice-image-node=""
      data-selected={isActive ? "true" : undefined}
      data-layer-layout={isLayerLayout ? layout : undefined}
      tabIndex={0}
      draggable
      style={imageWrapperStyle}
      onPointerDownCapture={selectNodeFromPointer}
      onMouseDownCapture={selectNodeFromPointer}
      onClick={selectNodeFromPointer}
      onDoubleClick={enterInlineCropMode}
      onKeyDown={openImageEditorFromObject}
    >
      {/* Tiptap NodeView must render the editable document image as a plain img node. */}
      <span
        data-notice-image-rotatable-surface=""
        data-notice-image-move-surface=""
        className={cn("relative block", !isLayerLayout && "max-w-full")}
        style={layerSurfaceStyle}
      >
        <span
          data-notice-image-frame=""
          style={imageFrameStyle}
          className={cn("rounded-none border border-stone-surface bg-white", isActive && "ring-2 ring-sky-blue", isCropMode && "ring-sky-blue")}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageSrc}
            alt={String(attrs.alt || "본문 이미지")}
            data-width={width}
            data-fit={fit}
            data-crop-x={cropX}
            data-crop-y={cropY}
            data-rotate={rotate}
            data-align={align}
            data-layout={layout}
            data-zoom={zoom}
            data-offset-x={offsetX}
            data-offset-y={offsetY}
            data-pixel-width={pixelWidth || undefined}
            data-pixel-height={pixelHeight || undefined}
            draggable
            style={{
              width: "100%",
              maxWidth: "none",
              height: pixelHeight || fit === "cover" ? "100%" : "auto",
              objectFit,
              objectPosition: `${cropX} ${cropY}`,
              transform: imageTransform,
              transformOrigin: "center",
              opacity: layout === "behind" ? 0.45 : 1,
              display: "block",
            }}
            className={cn("rounded-none", isActive && (fit === "cover" ? "cursor-move" : "cursor-grab active:cursor-grabbing"), isCropMode && "cursor-crosshair")}
          />
        </span>

        {isActive && isCropMode && (
          <span
            data-notice-image-crop-overlay=""
            className="pointer-events-none absolute inset-0 z-20 bg-black/20"
          >
            <span
              data-notice-image-crop-box=""
              className="absolute border-2 border-white shadow-[0_0_0_9999px_rgba(0,0,0,0.35)]"
              style={cropBoxStyle}
            >
              {cropHandles.map(({ handle, label, className, style, markClassName }) => (
                <button
                  key={handle}
                  type="button"
                  aria-label={label}
                  data-notice-image-crop-handle=""
                  data-crop-handle={handle}
                  className={cn(
                    "pointer-events-auto absolute z-30 flex size-5 items-center justify-center bg-transparent text-white focus:outline-none focus:ring-2 focus:ring-white/70",
                    className,
                  )}
                  style={style}
                  onPointerDown={(event) => startCropDrag(event, handle)}
                  onMouseDown={(event) => startCropDrag(event, handle)}
                >
                  <span
                    aria-hidden="true"
                    className={cn("block size-4 border-white drop-shadow", markClassName)}
                  />
                  <span className="sr-only">{label}</span>
                </button>
              ))}
            </span>
          </span>
        )}

        {isActive && !isCropMode && rotate !== 0 && (
        <span
          aria-hidden="true"
          data-notice-image-rotation-outline=""
          className="pointer-events-none absolute inset-0 z-10 border border-sky-blue"
          style={{ transform: "none", transformOrigin: "center" }}
        />
        )}

        {isActive && !isCropMode && (
          <>
            <span
              aria-hidden="true"
              data-notice-image-rotate-line=""
              className="pointer-events-none absolute z-20 h-7 border-l border-sky-blue"
              style={{ left: "50%", top: -34, transform: "translateX(-50%)" }}
            />
            <button
              type="button"
              aria-label="이미지 회전 핸들"
              data-notice-image-rotate=""
              className="absolute z-30 flex size-3 cursor-grab items-center justify-center rounded-full border border-sky-blue bg-sky-blue text-sky-blue shadow-sm active:cursor-grabbing focus:outline-none focus:ring-2 focus:ring-sky-blue/40"
              style={{ left: "50%", top: -42, transform: "translateX(-50%)" }}
              onPointerDown={handleRotateMouseDown}
              onMouseDown={handleRotateMouseDown}
            >
              <span className="sr-only">이미지 회전 핸들</span>
            </button>
            <span
              aria-hidden="true"
              data-notice-image-rotation-angle=""
              className="pointer-events-none absolute z-30 rounded-sm bg-white/90 px-1 text-[11px] font-medium leading-4 text-charcoal-primary shadow-sm"
              style={{
                left: "50%",
                top: -42,
                transform: `translate(18px, -50%) rotate(${-rotate}deg)`,
                transformOrigin: "left center",
              }}
            >
              {rotationLabel}
            </span>
          </>
        )}

        {isActive && !isCropMode && resizeHandles.map(({ handle, label, className, style }) => (
          <button
            key={handle}
            type="button"
            aria-label={label}
            data-notice-image-resize=""
            data-resize-handle={handle}
            className={cn(
              "absolute z-30 flex size-2 items-center justify-center rounded-[1px] border border-sky-blue bg-sky-blue text-sky-blue shadow-none hover:bg-sky-blue/90 focus:outline-none focus:ring-2 focus:ring-sky-blue/40",
              className,
            )}
            style={style}
            onPointerDown={handleResizeMouseDown}
            onMouseDown={handleResizeMouseDown}
          >
            <span className="sr-only">{label}</span>
          </button>
        ))}
      </span>

      {isActive && !isCropMode && (
        <div
          role="toolbar"
          aria-label="이미지 레이아웃 도구"
          data-notice-image-controls=""
          className="absolute left-0 top-full z-20 mt-3 flex items-center rounded-full border border-stone-surface bg-white shadow-lg"
          style={layerToolbarStyle}
          onClick={(event) => event.stopPropagation()}
        >
          {layoutButton("글자처럼 처리", layout === "inline", "inline", <ImageLayoutIcon variant="inline" active={layout === "inline"} />)}
          {layoutButton("이미지 텍스트 감싸기", layout === "wrap", "wrap", <ImageLayoutIcon variant="wrap" active={layout === "wrap"} />)}
          {layoutButton("텍스트와 함께 이동", layout === "block", "block", <ImageLayoutIcon variant="block" active={layout === "block"} />)}
          {layoutButton("텍스트 뒤에 배치", layout === "behind", "behind", <ImageLayoutIcon variant="behind" active={layout === "behind"} />)}
          {layoutButton("텍스트 앞에 배치", layout === "front", "front", <ImageLayoutIcon variant="front" active={layout === "front"} />)}
          <span aria-hidden="true" className="mx-1 h-6 border-l border-stone-surface" />
          <button
            type="button"
            aria-label="이미지 고급 설정"
            data-notice-image-open-editor=""
            className="flex h-10 w-11 items-center justify-center bg-white text-graphite hover:bg-parchment-card focus:outline-none focus:ring-2 focus:ring-sky-blue/30"
            onPointerDown={(event) => {
              event.preventDefault();
              event.stopPropagation();
              openImageEditor(event);
            }}
            onMouseDown={(event) => {
              openImageEditor(event);
            }}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              openCurrentImageEditor();
            }}
          >
            <MoreVertical className="size-5" aria-hidden="true" />
          </button>
        </div>
      )}

      {isActive && isCropMode && (
        <div
          role="toolbar"
          aria-label="이미지 자르기 도구"
          data-notice-image-crop-controls=""
          className="absolute left-0 top-full z-30 mt-3 flex items-center gap-1 rounded-full border border-stone-surface bg-white px-2 py-1 shadow-lg"
          style={layerToolbarStyle}
          onClick={(event) => event.stopPropagation()}
        >
          <CropIcon className="ml-1 size-4 text-sky-blue" aria-hidden="true" />
          <button
            type="button"
            aria-label="자르기 초기화"
            data-notice-image-crop-action="reset"
            className="rounded-full px-3 py-2 text-xs font-bold text-graphite hover:bg-parchment-card focus:outline-none focus:ring-2 focus:ring-sky-blue/30"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              setCropDraft(DEFAULT_CROP_BOX);
            }}
          >
            원본
          </button>
          <button
            type="button"
            aria-label="자르기 취소"
            data-notice-image-crop-action="cancel"
            className="rounded-full px-3 py-2 text-xs font-bold text-graphite hover:bg-parchment-card focus:outline-none focus:ring-2 focus:ring-sky-blue/30"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              cancelInlineCrop();
            }}
          >
            취소
          </button>
          <button
            type="button"
            aria-label="자르기 저장"
            data-notice-image-crop-action="apply"
            className="rounded-full bg-charcoal-primary px-4 py-2 text-xs font-bold text-white hover:bg-charcoal-primary/90 focus:outline-none focus:ring-2 focus:ring-charcoal-primary/30"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              applyInlineCrop();
            }}
          >
            저장
          </button>
        </div>
      )}

      {imageEditorDialog && typeof document !== "undefined" ? createPortal(imageEditorDialog, document.body) : null}
    </NodeViewWrapper>
  );
}

function buildGalleryHtml(layout: Exclude<ImageInsertMode, "inline">, urls: string[]) {
  const images = urls.map((url, index) => {
    const isFeatured = layout === "featured-grid" && index === 0;
    const style = buildImageStyle({
      width: 100,
      fit: "contain",
      cropX: "center",
      cropY: "center",
      rotate: 0,
      align: "left",
      layout: "block",
      zoom: 100,
      isGalleryImage: true,
      isFeatured,
    });
    return `<img src="${escapeAttr(url)}" alt="본문 이미지" data-width="100" data-fit="contain" data-crop-x="center" data-crop-y="center" data-rotate="0" data-align="left" data-layout="block" data-zoom="100" data-offset-x="0" data-offset-y="0" style="${style}" />`;
  });
  return `<div data-notice-gallery="${layout}" contenteditable="false" class="notice-image-gallery" role="group" aria-label="이미지 묶음" style="${GALLERY_GRID_STYLE}">${images.join("")}</div><p></p>`;
}

const FontSizeExtension = Extension.create({
  name: "fontSize",
  addGlobalAttributes() {
    return [
      {
        types: ["textStyle"],
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (element) => element.getAttribute("data-font-size") || element.style.fontSize || null,
            renderHTML: (attributes) => {
              if (!attributes.fontSize) return {};
              return {
                "data-font-size": attributes.fontSize,
                style: `font-size:${attributes.fontSize};`,
              };
            },
          },
        },
      },
    ];
  },
  addCommands() {
    return {
      setFontSize:
        (fontSize: string) =>
        ({ chain }) =>
          chain().setMark("textStyle", { fontSize }).run(),
      unsetFontSize:
        () =>
        ({ chain }) =>
          chain().setMark("textStyle", { fontSize: null }).removeEmptyTextStyle().run(),
    };
  },
});

const LineHeightExtension = Extension.create({
  name: "lineHeight",
  addGlobalAttributes() {
    return [
      {
        types: ["paragraph"],
        attributes: {
          lineHeight: {
            default: null,
            parseHTML: (element) => element.getAttribute("data-line-height") || element.style.lineHeight || null,
            renderHTML: (attributes) => {
              if (!attributes.lineHeight) return {};
              return {
                "data-line-height": attributes.lineHeight,
                style: `line-height:${attributes.lineHeight};`,
              };
            },
          },
        },
      },
    ];
  },
  addCommands() {
    return {
      setLineHeight:
        (lineHeight: string) =>
        ({ chain }) =>
          chain().updateAttributes("paragraph", { lineHeight }).run(),
      unsetLineHeight:
        () =>
        ({ chain }) =>
          chain().updateAttributes("paragraph", { lineHeight: null }).run(),
    };
  },
});

const NoticeImage = Image.extend({
  parseHTML() {
    const keepOnlyImagesWithSrc = (element: HTMLElement | string) => {
      if (typeof element === "string") return false;
      return element.getAttribute("src")?.trim() ? null : false;
    };

    return [
      { tag: "img[src]", getAttrs: keepOnlyImagesWithSrc },
      { tag: "p img[src]", getAttrs: keepOnlyImagesWithSrc },
    ];
  },
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: 100,
        parseHTML: (element) => Number(element.getAttribute("data-width") || "100"),
        renderHTML: (attributes) => ({ "data-width": attributes.width }),
      },
      fit: {
        default: "contain",
        parseHTML: (element) => element.getAttribute("data-fit") || "contain",
        renderHTML: (attributes) => ({ "data-fit": attributes.fit }),
      },
      cropX: {
        default: "center",
        parseHTML: (element) => element.getAttribute("data-crop-x") || "center",
        renderHTML: (attributes) => ({ "data-crop-x": attributes.cropX }),
      },
      cropY: {
        default: "center",
        parseHTML: (element) => element.getAttribute("data-crop-y") || "center",
        renderHTML: (attributes) => ({ "data-crop-y": attributes.cropY }),
      },
      rotate: {
        default: 0,
        parseHTML: (element) => Number(element.getAttribute("data-rotate") || "0"),
        renderHTML: (attributes) => ({ "data-rotate": attributes.rotate }),
      },
      align: {
        default: "left",
        parseHTML: (element) => element.getAttribute("data-align") || "left",
        renderHTML: (attributes) => ({ "data-align": attributes.align }),
      },
      layout: {
        default: "block",
        parseHTML: (element) => element.getAttribute("data-layout") || "block",
        renderHTML: (attributes) => ({ "data-layout": attributes.layout || "block" }),
      },
      zoom: {
        default: 100,
        parseHTML: (element) => normalizeImageZoom(element.getAttribute("data-zoom")),
        renderHTML: (attributes) => ({ "data-zoom": normalizeImageZoom(attributes.zoom) }),
      },
      pixelWidth: {
        default: null,
        parseHTML: (element) => normalizePixelDimension(element.getAttribute("data-pixel-width")),
        renderHTML: (attributes) => {
          const pixelWidth = normalizePixelDimension(attributes.pixelWidth);
          return pixelWidth ? { "data-pixel-width": pixelWidth } : {};
        },
      },
      pixelHeight: {
        default: null,
        parseHTML: (element) => normalizePixelDimension(element.getAttribute("data-pixel-height")),
        renderHTML: (attributes) => {
          const pixelHeight = normalizePixelDimension(attributes.pixelHeight);
          return pixelHeight ? { "data-pixel-height": pixelHeight } : {};
        },
      },
      offsetX: {
        default: 0,
        parseHTML: (element) => normalizeImageOffset(element.getAttribute("data-offset-x")),
        renderHTML: (attributes) => ({ "data-offset-x": normalizeImageOffset(attributes.offsetX) }),
      },
      offsetY: {
        default: 0,
        parseHTML: (element) => normalizeImageOffset(element.getAttribute("data-offset-y")),
        renderHTML: (attributes) => ({ "data-offset-y": normalizeImageOffset(attributes.offsetY) }),
      },
      style: {
        default: null,
        renderHTML: (attributes) => ({
          style: buildImageStyle({
            width: Number(attributes.width || 100),
            fit: normalizeImageFit(String(attributes.fit || "")),
            cropX: normalizeCropX(String(attributes.cropX || "")),
            cropY: normalizeCropY(String(attributes.cropY || "")),
            rotate: normalizeRotate(attributes.rotate),
            align: attributes.align === "right" || attributes.align === "center" ? attributes.align : "left",
            layout: normalizeImageLayout(String(attributes.layout || "")),
            zoom: normalizeImageZoom(attributes.zoom),
            pixelWidth: normalizePixelDimension(attributes.pixelWidth),
            pixelHeight: normalizePixelDimension(attributes.pixelHeight),
            offsetX: normalizeImageOffset(attributes.offsetX),
            offsetY: normalizeImageOffset(attributes.offsetY),
          }),
        }),
      },
    };
  },
  addNodeView() {
    return ReactNodeViewRenderer(NoticeImageNodeView);
  },
});

const NoticeGallery = Node.create({
  name: "noticeGallery",
  group: "block",
  content: "image+",
  isolating: true,
  selectable: true,
  addAttributes() {
    return {
      layout: {
        default: "two-column",
        parseHTML: (element) => element.getAttribute("data-notice-gallery") || "two-column",
      },
    };
  },
  parseHTML() {
    return [{ tag: "div[data-notice-gallery]" }];
  },
  renderHTML({ HTMLAttributes }) {
    const { layout, ...safeAttributes } = HTMLAttributes;
    return [
      "div",
      mergeAttributes(safeAttributes, {
        "data-notice-gallery": layout || "two-column",
        contenteditable: "false",
        class: "notice-image-gallery",
        role: "group",
        "aria-label": "이미지 묶음",
        style: GALLERY_GRID_STYLE,
      }),
      0,
    ];
  },
});

export function RichTextEditorV2({
  value,
  onChange,
  onUploadImage,
  ariaLabel,
  placeholder,
}: RichTextEditorV2Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const selectedLinkRef = useRef<HTMLAnchorElement | null>(null);
  const pasteImageFilesRef = useRef<(files: File[]) => void>(() => undefined);
  const lastEditorHtmlRef = useRef("");
  const [imageInsertMode, setImageInsertMode] = useState<ImageInsertMode>("inline");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [linkDraft, setLinkDraft] = useState<LinkDraft | null>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        link: false,
        underline: false,
      }),
      TextStyle,
      FontFamily.configure({ types: ["textStyle"] }),
      FontSizeExtension,
      LineHeightExtension,
      Color,
      Highlight.configure({ multicolor: true }),
      Underline,
      TextAlign.configure({ types: ["paragraph", "heading"] }),
      Link.configure({
        openOnClick: false,
        autolink: false,
        HTMLAttributes: {
          target: null,
          rel: null,
        },
      }),
      NoticeImage.configure({ inline: true, allowBase64: false }),
      NoticeGallery,
    ],
    content: normalizeEditorInputHtml(value || ""),
    editorProps: {
      attributes: {
        role: "textbox",
        "aria-label": ariaLabel,
        "data-placeholder": placeholder,
        class: cn(
          "min-h-[360px] w-full outline-none empty:before:text-ash empty:before:content-[attr(data-placeholder)] sm:min-h-[420px]",
          NEWS_ARTICLE_BODY_SURFACE_CLASS,
        ),
      },
      handleDOMEvents: {
        input: (view) => {
          const domHtml = view.dom.innerHTML;
          if (!lastEditorHtmlRef.current || hasEquivalentEditorHtml(domHtml, lastEditorHtmlRef.current)) {
            return false;
          }
          lastEditorHtmlRef.current = domHtml;
          onChange(domHtml);
          return false;
        },
        click: (view, event) => {
          const target = event.target as HTMLElement;
          const link = target.closest("a") as HTMLAnchorElement | null;
          if (link) {
            event.preventDefault();
            selectedLinkRef.current = link;
            setLinkDraft({
              url: normalizeLinkDraftUrl(link.getAttribute("href") || ""),
              label: link.textContent?.trim() || "",
              error: "",
              mode: "edit",
            });
            return true;
          }

          if (view.state.selection instanceof NodeSelection || shouldMoveCursorToDocumentEndOnClick(view.dom, event.target)) {
            const end = view.state.doc.content.size;
            view.dispatch(view.state.tr.setSelection(TextSelection.near(view.state.doc.resolve(end))));
          }
          return false;
        },
      },
      handlePaste: (_view, event) => {
        const files = Array.from(event.clipboardData?.files || []).filter((file) => file.type.startsWith("image/"));
        if (files.length === 0) return false;
        event.preventDefault();
        pasteImageFilesRef.current(files);
        return true;
      },
    },
    onUpdate: ({ editor: updatedEditor }) => {
      const updatedHtml = updatedEditor.getHTML();
      lastEditorHtmlRef.current = updatedHtml;
      onChange(updatedHtml);
    },
  });

  useEffect(() => {
    if (!editor || editor.isFocused) return;
    if (!lastEditorHtmlRef.current) {
      lastEditorHtmlRef.current = editor.getHTML();
    }
    const normalizedValue = normalizeEditorInputHtml(value || "");
    if (!hasEquivalentEditorHtml(editor.getHTML(), normalizedValue)) {
      const timeout = window.setTimeout(() => {
        if (editor.isDestroyed || editor.isFocused) return;
        if (!hasEquivalentEditorHtml(editor.getHTML(), normalizedValue)) {
          editor.commands.setContent(normalizedValue, { emitUpdate: false });
          lastEditorHtmlRef.current = editor.getHTML();
        }
      }, 0);
      return () => window.clearTimeout(timeout);
    }
    return undefined;
  }, [editor, value]);

  useEffect(() => {
    if (!editor) return;
    const handlePasteCapture = (event: ClipboardEvent) => {
      const files = Array.from(event.clipboardData?.files || []).filter((file) => file.type.startsWith("image/"));
      if (files.length === 0) return;
      event.preventDefault();
      event.stopPropagation();
      pasteImageFilesRef.current(files);
    };
    editor.view.dom.addEventListener("paste", handlePasteCapture, true);
    return () => {
      editor.view.dom.removeEventListener("paste", handlePasteCapture, true);
    };
  }, [editor]);

  const run = useCallback((callback: () => void) => {
    if (!editor) return;
    callback();
  }, [editor]);

  const insertImageFiles = useCallback(async (files: File[]) => {
    if (!editor || files.length === 0) return;
    setIsUploadingImage(true);
    try {
      const uploaded = await Promise.all(files.map((file) => onUploadImage(file)));
      const urls = uploaded.map((item) => item.url);
      if (urls.length > 1 && imageInsertMode !== "inline") {
        editor.chain().focus().insertContent(buildGalleryHtml(imageInsertMode, urls)).run();
        return;
      }
      editor.chain().focus().insertContent(urls.map(buildImageHtml).join("")).run();
      const lastImage = findLastImageNode(editor);
      if (lastImage) {
        editor.chain().focus().setNodeSelection(lastImage.pos).run();
      }
    } finally {
      setIsUploadingImage(false);
    }
  }, [editor, imageInsertMode, onUploadImage]);

  useEffect(() => {
    pasteImageFilesRef.current = (files: File[]) => {
      void insertImageFiles(files);
    };
  }, [insertImageFiles]);

  const submitLinkDialog = () => {
    if (!editor || !linkDraft) return;
    const url = normalizeEditorLinkHref(linkDraft.url);
    const label = linkDraft.label.trim() || url;
    if (!url) {
      setLinkDraft({ ...linkDraft, error: "연결 주소를 입력해 주세요." });
      return;
    }
    const selectedLink = selectedLinkRef.current;
    if (selectedLink && linkDraft.mode === "edit") {
      selectedLink.setAttribute("href", url);
      selectedLink.textContent = label;
      editor.commands.setContent(editor.view.dom.innerHTML, { emitUpdate: false });
      onChange(editor.getHTML());
      selectedLinkRef.current = null;
    } else if (linkDraft.replaceWholeContent) {
      editor.commands.setContent(`<p><a href="${escapeAttr(url)}">${escapeAttr(label)}</a></p>`);
    } else if (editor.state.selection.empty) {
      editor.chain().focus().insertContent(`<a href="${escapeAttr(url)}">${escapeAttr(label)}</a>`).run();
    } else {
      editor.chain().focus().extendMarkRange("link").setLink({ href: url }).insertContent(label).run();
    }
    setLinkDraft(null);
  };

  const openLinkDialog = useCallback(() => {
    if (!editor) return;
    selectedLinkRef.current = null;
    const selectedText =
      editor.state.doc.textBetween(editor.state.selection.from, editor.state.selection.to).trim() ||
      getEditorDomSelectionText(editor.view.dom);
    const editorText = editor.getText().trim();
    setLinkDraft({
      url: editor.getAttributes("link").href || "",
      label: selectedText,
      error: "",
      mode: "create",
      replaceWholeContent: Boolean(selectedText && selectedText === editorText),
    });
  }, [editor]);

  const markButton = (
    label: string,
    icon: React.ReactNode,
    active: boolean,
    onClick: () => void,
  ) => (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      className={cn(TOOL_BUTTON_CLASS, active && TOOL_BUTTON_ACTIVE_CLASS)}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
    >
      {icon}
    </button>
  );

  return (
    <div className="relative overflow-hidden rounded-xl border border-stone-surface bg-white focus-within:border-sky-blue focus-within:ring-1 focus-within:ring-sky-blue/30">
      <div className="flex flex-wrap items-center border-b border-stone-surface bg-[#fbfaf9]">
        <label className="sr-only" htmlFor="rich-editor-font-family">글꼴</label>
        <select
          id="rich-editor-font-family"
          aria-label="글꼴"
          className={cn(FIELD_CLASS, "w-36")}
          value={editor?.getAttributes("textStyle").fontFamily || "Pretendard"}
          onChange={(event) => run(() => editor?.chain().focus().setFontFamily(event.target.value).run())}
        >
          {FONT_OPTIONS.map((font) => (
            <option key={font.value} value={font.value}>{font.label}</option>
          ))}
        </select>
        <label className="sr-only" htmlFor="rich-editor-font-size">글자 크기</label>
        <select
          id="rich-editor-font-size"
          aria-label="글자 크기"
          className={cn(FIELD_CLASS, "w-28")}
          value={editor?.getAttributes("textStyle").fontSize || "12px"}
          onChange={(event) => run(() => editor?.chain().focus().setFontSize(event.target.value).run())}
        >
          {FONT_SIZE_OPTIONS.map((size) => (
            <option key={size} value={size}>{size}</option>
          ))}
        </select>
        {markButton("굵게", <Bold className="size-4" aria-hidden="true" />, Boolean(editor?.isActive("bold")), () => run(() => editor?.chain().focus().toggleBold().run()))}
        {markButton("기울임", <Italic className="size-4" aria-hidden="true" />, Boolean(editor?.isActive("italic")), () => run(() => editor?.chain().focus().toggleItalic().run()))}
        {markButton("밑줄", <UnderlineIcon className="size-4" aria-hidden="true" />, Boolean(editor?.isActive("underline")), () => run(() => editor?.chain().focus().toggleUnderline().run()))}
        {markButton("취소선", <Strikethrough className="size-4" aria-hidden="true" />, Boolean(editor?.isActive("strike")), () => run(() => editor?.chain().focus().toggleStrike().run()))}
        <label className="flex h-9 items-center gap-2 border-r border-stone-surface px-2 text-xs font-bold text-graphite">
          글자색
          <input
            aria-label="글자색"
            type="color"
            value="#343433"
            className="size-6 rounded border border-stone-surface bg-white"
            onChange={(event) => run(() => editor?.chain().focus().setColor(event.target.value).run())}
          />
        </label>
        <label className="flex h-9 items-center gap-2 border-r border-stone-surface px-2 text-xs font-bold text-graphite">
          배경색
          <input
            aria-label="배경색"
            type="color"
            value="#ffffff"
            className="size-6 rounded border border-stone-surface bg-white"
            onChange={(event) => run(() => editor?.chain().focus().toggleHighlight({ color: event.target.value }).run())}
          />
        </label>
        {markButton("왼쪽 정렬", <AlignLeft className="size-4" aria-hidden="true" />, Boolean(editor?.isActive({ textAlign: "left" })), () => run(() => editor?.chain().focus().setTextAlign("left").run()))}
        {markButton("가운데 정렬", <AlignCenter className="size-4" aria-hidden="true" />, Boolean(editor?.isActive({ textAlign: "center" })), () => run(() => editor?.chain().focus().setTextAlign("center").run()))}
        {markButton("오른쪽 정렬", <AlignRight className="size-4" aria-hidden="true" />, Boolean(editor?.isActive({ textAlign: "right" })), () => run(() => editor?.chain().focus().setTextAlign("right").run()))}
        {markButton("양쪽 정렬", <AlignJustify className="size-4" aria-hidden="true" />, Boolean(editor?.isActive({ textAlign: "justify" })), () => run(() => editor?.chain().focus().setTextAlign("justify").run()))}
        {markButton("글머리 기호", <List className="size-4" aria-hidden="true" />, Boolean(editor?.isActive("bulletList")), () => run(() => editor?.chain().focus().toggleBulletList().run()))}
        {markButton("번호 목록", <ListOrdered className="size-4" aria-hidden="true" />, Boolean(editor?.isActive("orderedList")), () => run(() => editor?.chain().focus().toggleOrderedList().run()))}
        {markButton("내어쓰기", <Outdent className="size-4" aria-hidden="true" />, false, () => run(() => editor?.chain().focus().liftListItem("listItem").run()))}
        {markButton("들여쓰기", <Indent className="size-4" aria-hidden="true" />, false, () => run(() => editor?.chain().focus().sinkListItem("listItem").run()))}
        <label className="sr-only" htmlFor="rich-editor-line-height">줄간격</label>
        <select
          id="rich-editor-line-height"
          aria-label="줄간격"
          className={cn(FIELD_CLASS, "w-24")}
          value={editor?.getAttributes("paragraph").lineHeight || "1.625"}
          onChange={(event) => run(() => editor?.chain().focus().setLineHeight(event.target.value).run())}
        >
          {LINE_HEIGHT_OPTIONS.map((lineHeight) => (
            <option key={lineHeight} value={lineHeight}>{lineHeight}</option>
          ))}
        </select>
        <button
          type="button"
          aria-label="링크"
          aria-pressed={Boolean(editor?.isActive("link"))}
          className={cn(TOOL_BUTTON_CLASS, editor?.isActive("link") && TOOL_BUTTON_ACTIVE_CLASS)}
          onMouseDown={(event) => event.preventDefault()}
          onClick={openLinkDialog}
        >
          <LinkIcon className="size-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          aria-label="이미지 삽입"
          aria-pressed={imageInsertMode === "inline"}
          className={cn(TOOL_BUTTON_CLASS, imageInsertMode === "inline" && TOOL_BUTTON_ACTIVE_CLASS)}
          onClick={() => {
            setImageInsertMode("inline");
            fileInputRef.current?.click();
          }}
        >
          <ImageIcon className="size-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          aria-label="2열 이미지"
          aria-pressed={imageInsertMode === "two-column"}
          className={cn("h-9 border-r border-stone-surface px-3 text-xs font-bold text-graphite hover:bg-parchment-card", imageInsertMode === "two-column" && "bg-sky-blue text-white")}
          onClick={() => {
            setImageInsertMode("two-column");
            fileInputRef.current?.click();
          }}
        >
          2열
        </button>
        <button
          type="button"
          aria-label="대표+2열 이미지"
          aria-pressed={imageInsertMode === "featured-grid"}
          className={cn("h-9 border-r border-stone-surface px-3 text-xs font-bold text-graphite hover:bg-parchment-card", imageInsertMode === "featured-grid" && "bg-sky-blue text-white")}
          onClick={() => {
            setImageInsertMode("featured-grid");
            fileInputRef.current?.click();
          }}
        >
          대표+2열
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/png,image/jpeg,image/gif,image/webp"
          className="sr-only"
          aria-label="본문 이미지 선택"
          onChange={(event) => {
            const files = Array.from(event.target.files || []);
            event.target.value = "";
            void insertImageFiles(files);
          }}
        />
      </div>

      <EditorContent editor={editor} />

      {linkDraft && (
        <div className="fixed inset-0 z-[220] flex items-center justify-center bg-black/35 px-4 py-6" style={{ zIndex: 220 }}>
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="rich-editor-link-title"
            className="w-full max-w-md rounded-3xl bg-white p-5 shadow-lg ring-1 ring-stone-surface"
          >
            <h2 id="rich-editor-link-title" className="text-base font-bold text-charcoal-primary">
              {linkDraft.mode === "edit" ? "링크 수정" : "링크 등록"}
            </h2>
            <div className="mt-4 space-y-3">
              <label className="block">
                <span className="mb-1 block text-xs font-bold text-graphite">연결 주소</span>
                <input
                  aria-label="연결 주소"
                  value={linkDraft.url}
                  onChange={(event) => setLinkDraft({ ...linkDraft, url: event.target.value, error: "" })}
                  className="w-full rounded-xl border border-stone-surface bg-[#fbfaf9] px-3 py-2.5 text-sm text-charcoal-primary outline-none focus:border-sky-blue focus:ring-2 focus:ring-sky-blue/20"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-bold text-graphite">표시 문구</span>
                <input
                  aria-label="표시 문구"
                  value={linkDraft.label}
                  onChange={(event) => setLinkDraft({ ...linkDraft, label: event.target.value, error: "" })}
                  className="w-full rounded-xl border border-stone-surface bg-[#fbfaf9] px-3 py-2.5 text-sm text-charcoal-primary outline-none focus:border-sky-blue focus:ring-2 focus:ring-sky-blue/20"
                />
              </label>
            </div>
            {linkDraft.error && <p className="mt-3 text-xs font-bold text-coral-red">{linkDraft.error}</p>}
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" className="rounded-full bg-parchment-card px-4 py-2 text-sm font-bold text-graphite" onClick={() => setLinkDraft(null)}>
                취소
              </button>
              <button type="button" className="rounded-full bg-midnight px-4 py-2 text-sm font-bold text-white" onClick={submitLinkDialog}>
                {linkDraft.mode === "edit" ? "링크 수정" : "링크 삽입"}
              </button>
            </div>
          </div>
        </div>
      )}

      {isUploadingImage && (
        <div className="absolute right-3 top-12 rounded-full bg-midnight px-3 py-1 text-xs font-bold text-white">
          이미지 업로드 중
        </div>
      )}
    </div>
  );
}
