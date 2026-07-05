export type ShareRouteKind = "document" | "free" | "newsletter" | "notice";

function normalizeBaseUrl(siteUrl?: string) {
  const value = siteUrl || process.env.OPENCHAT_SITE_URL || "https://dbapt-site.vercel.app";
  return value.replace(/\/+$/, "");
}

export function buildSharePath(kind: ShareRouteKind, id: string) {
  return `/share/${kind}/${encodeURIComponent(id)}`;
}

export function buildAbsoluteShareUrl(kind: ShareRouteKind, id: string, siteUrl?: string) {
  return `${normalizeBaseUrl(siteUrl)}${buildSharePath(kind, id)}`;
}
