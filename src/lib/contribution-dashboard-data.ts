import { prisma } from "@/lib/db";
import { buildContributionDashboardView } from "@/lib/contribution-dashboard";
import { serializeContributionDashboard } from "@/lib/contribution-serializer";
import type { ContributionDashboardView, ContributionSummaryView } from "@/lib/contribution-types";

type ContributionDashboardPrisma = typeof prisma & {
  memberContributionProfile?: {
    findUnique: typeof prisma.memberContributionProfile.findUnique;
  };
  contributionLedgerEntry?: {
    findMany: typeof prisma.contributionLedgerEntry.findMany;
  };
};

export async function loadContributionDashboardData(
  userId: string,
  summary: ContributionSummaryView | null,
): Promise<ContributionDashboardView> {
  const contributionPrisma = prisma as ContributionDashboardPrisma;
  if (!contributionPrisma.memberContributionProfile || !contributionPrisma.contributionLedgerEntry) {
    return buildContributionDashboardView({
      summary,
      profile: null,
      stages: [],
      ledgerEntries: [],
    });
  }

  const [profile, ledgerEntries] = await Promise.all([
    contributionPrisma.memberContributionProfile.findUnique({
      where: { userId },
      include: {
        paymentPlan: {
          include: {
            stages: {
              orderBy: { sortOrder: "asc" },
            },
          },
        },
      },
    }),
    contributionPrisma.contributionLedgerEntry.findMany({
      where: { userId },
      include: {
        stage: {
          select: { label: true },
        },
      },
      orderBy: { paidAt: "desc" },
      take: 20,
    }),
  ]);

  return serializeContributionDashboard(summary, profile, ledgerEntries);
}
