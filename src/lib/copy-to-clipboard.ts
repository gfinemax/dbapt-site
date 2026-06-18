export async function copyTextToClipboard(text: string) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch {
      // Some browsers expose navigator.clipboard but reject writes outside secure
      // user-gesture contexts. Fall through to the legacy textarea copy path.
    }
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  textarea.style.top = "-9999px";

  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();

  const copied = document.execCommand?.("copy") ?? false;
  document.body.removeChild(textarea);

  if (!copied) {
    throw new Error("클립보드 복사를 지원하지 않는 브라우저입니다.");
  }
}
