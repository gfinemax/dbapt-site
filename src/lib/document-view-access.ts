type DocumentViewSession = {
  id: string;
  role: string;
} | null;

type DocumentViewTarget = {
  category: string;
  status: string;
};

export function isPublicDisclosureDocument(target: DocumentViewTarget) {
  return target.category === "DISCLOSURE" && target.status === "APPROVED";
}

export function getDocumentViewAccessError(target: DocumentViewTarget, session: DocumentViewSession) {
  if (isPublicDisclosureDocument(target)) {
    return null;
  }

  if (!session) {
    return {
      status: 401,
      error: "인증되지 않은 사용자입니다.",
    };
  }

  if (session.role === "PENDING") {
    return {
      status: 403,
      error: "가입 승인 대기 중에는 자료를 열람할 수 없습니다.",
    };
  }

  if (target.status === "PENDING" && session.role !== "ADMIN") {
    return {
      status: 403,
      error: "해당 문서를 볼 수 있는 권한이 없습니다.",
    };
  }

  return null;
}

export function shouldWriteDocumentViewLog(
  session: DocumentViewSession,
): session is Exclude<DocumentViewSession, null> {
  return !!session && session.role !== "PENDING";
}
