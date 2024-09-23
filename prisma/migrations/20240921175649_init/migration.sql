-- CreateTable
CREATE TABLE "ledger" (
    "id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "openingBalance" DOUBLE PRECISION NOT NULL,
    "closingBalance" DOUBLE PRECISION NOT NULL,
    "dateTime" TIMESTAMP(3) NOT NULL,
    "type" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "service" TEXT NOT NULL,
    "transferredTo" TEXT,
    "description" TEXT,
    "referenceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ledger_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ledger_dateTime_idx" ON "ledger"("dateTime");

-- CreateIndex
CREATE INDEX "ledger_referenceId_idx" ON "ledger"("referenceId");

-- CreateIndex
CREATE INDEX "ledger_type_idx" ON "ledger"("type");

-- CreateIndex
CREATE INDEX "ledger_purpose_idx" ON "ledger"("purpose");
