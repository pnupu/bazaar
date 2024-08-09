/*
  Warnings:

  - Added the required column `sellerId` to the `Feedback` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Feedback" ADD COLUMN     "sellerId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
