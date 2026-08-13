import { describe, expect, it } from "vitest";
import {
  normalizeEditorFontSize,
  normalizeEditorLineHeight,
  normalizeEditorParagraphSpacing,
} from "@/lib/news/editor-typography";

describe("news editor typography values", () => {
  it("accepts one-pixel font sizes from 10px through 48px", () => {
    expect(normalizeEditorFontSize("10px")).toBe("10px");
    expect(normalizeEditorFontSize("13px")).toBe("13px");
    expect(normalizeEditorFontSize("47px")).toBe("47px");
    expect(normalizeEditorFontSize("48px")).toBe("48px");
    expect(normalizeEditorFontSize("9px")).toBe("");
    expect(normalizeEditorFontSize("49px")).toBe("");
    expect(normalizeEditorFontSize("14.5px")).toBe("");
  });

  it("accepts bounded line-height and paragraph spacing values", () => {
    expect(normalizeEditorLineHeight("1.0")).toBe("1.0");
    expect(normalizeEditorLineHeight("1.7")).toBe("1.7");
    expect(normalizeEditorLineHeight("3.0")).toBe("3.0");
    expect(normalizeEditorLineHeight("0.9")).toBe("");
    expect(normalizeEditorLineHeight("3.1")).toBe("");
    expect(normalizeEditorParagraphSpacing("0px")).toBe("0px");
    expect(normalizeEditorParagraphSpacing("13px")).toBe("13px");
    expect(normalizeEditorParagraphSpacing("48px")).toBe("48px");
    expect(normalizeEditorParagraphSpacing("49px")).toBe("");
  });
});
