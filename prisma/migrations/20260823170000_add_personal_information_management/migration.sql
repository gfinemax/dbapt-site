CREATE TABLE "MemberPersonalProfile" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "peopleOnMemberId" TEXT,
  "addressEncrypted" TEXT,
  "mailingAddressEncrypted" TEXT,
  "birthDateEncrypted" TEXT,
  "coOwnerEncrypted" TEXT,
  "refundAccountEncrypted" TEXT,
  "notificationSmsOptIn" BOOLEAN NOT NULL DEFAULT false,
  "notificationEmailOptIn" BOOLEAN NOT NULL DEFAULT false,
  "buildingUnitLabel" TEXT,
  "lastConfirmedAt" TIMESTAMP(3),
  "peopleOnSyncedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "MemberPersonalProfile_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PersonalInfoChangeRequest" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "field" TEXT NOT NULL,
  "previousValueEncrypted" TEXT,
  "requestedValueEncrypted" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "publicMemo" TEXT,
  "adminMemo" TEXT,
  "peopleOnStatus" TEXT NOT NULL DEFAULT 'PENDING',
  "peopleOnError" TEXT,
  "resolvedById" TEXT,
  "resolvedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PersonalInfoChangeRequest_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PersonalInfoChangeEvent" (
  "id" TEXT NOT NULL,
  "requestId" TEXT NOT NULL,
  "actorId" TEXT,
  "eventType" TEXT NOT NULL,
  "message" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PersonalInfoChangeEvent_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "MemberPersonalProfile_userId_key" ON "MemberPersonalProfile"("userId");
CREATE UNIQUE INDEX "MemberPersonalProfile_peopleOnMemberId_key" ON "MemberPersonalProfile"("peopleOnMemberId");
CREATE INDEX "PersonalInfoChangeRequest_userId_createdAt_idx" ON "PersonalInfoChangeRequest"("userId", "createdAt");
CREATE INDEX "PersonalInfoChangeRequest_status_createdAt_idx" ON "PersonalInfoChangeRequest"("status", "createdAt");
CREATE INDEX "PersonalInfoChangeRequest_peopleOnStatus_createdAt_idx" ON "PersonalInfoChangeRequest"("peopleOnStatus", "createdAt");
CREATE INDEX "PersonalInfoChangeEvent_requestId_createdAt_idx" ON "PersonalInfoChangeEvent"("requestId", "createdAt");
CREATE INDEX "PersonalInfoChangeEvent_actorId_createdAt_idx" ON "PersonalInfoChangeEvent"("actorId", "createdAt");
ALTER TABLE "MemberPersonalProfile" ADD CONSTRAINT "MemberPersonalProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PersonalInfoChangeRequest" ADD CONSTRAINT "PersonalInfoChangeRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PersonalInfoChangeRequest" ADD CONSTRAINT "PersonalInfoChangeRequest_resolvedById_fkey" FOREIGN KEY ("resolvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "PersonalInfoChangeEvent" ADD CONSTRAINT "PersonalInfoChangeEvent_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "PersonalInfoChangeRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PersonalInfoChangeEvent" ADD CONSTRAINT "PersonalInfoChangeEvent_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
