/*
  Warnings:

  - Added the required column `category` to the `Subscription` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN     "category" TEXT NOT NULL,
ADD COLUMN     "planName" TEXT;

-- CreateIndex
CREATE INDEX "Subscription_userId_category_idx" ON "Subscription"("userId", "category");
