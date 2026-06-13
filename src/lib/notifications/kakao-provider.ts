export type KakaoAlimtalkMessage = {
  to: string;
  documentTitle: string;
  documentCategory: string;
  publishedAt: Date | null;
  siteUrl: string;
};

export type KakaoSendResult = {
  providerMessageId: string;
};

export async function sendKakaoAlimtalk(message: KakaoAlimtalkMessage): Promise<KakaoSendResult> {
  void message;
  throw new Error("Kakao live provider is not configured for this implementation slice.");
}
