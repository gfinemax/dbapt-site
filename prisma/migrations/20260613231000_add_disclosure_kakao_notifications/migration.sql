-- AlterTable
ALTER TABLE "User" ADD COLUMN "phone" TEXT;
ALTER TABLE "User" ADD COLUMN "kakaoNotificationOptIn" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN "kakaoNotificationEnabled" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "NotificationGroup" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotificationGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationGroupMember" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NotificationGroupMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DisclosureNotificationRule" (
    "id" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'DISCLOSURE',
    "subCategory" TEXT NOT NULL,
    "correspondenceType" TEXT,
    "groupId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DisclosureNotificationRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DisclosureNotification" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "trigger" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "matchedRuleCount" INTEGER NOT NULL DEFAULT 0,
    "recipientCount" INTEGER NOT NULL DEFAULT 0,
    "sentCount" INTEGER NOT NULL DEFAULT 0,
    "failedCount" INTEGER NOT NULL DEFAULT 0,
    "skippedReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DisclosureNotification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DisclosureNotificationRecipient" (
    "id" TEXT NOT NULL,
    "notificationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "phoneMasked" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "providerMessageId" TEXT,
    "errorCode" TEXT,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DisclosureNotificationRecipient_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "NotificationGroup_key_key" ON "NotificationGroup"("key");

-- CreateIndex
CREATE UNIQUE INDEX "NotificationGroupMember_groupId_userId_key" ON "NotificationGroupMember"("groupId", "userId");

-- CreateIndex
CREATE INDEX "NotificationGroupMember_userId_idx" ON "NotificationGroupMember"("userId");

-- CreateIndex
CREATE INDEX "DisclosureNotificationRule_category_subCategory_correspondenceType_isActive_idx" ON "DisclosureNotificationRule"("category", "subCategory", "correspondenceType", "isActive");

-- CreateIndex
CREATE INDEX "DisclosureNotificationRule_groupId_idx" ON "DisclosureNotificationRule"("groupId");

-- CreateIndex
CREATE INDEX "DisclosureNotification_documentId_trigger_idx" ON "DisclosureNotification"("documentId", "trigger");

-- CreateIndex
CREATE INDEX "DisclosureNotification_status_createdAt_idx" ON "DisclosureNotification"("status", "createdAt");

-- CreateIndex
CREATE INDEX "DisclosureNotificationRecipient_notificationId_idx" ON "DisclosureNotificationRecipient"("notificationId");

-- CreateIndex
CREATE INDEX "DisclosureNotificationRecipient_userId_idx" ON "DisclosureNotificationRecipient"("userId");

-- CreateIndex
CREATE INDEX "DisclosureNotificationRecipient_groupId_idx" ON "DisclosureNotificationRecipient"("groupId");

-- CreateIndex
CREATE INDEX "DisclosureNotificationRecipient_status_createdAt_idx" ON "DisclosureNotificationRecipient"("status", "createdAt");

-- AddForeignKey
ALTER TABLE "NotificationGroupMember" ADD CONSTRAINT "NotificationGroupMember_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "NotificationGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationGroupMember" ADD CONSTRAINT "NotificationGroupMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DisclosureNotificationRule" ADD CONSTRAINT "DisclosureNotificationRule_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "NotificationGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DisclosureNotification" ADD CONSTRAINT "DisclosureNotification_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DisclosureNotificationRecipient" ADD CONSTRAINT "DisclosureNotificationRecipient_notificationId_fkey" FOREIGN KEY ("notificationId") REFERENCES "DisclosureNotification"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DisclosureNotificationRecipient" ADD CONSTRAINT "DisclosureNotificationRecipient_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DisclosureNotificationRecipient" ADD CONSTRAINT "DisclosureNotificationRecipient_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "NotificationGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;
