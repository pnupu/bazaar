import { ethers } from "hardhat";

async function main() {
  // Get the contract factory
  const MiniPay = await ethers.getContractFactory("MiniPay");

  // Get the deploy transaction object and estimate gas
  const deployTransaction = await MiniPay.getDeployTransaction("0xfA7c516B3ED8D9F2e1Cf818be8dB88043ac017ae");
  const gasEstimate = await ethers.provider.estimateGas(deployTransaction);

  console.log("Estimated Gas for Deployment: ", gasEstimate.toString());

  // Deploy the contract
  const miniPayNFT = await MiniPay.deploy(
    "0xfA7c516B3ED8D9F2e1Cf818be8dB88043ac017ae"
  );

  await miniPayNFT.waitForDeployment();

  console.log("Minipay NFT address - " + miniPayNFT.target);  // Use miniPayNFT.target if .address is not available
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
