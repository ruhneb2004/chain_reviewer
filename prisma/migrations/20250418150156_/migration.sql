/*
  Warnings:

  - You are about to drop the column `userId` on the `Job` table. All the data in the column will be lost.
  - Added the required column `approvedDev` to the `Job` table without a default value. This is not possible if the table is not empty.
  - Added the required column `assignerId` to the `Job` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `Job` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "jobStatus" AS ENUM ('PENDING', 'APPROVED', 'REWARDABLE', 'FINISHED');

-- DropForeignKey
ALTER TABLE "Job" DROP CONSTRAINT "Job_userId_fkey";

-- AlterTable
ALTER TABLE "Job" DROP COLUMN "userId",
ADD COLUMN     "approvedDev" TEXT NOT NULL,
ADD COLUMN     "assignerId" TEXT NOT NULL,
ADD COLUMN     "devId" TEXT,
ADD COLUMN     "status" "jobStatus" NOT NULL;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_assignerId_fkey" FOREIGN KEY ("assignerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_devId_fkey" FOREIGN KEY ("devId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
