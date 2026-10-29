/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `Customer` will be added.

*/

-- AlterTable
ALTER TABLE "Customer"
ADD COLUMN "password" TEXT,
ADD COLUMN "updatedAt" TIMESTAMP(3);

-- Fill updatedAt for existing customers
UPDATE "Customer"
SET "updatedAt" = CURRENT_TIMESTAMP
WHERE "updatedAt" IS NULL;

-- Make updatedAt required after existing rows have a value
ALTER TABLE "Customer"
ALTER COLUMN "updatedAt" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Customer_email_key" ON "Customer"("email");
