export function getPlainNoticeText(content: string) {
  return content
    .replace(/<img\b[^>]*>/gi, " [이미지] ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|li)>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
