/*
  Warnings:

  - A unique constraint covering the columns `[templateId,name,billingCycle]` on the table `SubscriptionPlan` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `SubscriptionTemplate` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "BillingCycle" ADD VALUE 'QUARTERLY';
ALTER TYPE "BillingCycle" ADD VALUE 'HALF_YEARLY';

-- CreateIndex
CREATE INDEX "Subscription_templateId_idx" ON "Subscription"("templateId");

-- CreateIndex
CREATE INDEX "Subscription_planId_idx" ON "Subscription"("planId");

-- CreateIndex
CREATE UNIQUE INDEX "SubscriptionPlan_templateId_name_billingCycle_key" ON "SubscriptionPlan"("templateId", "name", "billingCycle");

-- CreateIndex
CREATE UNIQUE INDEX "SubscriptionTemplate_name_key" ON "SubscriptionTemplate"("name");

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "SubscriptionTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_planId_fkey" FOREIGN KEY ("planId") REFERENCES "SubscriptionPlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;
