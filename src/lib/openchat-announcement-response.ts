type OpenChatAnnouncementSuccessResponse = {
  announcement: {
    id: string;
    message: string;
  };
};

type OpenChatAnnouncementResponse = Partial<OpenChatAnnouncementSuccessResponse> & {
  error?: string;
};

export async function readOpenChatAnnouncementResponse(res: Response): Promise<OpenChatAnnouncementSuccessResponse> {
  let data: OpenChatAnnouncementResponse = {};

  try {
    data = await res.json() as OpenChatAnnouncementResponse;
  } catch {
    data = {};
  }

  if (!res.ok || !data.announcement?.message) {
    throw new Error(data.error || "오픈채팅 공지문 생성 요청에 실패했습니다.");
  }

  return data as OpenChatAnnouncementSuccessResponse;
}
