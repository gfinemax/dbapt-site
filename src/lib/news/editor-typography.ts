export const DEFAULT_EDITOR_FONT_SIZE = 14;
export const MIN_EDITOR_FONT_SIZE = 10;
export const MAX_EDITOR_FONT_SIZE = 48;
export const DEFAULT_EDITOR_LINE_HEIGHT = 1.6;
export const MIN_EDITOR_LINE_HEIGHT = 1;
export const MAX_EDITOR_LINE_HEIGHT = 3;
export const DEFAULT_EDITOR_PARAGRAPH_SPACING = 12;
export const MIN_EDITOR_PARAGRAPH_SPACING = 0;
export const MAX_EDITOR_PARAGRAPH_SPACING = 48;

export function normalizeEditorFontSize(value: string) {
  const match = value.trim().match(/^(\d{1,2})px$/);
  if (!match) return "";
  const size = Number(match[1]);
  return Number.isInteger(size) && size >= MIN_EDITOR_FONT_SIZE && size <= MAX_EDITOR_FONT_SIZE
    ? `${size}px`
    : "";
}

export function normalizeEditorLineHeight(value: string) {
  const normalized = value.trim();
  if (!/^\d(?:\.\d{1,3})?$/.test(normalized)) return "";
  const lineHeight = Number(normalized);
  return lineHeight >= MIN_EDITOR_LINE_HEIGHT && lineHeight <= MAX_EDITOR_LINE_HEIGHT
    ? normalized
    : "";
}

export function normalizeEditorParagraphSpacing(value: string) {
  const match = value.trim().match(/^(\d{1,2})px$/);
  if (!match) return "";
  const spacing = Number(match[1]);
  return Number.isInteger(spacing) && spacing >= MIN_EDITOR_PARAGRAPH_SPACING && spacing <= MAX_EDITOR_PARAGRAPH_SPACING
    ? `${spacing}px`
    : "";
}
