-- CreateTable
CREATE TABLE "ContributionSummary" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "totalDue" INTEGER NOT NULL DEFAULT 0,
    "totalPaid" INTEGER NOT NULL DEFAULT 0,
    "unpaidAmount" INTEGER NOT NULL DEFAULT 0,
    "overdueAmount" INTEGER NOT NULL DEFAULT 0,
    "lateFee" INTEGER NOT NULL DEFAULT 0,
    "nextDueDate" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'NORMAL',
    "noticeMessage" TEXT,
    "sourceBatchId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContributionSummary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentImportBatch" (
    "id" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'MANUAL_API',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "rowCount" INTEGER NOT NULL DEFAULT 0,
    "errorCount" INTEGER NOT NULL DEFAULT 0,
    "createdById" TEXT NOT NULL,
    "approvedById" TEXT,
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentImportBatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentImportRow" (
    "id" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "loginId" TEXT NOT NULL,
    "memberName" TEXT,
    "targetUserId" TEXT,
    "totalDue" INTEGER NOT NULL DEFAULT 0,
    "totalPaid" INTEGER NOT NULL DEFAULT 0,
    "unpaidAmount" INTEGER NOT NULL DEFAULT 0,
    "overdueAmount" INTEGER NOT NULL DEFAULT 0,
    "lateFee" INTEGER NOT NULL DEFAULT 0,
    "nextDueDate" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'NORMAL',
    "noticeMessage" TEXT,
    "validationStatus" TEXT NOT NULL DEFAULT 'VALID',
    "validationMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PaymentImportRow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentNotice" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sourceBatchId" TEXT,
    "type" TEXT NOT NULL DEFAULT 'UNPAID',
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "unpaidAmount" INTEGER NOT NULL DEFAULT 0,
    "overdueAmount" INTEGER NOT NULL DEFAULT 0,
    "lateFee" INTEGER NOT NULL DEFAULT 0,
    "dueDate" TIMESTAMP(3),
    "approvedAt" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentNotice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ContributionSummary_userId_key" ON "ContributionSummary"("userId");

-- CreateIndex
CREATE INDEX "ContributionSummary_status_idx" ON "ContributionSummary"("status");

-- CreateIndex
CREATE INDEX "PaymentImportBatch_status_createdAt_idx" ON "PaymentImportBatch"("status", "createdAt");

-- CreateIndex
CREATE INDEX "PaymentImportRow_batchId_idx" ON "PaymentImportRow"("batchId");

-- CreateIndex
CREATE INDEX "PaymentImportRow_loginId_idx" ON "PaymentImportRow"("loginId");

-- CreateIndex
CREATE INDEX "PaymentImportRow_targetUserId_idx" ON "PaymentImportRow"("targetUserId");

-- CreateIndex
CREATE INDEX "PaymentNotice_userId_status_idx" ON "PaymentNotice"("userId", "status");

-- CreateIndex
CREATE INDEX "PaymentNotice_status_createdAt_idx" ON "PaymentNotice"("status", "createdAt");

-- AddForeignKey
ALTER TABLE "ContributionSummary" ADD CONSTRAINT "ContributionSummary_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentImportBatch" ADD CONSTRAINT "PaymentImportBatch_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentImportBatch" ADD CONSTRAINT "PaymentImportBatch_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentImportRow" ADD CONSTRAINT "PaymentImportRow_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "PaymentImportBatch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentNotice" ADD CONSTRAINT "PaymentNotice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
