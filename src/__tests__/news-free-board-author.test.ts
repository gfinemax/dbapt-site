import { describe, expect, it } from "vitest";

import { getFreeBoardAuthorLabel } from "@/lib/news/free-board-author";
import type { NewsUserView } from "@/lib/news/types";

const user = (overrides: Partial<NewsUserView> = {}): NewsUserView => ({
  id: "member-1",
  name: "홍길동",
  loginId: "hong123",
  role: "MEMBER",
  memberType: "REGULAR",
  ...overrides,
});

describe("getFreeBoardAuthorLabel", () => {
  it("uses admin display names without masking", () => {
    expect(getFreeBoardAuthorLabel(user({ role: "ADMIN", displayAuthorName: "운영자" }), "member-1")).toBe("운영자 (나)");
    expect(getFreeBoardAuthorLabel(user({ id: "admin-1", role: "ADMIN", displayAuthorName: null }), "member-1")).toBe("사무국");
  });

  it("marks the current member as mine", () => {
    expect(getFreeBoardAuthorLabel(user({ signupName: "김대방" }), "member-1")).toBe("김대방 (나)");
  });

  it("shows other member and preliminary member names without masking", () => {
    expect(getFreeBoardAuthorLabel(user({ id: "member-2", signupName: "김대방", loginId: "kim123" }), "member-1")).toBe("김대방");
    expect(getFreeBoardAuthorLabel(user({ id: "member-3", memberType: "PRELIMINARY", name: "예비회원", loginId: null }), "member-1")).toBe("예비회원");
  });

  it("marks refund and related-party authors", () => {
    expect(getFreeBoardAuthorLabel(user({ id: "refund-1", role: "REFUND", memberType: "REFUND", name: "박정산" }), "member-1")).toBe("박정산 (환불)");
    expect(getFreeBoardAuthorLabel(user({ id: "associate-1", role: "ASSOCIATE", memberType: "ASSOCIATE", name: "외부관계자" }), "member-1")).toBe("외부관계자 (관계자)");
  });
});
