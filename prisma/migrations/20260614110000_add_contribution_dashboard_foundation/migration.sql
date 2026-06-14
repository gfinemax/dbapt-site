-- Contribution dashboard foundation for future ERP ledger sync.
CREATE TABLE "ContributionPaymentPlan" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "unitLabel" TEXT,
    "unitAreaM2" DOUBLE PRECISION,
    "totalPlannedAmount" INTEGER,
    "version" TEXT NOT NULL DEFAULT 'v1',
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "source" TEXT NOT NULL DEFAULT 'INTERNAL',
    "externalId" TEXT,
    "syncedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContributionPaymentPlan_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "MemberContributionProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "paymentPlanId" TEXT,
    "selectedUnitLabel" TEXT,
    "unitAreaM2" DOUBLE PRECISION,
    "dataStatus" TEXT NOT NULL DEFAULT 'WAITING',
    "source" TEXT NOT NULL DEFAULT 'INTERNAL',
    "externalMemberId" TEXT,
    "syncedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MemberContributionProfile_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ContributionPaymentStage" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'OTHER',
    "amount" INTEGER,
    "dueDate" TIMESTAMP(3),
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContributionPaymentStage_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ContributionLedgerEntry" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "stageId" TEXT,
    "label" TEXT,
    "amount" INTEGER NOT NULL,
    "paidAt" TIMESTAMP(3) NOT NULL,
    "method" TEXT,
    "memo" TEXT,
    "source" TEXT NOT NULL DEFAULT 'MANUAL',
    "externalId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContributionLedgerEntry_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ContributionSyncRun" (
    "id" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'ERP',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "startedById" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),
    "rowCount" INTEGER NOT NULL DEFAULT 0,
    "errorCount" INTEGER NOT NULL DEFAULT 0,
    "message" TEXT,

    CONSTRAINT "ContributionSyncRun_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ContributionViewLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "actionType" TEXT NOT NULL DEFAULT 'VIEW_DASHBOARD',
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContributionViewLog_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "MemberContributionProfile_userId_key" ON "MemberContributionProfile"("userId");
CREATE INDEX "MemberContributionProfile_paymentPlanId_idx" ON "MemberContributionProfile"("paymentPlanId");
CREATE INDEX "MemberContributionProfile_dataStatus_idx" ON "MemberContributionProfile"("dataStatus");
CREATE INDEX "MemberContributionProfile_externalMemberId_idx" ON "MemberContributionProfile"("externalMemberId");

CREATE INDEX "ContributionPaymentPlan_status_version_idx" ON "ContributionPaymentPlan"("status", "version");
CREATE INDEX "ContributionPaymentPlan_externalId_idx" ON "ContributionPaymentPlan"("externalId");

CREATE INDEX "ContributionPaymentStage_planId_sortOrder_idx" ON "ContributionPaymentStage"("planId", "sortOrder");
CREATE INDEX "ContributionPaymentStage_category_idx" ON "ContributionPaymentStage"("category");

CREATE UNIQUE INDEX "ContributionLedgerEntry_source_externalId_key" ON "ContributionLedgerEntry"("source", "externalId");
CREATE INDEX "ContributionLedgerEntry_userId_paidAt_idx" ON "ContributionLedgerEntry"("userId", "paidAt");
CREATE INDEX "ContributionLedgerEntry_stageId_idx" ON "ContributionLedgerEntry"("stageId");

CREATE INDEX "ContributionSyncRun_status_startedAt_idx" ON "ContributionSyncRun"("status", "startedAt");
CREATE INDEX "ContributionSyncRun_source_startedAt_idx" ON "ContributionSyncRun"("source", "startedAt");
CREATE INDEX "ContributionSyncRun_startedById_idx" ON "ContributionSyncRun"("startedById");

CREATE INDEX "ContributionViewLog_userId_createdAt_idx" ON "ContributionViewLog"("userId", "createdAt");
CREATE INDEX "ContributionViewLog_actionType_createdAt_idx" ON "ContributionViewLog"("actionType", "createdAt");

ALTER TABLE "MemberContributionProfile" ADD CONSTRAINT "MemberContributionProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MemberContributionProfile" ADD CONSTRAINT "MemberContributionProfile_paymentPlanId_fkey" FOREIGN KEY ("paymentPlanId") REFERENCES "ContributionPaymentPlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ContributionPaymentStage" ADD CONSTRAINT "ContributionPaymentStage_planId_fkey" FOREIGN KEY ("planId") REFERENCES "ContributionPaymentPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ContributionLedgerEntry" ADD CONSTRAINT "ContributionLedgerEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ContributionLedgerEntry" ADD CONSTRAINT "ContributionLedgerEntry_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "ContributionPaymentStage"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ContributionSyncRun" ADD CONSTRAINT "ContributionSyncRun_startedById_fkey" FOREIGN KEY ("startedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ContributionViewLog" ADD CONSTRAINT "ContributionViewLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
