import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

export const DOCUMENTS_BUCKET = process.env.SUPABASE_DOCUMENTS_BUCKET || "documents";

let supabaseAdmin: ReturnType<typeof createClient> | null = null;
let bucketReady = false;

function getStorageConfig() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("SUPABASE_URL and SUPABASE_SECRET_KEY or SUPABASE_SERVICE_ROLE_KEY are required.");
  }

  return { supabaseUrl, supabaseKey };
}

function getSupabaseAdmin() {
  if (!supabaseAdmin) {
    const { supabaseUrl, supabaseKey } = getStorageConfig();
    supabaseAdmin = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  return supabaseAdmin;
}

function sanitizeFileName(fileName: string) {
  const sanitized = fileName
    .normalize("NFKD")
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");

  return sanitized || "document.pdf";
}

export function createDocumentStoragePath(fileName: string) {
  const datePrefix = new Date().toISOString().slice(0, 10);
  return `documents/${datePrefix}/${randomUUID()}-${sanitizeFileName(fileName)}`;
}

export async function ensureDocumentsBucket() {
  if (bucketReady) return;

  const supabase = getSupabaseAdmin();
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();

  if (listError) {
    throw listError;
  }

  const exists = buckets.some((bucket) => bucket.id === DOCUMENTS_BUCKET);
  if (!exists) {
    const { error: createError } = await supabase.storage.createBucket(DOCUMENTS_BUCKET, {
      public: false,
      allowedMimeTypes: ["application/pdf"],
      fileSizeLimit: "20MB",
    });

    if (createError) {
      throw createError;
    }
  }

  bucketReady = true;
}

export async function uploadDocumentFile(file: File) {
  await ensureDocumentsBucket();

  const path = createDocumentStoragePath(file.name);
  const contentType = file.type || "application/pdf";
  const bytes = await file.arrayBuffer();

  const { error } = await getSupabaseAdmin().storage.from(DOCUMENTS_BUCKET).upload(path, bytes, {
    contentType,
    upsert: false,
  });

  if (error) {
    throw error;
  }

  return path;
}

export async function uploadDocumentBytes(params: {
  path: string;
  bytes: Buffer | ArrayBuffer;
  contentType?: string;
}) {
  await ensureDocumentsBucket();

  const { error } = await getSupabaseAdmin().storage.from(DOCUMENTS_BUCKET).upload(params.path, params.bytes, {
    contentType: params.contentType || "application/pdf",
    upsert: true,
  });

  if (error) {
    throw error;
  }
}

export async function downloadDocumentFile(path: string) {
  const { data, error } = await getSupabaseAdmin().storage.from(DOCUMENTS_BUCKET).download(path);

  if (error) {
    throw error;
  }

  return data;
}

export const UPLOADS_BUCKET = process.env.SUPABASE_UPLOADS_BUCKET || "uploads";
let uploadsBucketReady = false;

export async function ensurePublicUploadsBucket() {
  if (uploadsBucketReady) return;

  const supabase = getSupabaseAdmin();
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();

  if (listError) {
    throw listError;
  }

  const exists = buckets.some((bucket) => bucket.id === UPLOADS_BUCKET);
  if (!exists) {
    const { error: createError } = await supabase.storage.createBucket(UPLOADS_BUCKET, {
      public: true,
      fileSizeLimit: "5MB",
    });

    if (createError) {
      throw createError;
    }
  }

  uploadsBucketReady = true;
}

export async function uploadPublicFile(file: File) {
  await ensurePublicUploadsBucket();

  const datePrefix = new Date().toISOString().slice(0, 10);
  const path = `uploads/${datePrefix}/${randomUUID()}-${sanitizeFileName(file.name)}`;
  const contentType = file.type || "image/png";
  const bytes = await file.arrayBuffer();

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.storage.from(UPLOADS_BUCKET).upload(path, bytes, {
    contentType,
    upsert: false,
  });

  if (error) {
    throw error;
  }

  const { data } = supabase.storage.from(UPLOADS_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
