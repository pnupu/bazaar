/*
  Warnings:

  - Made the column `nftTokenId` on table `Feedback` required. This step will fail if there are existing NULL values in that column.
  - Made the column `nftTransactionHash` on table `Feedback` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Feedback" ALTER COLUMN "nftTokenId" SET NOT NULL,
ALTER COLUMN "nftTransactionHash" SET NOT NULL;
