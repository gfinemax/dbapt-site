import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { getYouTubeEmbedUrl, parseYouTubeVideoId } from "@/lib/news/youtube";
import { YouTubeVideoPlayer } from "@/components/news/youtube-video-player";

describe("news YouTube embeds", () => {
  it.each([
    ["https://www.youtube.com/watch?v=dQw4w9WgXcQ", "dQw4w9WgXcQ"],
    ["https://youtu.be/dQw4w9WgXcQ?t=3", "dQw4w9WgXcQ"],
    ["https://youtube.com/shorts/dQw4w9WgXcQ", "dQw4w9WgXcQ"],
    ["https://youtube.com/embed/dQw4w9WgXcQ", "dQw4w9WgXcQ"],
  ])("parses %s", (url, expected) => expect(parseYouTubeVideoId(url)).toBe(expected));

  it("rejects arbitrary and malformed URLs", () => {
    expect(parseYouTubeVideoId("https://example.com/dQw4w9WgXcQ")).toBeNull();
    expect(parseYouTubeVideoId("https://youtube.com/watch?v=short")).toBeNull();
  });

  it("uses the privacy-enhanced player origin", () => {
    expect(getYouTubeEmbedUrl("dQw4w9WgXcQ")).toBe("https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?rel=0");
  });

  it("renders an accessible responsive player", () => {
    const { container } = render(<YouTubeVideoPlayer videoId="dQw4w9WgXcQ" title="현장 안내" />);
    expect(screen.getByTitle("현장 안내 동영상")).toHaveAttribute(
      "src",
      "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?rel=0",
    );
    expect(container.querySelector(".aspect-video")).toBeInTheDocument();
  });
});
