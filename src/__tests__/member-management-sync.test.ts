import { describe, expect, it, vi } from "vitest";
import { buildMemberManagementSnapshot, fetchPeopleOnMemberRows } from "@/lib/admin/member-management";

describe("member management snapshot", () => {
  it("matches PeopleOn members to homepage accounts and reports action counts", () => {
    const snapshot = buildMemberManagementSnapshot({
      generatedAt: "2026-06-17T00:00:00.000Z",
      peopleOnRows: [
        {
          id: "po-registered-ok",
          name: "김정호",
          phone: "010-1111-2222",
          display_status: "등기조합원",
          is_registered: true,
          is_settlement_eligible: false,
        },
        {
          id: "po-refund-pending",
          name: "오학동",
          phone: "010-3333-4444",
          display_status: "환불 조합원",
          is_registered: false,
          is_settlement_eligible: true,
        },
        {
          id: "po-missing",
          name: "박미가입",
          phone: "010-5555-6666",
          display_status: "등기조합원",
          is_registered: true,
          is_settlement_eligible: false,
        },
        {
          id: "po-mismatch",
          name: "이정산",
          phone: "010-7777-8888",
          display_status: "환불 조합원",
          is_registered: false,
          is_settlement_eligible: true,
        },
        {
          id: "po-preliminary",
          name: "최예비",
          phone: "010-9999-0000",
          display_status: "예비조합원",
          status: "예비조합원",
          tier: "예비조합원",
          is_registered: false,
          is_settlement_eligible: false,
        },
      ],
      homepageUsers: [
        {
          id: "user-member",
          name: "김정호",
          email: "member@example.com",
          loginId: "member1",
          phone: "01011112222",
          signupPhone: null,
          role: "MEMBER",
          isActive: true,
          createdAt: "2026-06-01T00:00:00.000Z",
        },
        {
          id: "user-pending",
          name: "오학동",
          email: null,
          loginId: "01033334444",
          phone: null,
          signupPhone: "010-3333-4444",
          role: "PENDING",
          isActive: true,
          createdAt: "2026-06-02T00:00:00.000Z",
        },
        {
          id: "user-wrong-role",
          name: "이정산",
          email: "refund@example.com",
          loginId: "refund-wrong",
          phone: "010-7777-8888",
          signupPhone: null,
          role: "MEMBER",
          isActive: true,
          createdAt: "2026-06-03T00:00:00.000Z",
        },
      ],
    });

    expect(snapshot.stats.registeredPeopleOnCount).toBe(2);
    expect(snapshot.stats.refundPeopleOnCount).toBe(2);
    expect(snapshot.stats.preliminaryPeopleOnCount).toBe(1);
    expect(snapshot.stats.homepageApprovedCount).toBe(2);
    expect(snapshot.stats.homepagePendingCount).toBe(1);
    expect(snapshot.stats.missingHomepageCount).toBe(2);
    expect(snapshot.stats.roleMismatchCount).toBe(1);

    expect(snapshot.actionRows.map((row) => row.peopleOnName)).toEqual(["오학동", "박미가입", "이정산", "최예비"]);
    expect(snapshot.actionRows.map((row) => row.matchStatus)).toEqual(["PENDING", "MISSING", "ROLE_MISMATCH", "MISSING"]);
    expect(snapshot.actionRows[1].expectedRole).toBe("MEMBER");
    expect(snapshot.actionRows[2].expectedRole).toBe("REFUND");
    expect(snapshot.actionRows[3].expectedRole).toBe("MEMBER");
    expect(snapshot.actionRows[3].expectedMemberType).toBe("PRELIMINARY");
  });

  it("fetches all PeopleOn member pages with the server-side API key", async () => {
    const fetchImpl = vi.fn(async (input: string | URL, init?: RequestInit) => {
      const url = new URL(String(input));
      const page = url.searchParams.get("page");

      expect(init?.headers).toEqual({
        "X-API-Key": "secret-key",
      });

      if (page === "1") {
        return Response.json({
          success: true,
          rows: [
            {
              id: "po-1",
              name: "김정호",
              phone: "010-1111-2222",
              display_status: "등기조합원",
              is_registered: true,
              is_settlement_eligible: false,
            },
          ],
          pagination: { page: 1, total_pages: 2 },
          generated_at: "2026-06-17T00:00:00.000Z",
        });
      }

      return Response.json({
        success: true,
        rows: [
          {
            id: "po-2",
            name: "오학동",
            phone: "010-3333-4444",
            display_status: "환불 조합원",
            is_registered: false,
            is_settlement_eligible: true,
          },
        ],
        pagination: { page: 2, total_pages: 2 },
        generated_at: "2026-06-17T00:00:00.000Z",
      });
    });

    const result = await fetchPeopleOnMemberRows({
      apiUrl: "https://people-on.example.test/api/members/table",
      apiKey: "secret-key",
      fetchImpl,
    });

    expect(result.rows.map((row) => row.id)).toEqual(["po-1", "po-2"]);
    expect(result.generatedAt).toBe("2026-06-17T00:00:00.000Z");
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });
});
