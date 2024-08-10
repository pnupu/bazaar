-- CreateTable
CREATE TABLE "WorldcoinProof" (
    "id" TEXT NOT NULL,
    "nullifierHash" TEXT NOT NULL,
    "merkleRoot" TEXT NOT NULL,
    "proof" TEXT NOT NULL,
    "verificationLevel" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "WorldcoinProof_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WorldcoinProof_nullifierHash_key" ON "WorldcoinProof"("nullifierHash");

-- CreateIndex
CREATE UNIQUE INDEX "WorldcoinProof_userId_key" ON "WorldcoinProof"("userId");

-- AddForeignKey
ALTER TABLE "WorldcoinProof" ADD CONSTRAINT "WorldcoinProof_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
