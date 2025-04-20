/*
  Warnings:

  - The values [DEVCOMPLETION] on the enum `jobStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "jobStatus_new" AS ENUM ('PENDING', 'APPROVED', 'REWARDABLE', 'FINISHED');
ALTER TABLE "Job" ALTER COLUMN "status" TYPE "jobStatus_new" USING ("status"::text::"jobStatus_new");
ALTER TYPE "jobStatus" RENAME TO "jobStatus_old";
ALTER TYPE "jobStatus_new" RENAME TO "jobStatus";
DROP TYPE "jobStatus_old";
COMMIT;

-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "earnableReward" INTEGER NOT NULL DEFAULT 0;
