/*
  Warnings:

  - You are about to drop the column `recurringTransactionId` on the `transactions` table. All the data in the column will be lost.
  - You are about to drop the `recurring_transactions` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "recurring_transactions" DROP CONSTRAINT "recurring_transactions_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "recurring_transactions" DROP CONSTRAINT "recurring_transactions_userId_fkey";

-- DropForeignKey
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_recurringTransactionId_fkey";

-- AlterTable
ALTER TABLE "transactions" DROP COLUMN "recurringTransactionId";

-- DropTable
DROP TABLE "recurring_transactions";
