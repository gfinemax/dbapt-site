import { describe, expect, it } from "vitest";
import { mapErpLedgerSnapshotToContributionRecords } from "@/lib/contributions/erp-contract";

describe("ERP contribution contract", () => {
  it("maps ERP ledger snapshots into the internal contribution plan shape", () => {
    const mapped = mapErpLedgerSnapshotToContributionRecords({
      externalMemberId: "erp-member-1",
      selectedUnitLabel: "30평형",
      unitAreaM2: 84.9,
      totalPlannedAmount: 1_000_000_000,
      syncedAt: "2026-06-14T00:00:00.000Z",
      plan: {
        externalPlanId: "plan-30-v1",
        name: "30평형 1차 조합원 납부계획",
        version: "2026-06",
        stages: [
          {
            externalStageId: "stage-application",
            label: "신청금(가입필증)",
            category: "APPLICATION_CERTIFICATE_FEE",
            amount: 30_000_000,
            dueDate: "2026-01-31",
            sortOrder: 1,
            scope: "COMMON",
          },
          {
            externalStageId: "stage-middle",
            label: "중도금",
            category: "INTERMEDIATE_PAYMENT",
            amount: 600_000_000,
            dueDate: null,
            sortOrder: 6,
            scope: "UNIT_DEPENDENT",
          },
        ],
      },
      ledgerEntries: [
        {
          externalId: "ledger-application-1",
          stageExternalId: "stage-application",
          label: "신청금 납부",
          amount: 30_000_000,
          paidAt: "2026-01-10T00:00:00.000Z",
          method: "계좌이체",
          memo: null,
        },
      ],
    });

    expect(mapped.profile.selectedUnitLabel).toBe("30평형");
    expect(mapped.profile.dataStatus).toBe("SYNCED");
    expect(mapped.paymentPlan.externalId).toBe("plan-30-v1");
    expect(mapped.stages[0]).toMatchObject({
      externalId: "stage-application",
      category: "APPLICATION_CERTIFICATE_FEE",
      scope: "COMMON",
    });
    expect(mapped.stages[1]).toMatchObject({
      category: "INTERMEDIATE_PAYMENT",
      scope: "UNIT_DEPENDENT",
    });
    expect(mapped.ledgerEntries[0]).toMatchObject({
      source: "ERP",
      externalId: "ledger-application-1",
      stageExternalId: "stage-application",
    });
  });
});
