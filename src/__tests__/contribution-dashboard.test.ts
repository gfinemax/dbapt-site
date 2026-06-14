import { describe, expect, it } from "vitest";
import { buildContributionDashboardView } from "@/lib/contribution-dashboard";
import type { ContributionSummaryView } from "@/lib/contribution-types";

describe("contribution dashboard view model", () => {
  it("keeps member payment amounts pending when no approved contribution data exists", () => {
    const dashboard = buildContributionDashboardView({
      summary: null,
      profile: null,
      stages: [],
      ledgerEntries: [],
    });

    expect(dashboard.dataStatus).toBe("WAITING");
    expect(dashboard.statusLabel).toBe("자료 대기");
    expect(dashboard.erpStatusLabel).toBe("ERP 연동 예정");
    expect(dashboard.selectedUnitLabel).toBe("자료 대기");
    expect(dashboard.totalPlannedAmount).toBeNull();
    expect(dashboard.totalPaid).toBeNull();
    expect(dashboard.paymentProgress).toBeNull();
    expect(dashboard.stageSummary).toHaveLength(0);
    expect(dashboard.ledgerEntries).toHaveLength(0);
  });

  it("derives contribution progress from approved summary totals", () => {
    const summary: ContributionSummaryView = {
      totalDue: 120_000_000,
      totalPaid: 90_000_000,
      unpaidAmount: 30_000_000,
      overdueAmount: 0,
      lateFee: 0,
      nextDueDate: "2026-06-30T00:00:00.000Z",
      status: "UNPAID",
      noticeMessage: "2차 토지분담금 납부 안내 대상입니다.",
      updatedAt: "2026-06-10T00:00:00.000Z",
    };

    const dashboard = buildContributionDashboardView({
      summary,
      profile: {
        selectedUnitLabel: "30평형",
        dataStatus: "SYNCED",
        erpSyncedAt: "2026-06-10T00:00:00.000Z",
      },
      stages: [
        {
          id: "stage-1",
          label: "가입비",
          category: "JOINING_FEE",
          plannedAmount: 30_000_000,
          paidAmount: 30_000_000,
          unpaidAmount: 0,
          dueDate: "2026-01-31T00:00:00.000Z",
          status: "PAID",
          sortOrder: 1,
        },
        {
          id: "stage-2",
          label: "토지분담금",
          category: "LAND_CONTRIBUTION",
          plannedAmount: 90_000_000,
          paidAmount: 60_000_000,
          unpaidAmount: 30_000_000,
          dueDate: "2026-06-30T00:00:00.000Z",
          status: "UNPAID",
          sortOrder: 2,
        },
      ],
      ledgerEntries: [
        {
          id: "ledger-1",
          label: "가입비 납부",
          amount: 30_000_000,
          paidAt: "2026-01-10T00:00:00.000Z",
          stageLabel: "가입비",
          source: "ERP",
        },
      ],
    });

    expect(dashboard.dataStatus).toBe("SYNCED");
    expect(dashboard.statusLabel).toBe("미납 안내");
    expect(dashboard.erpStatusLabel).toBe("2026-06-10 동기화");
    expect(dashboard.selectedUnitLabel).toBe("30평형");
    expect(dashboard.totalPlannedAmount).toBe(120_000_000);
    expect(dashboard.totalPaid).toBe(90_000_000);
    expect(dashboard.unpaidAmount).toBe(30_000_000);
    expect(dashboard.paymentProgress).toBe(75);
    expect(dashboard.nextDueDate).toBe("2026-06-30T00:00:00.000Z");
    expect(dashboard.stageSummary).toHaveLength(2);
    expect(dashboard.stageSummary[1].statusLabel).toBe("미납");
    expect(dashboard.ledgerEntries[0].sourceLabel).toBe("ERP 반영");
  });
});
