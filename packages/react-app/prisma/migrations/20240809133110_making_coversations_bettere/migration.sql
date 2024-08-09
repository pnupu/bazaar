/*
  Warnings:

  - You are about to drop the column `latitude` on the `Item` table. All the data in the column will be lost.
  - You are about to drop the column `longitude` on the `Item` table. All the data in the column will be lost.
  - You are about to drop the column `placeName` on the `Item` table. All the data in the column will be lost.
  - You are about to drop the `_UserConversations` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `buyerId` to the `Conversation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `itemId` to the `Conversation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sellerId` to the `Conversation` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "_UserConversations" DROP CONSTRAINT "_UserConversations_A_fkey";

-- DropForeignKey
ALTER TABLE "_UserConversations" DROP CONSTRAINT "_UserConversations_B_fkey";

-- DropIndex
DROP INDEX "User_username_key";

-- AlterTable
ALTER TABLE "Conversation" ADD COLUMN     "buyerId" TEXT NOT NULL,
ADD COLUMN     "itemId" TEXT NOT NULL,
ADD COLUMN     "sellerId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Item" DROP COLUMN "latitude",
DROP COLUMN "longitude",
DROP COLUMN "placeName",
ALTER COLUMN "status" DROP DEFAULT;

-- DropTable
DROP TABLE "_UserConversations";

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
