import { describe, expect, it } from "vitest";

import { getContentAuthorLabel } from "@/lib/content-author-label";
import type { NewsUserView } from "@/lib/news/types";

const author = (overrides: Partial<NewsUserView> = {}): NewsUserView => ({
  id: "member-1",
  name: "홍길동",
  signupName: null,
  loginId: "hong123",
  role: "MEMBER",
  memberType: "REGULAR",
  ...overrides,
});

describe("getContentAuthorLabel", () => {
  it("shows member and preliminary member names without masking", () => {
    expect(getContentAuthorLabel(author({ id: "member-2", signupName: "김대방" }), "member-1")).toBe("김대방");
    expect(getContentAuthorLabel(author({ id: "member-3", memberType: "PRELIMINARY", name: "예비회원" }), "member-1")).toBe("예비회원");
  });

  it("marks refund authors next to the name", () => {
    expect(getContentAuthorLabel(author({ id: "refund-1", role: "REFUND", memberType: "REFUND", name: "박정산" }), "member-1")).toBe("박정산 (환불)");
  });

  it("does not mark operator or secretariat admin names as related parties", () => {
    expect(getContentAuthorLabel(author({ id: "admin-1", role: "ADMIN", displayAuthorName: "운영자" }), "member-1")).toBe("운영자");
    expect(getContentAuthorLabel(author({ id: "admin-2", role: "ADMIN", displayAuthorName: "사무국" }), "member-1")).toBe("사무국");
  });

  it("marks other related-party authors", () => {
    expect(getContentAuthorLabel(author({ id: "associate-1", role: "ASSOCIATE", memberType: "ASSOCIATE", name: "외부관계자" }), "member-1")).toBe("외부관계자 (관계자)");
    expect(getContentAuthorLabel(author({ id: "admin-3", role: "ADMIN", displayAuthorName: "조합장" }), "member-1")).toBe("조합장 (관계자)");
  });

  it("keeps the current-user marker with status tags", () => {
    expect(getContentAuthorLabel(author({ id: "member-1", signupName: "김대방" }), "member-1")).toBe("김대방 (나)");
    expect(getContentAuthorLabel(author({ id: "member-1", role: "REFUND", memberType: "REFUND", name: "박정산" }), "member-1")).toBe("박정산 (환불, 나)");
  });
});
