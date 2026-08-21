export type ShortShareKind = "document" | "free" | "newsletter" | "notice";

const BASE62_ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
const BASE62 = BigInt(BASE62_ALPHABET.length);
const ZERO = BigInt(0);
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const KIND_PREFIX: Record<ShortShareKind, string> = {
  document: "d",
  free: "f",
  newsletter: "w",
  notice: "n",
};

const PREFIX_KIND: Record<string, ShortShareKind | undefined> = Object.fromEntries(
  Object.entries(KIND_PREFIX).map(([kind, prefix]) => [prefix, kind as ShortShareKind]),
);

function normalizeBaseUrl(siteUrl?: string) {
  const value = siteUrl || process.env.OPENCHAT_SITE_URL || "https://dbapt-site.vercel.app";
  return value.replace(/\/+$/, "");
}

function encodeBase62(value: bigint) {
  if (value === ZERO) return "0";

  let remaining = value;
  let encoded = "";
  while (remaining > ZERO) {
    const index = Number(remaining % BASE62);
    encoded = `${BASE62_ALPHABET[index]}${encoded}`;
    remaining = remaining / BASE62;
  }

  return encoded;
}

function decodeBase62(value: string) {
  let decoded = ZERO;

  for (const char of value) {
    const index = BASE62_ALPHABET.indexOf(char);
    if (index === -1) return null;
    decoded = decoded * BASE62 + BigInt(index);
  }

  return decoded;
}

function uuidToCompactId(id: string) {
  const hex = id.replace(/-/g, "").toLowerCase();
  return encodeBase62(BigInt(`0x${hex}`));
}

function compactIdToUuid(compactId: string) {
  const decoded = decodeBase62(compactId);
  if (decoded === null) return null;

  const hex = decoded.toString(16).padStart(32, "0");
  if (hex.length > 32) return null;

  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function encodeFallbackId(id: string) {
  return Buffer.from(id, "utf8").toString("base64url");
}

function decodeFallbackId(id: string) {
  try {
    return Buffer.from(id, "base64url").toString("utf8");
  } catch {
    return null;
  }
}

export function buildShortShareCode(kind: ShortShareKind, id: string) {
  const prefix = KIND_PREFIX[kind];
  if (UUID_PATTERN.test(id)) {
    return `${prefix}${uuidToCompactId(id)}`;
  }

  return `${prefix}~${encodeFallbackId(id)}`;
}

function buildShareCacheVersion(cacheKey: string) {
  let hash = 2166136261;
  for (let index = 0; index < cacheKey.length; index += 1) {
    hash ^= cacheKey.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
}

export function buildVersionedShortShareCode(kind: ShortShareKind, id: string, cacheKey?: string | null) {
  const code = buildShortShareCode(kind, id);
  const normalizedCacheKey = cacheKey?.trim();
  return normalizedCacheKey ? `${code}.${buildShareCacheVersion(normalizedCacheKey)}` : code;
}

export function parseShortShareCode(code: string): { kind: ShortShareKind; id: string } | null {
  const [contentCode, version, ...extraParts] = code.split(".");
  if (extraParts.length > 0 || (version !== undefined && !/^[A-Za-z0-9]+$/.test(version))) return null;
  if (contentCode.length < 2) return null;

  const kind = PREFIX_KIND[contentCode[0]];
  if (!kind) return null;

  const payload = contentCode.slice(1);
  if (!payload) return null;

  if (payload.startsWith("~")) {
    const encodedId = payload.slice(1);
    if (!encodedId || !/^[A-Za-z0-9_-]+$/.test(encodedId)) return null;

    const id = decodeFallbackId(encodedId);
    return id ? { kind, id } : null;
  }

  if (!/^[A-Za-z0-9]+$/.test(payload)) return null;

  const id = compactIdToUuid(payload);
  return id ? { kind, id } : null;
}

export function buildShortSharePath(kind: ShortShareKind, id: string, cacheKey?: string | null) {
  return `/s/${buildVersionedShortShareCode(kind, id, cacheKey)}`;
}

export function buildAbsoluteShortShareUrl(kind: ShortShareKind, id: string, siteUrl?: string, cacheKey?: string | null) {
  return `${normalizeBaseUrl(siteUrl)}${buildShortSharePath(kind, id, cacheKey)}`;
}
