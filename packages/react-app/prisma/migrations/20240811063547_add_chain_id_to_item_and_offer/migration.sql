/*
  Warnings:

  - You are about to drop the column `chain` on the `Item` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Item" DROP COLUMN "chain",
ADD COLUMN     "chainId" INTEGER NOT NULL DEFAULT 44787;

-- AlterTable
ALTER TABLE "Offer" ADD COLUMN     "chainId" INTEGER NOT NULL DEFAULT 44787;

-- DropEnum
DROP TYPE "Chain";
