/*
  Warnings:

  - You are about to drop the column `payment_method` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `subscription_end` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `subscription_start` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `subscription_status` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `subscription_tier` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `MembershipTier` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SubscriptionPayment` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "SubscriptionPayment" DROP CONSTRAINT "SubscriptionPayment_user_id_fkey";

-- DropIndex
DROP INDEX "User_subscription_status_subscription_end_idx";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "payment_method",
DROP COLUMN "subscription_end",
DROP COLUMN "subscription_start",
DROP COLUMN "subscription_status",
DROP COLUMN "subscription_tier";

-- DropTable
DROP TABLE "MembershipTier";

-- DropTable
DROP TABLE "SubscriptionPayment";
