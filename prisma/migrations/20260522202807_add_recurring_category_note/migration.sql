/*
  Warnings:

  - Added the required column `category` to the `RecurringExpense` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "RecurringCategory" AS ENUM ('HOUSING', 'UTILITIES', 'EMI', 'EDUCATION', 'HEALTH', 'INSURANCE', 'INVESTMENT', 'INTERNET_PHONE', 'MAINTENANCE', 'OTHER');

-- AlterTable
ALTER TABLE "RecurringExpense" ADD COLUMN     "category" "RecurringCategory" NOT NULL,
ADD COLUMN     "note" TEXT;

-- CreateIndex
CREATE INDEX "RecurringExpense_userId_category_idx" ON "RecurringExpense"("userId", "category");

-- CreateIndex
CREATE INDEX "RecurringExpense_userId_isActive_idx" ON "RecurringExpense"("userId", "isActive");
