import { getYouTubeEmbedUrl } from "@/lib/news/youtube";

export function YouTubeVideoPlayer({ videoId, title }: { videoId?: string | null; title: string }) {
  const src = videoId ? getYouTubeEmbedUrl(videoId) : null;
  if (!src) return null;
  return (
    <div className="my-4 overflow-hidden rounded-2xl border border-stone-surface bg-black" data-youtube-player="true">
      <div className="aspect-video w-full">
        <iframe
          className="h-full w-full"
          src={src}
          title={`${title} 동영상`}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      </div>
    </div>
  );
}
