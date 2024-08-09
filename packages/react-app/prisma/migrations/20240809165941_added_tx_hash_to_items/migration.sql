/*
  Warnings:

  - Changed the type of `status` on the `Item` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "ItemStatus" AS ENUM ('SOLD', 'AVAILABLE', 'DISABLED');

-- AlterTable
ALTER TABLE "Item" ADD COLUMN     "txHash" TEXT,
DROP COLUMN "status",
ADD COLUMN     "status" "ItemStatus" NOT NULL;
