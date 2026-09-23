ALTER TABLE "User" ADD COLUMN "authVersion" INTEGER NOT NULL DEFAULT 0;

CREATE TABLE "AccountRecoveryRequest" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "requestType" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "requestPhoneLast4" TEXT NOT NULL,
  "deliveryMethod" TEXT,
  "tokenHash" TEXT,
  "tokenExpiresAt" TIMESTAMP(3),
  "tokenUsedAt" TIMESTAMP(3),
  "handledById" TEXT,
  "handledAt" TIMESTAMP(3),
  "messagePreparedAt" TIMESTAMP(3),
  "deliveryMarkedAt" TIMESTAMP(3),
  "completedAt" TIMESTAMP(3),
  "cancelledAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AccountRecoveryRequest_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "AccountRecoveryRequest_tokenHash_key" ON "AccountRecoveryRequest"("tokenHash");
CREATE INDEX "AccountRecoveryRequest_status_createdAt_idx" ON "AccountRecoveryRequest"("status", "createdAt");
CREATE INDEX "AccountRecoveryRequest_userId_requestType_createdAt_idx" ON "AccountRecoveryRequest"("userId", "requestType", "createdAt");
CREATE INDEX "AccountRecoveryRequest_handledById_handledAt_idx" ON "AccountRecoveryRequest"("handledById", "handledAt");

ALTER TABLE "AccountRecoveryRequest" ADD CONSTRAINT "AccountRecoveryRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AccountRecoveryRequest" ADD CONSTRAINT "AccountRecoveryRequest_handledById_fkey" FOREIGN KEY ("handledById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "AccountRecoveryRequest" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE "AccountRecoveryRequest" FROM anon, authenticated;
