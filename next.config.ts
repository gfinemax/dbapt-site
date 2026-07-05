import type { NextConfig } from "next";

const defaultHtmlLimitedBots =
  "[\\w-]+-Google|Google-[\\w-]+|Chrome-Lighthouse|Slurp|DuckDuckBot|baiduspider|yandex|sogou|bitlybot|tumblr|vkShare|quora link preview|redditbot|ia_archiver|Bingbot|BingPreview|applebot|facebookexternalhit|facebookcatalog|Twitterbot|LinkedInBot|Slackbot|Discordbot|WhatsApp|SkypeUriPreview|Yeti|googleweblight";

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  htmlLimitedBots: new RegExp(`${defaultHtmlLimitedBots}|KakaoTalk|Kakaotalk-scrap|kakaotalk-scrap`, "i"),
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "qhgxsafflybrjnhyxqzs.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
