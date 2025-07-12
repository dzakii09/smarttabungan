-- AlterTable
ALTER TABLE "group_budgets" ADD COLUMN     "duration" INTEGER NOT NULL DEFAULT 1;

-- CreateTable
CREATE TABLE "group_budget_periods" (
    "id" TEXT NOT NULL,
    "periodNumber" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "budget" DOUBLE PRECISION NOT NULL,
    "spent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "groupBudgetId" TEXT NOT NULL,

    CONSTRAINT "group_budget_periods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "group_budget_transactions" (
    "id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "description" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "groupBudgetId" TEXT NOT NULL,
    "periodId" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,

    CONSTRAINT "group_budget_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "group_budget_periods_groupBudgetId_periodNumber_key" ON "group_budget_periods"("groupBudgetId", "periodNumber");

-- AddForeignKey
ALTER TABLE "group_budget_periods" ADD CONSTRAINT "group_budget_periods_groupBudgetId_fkey" FOREIGN KEY ("groupBudgetId") REFERENCES "group_budgets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_budget_transactions" ADD CONSTRAINT "group_budget_transactions_groupBudgetId_fkey" FOREIGN KEY ("groupBudgetId") REFERENCES "group_budgets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_budget_transactions" ADD CONSTRAINT "group_budget_transactions_periodId_fkey" FOREIGN KEY ("periodId") REFERENCES "group_budget_periods"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_budget_transactions" ADD CONSTRAINT "group_budget_transactions_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
