export const QUARTERLY_PERFORMANCE_REPORT_LABEL = "분기실적보고서(조합)";

export function getDisclosureCategoryLabel(category: string) {
  if (category === "실적보고서" || category === "추진실적") {
    return QUARTERLY_PERFORMANCE_REPORT_LABEL;
  }

  return category;
}
