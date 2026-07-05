import { describe, expect, it } from "vitest";
import {
  SOCIAL_PREVIEW_ASPECT_RATIO,
  SOCIAL_PREVIEW_OUTPUT_HEIGHT,
  SOCIAL_PREVIEW_OUTPUT_WIDTH,
  clampSocialPreviewCrop,
  createCenteredSocialPreviewCrop,
  createSocialPreviewFileName,
  moveSocialPreviewCrop,
  resizeSocialPreviewCrop,
} from "@/lib/social-preview-crop";

describe("social preview crop", () => {
  it("uses the Kakao/Open Graph wide-card output size", () => {
    expect(SOCIAL_PREVIEW_OUTPUT_WIDTH).toBe(1200);
    expect(SOCIAL_PREVIEW_OUTPUT_HEIGHT).toBe(628);
    expect(SOCIAL_PREVIEW_ASPECT_RATIO).toBeCloseTo(1200 / 628, 5);
  });

  it("creates the largest centered 1.91:1 crop inside the source image", () => {
    const crop = createCenteredSocialPreviewCrop({ width: 1000, height: 1000 });

    expect(crop.width).toBeCloseTo(1000);
    expect(crop.height).toBeCloseTo(523.33, 2);
    expect(crop.x).toBeCloseTo(0);
    expect(crop.y).toBeCloseTo(238.33, 2);
  });

  it("clamps crop movement without changing the aspect ratio", () => {
    const crop = clampSocialPreviewCrop(
      { x: 900, y: -40, width: 600, height: 314 },
      { width: 1000, height: 500 },
    );

    expect(crop).toEqual({
      x: 400,
      y: 0,
      width: 600,
      height: 314,
    });
  });

  it("moves a wide crop vertically when the source image is narrower than the target ratio", () => {
    const bounds = { width: 1000, height: 750 };
    const crop = createCenteredSocialPreviewCrop(bounds);
    const moved = moveSocialPreviewCrop(crop, bounds, { x: 200, y: 60 });

    expect(moved.x).toBe(0);
    expect(moved.y).toBeCloseTo(crop.y + 60, 2);
  });

  it("shrinks a full-width crop at the same ratio so it can move horizontally", () => {
    const bounds = { width: 1000, height: 750 };
    const crop = createCenteredSocialPreviewCrop(bounds);
    const resized = resizeSocialPreviewCrop(crop, bounds, 70);
    const moved = moveSocialPreviewCrop(resized, bounds, { x: 100, y: 0 });

    expect(resized.width).toBeCloseTo(700);
    expect(resized.height).toBeCloseTo(366.33, 2);
    expect(resized.width / resized.height).toBeCloseTo(SOCIAL_PREVIEW_ASPECT_RATIO, 5);
    expect(moved.x).toBeGreaterThan(0);
  });

  it("names cropped files as social-preview PNGs", () => {
    expect(createSocialPreviewFileName(new Date("2026-07-05T01:23:27+09:00"))).toBe(
      "social-preview-20260704-162327.png",
    );
  });
});
