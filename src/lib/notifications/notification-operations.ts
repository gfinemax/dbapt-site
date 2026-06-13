type ContactUpdateInput = {
  phone?: string;
  optIn?: boolean;
  enabled?: boolean;
  clearPhone?: boolean;
};

export type NotificationContactUpdate = {
  phone?: string | null;
  kakaoNotificationOptIn?: boolean;
  kakaoNotificationEnabled?: boolean;
};

type NotificationLogRecipient = {
  status: string;
  phoneMasked: string | null;
  errorCode: string | null;
  user: {
    loginId: string | null;
    name: string | null;
  };
  group: {
    key: string;
    name: string;
  };
};

export type DisclosureNotificationLog = {
  id: string;
  status: string;
  skippedReason: string | null;
  recipientCount: number;
  sentCount: number;
  failedCount: number;
  createdAt: Date;
  document: {
    id: string;
    title: string;
  };
  recipients?: NotificationLogRecipient[];
};

export function normalizeNotificationPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (!/^010\d{8}$/.test(digits)) {
    throw new Error("phone must be a Korean mobile number starting with 010 and 11 digits long.");
  }
  return digits;
}

export function buildNotificationContactUpdate(input: ContactUpdateInput): NotificationContactUpdate {
  const data: NotificationContactUpdate = {};

  if (input.clearPhone) {
    data.phone = null;
  } else if (input.phone !== undefined) {
    data.phone = normalizeNotificationPhone(input.phone);
  }

  if (input.optIn !== undefined) {
    data.kakaoNotificationOptIn = input.optIn;
  }

  if (input.enabled !== undefined) {
    data.kakaoNotificationEnabled = input.enabled;
  }

  if (Object.keys(data).length === 0) {
    throw new Error("At least one contact field must be provided.");
  }

  return data;
}

function formatDate(date: Date) {
  return date.toISOString();
}

export function formatDisclosureNotificationLog(log: DisclosureNotificationLog) {
  const lines = [
    `NOTIFICATION id=${log.id} document=${log.document.id} title="${log.document.title}" status=${log.status} reason=${log.skippedReason || "none"} recipients=${log.recipientCount} sent=${log.sentCount} failed=${log.failedCount} createdAt=${formatDate(log.createdAt)}`,
  ];

  for (const recipient of log.recipients ?? []) {
    lines.push(
      `  RECIPIENT user=${recipient.user.loginId || recipient.user.name || "unknown"} group=${recipient.group.key} status=${recipient.status} phone=${recipient.phoneMasked || "none"} error=${recipient.errorCode || "none"}`,
    );
  }

  return lines.join("\n");
}
