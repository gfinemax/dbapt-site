import type { CoopNewsView } from "@/lib/news/types";

export function mergeNewsCategoryRefresh(
  currentList: readonly CoopNewsView[],
  refreshedItems: readonly CoopNewsView[],
  category: string,
): CoopNewsView[] {
  return [
    ...refreshedItems,
    ...currentList.filter((item) => item.category !== category),
  ];
}
