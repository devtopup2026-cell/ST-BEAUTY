/*
  Warnings:

  - Made the column `recipientEmail` on table `Order` required. This step will fail if there are existing NULL values in that column.
  - Made the column `recipientName` on table `Order` required. This step will fail if there are existing NULL values in that column.
  - Made the column `recipientPhone` on table `Order` required. This step will fail if there are existing NULL values in that column.
  - Made the column `shippingAddress` on table `Order` required. This step will fail if there are existing NULL values in that column.
  - Made the column `shippingPostalCode` on table `Order` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Order" ALTER COLUMN "recipientEmail" SET NOT NULL,
ALTER COLUMN "recipientName" SET NOT NULL,
ALTER COLUMN "recipientPhone" SET NOT NULL,
ALTER COLUMN "shippingAddress" SET NOT NULL,
ALTER COLUMN "shippingPostalCode" SET NOT NULL;
