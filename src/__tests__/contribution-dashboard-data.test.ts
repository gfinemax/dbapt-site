import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/db", () => ({
  prisma: {
    memberContributionProfile: undefined,
    contributionLedgerEntry: undefined,
  },
}));

describe("loadContributionDashboardData", () => {
  it("falls back to a pending dashboard when the generated Prisma client is stale", async () => {
    const { loadContributionDashboardData } = await import("@/lib/contribution-dashboard-data");

    const dashboard = await loadContributionDashboardData("member-1", null);

    expect(dashboard.statusLabel).toBe("자료 대기");
    expect(dashboard.erpStatusLabel).toBe("ERP 연동 예정");
    expect(dashboard.selectedUnitLabel).toBe("자료 대기");
  });
});
