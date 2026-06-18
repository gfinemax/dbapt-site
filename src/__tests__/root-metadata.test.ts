import { describe, expect, it } from "vitest";
import { metadata } from "@/app/layout";

describe("root metadata", () => {
  it("uses the community hero artwork as the social preview image", () => {
    expect(metadata.openGraph?.images).toEqual([
      {
        url: "/assets/hero/community-hero-04.png",
        width: 1672,
        height: 941,
        alt: "대방동 지역주택조합 대표 이미지",
      },
    ]);
    expect(metadata.metadataBase?.toString()).toBe("https://dbapt-site.vercel.app/");
    expect(metadata.twitter?.images).toEqual(["/assets/hero/community-hero-04.png"]);
    expect(JSON.stringify(metadata)).not.toContain("/assets/about/chairman.jpg");
  });
});
