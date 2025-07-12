-- CreateTable
CREATE TABLE "group_budget_period_confirmations" (
    "id" TEXT NOT NULL,
    "periodId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "confirmedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "group_budget_period_confirmations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "group_budget_period_confirmations_periodId_userId_key" ON "group_budget_period_confirmations"("periodId", "userId");

-- AddForeignKey
ALTER TABLE "group_budget_period_confirmations" ADD CONSTRAINT "group_budget_period_confirmations_periodId_fkey" FOREIGN KEY ("periodId") REFERENCES "group_budget_periods"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_budget_period_confirmations" ADD CONSTRAINT "group_budget_period_confirmations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
