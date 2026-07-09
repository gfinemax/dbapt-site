const KOREA_TIME_OFFSET_MINUTES = 9 * 60;
const DATETIME_LOCAL_PATTERN =
  /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?$/;
const EXPLICIT_TIME_ZONE_PATTERN = /(Z|[+-]\d{2}:?\d{2})$/i;

export function toKoreaDateTimeLocalValue(value: string | Date | null | undefined) {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const koreaTime = new Date(date.getTime() + KOREA_TIME_OFFSET_MINUTES * 60_000);
  return koreaTime.toISOString().slice(0, 16);
}

export function formatKoreaDateValue(value: string | Date | null | undefined) {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return String(value).slice(0, 10).replace(/-/g, ".");
  }

  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date).replace(/-/g, ".");
}

export function parseKoreaDateTimeLocalValue(value: unknown): Date | null | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  if (typeof value !== "string") return null;

  const trimmed = value.trim();
  if (!trimmed) return undefined;

  if (EXPLICIT_TIME_ZONE_PATTERN.test(trimmed)) {
    const explicitDate = new Date(trimmed);
    return Number.isNaN(explicitDate.getTime()) ? null : explicitDate;
  }

  const match = DATETIME_LOCAL_PATTERN.exec(trimmed);
  if (match) {
    const [, year, month, day, hour, minute, second = "0", millisecond = "0"] = match;
    const utcMillis = Date.UTC(
      Number(year),
      Number(month) - 1,
      Number(day),
      Number(hour) - KOREA_TIME_OFFSET_MINUTES / 60,
      Number(minute),
      Number(second),
      Number(millisecond.padEnd(3, "0")),
    );
    const koreaWallClockDate = new Date(utcMillis);
    return Number.isNaN(koreaWallClockDate.getTime()) ? null : koreaWallClockDate;
  }

  const date = new Date(trimmed);
  return Number.isNaN(date.getTime()) ? null : date;
}
