export function normalizeViewCount(value: number | null | undefined) {
  return Number.isFinite(value) && typeof value === "number" && value > 0 ? Math.floor(value) : 0;
}

export function formatViewCount(value: number | null | undefined, label = "조회") {
  return `${label} ${normalizeViewCount(value).toLocaleString("ko-KR")}회`;
}

export function formatViewCountNumber(value: number | null | undefined) {
  return normalizeViewCount(value).toLocaleString("ko-KR");
}

export const VIEW_COUNT_BASELINE_DATE = "2026.07.05";

export function formatViewCountBaseline(label = "조회수") {
  return `${label}는 ${VIEW_COUNT_BASELINE_DATE}부터 집계됩니다.`;
}
