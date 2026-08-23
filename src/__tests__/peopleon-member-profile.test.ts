import { describe, expect, it, vi } from "vitest";
import { fetchPeopleOnMemberProfile } from "@/lib/peopleon/member-profile";

const member = {
  peopleon_id: "peopleon-7",
  member_id: "56",
  name: "오학동",
  phone: "01012345678",
  address: "서울시 동작구",
  status: "정상",
  display_status: "정식 조합원",
  unit_group: "84m²",
  birth_date: "1980-01-02",
  joined_at: "2009-07-13",
  certificate_numbers: ["CERT-7"],
  certificate_display: "가입신청필증 7호",
  is_registered: true,
  tier: "정식",
  related_names: [],
  refund_account: null,
};

describe("fetchPeopleOnMemberProfile", () => {
  it("matches the saved PeopleON id without using a member name", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, generated_at: "2026-08-23T00:00:00.000Z", members: [member] }),
    });
    const result = await fetchPeopleOnMemberProfile({ externalMemberId: "peopleon-7", apiKey: "secret", fetchImpl });
    expect(result.member?.name).toBe("오학동");
    expect(result.status).toBe("CONNECTED");
    expect(fetchImpl).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({ headers: { "X-API-Key": "secret" } }));
  });

  it("supports the saved legacy member id only when it has one exact match", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ success: true, members: [member] }) });
    const result = await fetchPeopleOnMemberProfile({ externalMemberId: "56", apiKey: "secret", fetchImpl });
    expect(result.member?.peopleon_id).toBe("peopleon-7");
  });

  it("does not call PeopleON when the server key is unavailable", async () => {
    const fetchImpl = vi.fn();
    const result = await fetchPeopleOnMemberProfile({ externalMemberId: "peopleon-7", apiKey: "", fetchImpl });
    expect(result.status).toBe("NOT_CONFIGURED");
    expect(fetchImpl).not.toHaveBeenCalled();
  });
});
