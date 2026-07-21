export type ShareableNewsKind = "free" | "notice";

export function buildNewsSharePath(kind: ShareableNewsKind, id: string) {
  return `/share/${kind}/${encodeURIComponent(id)}`;
}

export function buildAbsoluteNewsShareUrl(origin: string, kind: ShareableNewsKind, id: string) {
  return `${origin.replace(/\/+$/, "")}${buildNewsSharePath(kind, id)}`;
}
