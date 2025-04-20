/*
  Warnings:

  - A unique constraint covering the columns `[address]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Made the column `address` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "User" ALTER COLUMN "address" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User_address_key" ON "User"("address");
