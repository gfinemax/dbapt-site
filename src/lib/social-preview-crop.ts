export const SOCIAL_PREVIEW_OUTPUT_WIDTH = 1200;
export const SOCIAL_PREVIEW_OUTPUT_HEIGHT = 628;
export const SOCIAL_PREVIEW_ASPECT_RATIO = SOCIAL_PREVIEW_OUTPUT_WIDTH / SOCIAL_PREVIEW_OUTPUT_HEIGHT;

export type SocialPreviewImageBounds = {
  width: number;
  height: number;
};

export type SocialPreviewCropRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

function roundCropValue(value: number) {
  return Number(value.toFixed(4));
}

export function createCenteredSocialPreviewCrop(bounds: SocialPreviewImageBounds): SocialPreviewCropRect {
  const boundedWidth = Math.max(1, bounds.width);
  const boundedHeight = Math.max(1, bounds.height);
  let width = boundedWidth;
  let height = width / SOCIAL_PREVIEW_ASPECT_RATIO;

  if (height > boundedHeight) {
    height = boundedHeight;
    width = height * SOCIAL_PREVIEW_ASPECT_RATIO;
  }

  return {
    x: roundCropValue((boundedWidth - width) / 2),
    y: roundCropValue((boundedHeight - height) / 2),
    width: roundCropValue(width),
    height: roundCropValue(height),
  };
}

export function clampSocialPreviewCrop(
  crop: SocialPreviewCropRect,
  bounds: SocialPreviewImageBounds,
): SocialPreviewCropRect {
  const width = Math.min(Math.max(1, crop.width), Math.max(1, bounds.width));
  const height = Math.min(Math.max(1, crop.height), Math.max(1, bounds.height));
  const maxX = Math.max(0, bounds.width - width);
  const maxY = Math.max(0, bounds.height - height);

  return {
    x: roundCropValue(Math.min(Math.max(0, crop.x), maxX)),
    y: roundCropValue(Math.min(Math.max(0, crop.y), maxY)),
    width: roundCropValue(width),
    height: roundCropValue(height),
  };
}

export function moveSocialPreviewCrop(
  crop: SocialPreviewCropRect,
  bounds: SocialPreviewImageBounds,
  delta: { x: number; y: number },
): SocialPreviewCropRect {
  return clampSocialPreviewCrop(
    {
      ...crop,
      x: crop.x + delta.x,
      y: crop.y + delta.y,
    },
    bounds,
  );
}

export function resizeSocialPreviewCrop(
  crop: SocialPreviewCropRect,
  bounds: SocialPreviewImageBounds,
  sizePercent: number,
): SocialPreviewCropRect {
  const maxCrop = createCenteredSocialPreviewCrop(bounds);
  const normalizedPercent = Math.min(Math.max(sizePercent, 35), 100) / 100;
  const nextWidth = maxCrop.width * normalizedPercent;
  const nextHeight = nextWidth / SOCIAL_PREVIEW_ASPECT_RATIO;
  const centerX = crop.x + crop.width / 2;
  const centerY = crop.y + crop.height / 2;

  return clampSocialPreviewCrop(
    {
      x: centerX - nextWidth / 2,
      y: centerY - nextHeight / 2,
      width: nextWidth,
      height: nextHeight,
    },
    bounds,
  );
}

export function createSocialPreviewFileName(now = new Date()) {
  const stamp = now.toISOString().replace(/\D/g, "").slice(0, 14);
  return `social-preview-${stamp.slice(0, 8)}-${stamp.slice(8, 14)}.png`;
}

export async function createSocialPreviewFile(
  source: CanvasImageSource,
  crop: SocialPreviewCropRect,
  fileName = createSocialPreviewFileName(),
) {
  const canvas = document.createElement("canvas");
  canvas.width = SOCIAL_PREVIEW_OUTPUT_WIDTH;
  canvas.height = SOCIAL_PREVIEW_OUTPUT_HEIGHT;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("이미지 자르기를 처리할 수 없습니다.");
  }

  context.drawImage(
    source,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    SOCIAL_PREVIEW_OUTPUT_WIDTH,
    SOCIAL_PREVIEW_OUTPUT_HEIGHT,
  );

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, "image/png", 0.92);
  });

  if (!blob) {
    throw new Error("카톡 미리보기 이미지를 생성하지 못했습니다.");
  }

  return new File([blob], fileName, { type: "image/png" });
}
