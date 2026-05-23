-- AlterTable
ALTER TABLE "Budget" ADD COLUMN     "name" TEXT;

-- CreateIndex
CREATE INDEX "Budget_userId_type_idx" ON "Budget"("userId", "type");

-- CreateIndex
CREATE INDEX "Budget_userId_category_idx" ON "Budget"("userId", "category");

-- CreateIndex
CREATE INDEX "Subscription_isActive_nextRenewalDate_idx" ON "Subscription"("isActive", "nextRenewalDate");
