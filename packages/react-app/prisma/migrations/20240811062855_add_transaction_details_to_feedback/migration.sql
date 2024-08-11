-- AlterTable
ALTER TABLE "Feedback" ADD COLUMN     "blockNumber" TEXT,
ADD COLUMN     "chainId" INTEGER NOT NULL DEFAULT 44787,
ADD COLUMN     "transactionHash" TEXT;
