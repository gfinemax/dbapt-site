import { describe, expect, it, vi } from "vitest";
import {
  SOCIAL_PREVIEW_ASPECT_RATIO,
  SOCIAL_PREVIEW_OUTPUT_HEIGHT,
  SOCIAL_PREVIEW_OUTPUT_WIDTH,
  clampSocialPreviewCrop,
  createCenteredSocialPreviewCrop,
  createSocialPreviewFile,
  createSocialPreviewFileName,
  moveSocialPreviewCrop,
  resizeSocialPreviewCrop,
} from "@/lib/social-preview-crop";

describe("social preview crop", () => {
  it("uses the Kakao/Open Graph wide-card output size", () => {
    expect(SOCIAL_PREVIEW_OUTPUT_WIDTH).toBe(800);
    expect(SOCIAL_PREVIEW_OUTPUT_HEIGHT).toBe(400);
    expect(SOCIAL_PREVIEW_ASPECT_RATIO).toBe(2);
  });

  it("creates the largest centered 2:1 crop inside the source image", () => {
    const crop = createCenteredSocialPreviewCrop({ width: 1000, height: 1000 });

    expect(crop.width).toBeCloseTo(1000);
    expect(crop.height).toBeCloseTo(500, 2);
    expect(crop.x).toBeCloseTo(0);
    expect(crop.y).toBeCloseTo(250, 2);
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
    expect(resized.height).toBeCloseTo(350, 2);
    expect(resized.width / resized.height).toBeCloseTo(SOCIAL_PREVIEW_ASPECT_RATIO, 5);
    expect(moved.x).toBeGreaterThan(0);
  });

  it("names cropped files as Kakao-specific 800x400 JPEGs", () => {
    expect(createSocialPreviewFileName(new Date("2026-07-05T01:23:27+09:00"))).toBe(
      "kakao-preview-800x400-20260704-162327.jpg",
    );
  });

  it("encodes a white-backed 800x400 JPEG", async () => {
    const fillRect = vi.fn();
    const drawImage = vi.fn();
    const context = { fillStyle: "", fillRect, drawImage };
    const canvas = {
      width: 0,
      height: 0,
      getContext: vi.fn(() => context),
      toBlob: vi.fn((callback: BlobCallback, type?: string) => {
        callback(new Blob(["jpeg"], { type }));
      }),
    };
    const createElementSpy = vi.spyOn(document, "createElement").mockReturnValue(canvas as unknown as HTMLCanvasElement);

    const file = await createSocialPreviewFile(
      {} as CanvasImageSource,
      { x: 0, y: 0, width: 1000, height: 500 },
      "kakao-preview-800x400-test.jpg",
    );

    expect(canvas).toMatchObject({ width: 800, height: 400 });
    expect(context.fillStyle).toBe("#ffffff");
    expect(fillRect).toHaveBeenCalledWith(0, 0, 800, 400);
    expect(drawImage).toHaveBeenCalled();
    expect(canvas.toBlob).toHaveBeenCalledWith(expect.any(Function), "image/jpeg", 0.9);
    expect(file.type).toBe("image/jpeg");
    createElementSpy.mockRestore();
  });
});
