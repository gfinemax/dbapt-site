import { afterEach, describe, expect, it } from "vitest";
import { getPublicUploadStoragePath } from "@/lib/document-storage";

const originalSupabaseUrl = process.env.SUPABASE_URL;
const originalPublicSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

afterEach(() => {
  process.env.SUPABASE_URL = originalSupabaseUrl;
  process.env.NEXT_PUBLIC_SUPABASE_URL = originalPublicSupabaseUrl;
});

describe("getPublicUploadStoragePath", () => {
  it("extracts only a file inside the configured public uploads bucket", () => {
    process.env.SUPABASE_URL = "https://project.supabase.co";

    expect(getPublicUploadStoragePath(
      "https://project.supabase.co/storage/v1/object/public/uploads/uploads/2026-08-05/report.pdf",
    )).toBe("uploads/2026-08-05/report.pdf");
  });

  it("keeps encoded Korean file names", () => {
    process.env.SUPABASE_URL = "https://project.supabase.co";

    expect(getPublicUploadStoragePath(
      "https://project.supabase.co/storage/v1/object/public/uploads/uploads/2026-08-05/%EC%9E%85%EC%9E%A5%EB%AC%B8.pdf",
    )).toBe("uploads/2026-08-05/입장문.pdf");
  });

  it("rejects another host, bucket, or traversal path", () => {
    process.env.SUPABASE_URL = "https://project.supabase.co";

    expect(() => getPublicUploadStoragePath(
      "https://evil.example/storage/v1/object/public/uploads/uploads/report.pdf",
    )).toThrow("허용되지 않은");
    expect(() => getPublicUploadStoragePath(
      "https://project.supabase.co/storage/v1/object/public/private/uploads/report.pdf",
    )).toThrow("허용되지 않은");
    expect(() => getPublicUploadStoragePath(
      "https://project.supabase.co/storage/v1/object/public/uploads/uploads/%2E%2E/secret.pdf",
    )).toThrow("올바르지 않은");
  });
});
