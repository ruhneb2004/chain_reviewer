/*
  Warnings:

  - You are about to drop the column `assignerId` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the column `developerId` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the `Assigner` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Developer` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `userId` to the `Job` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Job" DROP CONSTRAINT "Job_assignerId_fkey";

-- DropForeignKey
ALTER TABLE "Job" DROP CONSTRAINT "Job_developerId_fkey";

-- AlterTable
ALTER TABLE "Job" DROP COLUMN "assignerId",
DROP COLUMN "developerId",
ADD COLUMN     "userId" TEXT NOT NULL;

-- DropTable
DROP TABLE "Assigner";

-- DropTable
DROP TABLE "Developer";

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
