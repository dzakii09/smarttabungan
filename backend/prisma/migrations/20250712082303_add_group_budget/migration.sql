-- CreateTable
CREATE TABLE "group_budgets" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "spent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "period" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT NOT NULL,
    "categoryId" TEXT,

    CONSTRAINT "group_budgets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "group_budget_members" (
    "id" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'member',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "groupBudgetId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "group_budget_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "group_budget_invitations" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "invitedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "respondedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "groupBudgetId" TEXT NOT NULL,
    "invitedBy" TEXT NOT NULL,

    CONSTRAINT "group_budget_invitations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "group_budget_members_groupBudgetId_userId_key" ON "group_budget_members"("groupBudgetId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "group_budget_invitations_groupBudgetId_email_key" ON "group_budget_invitations"("groupBudgetId", "email");

-- AddForeignKey
ALTER TABLE "group_budgets" ADD CONSTRAINT "group_budgets_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_budgets" ADD CONSTRAINT "group_budgets_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_budget_members" ADD CONSTRAINT "group_budget_members_groupBudgetId_fkey" FOREIGN KEY ("groupBudgetId") REFERENCES "group_budgets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_budget_members" ADD CONSTRAINT "group_budget_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_budget_invitations" ADD CONSTRAINT "group_budget_invitations_groupBudgetId_fkey" FOREIGN KEY ("groupBudgetId") REFERENCES "group_budgets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_budget_invitations" ADD CONSTRAINT "group_budget_invitations_invitedBy_fkey" FOREIGN KEY ("invitedBy") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
