import { describe, expect, it } from "vitest";

import { getFreeBoardAuthorLabel } from "@/lib/news/free-board-author";
import type { NewsUserView } from "@/lib/news/types";

const user = (overrides: Partial<NewsUserView> = {}): NewsUserView => ({
  id: "member-1",
  name: "홍길동",
  loginId: "hong123",
  role: "MEMBER",
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

  it("masks other member names and login ids", () => {
    expect(getFreeBoardAuthorLabel(user({ id: "member-2", signupName: "김대방", loginId: "kim123" }), "member-1")).toBe("김*조합원 (ki***)");
    expect(getFreeBoardAuthorLabel(user({ id: "member-2", signupName: "김대방", loginId: null }), "member-1")).toBe("김*조합원 (social)");
  });
});
