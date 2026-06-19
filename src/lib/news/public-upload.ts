export type PublicUploadKind = "image" | "attachment";

export type PublicUploadResult = {
  url: string;
  name: string;
  size: number;
};

type FetchUpload = (input: string, init?: RequestInit) => Promise<Response>;

export async function uploadPublicFile(
  file: File,
  kind: PublicUploadKind,
  fetchImpl: FetchUpload = fetch,
): Promise<PublicUploadResult> {
  const formData = new FormData();
  formData.set("file", file);
  formData.set("kind", kind);

  const uploadRes = await fetchImpl("/api/upload", {
    method: "POST",
    body: formData,
  });
  const uploadData = await uploadRes.json();

  if (!uploadRes.ok) {
    throw new Error(uploadData.error || "파일 업로드에 실패했습니다.");
  }

  return uploadData as PublicUploadResult;
}
