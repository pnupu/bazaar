-- CreateEnum
CREATE TYPE "Chain" AS ENUM ('CELOALFAJORES', 'BASESEPOLIA', 'CELO');

-- AlterTable
ALTER TABLE "Feedback" ALTER COLUMN "nftTokenId" DROP NOT NULL,
ALTER COLUMN "nftTransactionHash" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Item" ADD COLUMN     "chain" "Chain" NOT NULL DEFAULT 'CELOALFAJORES';
