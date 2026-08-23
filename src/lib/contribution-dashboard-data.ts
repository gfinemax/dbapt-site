import { prisma } from "@/lib/db";
import { buildContributionDashboardView } from "@/lib/contribution-dashboard";
import { serializeContributionDashboard } from "@/lib/contribution-serializer";
import type { ContributionDashboardView, ContributionSummaryView } from "@/lib/contribution-types";
import { buildDashboardFromErpSnapshot, type ErpContributionLedgerSnapshot } from "@/lib/contributions/erp-contract";

type ContributionDashboardPrisma = typeof prisma & {
  memberContributionProfile?: {
    findUnique: typeof prisma.memberContributionProfile.findUnique;
  };
  contributionLedgerEntry?: {
    findMany: typeof prisma.contributionLedgerEntry.findMany;
  };
  user?: {
    findUnique: typeof prisma.user.findUnique;
  };
};

export async function loadContributionDashboardData(
  userId: string,
  summary: ContributionSummaryView | null,
  role?: string,
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

  const userLookup = typeof contributionPrisma.user?.findUnique === "function"
    ? contributionPrisma.user.findUnique({
        where: { id: userId },
        select: { loginId: true, phone: true, signupPhone: true },
      })
    : Promise.resolve(null);

  const [profile, ledgerEntries, user] = await Promise.all([
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
    userLookup,
  ]);

  const ledgerApiUrl = process.env.LEDGER_API_URL?.replace(/\/$/, "");
  const ledgerApiKey = process.env.LEDGER_SITE_INTEGRATION_KEY;
  const identity = profile?.externalMemberId
    ? `external_member_id=${encodeURIComponent(profile.externalMemberId)}`
    : `phone=${encodeURIComponent(user?.phone || user?.signupPhone || user?.loginId || "")}`;

  if (ledgerApiUrl && ledgerApiKey && identity && !identity.endsWith("=")) {
    try {
      const response = await fetch(`${ledgerApiUrl}/api/contributions/ledger?${identity}`, {
        headers: { Authorization: `Bearer ${ledgerApiKey}` },
        cache: "no-store",
      });
      if (response.ok) {
        const snapshot = await response.json() as ErpContributionLedgerSnapshot;
        const live = buildDashboardFromErpSnapshot(snapshot);
        await prisma.memberContributionProfile.upsert({
          where: { userId },
          create: {
            userId,
            externalMemberId: snapshot.externalMemberId,
            selectedUnitLabel: role === "REFUND" ? null : snapshot.selectedUnitLabel,
            unitAreaM2: role === "REFUND" ? null : snapshot.unitAreaM2,
            dataStatus: "SYNCED",
            source: "ERP",
            syncedAt: new Date(snapshot.syncedAt),
          },
          update: {
            externalMemberId: snapshot.externalMemberId,
            selectedUnitLabel: role === "REFUND" ? null : snapshot.selectedUnitLabel,
            unitAreaM2: role === "REFUND" ? null : snapshot.unitAreaM2,
            dataStatus: "SYNCED",
            source: "ERP",
            syncedAt: new Date(snapshot.syncedAt),
          },
        });
        if (snapshot.peopleOnMemberId) {
          try {
            await prisma.memberPersonalProfile.upsert({
              where: { userId },
              create: {
                userId,
                peopleOnMemberId: snapshot.peopleOnMemberId,
                peopleOnSyncedAt: new Date(snapshot.syncedAt),
              },
              update: {
                peopleOnMemberId: snapshot.peopleOnMemberId,
                peopleOnSyncedAt: new Date(snapshot.syncedAt),
              },
            });
          } catch (error) {
            console.error("PeopleON member identity link failed:", error);
          }
        }
        return buildContributionDashboardView({
          summary: live.summary,
          profile: role === "REFUND" ? { ...live.profile, selectedUnitLabel: null, unitAreaM2: null } : live.profile,
          stages: live.stages,
          ledgerEntries: live.ledgerEntries,
        });
      }
    } catch (error) {
      console.error("Ledger contribution sync failed:", error);
    }
  }

  return serializeContributionDashboard(summary, profile, ledgerEntries);
}
