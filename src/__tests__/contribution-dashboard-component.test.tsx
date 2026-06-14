import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ContributionDashboard } from "@/components/portal/contribution-dashboard";
import { buildContributionDashboardView } from "@/lib/contribution-dashboard";

describe("ContributionDashboard", () => {
  it("renders a truthful pending state without fake amounts", () => {
    const dashboard = buildContributionDashboardView({
      summary: null,
      profile: null,
      stages: [],
      ledgerEntries: [],
    });

    render(<ContributionDashboard dashboard={dashboard} paymentNotices={[]} />);

    expect(screen.getByRole("heading", { name: "내 분담금 현황" })).toBeInTheDocument();
    expect(screen.getAllByText("자료 대기")).toHaveLength(1);
    expect(screen.getByText("ERP 연동 예정")).toBeInTheDocument();
    expect(screen.getByText("납부계획 반영 대기")).toBeInTheDocument();
    expect(screen.getByLabelText("초반 납입금 · 중도금 · 잔금")).toBeInTheDocument();
    expect(screen.queryByText("0 원")).not.toBeInTheDocument();
  });

  it("uses a low-emphasis pending progress panel and ordered stage flow", () => {
    const dashboard = buildContributionDashboardView({
      summary: null,
      profile: null,
      stages: [],
      ledgerEntries: [],
    });

    render(<ContributionDashboard dashboard={dashboard} paymentNotices={[]} />);

    expect(screen.getByTestId("contribution-dashboard-layout")).toHaveClass("space-y-6");
    expect(screen.getByTestId("contribution-progress-panel")).toHaveClass("bg-parchment-card");
    expect(screen.getByText("납부자료 반영 대기")).toBeInTheDocument();

    const flow = screen.getByLabelText("예상 납부 단계");
    expect(flow).toHaveClass("md:grid-cols-5");
    expect(flow).toHaveTextContent("신청금");
    expect(flow).toHaveTextContent("가입필증");
    expect(flow).toHaveTextContent("계약금");
    expect(flow).toHaveTextContent("1차분담금");
    expect(flow).toHaveTextContent("2차분담금");
    expect(flow).toHaveTextContent("초반 납입금");
    expect(flow).toHaveTextContent("중도금 · 잔금");

    expect(screen.getByText("승인된 납부 내역이 아직 없습니다.")).toBeInTheDocument();
  });

  it("keeps payment stage copy readable in the horizontal layout", () => {
    const dashboard = buildContributionDashboardView({
      summary: null,
      profile: null,
      stages: [],
      ledgerEntries: [],
    });

    render(<ContributionDashboard dashboard={dashboard} paymentNotices={[]} />);

    expect(screen.getByTestId("contribution-stage-section")).toHaveClass("space-y-4");
    expect(screen.getByText("ERP 또는 관리자 승인 자료가 반영되면 단계별 금액과 일정이 표시됩니다.")).toBeInTheDocument();
    expect(screen.getByLabelText("신청금(가입필증)")).toBeInTheDocument();
    expect(screen.getByText("신청금")).toBeInTheDocument();
    expect(screen.getByText("가입필증")).toBeInTheDocument();
    expect(screen.getByText("초반 납입금")).toBeInTheDocument();
    expect(screen.getByText("중도금 · 잔금")).toBeInTheDocument();
  });

  it("renders selected unit, progress, stages, and ledger entries when data exists", () => {
    const dashboard = buildContributionDashboardView({
      summary: {
        totalDue: 120_000_000,
        totalPaid: 90_000_000,
        unpaidAmount: 30_000_000,
        overdueAmount: 0,
        lateFee: 0,
        nextDueDate: "2026-06-30T00:00:00.000Z",
        status: "UNPAID",
        noticeMessage: "2차 분담금 납부 안내 대상입니다.",
        updatedAt: "2026-06-10T00:00:00.000Z",
      },
      profile: {
        selectedUnitLabel: "30평형",
        dataStatus: "SYNCED",
        erpSyncedAt: "2026-06-10T00:00:00.000Z",
      },
      stages: [
        {
          id: "stage-1",
          label: "신청금(가입필증)",
          category: "APPLICATION_CERTIFICATE_FEE",
          plannedAmount: 30_000_000,
          paidAmount: 30_000_000,
          unpaidAmount: 0,
          dueDate: "2026-01-31T00:00:00.000Z",
          status: "PAID",
          sortOrder: 1,
        },
      ],
      ledgerEntries: [
        {
          id: "ledger-1",
          label: "신청금 납부",
          amount: 30_000_000,
          paidAt: "2026-01-10T00:00:00.000Z",
          stageLabel: "신청금(가입필증)",
          source: "ERP",
        },
      ],
    });

    render(<ContributionDashboard dashboard={dashboard} paymentNotices={[]} />);

    expect(screen.getByText("30평형")).toBeInTheDocument();
    expect(screen.getByText("75%")).toBeInTheDocument();
    expect(screen.getAllByText("30,000,000 원").length).toBeGreaterThan(0);
    expect(screen.getByText("신청금(가입필증)")).toBeInTheDocument();
    expect(screen.getByText("ERP 반영")).toBeInTheDocument();
  });
});
