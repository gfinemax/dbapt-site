export const KAKAO_PREVIEW_OUTPUT_WIDTH = 800;
export const KAKAO_PREVIEW_OUTPUT_HEIGHT = 400;
export const LEGACY_SOCIAL_PREVIEW_WIDTH = 1200;
export const LEGACY_SOCIAL_PREVIEW_HEIGHT = 628;

export function getSocialPreviewDimensions(imageUrl: string) {
  return imageUrl.includes("kakao-preview-800x400-")
    ? { width: KAKAO_PREVIEW_OUTPUT_WIDTH, height: KAKAO_PREVIEW_OUTPUT_HEIGHT }
    : { width: LEGACY_SOCIAL_PREVIEW_WIDTH, height: LEGACY_SOCIAL_PREVIEW_HEIGHT };
}
