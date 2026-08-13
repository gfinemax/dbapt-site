const YOUTUBE_VIDEO_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;

export function parseYouTubeVideoId(value: unknown): string | null {
  if (typeof value !== "string" || !value.trim()) return null;
  const input = value.trim();
  if (YOUTUBE_VIDEO_ID_PATTERN.test(input)) return input;

  try {
    const url = new URL(input.startsWith("http") ? input : `https://${input}`);
    const host = url.hostname.toLowerCase().replace(/^www\./, "");
    let candidate = "";
    if (host === "youtu.be") candidate = url.pathname.split("/").filter(Boolean)[0] || "";
    if (host === "youtube.com" || host === "m.youtube.com") {
      candidate = url.searchParams.get("v") || "";
      if (!candidate) {
        const parts = url.pathname.split("/").filter(Boolean);
        if (["shorts", "embed", "live"].includes(parts[0])) candidate = parts[1] || "";
      }
    }
    return YOUTUBE_VIDEO_ID_PATTERN.test(candidate) ? candidate : null;
  } catch {
    return null;
  }
}

export function getYouTubeEmbedUrl(videoId: string) {
  if (!YOUTUBE_VIDEO_ID_PATTERN.test(videoId)) return null;
  return `https://www.youtube-nocookie.com/embed/${videoId}?rel=0`;
}
