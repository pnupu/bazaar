import { useState, useCallback } from "react";
import StableTokenABI from "./cusd-abi.json";
import MinipayNFTABI from "./minipay-nft.json";
import {
  Chain,
  createPublicClient,
  createWalletClient,
  custom,
  getContract,
  http,
  parseEther,
} from "viem";
import { useConfig, useChainId } from "wagmi";
import { celoAlfajores, baseSepolia } from "viem/chains";

const publicClient = createPublicClient({
  chain: celoAlfajores, 
  transport: http(),
});

const cUSDTokenAddress = "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1"; // Celo Testnet
const MINIPAY_NFT_CONTRACT = "0xE8F4699baba6C86DA9729b1B0a1DA1Bd4136eFeF"; // Celo Testnet
const BASE_SEPOLIA_CUSD_ADDRESS = "0x5dEaC602762362FE5f135FA5904351916053cF70"; // Base Testnet

export const useWeb3 = () => {
  const [address, setAddress] = useState<string | null>(null);
  const config = useConfig();
  const chainId = useChainId();

  const getChain = useCallback((): Chain => {
    return chainId === baseSepolia.id ? baseSepolia : celoAlfajores;
  }, [chainId]);

  const getPublicClient = useCallback(() => {
    return createPublicClient({
      chain: getChain(),
      transport: http(),
    });
  }, [getChain]);
  
  const getUserAddress = async () => {
    if (typeof window !== "undefined" && window.ethereum) {
      const walletClient = createWalletClient({
        transport: custom(window.ethereum),
        chain: celoAlfajores,
      });

      const [address] = await walletClient.getAddresses();
      setAddress(address);
    }
  };

  const getWalletClient = useCallback(async () => {
    if (typeof window !== "undefined" && window.ethereum) {
      return createWalletClient({
        transport: custom(window.ethereum),
        chain: getChain(),
      });
    }
    throw new Error("Ethereum provider not found");
  }, [getChain]);

  const sendCUSD = async (to: string, amount: string) => {
    const walletClient = await getWalletClient();
    const [address] = await walletClient.getAddresses();

    const amountInWei = parseEther(amount);

    const tokenAddress = chainId === baseSepolia.id ? BASE_SEPOLIA_CUSD_ADDRESS : cUSDTokenAddress;

    const tx = await walletClient.writeContract({
      address: tokenAddress,
      abi: StableTokenABI.abi,
      functionName: "transfer",
      account: address,
      args: [to, amountInWei],
    });

    const publicClient = getPublicClient();
    const receipt = await publicClient.waitForTransactionReceipt({
      hash: tx,
    });

    return receipt;
  };

  const mintMinipayNFT = async (message: string) => {
    const walletClient = createWalletClient({
      transport: custom(window.ethereum),
      chain: celoAlfajores,
    });

    const [address] = await walletClient.getAddresses();

    const tx = await walletClient.writeContract({
      address: MINIPAY_NFT_CONTRACT,
      abi: MinipayNFTABI.abi,
      functionName: "safeMint",
      account: address,
      args: [
        address,
        message
      ],
    });

    const receipt = await publicClient.waitForTransactionReceipt({
      hash: tx,
    });

    return receipt;
  };

  const getNFTs = async () => {
    const walletClient = createWalletClient({
      transport: custom(window.ethereum),
      chain: celoAlfajores,
    });

    const minipayNFTContract = getContract({
      abi: MinipayNFTABI.abi,
      address: MINIPAY_NFT_CONTRACT,
      client: publicClient,
    });

    const [address] = await walletClient.getAddresses();
    // const nfts: any = await minipayNFTContract.read.getNFTsByAddress([
    //   address,
    // ]);


    const tokenURIs: string[] = [];

    // for (let i = 0; i < nfts.length; i++) {
    //   const tokenURI: string = (await minipayNFTContract.read.tokenURI([
    //     nfts[i],
    //   ])) as string;
    //   tokenURIs.push(tokenURI);
    // }
    return tokenURIs;
  };

  const signTransaction = async (message: string) => {
    const walletClient = createWalletClient({
      transport: custom(window.ethereum),
      chain: celoAlfajores,
    });

    const [address] = await walletClient.getAddresses();

    const res = await walletClient.signMessage({
      account: address,
      message: message,
    });

    return res;
  };

  return {
    address,
    getUserAddress,
    sendCUSD,
    mintMinipayNFT,
    getNFTs,
    signTransaction,
  };
};
