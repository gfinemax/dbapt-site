"use client";

import { LinkIcon, Maximize2, RotateCw, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { RichTextEditorV2 } from "./rich-text-editor-v2";
export { getPlainNoticeText } from "@/lib/news/rich-text";

type UploadImage = (file: File) => Promise<{ url: string }>;

type NoticeRichEditorProps = {
  value: string;
  onChange: (value: string) => void;
  onUploadImage: UploadImage;
  ariaLabel: string;
  placeholder: string;
};

type LinkDraft = {
  url: string;
  label: string;
  error: string;
  mode: "create" | "edit";
};

type GalleryLayout = "two-column" | "featured-grid";
type ImageInsertMode = "inline" | GalleryLayout;
type ImageFit = "contain" | "cover";
type ImageLayout = "inline" | "block" | "wrap" | "behind" | "front";
type ImageAlign = "left" | "center" | "right";
type CropX = "left" | "center" | "right";
type CropY = "top" | "center" | "bottom";
type TextAlign = "left" | "center" | "right" | "justify";
type SelectedImageBox = {
  left: number;
  top: number;
  width: number;
  height: number;
};
type ImageHandleDrag = {
  type: "resize" | "rotate";
  startX: number;
  startWidth: number;
  startRotate: number;
};

const EDITOR_BUTTON_CLASS =
  "rounded-full border border-stone-surface bg-[#f8f7f4] px-2.5 py-1 text-[10px] font-bold text-graphite hover:bg-stone-surface focus:outline-none focus:ring-2 focus:ring-sky-blue/30";
const EDITOR_BUTTON_ACTIVE_CLASS =
  "border-sky-blue bg-sky-blue text-white hover:bg-sky-blue";
const NOTICE_RICH_BODY_CLASS =
  "text-xs leading-relaxed text-charcoal-primary [&_a]:text-sky-blue [&_a]:underline [&_img]:my-1 [&_img]:max-w-full [&_img]:rounded-none [&_img]:border [&_img]:border-stone-surface [&_li]:ml-4 [&_ol]:list-decimal [&_ul]:list-disc";
const GALLERY_GRID_STYLE =
  "display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,407px),1fr));gap:6px;max-width:100%;";
const IMAGE_FIT_LABELS: Record<ImageFit, string> = {
  contain: "원본비율",
  cover: "채우기",
};
const CROP_PRESETS: Array<{ label: string; x: CropX; y: CropY }> = [
  { label: "왼쪽 위", x: "left", y: "top" },
  { label: "중앙", x: "center", y: "center" },
  { label: "오른쪽 아래", x: "right", y: "bottom" },
];
const SAFE_FONT_FAMILIES = new Set(["Pretendard", "Gulim", "Malgun Gothic"]);
const SAFE_FONT_SIZES = new Set(["12px", "14px", "16px", "18px", "20px", "24px"]);
const SAFE_LINE_HEIGHTS = new Set(["1.2", "1.5", "1.8", "2"]);
const SAFE_TEXT_ALIGNS = new Set<TextAlign>(["left", "center", "right", "justify"]);

function escapeAttr(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function readHtmlAttr(attrs: string, name: string) {
  const pattern = new RegExp(`\\s${name}=(["'])(.*?)\\1`, "i");
  return attrs.match(pattern)?.[2] || "";
}

function readStyleValue(attrs: string, name: string) {
  const style = readHtmlAttr(attrs, "style");
  const pattern = new RegExp(`${name}\\s*:\\s*([^;]+)`, "i");
  return style.match(pattern)?.[1]?.trim() || "";
}

function normalizeTextAlign(value: string): TextAlign | "" {
  if (SAFE_TEXT_ALIGNS.has(value as TextAlign)) return value as TextAlign;
  return "";
}

function normalizeLineHeight(value: string) {
  const normalized = value.trim();
  return SAFE_LINE_HEIGHTS.has(normalized) ? normalized : "";
}

function normalizeFontFamily(value: string) {
  const normalized = value.replace(/^["']|["']$/g, "").trim();
  return SAFE_FONT_FAMILIES.has(normalized) ? normalized : "";
}

function normalizeFontSize(value: string) {
  const normalized = value.trim();
  return SAFE_FONT_SIZES.has(normalized) ? normalized : "";
}

function normalizeSafeColor(value: string) {
  const normalized = value.trim();
  if (/^#[0-9a-f]{6}$/i.test(normalized)) return normalized.toLowerCase();
  return "";
}

function buildNoticeParagraphOpenTag(attrs: string) {
  const textAlign = normalizeTextAlign(readHtmlAttr(attrs, "data-text-align") || readStyleValue(attrs, "text-align"));
  const lineHeight = normalizeLineHeight(readHtmlAttr(attrs, "data-line-height") || readStyleValue(attrs, "line-height"));
  const attrParts: string[] = [];
  const styleParts: string[] = [];

  if (textAlign) {
    attrParts.push(`data-text-align="${textAlign}"`);
    styleParts.push(`text-align:${textAlign};`);
  }
  if (lineHeight) {
    attrParts.push(`data-line-height="${lineHeight}"`);
    styleParts.push(`line-height:${lineHeight};`);
  }
  if (styleParts.length > 0) attrParts.push(`style="${styleParts.join("")}"`);
  return attrParts.length > 0 ? `<p ${attrParts.join(" ")}>` : "<p>";
}

function buildNoticeSpanOpenTag(attrs: string) {
  const fontFamily = normalizeFontFamily(readHtmlAttr(attrs, "data-font-family") || readStyleValue(attrs, "font-family"));
  const fontSize = normalizeFontSize(readHtmlAttr(attrs, "data-font-size") || readStyleValue(attrs, "font-size"));
  const textColor = normalizeSafeColor(readStyleValue(attrs, "color"));
  const backgroundColor = normalizeSafeColor(readStyleValue(attrs, "background-color"));
  const attrParts: string[] = [];
  const styleParts: string[] = [];

  if (fontFamily) {
    attrParts.push(`data-font-family="${escapeAttr(fontFamily)}"`);
    styleParts.push(`font-family:${fontFamily};`);
  }
  if (fontSize) {
    attrParts.push(`data-font-size="${fontSize}"`);
    styleParts.push(`font-size:${fontSize};`);
  }
  if (textColor) styleParts.push(`color:${textColor};`);
  if (backgroundColor) styleParts.push(`background-color:${backgroundColor};`);
  if (styleParts.length > 0) attrParts.push(`style="${styleParts.join("")}"`);
  return attrParts.length > 0 ? `<span ${attrParts.join(" ")}>` : "<span>";
}

function isTrustedNoticeImageSrc(src: string) {
  return src.startsWith("/uploads/") || src.includes("/storage/v1/object/public/");
}

function getNoticeImageWidth(attrs: string) {
  const widthFromData = Number(readHtmlAttr(attrs, "data-width"));
  const widthFromStyle = Number(attrs.match(/width\s*:\s*(\d{1,3})%/i)?.[1]);
  return Math.min(100, Math.max(20, widthFromData || widthFromStyle || 100));
}

function getNoticeImagePixelDimension(attrs: string, name: string) {
  const dimension = Number(readHtmlAttr(attrs, name));
  if (!Number.isFinite(dimension) || dimension <= 0) return null;
  return Math.min(4000, Math.max(40, Math.round(dimension)));
}

function normalizeImageFit(value: string): ImageFit {
  return value === "cover" ? "cover" : "contain";
}

function normalizeImageLayout(value: string): ImageLayout {
  if (value === "inline" || value === "wrap" || value === "behind" || value === "front") return value;
  return "block";
}

function normalizeImageAlign(value: string): ImageAlign {
  if (value === "center" || value === "right") return value;
  return "left";
}

function normalizeImageZoom(value: string | number) {
  const zoom = Number(value);
  if (!Number.isFinite(zoom) || zoom <= 0) return 100;
  return Math.min(200, Math.max(25, Math.round(zoom)));
}

function normalizeImageOffset(value: string | number) {
  const offset = Number(value);
  if (!Number.isFinite(offset)) return 0;
  return Math.min(4000, Math.max(-4000, Math.round(offset)));
}

function normalizeCropX(value: string): CropX {
  if (value === "left" || value === "right") return value;
  return "center";
}

function normalizeCropY(value: string): CropY {
  if (value === "top" || value === "bottom") return value;
  return "center";
}

function normalizeImageRotation(value: string | number) {
  const rotation = Number(value);
  if (!Number.isFinite(rotation)) return 0;
  return ((Math.round(rotation) % 360) + 360) % 360;
}

function buildNoticeImageStyle({
  width,
  fit,
  cropX,
  cropY,
  rotate,
  align = "left",
  layout = "block",
  zoom = 100,
  offsetX = 0,
  offsetY = 0,
  pixelWidth,
  pixelHeight,
  isGalleryImage = false,
  isFeatured = false,
}: {
  width: number;
  fit: ImageFit;
  cropX: CropX;
  cropY: CropY;
  rotate: number;
  align?: ImageAlign;
  layout?: ImageLayout;
  zoom?: number;
  offsetX?: number;
  offsetY?: number;
  pixelWidth?: number | null;
  pixelHeight?: number | null;
  isGalleryImage?: boolean;
  isFeatured?: boolean;
}) {
  const widthStyle = isGalleryImage ? "width:100%;" : pixelWidth ? `width:${pixelWidth}px;` : `width:${width}%;`;
  const heightStyle = pixelHeight && !isGalleryImage ? `height:${pixelHeight}px;` : "height:auto;";
  const hasPixelSize = Boolean((pixelWidth || pixelHeight) && !isGalleryImage);
  const isRotated = normalizeImageRotation(rotate) !== 0;
  const coverFrame = fit === "cover" && !hasPixelSize && !isRotated
    ? `aspect-ratio:${isFeatured ? "16 / 10" : "1 / 1"};`
    : "";
  const objectFit = isRotated ? (hasPixelSize ? "fill" : "contain") : hasPixelSize ? "fill" : fit;
  const normalizedLayout = normalizeImageLayout(layout);
  const normalizedAlign = normalizeImageAlign(align);
  const margin = isGalleryImage
    ? ""
    : normalizedLayout === "inline"
      ? "display:inline-block;margin-left:4px;margin-right:4px;vertical-align:middle;"
      : normalizedLayout === "behind"
        ? `display:inline-block;position:relative;left:${normalizeImageOffset(offsetX)}px;top:${normalizeImageOffset(offsetY)}px;z-index:0;opacity:0.45;margin-left:4px;margin-right:4px;vertical-align:middle;`
        : normalizedLayout === "front"
          ? `display:inline-block;position:relative;left:${normalizeImageOffset(offsetX)}px;top:${normalizeImageOffset(offsetY)}px;z-index:3;opacity:1;margin-left:4px;margin-right:4px;vertical-align:middle;`
          : normalizedLayout === "wrap" && normalizedAlign === "left"
            ? "display:block;float:left;margin:0 16px 12px 0;"
            : normalizedLayout === "wrap" && normalizedAlign === "right"
              ? "display:block;float:right;margin:0 0 12px 16px;"
              : normalizedAlign === "center"
                ? "display:block;margin-left:auto;margin-right:auto;"
                : normalizedAlign === "right"
                  ? "display:block;margin-left:auto;margin-right:0;"
                  : "display:block;margin-left:0;margin-right:auto;";
  const scale = normalizeImageZoom(zoom) !== 100 ? ` scale(${normalizeImageZoom(zoom) / 100})` : "";
  const rotation = rotate || scale ? `transform:${rotate ? `rotate(${rotate}deg)` : ""}${scale};transform-origin:center;` : "";
  const featured = isFeatured ? "grid-column:1 / -1;" : "";
  return `${widthStyle}max-width:100%;${heightStyle}${coverFrame}object-fit:${objectFit};object-position:${cropX} ${cropY};${margin}${rotation}${featured}`;
}

function getNoticeImageMetadata(attrs: string) {
  return {
    width: getNoticeImageWidth(attrs),
    pixelWidth: getNoticeImagePixelDimension(attrs, "data-pixel-width"),
    pixelHeight: getNoticeImagePixelDimension(attrs, "data-pixel-height"),
    fit: normalizeImageFit(readHtmlAttr(attrs, "data-fit")),
    align: normalizeImageAlign(readHtmlAttr(attrs, "data-align")),
    layout: normalizeImageLayout(readHtmlAttr(attrs, "data-layout")),
    zoom: normalizeImageZoom(readHtmlAttr(attrs, "data-zoom")),
    offsetX: normalizeImageOffset(readHtmlAttr(attrs, "data-offset-x") || readStyleValue(attrs, "left")),
    offsetY: normalizeImageOffset(readHtmlAttr(attrs, "data-offset-y") || readStyleValue(attrs, "top")),
    cropX: normalizeCropX(readHtmlAttr(attrs, "data-crop-x")),
    cropY: normalizeCropY(readHtmlAttr(attrs, "data-crop-y")),
    rotate: normalizeImageRotation(readHtmlAttr(attrs, "data-rotate")),
  };
}

function getNoticeLayerReservedHeight({
  layerPixelWidth,
  pixelHeight,
  zoom,
  rotate,
  offsetY,
}: {
  layerPixelWidth: number;
  pixelHeight: number | null;
  zoom: number;
  rotate: number;
  offsetY: number;
}) {
  const baseHeight = pixelHeight || Math.max(90, Math.round(layerPixelWidth * 0.75));
  const zoomRatio = normalizeImageZoom(zoom) / 100;
  const visualWidth = layerPixelWidth * zoomRatio;
  const visualHeight = baseHeight * zoomRatio;
  const normalizedRotate = normalizeImageRotation(rotate);
  const rotatedHeight = normalizedRotate === 0
    ? visualHeight
    : Math.abs(visualWidth * Math.sin((normalizedRotate * Math.PI) / 180))
      + Math.abs(visualHeight * Math.cos((normalizedRotate * Math.PI) / 180));

  return Math.ceil(Math.max(1, rotatedHeight + Math.max(0, offsetY)));
}

function getNoticeContentLayerReserveHeight(content: string) {
  let reserveHeight = 0;
  const contentOutsideGalleries = content.replace(
    /<div\b([^>]*)data-notice-gallery=(["'])(.*?)\2([^>]*)>([\s\S]*?)<\/div>/gi,
    "",
  );

  contentOutsideGalleries.replace(/<img\b([^>]*)>/gi, (_match, attrs: string) => {
    const src = readHtmlAttr(attrs, "src");
    if (!isTrustedNoticeImageSrc(src)) return "";

    const { width, pixelWidth, pixelHeight, layout, zoom, offsetY, rotate } = getNoticeImageMetadata(attrs);
    if (layout !== "front" && layout !== "behind") return "";

    const layerPixelWidth = pixelWidth || Math.max(120, Math.round(width * 8));
    reserveHeight = Math.max(
      reserveHeight,
      getNoticeLayerReservedHeight({ layerPixelWidth, pixelHeight, zoom, rotate, offsetY }),
    );

    return "";
  });

  return reserveHeight;
}

function sanitizeNoticeImageFromAttrs(attrs: string) {
  const src = readHtmlAttr(attrs, "src");
  if (!isTrustedNoticeImageSrc(src)) return "";

  const { width, pixelWidth, pixelHeight, fit, align, layout, zoom, offsetX, offsetY, cropX, cropY, rotate } = getNoticeImageMetadata(attrs);
  const alt = readHtmlAttr(attrs, "alt") || "본문 이미지";
  if (layout === "front" || layout === "behind") {
    const layerPixelWidth = pixelWidth || Math.max(120, Math.round(width * 8));
    const imageHeight = pixelHeight ? `height:${pixelHeight}px;` : "height:auto;";
    const hasPixelSize = Boolean(pixelWidth || pixelHeight);
    const objectFit = rotate ? (hasPixelSize ? "fill" : "contain") : hasPixelSize ? "fill" : fit;
    const surfaceTransform = rotate ? `transform:rotate(${rotate}deg);transform-origin:center;` : "";
    const imageTransform = zoom !== 100 ? `transform:scale(${zoom / 100});transform-origin:center;` : "";
    const opacity = layout === "behind" ? "opacity:0.45;" : "opacity:1;";
    const layerZIndex = layout === "front" ? 3 : 0;
    const pixelAttrs = `${pixelWidth ? ` data-pixel-width="${pixelWidth}"` : ""}${pixelHeight ? ` data-pixel-height="${pixelHeight}"` : ""}`;
    const layerStyle = "display:inline-block;position:relative;width:0px;height:0px;max-width:none;overflow:visible;vertical-align:middle;";
    const surfaceStyle = `position:absolute;left:${offsetX}px;top:${offsetY}px;width:${layerPixelWidth}px;z-index:${layerZIndex};${surfaceTransform}`;
    const imageStyle = `width:100%;max-width:none;${imageHeight}object-fit:${objectFit};object-position:${cropX} ${cropY};${imageTransform}${opacity}display:block;`;

    return `<span data-notice-image-layer="${layout}" style="${layerStyle}"><span data-notice-image-layer-surface="" style="${surfaceStyle}"><img src="${escapeAttr(src)}" alt="${escapeAttr(alt)}" data-width="${width}"${pixelAttrs} data-fit="${fit}" data-crop-x="${cropX}" data-crop-y="${cropY}" data-rotate="${rotate}" data-align="${align}" data-layout="${layout}" data-zoom="${zoom}" data-offset-x="${offsetX}" data-offset-y="${offsetY}" style="${imageStyle}" /></span></span>`;
  }

  const style = buildNoticeImageStyle({ width, fit, cropX, cropY, rotate, align, layout, zoom, offsetX, offsetY, pixelWidth, pixelHeight });
  const pixelAttrs = `${pixelWidth ? ` data-pixel-width="${pixelWidth}"` : ""}${pixelHeight ? ` data-pixel-height="${pixelHeight}"` : ""}`;
  return `<img src="${escapeAttr(src)}" alt="${escapeAttr(alt)}" data-width="${width}"${pixelAttrs} data-fit="${fit}" data-crop-x="${cropX}" data-crop-y="${cropY}" data-rotate="${rotate}" data-align="${align}" data-layout="${layout}" data-zoom="${zoom}" data-offset-x="${offsetX}" data-offset-y="${offsetY}" style="${style}" />`;
}

function normalizeNoticeGalleryLayout(layout: string): GalleryLayout {
  return layout === "featured-grid" ? "featured-grid" : "two-column";
}

function buildNoticeGalleryImageHtml(attrs: string, layout: GalleryLayout, index: number) {
  const src = readHtmlAttr(attrs, "src");
  if (!isTrustedNoticeImageSrc(src)) return "";

  const { fit, cropX, cropY, rotate } = getNoticeImageMetadata(attrs);
  const alt = readHtmlAttr(attrs, "alt") || "본문 이미지";
  const isFeatured = layout === "featured-grid" && index === 0;
  const style = buildNoticeImageStyle({
    width: 100,
    fit,
    cropX,
    cropY,
    rotate,
    isGalleryImage: true,
    isFeatured,
  });
  return `<img src="${escapeAttr(src)}" alt="${escapeAttr(alt)}" data-width="100" data-fit="${fit}" data-crop-x="${cropX}" data-crop-y="${cropY}" data-rotate="${rotate}" style="${style}" />`;
}

function buildNoticeGalleryHtml(layout: GalleryLayout, imageHtml: string[], { editable = true } = {}) {
  const editableAttr = editable ? "" : ' contenteditable="false"';
  return `<div data-notice-gallery="${layout}"${editableAttr} class="notice-image-gallery" role="group" aria-label="이미지 묶음" style="${GALLERY_GRID_STYLE}">${imageHtml.join("")}</div>`;
}

function sanitizeNoticeGalleryHtml(layoutValue: string, innerHtml: string) {
  const layout = normalizeNoticeGalleryLayout(layoutValue);
  const images = Array.from(innerHtml.matchAll(/<img\b([^>]*)>/gi))
    .map((match, index) => buildNoticeGalleryImageHtml(match[1] || "", layout, index))
    .filter(Boolean);

  if (images.length === 0) return "";
  if (images.length === 1) return images[0];
  return buildNoticeGalleryHtml(layout, images);
}

function decodeNoticeLinkHrefEntities(value: string) {
  let decoded = value;
  for (let index = 0; index < 3; index += 1) {
    const next = decoded
      .replace(/&amp;/gi, "&")
      .replace(/&#38;/gi, "&")
      .replace(/&#x26;/gi, "&");
    if (next === decoded) break;
    decoded = next;
  }
  return decoded;
}

function normalizeNoticeLinkHref(href: string) {
  const trimmed = decodeNoticeLinkHrefEntities(href).trim();
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

function isInternalNoticeLinkHref(href: string) {
  return href.startsWith("/");
}

export function buildNoticeLinkHtml(href: string, label?: string) {
  const normalizedHref = normalizeNoticeLinkHref(href);
  if (!normalizedHref) return escapeAttr(label || href);

  const text = escapeAttr((label || href).trim() || normalizedHref);
  const targetAttrs = isInternalNoticeLinkHref(normalizedHref) ? "" : ' target="_blank" rel="noreferrer"';
  return `<a href="${escapeAttr(normalizedHref)}"${targetAttrs}>${text}</a>`;
}

function linkPlainTextUrls(content: string) {
  const urlPattern = /https?:\/\/[^\s<]+/gi;
  let cursor = 0;
  let html = "";

  for (const match of content.matchAll(urlPattern)) {
    const url = match[0];
    const index = match.index ?? 0;
    const trailing = url.match(/[),.?!]+$/)?.[0] || "";
    const href = trailing ? url.slice(0, -trailing.length) : url;

    html += escapeAttr(content.slice(cursor, index));
    html += buildNoticeLinkHtml(href);
    html += escapeAttr(trailing);
    cursor = index + url.length;
  }

  html += escapeAttr(content.slice(cursor));
  return html.replace(/\n/g, "<br />");
}

function getSelectedTextInEditor(editor: HTMLElement | null) {
  if (!editor) return "";

  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return "";

  const range = selection.getRangeAt(0);
  if (!editor.contains(range.commonAncestorContainer)) return "";

  return selection.toString().trim();
}

function getSelectedRangeInEditor(editor: HTMLElement | null) {
  if (!editor) return null;

  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return null;

  const range = selection.getRangeAt(0);
  if (!editor.contains(range.commonAncestorContainer)) return null;

  return range.cloneRange();
}

export function sanitizeNoticeContentHtml(content: string) {
  if (!/<[a-z][\s\S]*>/i.test(content)) {
    return linkPlainTextUrls(content);
  }

  const galleries: string[] = [];
  const withGalleryPlaceholders = content.replace(
    /<div\b([^>]*)data-notice-gallery=(["'])(.*?)\2([^>]*)>([\s\S]*?)<\/div>/gi,
    (_match, _attrsBefore: string, _quote: string, layout: string, _attrsAfter: string, innerHtml: string) => {
      const gallery = sanitizeNoticeGalleryHtml(layout, innerHtml);
      if (!gallery) return "";
      const token = `__NOTICE_GALLERY_${galleries.length}__`;
      galleries.push(gallery);
      return token;
    },
  );

  const images: string[] = [];
  const withImagePlaceholders = withGalleryPlaceholders.replace(/<img\b([^>]*)>/gi, (_match, attrs: string) => {
    const image = sanitizeNoticeImageFromAttrs(attrs);
    if (!image) return "";
    const token = `__NOTICE_IMAGE_${images.length}__`;

    images.push(image);
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
      const normalizedHref = normalizeNoticeLinkHref(href);
      if (!normalizedHref) return "<a>";
      const targetAttrs = isInternalNoticeLinkHref(normalizedHref) ? "" : ' target="_blank" rel="noreferrer"';
      return `<a href="${escapeAttr(normalizedHref)}"${targetAttrs}>`;
    })
    .replace(/<br\b[^>]*\/?>/gi, "<br />")
    .replace(/<p\b([^>]*)>/gi, (_match, attrs: string) => buildNoticeParagraphOpenTag(attrs))
    .replace(/<span\b([^>]*)>/gi, (_match, attrs: string) => buildNoticeSpanOpenTag(attrs))
    .replace(/<(\/?)(strong|b|em|i|u|ul|ol|li)\b[^>]*>/gi, "<$1$2>")
    .replace(/<\/a\b[^>]*>/gi, "</a>")
    .replace(/<\/p\b[^>]*>/gi, "</p>")
    .replace(/<\/span\b[^>]*>/gi, "</span>")
    .replace(/<(?!\/?(p|br|span|strong|b|em|i|u|ul|ol|li|a)\b)[^>]*>/gi, "");

  const withImages = images.reduce((html, image, index) => html.replace(`__NOTICE_IMAGE_${index}__`, image), sanitized);
  return galleries.reduce((html, gallery, index) => html.replace(`__NOTICE_GALLERY_${index}__`, gallery), withImages);
}

export function NoticeRichContent({
  content,
  className,
  onInternalLinkClick,
}: {
  content: string;
  className?: string;
  onInternalLinkClick?: (href: string) => void;
}) {
  const sanitizedContent = sanitizeNoticeContentHtml(content);
  const layerReserveHeight = getNoticeContentLayerReserveHeight(content);

  return (
    <div
      className={cn(
        "notice-rich-content whitespace-normal break-words",
        NOTICE_RICH_BODY_CLASS,
        className,
      )}
      style={layerReserveHeight > 0 ? { paddingBottom: `${layerReserveHeight}px` } : undefined}
      onClick={(event) => {
        if (!onInternalLinkClick) return;
        const target = event.target as HTMLElement;
        const link = target.closest("a");
        const href = link?.getAttribute("href") || "";
        if (!href.startsWith("/")) return;
        event.preventDefault();
        onInternalLinkClick(href);
      }}
      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
    />
  );
}

export function NoticeRichEditor(props: NoticeRichEditorProps) {
  return <RichTextEditorV2 {...props} />;
}

export function LegacyNoticeRichEditor({
  value,
  onChange,
  onUploadImage,
  ariaLabel,
  placeholder,
}: NoticeRichEditorProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const selectedImageRef = useRef<HTMLImageElement | null>(null);
  const imageHandleDragRef = useRef<ImageHandleDrag | null>(null);
  const selectedRangeRef = useRef<Range | null>(null);
  const selectedLinkRef = useRef<HTMLAnchorElement | null>(null);
  const linkUrlInputRef = useRef<HTMLInputElement>(null);
  const shouldFocusLinkDialogRef = useRef(false);
  const [selectedImageSrc, setSelectedImageSrc] = useState("");
  const [selectedImageWidth, setSelectedImageWidth] = useState(100);
  const [selectedImageFit, setSelectedImageFit] = useState<ImageFit>("contain");
  const [selectedImageCropX, setSelectedImageCropX] = useState<CropX>("center");
  const [selectedImageCropY, setSelectedImageCropY] = useState<CropY>("center");
  const [selectedImageRotate, setSelectedImageRotate] = useState(0);
  const [selectedImageBox, setSelectedImageBox] = useState<SelectedImageBox | null>(null);
  const [isDraggingImageHandle, setIsDraggingImageHandle] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [linkDraft, setLinkDraft] = useState<LinkDraft | null>(null);
  const [imageInsertMode, setImageInsertMode] = useState<ImageInsertMode>("inline");

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;
    if (document.activeElement === editor) return;
    if (editor.innerHTML !== value) {
      editor.innerHTML = value;
    }
    editor.querySelectorAll<HTMLElement>("[data-notice-gallery]").forEach((gallery) => {
      gallery.setAttribute("contenteditable", "false");
    });
  }, [value]);

  useEffect(() => {
    if (!linkDraft || !shouldFocusLinkDialogRef.current) return;
    shouldFocusLinkDialogRef.current = false;
    window.setTimeout(() => linkUrlInputRef.current?.focus(), 0);
  }, [linkDraft]);

  const commitContent = useCallback(() => {
    onChange(editorRef.current?.innerHTML || "");
  }, [onChange]);

  const updateSelectedImageBox = useCallback((image = selectedImageRef.current) => {
    const root = rootRef.current;
    const editor = editorRef.current;
    if (!root || !editor || !image) {
      setSelectedImageBox(null);
      return;
    }

    const rootRect = root.getBoundingClientRect();
    const editorRect = editor.getBoundingClientRect();
    const imageRect = image.getBoundingClientRect();
    const width = imageRect.width || 120;
    const height = imageRect.height || 80;
    const left = imageRect.width ? imageRect.left - rootRect.left : editorRect.left - rootRect.left + 16;
    const top = imageRect.height ? imageRect.top - rootRect.top : editorRect.top - rootRect.top + 16;
    setSelectedImageBox({ left, top, width, height });
  }, []);

  const rememberSelection = () => {
    selectedRangeRef.current = getSelectedRangeInEditor(editorRef.current);
  };

  const restoreSelection = () => {
    const editor = editorRef.current;
    const range = selectedRangeRef.current;
    if (!editor || !range) return false;

    const selection = window.getSelection();
    if (!selection) return false;

    editor.focus();
    selection.removeAllRanges();
    selection.addRange(range);
    return true;
  };

  const insertHtmlAtCurrentSelection = (html: string) => {
    const editor = editorRef.current;
    if (!editor) return;

    restoreSelection();
    const before = editor.innerHTML;
    if (typeof document.execCommand === "function") {
      document.execCommand("insertHTML", false, html);
    }

    if (editor.innerHTML === before) {
      const template = document.createElement("template");
      template.innerHTML = html;
      const fragment = template.content;
      const selection = window.getSelection();
      const range = selection?.rangeCount ? selection.getRangeAt(0) : selectedRangeRef.current;
      if (range && editor.contains(range.commonAncestorContainer)) {
        range.deleteContents();
        range.insertNode(fragment);
      } else {
        editor.insertAdjacentHTML("beforeend", html);
      }
    }

    selectedRangeRef.current = null;
    commitContent();
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
    const fit = normalizeImageFit(image.dataset.fit || "");
    const cropX = normalizeCropX(image.dataset.cropX || "");
    const cropY = normalizeCropY(image.dataset.cropY || "");
    const rotate = normalizeImageRotation(image.dataset.rotate || 0);
    selectedImageRef.current = image;
    setSelectedImageSrc(image.getAttribute("src") || "");
    setSelectedImageWidth(Math.min(100, Math.max(20, width || 100)));
    setSelectedImageFit(fit);
    setSelectedImageCropX(cropX);
    setSelectedImageCropY(cropY);
    setSelectedImageRotate(rotate);
    updateSelectedImageBox(image);
  };

  const clearSelectedImage = () => {
    selectedImageRef.current = null;
    setSelectedImageSrc("");
    setSelectedImageBox(null);
  };

  const buildEditorImageHtml = (url: string) =>
    `<p><img src="${escapeAttr(url)}" alt="본문 이미지" data-width="100" data-fit="contain" data-crop-x="center" data-crop-y="center" data-rotate="0" style="${buildNoticeImageStyle({ width: 100, fit: "contain", cropX: "center", cropY: "center", rotate: 0 })}" /></p>`;

  const buildEditorGalleryHtml = (urls: string[]) => {
    const images = urls.map((url, index) => {
      const isFeatured = imageInsertMode === "featured-grid" && index === 0;
      const style = buildNoticeImageStyle({
        width: 100,
        fit: "contain",
        cropX: "center",
        cropY: "center",
        rotate: 0,
        isGalleryImage: true,
        isFeatured,
      });
      return `<img src="${escapeAttr(url)}" alt="본문 이미지" data-width="100" data-fit="contain" data-crop-x="center" data-crop-y="center" data-rotate="0" style="${style}" />`;
    });

    const layout = imageInsertMode === "featured-grid" ? "featured-grid" : "two-column";
    return `<p>${buildNoticeGalleryHtml(layout, images, { editable: false })}</p>`;
  };

  const insertImageFiles = async (files: File[]) => {
    if (files.length === 0) return;
    setIsUploadingImage(true);
    try {
      const uploaded = await Promise.all(files.map((file) => onUploadImage(file)));
      const shouldInsertGallery = uploaded.length > 1 && imageInsertMode !== "inline";
      const imageHtml = shouldInsertGallery
        ? buildEditorGalleryHtml(uploaded.map((item) => item.url))
        : uploaded.map((item) => buildEditorImageHtml(item.url)).join("");
      if (typeof document.execCommand === "function") {
        document.execCommand("insertHTML", false, imageHtml);
      }
      const imageWasInserted = Array.from(editorRef.current?.querySelectorAll("img") || [])
        .some((image) => image.getAttribute("src") === uploaded[0].url);
      if (!imageWasInserted) {
        editorRef.current?.insertAdjacentHTML("beforeend", imageHtml);
      }
      commitContent();

      const insertedImage = Array.from(editorRef.current?.querySelectorAll("img") || [])
        .find((image) => image.getAttribute("src") === uploaded[0].url);
      if (!shouldInsertGallery && uploaded.length === 1 && insertedImage) {
        selectImage(insertedImage as HTMLImageElement);
      } else {
        clearSelectedImage();
      }
    } finally {
      setIsUploadingImage(false);
    }
  };

  const insertImage = async (file: File) => {
    await insertImageFiles([file]);
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLDivElement>) => {
    const imageFiles = Array.from(event.clipboardData.files).filter((file) => file.type.startsWith("image/"));
    if (imageFiles.length === 0) {
      window.setTimeout(commitContent, 0);
      return;
    }

    event.preventDefault();
    void insertImageFiles(imageFiles);
  };

  const updateSelectedImagePresentation = useCallback(({
    width = selectedImageWidth,
    fit = selectedImageFit,
    cropX = selectedImageCropX,
    cropY = selectedImageCropY,
    rotate = selectedImageRotate,
  }: {
    width?: number;
    fit?: ImageFit;
    cropX?: CropX;
    cropY?: CropY;
    rotate?: number;
  }) => {
    const selectedImage = selectedImageRef.current;
    if (!selectedImage) return;
    const nextWidth = Math.min(100, Math.max(20, width));
    const nextFit = normalizeImageFit(fit);
    const nextCropX = normalizeCropX(cropX);
    const nextCropY = normalizeCropY(cropY);
    const nextRotate = normalizeImageRotation(rotate);
    const pixelWidth = getNoticeImagePixelDimension(selectedImage.outerHTML, "data-pixel-width");
    const pixelHeight = getNoticeImagePixelDimension(selectedImage.outerHTML, "data-pixel-height");
    const isGalleryImage = Boolean(selectedImage.closest("[data-notice-gallery]"));
    const isFeatured = selectedImage.parentElement?.getAttribute("data-notice-gallery") === "featured-grid"
      && Array.from(selectedImage.parentElement.querySelectorAll("img")).indexOf(selectedImage) === 0;

    selectedImage.dataset.width = String(nextWidth);
    selectedImage.dataset.fit = nextFit;
    selectedImage.dataset.cropX = nextCropX;
    selectedImage.dataset.cropY = nextCropY;
    selectedImage.dataset.rotate = String(nextRotate);
    selectedImage.setAttribute(
      "style",
      buildNoticeImageStyle({
        width: nextWidth,
        fit: nextFit,
        cropX: nextCropX,
        cropY: nextCropY,
        rotate: nextRotate,
        pixelWidth,
        pixelHeight,
        isGalleryImage,
        isFeatured,
      }),
    );
    setSelectedImageWidth(nextWidth);
    setSelectedImageFit(nextFit);
    setSelectedImageCropX(nextCropX);
    setSelectedImageCropY(nextCropY);
    setSelectedImageRotate(nextRotate);
    updateSelectedImageBox(selectedImage);
    commitContent();
  }, [
    commitContent,
    selectedImageCropX,
    selectedImageCropY,
    selectedImageFit,
    selectedImageRotate,
    selectedImageWidth,
    updateSelectedImageBox,
  ]);

  const updateImageWidth = (width: number) => {
    updateSelectedImagePresentation({ width });
  };

  const startImageHandleDrag = (type: ImageHandleDrag["type"], event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (!selectedImageRef.current) return;

    imageHandleDragRef.current = {
      type,
      startX: event.clientX,
      startWidth: selectedImageWidth,
      startRotate: selectedImageRotate,
    };
    setIsDraggingImageHandle(true);
  };

  useEffect(() => {
    if (!isDraggingImageHandle) return;

    const handleMouseMove = (event: MouseEvent) => {
      const drag = imageHandleDragRef.current;
      if (!drag) return;

      const deltaX = event.clientX - drag.startX;
      if (drag.type === "resize") {
        const nextWidth = Math.min(100, Math.max(20, Math.round((drag.startWidth + deltaX / 4) / 5) * 5));
        updateSelectedImagePresentation({ width: nextWidth });
        return;
      }

      const steps = Math.round(deltaX / 90);
      const nextRotate = (drag.startRotate + steps * 90 + 360) % 360;
      updateSelectedImagePresentation({ rotate: nextRotate });
    };

    const handleMouseUp = () => {
      imageHandleDragRef.current = null;
      setIsDraggingImageHandle(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDraggingImageHandle, updateSelectedImagePresentation]);

  const addLink = () => {
    const selectedRange = getSelectedRangeInEditor(editorRef.current);
    if (selectedRange) selectedRangeRef.current = selectedRange;
    selectedLinkRef.current = null;

    const selectedText = selectedRange?.toString().trim() || getSelectedTextInEditor(editorRef.current);
    const selectedTextLooksLikeUrl = /^https?:\/\//i.test(selectedText) || selectedText.startsWith("/");

    shouldFocusLinkDialogRef.current = true;
    setLinkDraft({
      url: selectedTextLooksLikeUrl ? selectedText : "",
      label: selectedTextLooksLikeUrl ? "" : selectedText,
      error: "",
      mode: "create",
    });
  };

  const editLink = (link: HTMLAnchorElement) => {
    selectedLinkRef.current = link;
    selectedRangeRef.current = null;
    shouldFocusLinkDialogRef.current = true;
    setLinkDraft({
      url: link.getAttribute("href") || "",
      label: link.textContent?.trim() || "",
      error: "",
      mode: "edit",
    });
  };

  const closeLinkDialog = () => {
    setLinkDraft(null);
    selectedLinkRef.current = null;
    editorRef.current?.focus();
  };

  const submitLinkDialog = () => {
    if (!linkDraft) return;

    const url = linkDraft.url.trim();
    const label = linkDraft.label.trim() || url;
    if (!url) {
      setLinkDraft({ ...linkDraft, error: "연결 주소를 입력해 주세요." });
      return;
    }

    if (!normalizeNoticeLinkHref(url)) {
      setLinkDraft({
        ...linkDraft,
        error: "http://, https:// 또는 / 로 시작하는 주소를 입력해 주세요.",
      });
      return;
    }

    const selectedLink = selectedLinkRef.current;
    if (selectedLink && editorRef.current?.contains(selectedLink)) {
      const template = document.createElement("template");
      template.innerHTML = buildNoticeLinkHtml(url, label);
      selectedLink.replaceWith(template.content);
      selectedLinkRef.current = null;
      commitContent();
    } else {
      insertHtmlAtCurrentSelection(buildNoticeLinkHtml(url, label));
    }
    setLinkDraft(null);
  };

  return (
    <div
      ref={rootRef}
      className="relative rounded-xl border border-stone-surface bg-white focus-within:border-sky-blue focus-within:ring-1 focus-within:ring-sky-blue/30"
    >
      <div className="flex flex-wrap items-center gap-1.5 border-b border-stone-surface px-3 py-2">
        <button type="button" className={EDITOR_BUTTON_CLASS} onMouseDown={(event) => event.preventDefault()} onClick={() => runCommand("bold")}>
          굵게
        </button>
        <button type="button" className={EDITOR_BUTTON_CLASS} onMouseDown={(event) => event.preventDefault()} onClick={() => runCommand("italic")}>
          기울임
        </button>
        <button type="button" className={EDITOR_BUTTON_CLASS} onMouseDown={(event) => event.preventDefault()} onClick={() => runCommand("underline")}>
          밑줄
        </button>
        <button type="button" className={EDITOR_BUTTON_CLASS} onMouseDown={(event) => event.preventDefault()} onClick={() => runCommand("insertUnorderedList")}>
          글머리
        </button>
        <button type="button" className={EDITOR_BUTTON_CLASS} onMouseDown={(event) => event.preventDefault()} onClick={() => runCommand("insertOrderedList")}>
          번호
        </button>
        <button type="button" className={EDITOR_BUTTON_CLASS} onMouseDown={(event) => event.preventDefault()} onClick={addLink}>
          링크
        </button>
        <span className="mx-1 h-5 w-px bg-stone-surface" aria-hidden="true" />
        <button
          type="button"
          aria-pressed={imageInsertMode === "inline"}
          className={cn(EDITOR_BUTTON_CLASS, imageInsertMode === "inline" && EDITOR_BUTTON_ACTIVE_CLASS)}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => setImageInsertMode("inline")}
        >
          본문 이미지
        </button>
        <button
          type="button"
          aria-pressed={imageInsertMode === "two-column"}
          className={cn(EDITOR_BUTTON_CLASS, imageInsertMode === "two-column" && EDITOR_BUTTON_ACTIVE_CLASS)}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => setImageInsertMode("two-column")}
        >
          2열
        </button>
        <button
          type="button"
          aria-pressed={imageInsertMode === "featured-grid"}
          className={cn(EDITOR_BUTTON_CLASS, imageInsertMode === "featured-grid" && EDITOR_BUTTON_ACTIVE_CLASS)}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => setImageInsertMode("featured-grid")}
        >
          대표+2열
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
          multiple
          accept="image/png,image/jpeg,image/gif,image/webp"
          className="sr-only"
          aria-label="본문 이미지 선택"
          onChange={(event) => {
            const files = Array.from(event.target.files || []);
            event.target.value = "";
            if (files.length === 1) {
              void insertImage(files[0]);
              return;
            }
            if (files.length > 1) void insertImageFiles(files);
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
          <span className="mx-1 h-5 w-px bg-stone-surface" aria-hidden="true" />
          <span className="text-[10px] font-bold text-graphite">맞춤</span>
          {(Object.keys(IMAGE_FIT_LABELS) as ImageFit[]).map((fit) => (
            <button
              key={fit}
              type="button"
              aria-pressed={selectedImageFit === fit}
              className={cn(EDITOR_BUTTON_CLASS, selectedImageFit === fit && EDITOR_BUTTON_ACTIVE_CLASS)}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => updateSelectedImagePresentation({ fit })}
            >
              {IMAGE_FIT_LABELS[fit]}
            </button>
          ))}
          <span className="text-[10px] font-bold text-graphite">트리밍</span>
          {CROP_PRESETS.map((preset) => (
            <button
              key={`${preset.x}-${preset.y}`}
              type="button"
              aria-pressed={selectedImageCropX === preset.x && selectedImageCropY === preset.y}
              className={cn(
                EDITOR_BUTTON_CLASS,
                selectedImageCropX === preset.x && selectedImageCropY === preset.y && EDITOR_BUTTON_ACTIVE_CLASS,
              )}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => updateSelectedImagePresentation({ cropX: preset.x, cropY: preset.y })}
            >
              {preset.label}
            </button>
          ))}
          <span className="text-[10px] font-bold text-graphite">회전</span>
          <button
            type="button"
            className={EDITOR_BUTTON_CLASS}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => updateSelectedImagePresentation({ rotate: (selectedImageRotate + 90) % 360 })}
          >
            오른쪽으로 회전
          </button>
          {selectedImageRotate !== 0 && (
            <button
              type="button"
              className={EDITOR_BUTTON_CLASS}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => updateSelectedImagePresentation({ rotate: 0 })}
            >
              회전 초기화
            </button>
          )}
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
        onBlur={rememberSelection}
        onKeyUp={rememberSelection}
        onMouseUp={rememberSelection}
        onPaste={handlePaste}
        onClick={(event) => {
          const target = event.target as HTMLElement;
          const link = target.closest("a") as HTMLAnchorElement | null;
          if (link && editorRef.current?.contains(link)) {
            event.preventDefault();
            editLink(link);
            return;
          }
          if (target.tagName === "IMG") selectImage(target as HTMLImageElement);
          else clearSelectedImage();
        }}
        className={cn(
          "min-h-52 w-full px-4 py-3 outline-none empty:before:text-ash empty:before:content-[attr(data-placeholder)]",
          NOTICE_RICH_BODY_CLASS,
        )}
      />

      {selectedImageSrc && selectedImageBox && (
        <div
          className="pointer-events-none absolute z-20 rounded-sm ring-2 ring-sky-blue/70"
          style={{
            left: selectedImageBox.left,
            top: selectedImageBox.top,
            width: selectedImageBox.width,
            height: selectedImageBox.height,
          }}
        >
          <button
            type="button"
            aria-label="이미지 회전 핸들"
            className="pointer-events-auto absolute -right-3 -top-3 flex size-6 items-center justify-center rounded-full bg-white text-sky-blue shadow-sm ring-1 ring-stone-surface hover:bg-parchment-card focus:outline-none focus:ring-2 focus:ring-sky-blue/40"
            onMouseDown={(event) => startImageHandleDrag("rotate", event)}
          >
            <RotateCw className="size-3.5" aria-hidden="true" />
          </button>
          <button
            type="button"
            aria-label="이미지 크기 조절 핸들"
            className="pointer-events-auto absolute -bottom-3 -right-3 flex size-6 items-center justify-center rounded-full bg-sky-blue text-white shadow-sm ring-2 ring-white hover:bg-sky-blue/90 focus:outline-none focus:ring-2 focus:ring-sky-blue/40"
            onMouseDown={(event) => startImageHandleDrag("resize", event)}
          >
            <Maximize2 className="size-3.5" aria-hidden="true" />
          </button>
        </div>
      )}

      {linkDraft && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 px-4 py-6">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="notice-link-dialog-title"
            className="w-full max-w-md rounded-3xl bg-white p-5 shadow-lg ring-1 ring-stone-surface"
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                closeLinkDialog();
                return;
              }
              if (event.key === "Enter") {
                event.preventDefault();
                submitLinkDialog();
              }
            }}
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-full bg-parchment-card text-sky-blue">
                  <LinkIcon className="size-5" aria-hidden="true" />
                </span>
                <div>
                  <h2 id="notice-link-dialog-title" className="text-base font-bold text-charcoal-primary">
                    {linkDraft.mode === "edit" ? "링크 수정" : "링크 등록"}
                  </h2>
                  <p className="mt-1 text-xs text-ash">주소와 본문에 보일 문구를 입력해 주세요.</p>
                </div>
              </div>
              <button
                type="button"
                aria-label="링크 등록 닫기"
                className="flex size-9 items-center justify-center rounded-full bg-parchment-card text-graphite hover:bg-stone-surface focus:outline-none focus:ring-2 focus:ring-sky-blue/30"
                onClick={closeLinkDialog}
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            </div>

            <div className="space-y-3">
              <label className="block">
                <span className="mb-1 block text-xs font-bold text-graphite">연결 주소</span>
                <input
                  ref={linkUrlInputRef}
                  aria-label="연결 주소"
                  value={linkDraft.url}
                  onChange={(event) => setLinkDraft({ ...linkDraft, url: event.target.value, error: "" })}
                  placeholder="https://example.com 또는 /news?tab=notice..."
                  className="w-full rounded-xl border border-stone-surface bg-[#fbfaf9] px-3 py-2.5 text-sm text-charcoal-primary outline-none focus:border-sky-blue focus:ring-2 focus:ring-sky-blue/20"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-bold text-graphite">표시 문구</span>
                <input
                  aria-label="표시 문구"
                  value={linkDraft.label}
                  onChange={(event) => setLinkDraft({ ...linkDraft, label: event.target.value, error: "" })}
                  placeholder="본문에 표시할 텍스트"
                  className="w-full rounded-xl border border-stone-surface bg-[#fbfaf9] px-3 py-2.5 text-sm text-charcoal-primary outline-none focus:border-sky-blue focus:ring-2 focus:ring-sky-blue/20"
                />
              </label>
            </div>

            {linkDraft.error && (
              <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-xs font-semibold text-red-600" role="alert">
                {linkDraft.error}
              </p>
            )}

            <div className="mt-5 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                className="rounded-full bg-parchment-card px-4 py-2 text-sm font-bold text-graphite hover:bg-stone-surface focus:outline-none focus:ring-2 focus:ring-sky-blue/30"
                onClick={closeLinkDialog}
              >
                취소
              </button>
              <button
                type="button"
                className="rounded-full bg-midnight px-4 py-2 text-sm font-bold text-white hover:bg-charcoal-primary focus:outline-none focus:ring-2 focus:ring-sky-blue/30"
                onClick={submitLinkDialog}
              >
                {linkDraft.mode === "edit" ? "링크 수정" : "링크 삽입"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
